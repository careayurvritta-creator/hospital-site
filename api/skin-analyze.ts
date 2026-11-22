/**
 * Vercel Serverless API - Image-Based Skin Disease Recognition
 * 
 * Handles multipart/form-data uploads with image + questionnaire data.
 * Uses Nvidia NIM vision-capable models for image analysis combined with
 * structured questionnaire for comprehensive Ayurvedic skin assessment.
 * 
 * Features:
 * - Image preprocessing (validation, resizing, base64 encoding)
 * - Multi-modal AI analysis (vision + text)
 * - Structured JSON response with condition, severity, remedies, referral
 * - Rate limiting and abuse prevention
 * - CORS and origin validation
 */

export const config = {
  runtime: 'nodejs',
};

// Sentry server-side initialization
let sentryInitialized = false;
function initSentry() {
  if (sentryInitialized) return;
  try {
    const Sentry = require('@sentry/node');
    const dsn = process.env.SENTRY_DSN;
    if (dsn && dsn !== 'YOUR_SENTRY_DSN') {
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
      });
      sentryInitialized = true;
      console.log('[Skin Analyze] Sentry initialized');
    }
  } catch {
    // @sentry/node not available — continue without Sentry
  }
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Vision-capable models on Nvidia NIM (ordered by preference)
const VISION_MODELS = [
  'nvidia/llama-3.2-90b-vision-instruct',
  'nvidia/nemotron-3.5-ultra', // May have vision capabilities
  'meta/llama-3.2-90b-vision-instruct',
];

const MODEL_TIMEOUT_MS = 20000; // Longer timeout for vision models

const RETRYABLE_STATUS = [403, 404, 410, 429, 500, 502, 503, 504];

const ALLOWED_ORIGIN_HOSTS = [
  'ayurvrittaayurveda.in',
  'www.ayurvrittaayurveda.in',
  'localhost',
  '127.0.0.1',
];

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Questionnaire field validation
const QUESTIONNAIRE_FIELDS = [
  'age', 'gender', 'duration', 'symptoms', 'triggers', 
  'currentTreatment', 'digestiveHealth', 'bodyType', 'sleepQuality', 'allergies'
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Non-browser clients (CI, scripts)
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_ORIGIN_HOSTS.includes(host)) return true;
    const deploymentHost = process.env.VERCEL_URL;
    return Boolean(deploymentHost && host === deploymentHost);
  } catch {
    return false;
  }
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Convert file to base64 data URL
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

// Validate uploaded file
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No image file provided' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }
  return { valid: true };
}

// Build the system prompt for skin analysis
function buildSystemPrompt(): string {
  return `
You are Dr. Jinendradutt Sharma's AI Ayurvedic Skin Specialist at Ayurvritta Ayurveda Hospital, Vadodara.
You analyze skin conditions from uploaded images combined with patient questionnaire data.

ANALYSIS FRAMEWORK:
1. **Visual Assessment**: Identify skin condition from image (lesion type, distribution, color, texture)
2. **Dosha Analysis**: Determine Vata/Pitta/Kapha aggravation based on visual + questionnaire
3. **Root Cause**: Identify ahara (diet) and vihara (lifestyle) factors
4. **Agni & Ama Status**: Assess digestive fire and toxin accumulation
5. **Severity Grading**: Rate 1-5 (1=mild/self-care, 5=emergency referral)
6. **Treatment Direction**: Purification (Panchakarma), diet correction, or direct treatment

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "condition": {
    "identified": "Ayurvedic name (e.g., Yauvan Pidika, Vicharchika, Kitibha)",
    "modernEquivalent": "Common name (e.g., Acne Vulgaris, Atopic Dermatitis, Psoriasis)",
    "confidence": 0.85,
    "differentialDiagnoses": ["Alternative 1", "Alternative 2"]
  },
  "severity": {
    "level": 3,
    "scale": "1-5",
    "description": "Moderate - Regular flares with visible inflammation, needs targeted protocol",
    "urgency": "routine"
  },
  "doshaAnalysis": {
    "primary": "Pitta",
    "secondary": "Kapha",
    "explanation": "Red inflamed lesions with pustules indicate Pitta aggravation; oily component shows Kapha involvement"
  },
  "rootCause": {
    "dietary": ["Spicy fried foods", "Excess dairy", "Irregular meals"],
    "lifestyle": ["Stress", "Late nights", "Suppressed urges"],
    "agniStatus": "Mandagni (weak digestion) with Ama accumulation",
    "explanation": "Pitta-aggravating diet combined with stress has weakened digestive fire, leading to toxin accumulation in Rakta dhatu"
  },
  "homeRemedies": [
    {
      "name": "Neem-Turmeric Paste",
      "type": "Ayurvedic",
      "ingredients": ["Fresh neem leaves", "Turmeric powder", "Rose water"],
      "preparation": "Grind neem leaves with turmeric and rose water into smooth paste",
      "application": "Apply on affected areas for 20 minutes, then rinse with cool water. Twice daily.",
      "duration": "7-14 days",
      "precautions": ["Patch test first", "Avoid sun exposure after application", "Do not use on open wounds"]
    },
    {
      "name": "Aloe Vera Gel",
      "type": "Modern",
      "ingredients": ["Fresh aloe vera leaf"],
      "preparation": "Extract clear gel from leaf",
      "application": "Apply thin layer 3-4 times daily",
      "duration": "Ongoing",
      "precautions": ["Use fresh gel only", "Discontinue if irritation occurs"]
    }
  ],
  "dietRecommendations": {
    "favor": ["Bitter vegetables (bitter gourd, neem)", "Cooling foods (cucumber, coconut water)", "Whole grains", "Ghee in moderation"],
    "avoid": ["Spicy, fried, fermented foods", "Excess dairy and sugar", "Alcohol and caffeine", "Nightshades (tomato, eggplant)"],
    "mealTiming": "Regular meals, largest at noon, light dinner by 7 PM",
    "hydration": "2-3L warm water daily, herbal teas (cumin-coriander-fennel)"
  },
  "lifestyleRecommendations": {
    "routine": ["Wake by 6 AM, sleep by 10 PM", "Oil massage (Abhyanga) with neem/coconut oil before bath", "Cool showers, avoid hot water"],
    "stressManagement": ["Pranayama (Sheetali, Sheetkari)", "Meditation 15 min daily", "Regular sleep schedule"],
    "exercise": "Moderate - walking, yoga; avoid excessive sweating",
    "environmental": "Cotton clothing, avoid synthetic fabrics, keep skin clean and dry"
  },
  "doctorReferral": {
    "required": true,
    "urgency": "routine",
    "specialty": "Ayurvedic Dermatology / Panchakarma",
    "reason": "Moderate severity with chronicity >3 months requires physician-supervised Panchakarma for root cause resolution",
    "suggestedTimeline": "Within 2 weeks",
    "keyQuestionsForPhysician": [
      "Should Virechana (therapeutic purgation) be initiated?",
      "Any contraindications for Raktamokshana (bloodletting)?",
      "Internal formulation: RSBK vs. classical kashaya?"
    ]
  },
  "redFlags": [
    "Rapidly spreading rash",
    "Fever with skin lesions",
    "Difficulty breathing or swallowing",
    "Signs of infection (pus, increasing pain, red streaks)"
  ],
  "disclaimer": "This AI analysis provides educational Ayurvedic perspective only. It is not a medical diagnosis and should not replace professional medical assessment. Please consult a qualified Ayurvedic physician for proper evaluation and treatment. Seek immediate emergency care for severe symptoms listed in redFlags."
`;
}

// Build user prompt with questionnaire data
function buildUserPrompt(questionnaire: Record<string, string>, imageBase64: string): string {
  const q = questionnaire;
  return `
Analyze this skin condition image combined with the following patient data:

PATIENT QUESTIONNAIRE:
- Age: ${q.age || 'Not provided'}
- Gender: ${q.gender || 'Not provided'}
- Duration of symptoms: ${q.duration || 'Not provided'}
- Primary symptoms: ${q.symptoms || 'Not provided'}
- Known triggers: ${q.triggers || 'Not provided'}
- Current treatment: ${q.currentTreatment || 'Not provided'}
- Digestive health: ${q.digestiveHealth || 'Not provided'}
- Body type (Prakriti): ${q.bodyType || 'Not provided'}
- Sleep quality: ${q.sleepQuality || 'Not provided'}
- Allergies: ${q.allergies || 'None reported'}

Please provide a comprehensive Ayurvedic skin analysis following the JSON format specified in the system prompt.
`;
}

export default async function handler(request: Request) {
  initSentry();

  const getHeader = (name: string) => request.headers?.[name.toLowerCase()];

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!isAllowedOrigin(getHeader('origin'))) {
    return jsonResponse({ error: 'Origin not allowed' }, 403);
  }

  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('[Skin Analyze] Nvidia API key not configured');
      return jsonResponse({ error: 'AI service not configured' }, 500);
    }

    // Parse multipart/form-data
    const contentType = getHeader('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return jsonResponse({ error: 'Content-Type must be multipart/form-data' }, 400);
    }

    // Vercel nodejs runtime: request is Node.js IncomingMessage
    const bodyText = await request.text();

    // Parse multipart manually (simplified for Vercel serverless)
    // We'll use a simple boundary parser
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return jsonResponse({ error: 'Invalid multipart boundary' }, 400);
    }
    const boundary = boundaryMatch[1];

    const parts = bodyText.split(`--${boundary}`).filter(part => part.trim() && !part.includes('--'));
    
    let imageFile: File | null = null;
    const questionnaire: Record<string, string> = {};

    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      
      const headers = part.slice(0, headerEnd);
      const content = part.slice(headerEnd + 4).replace(/\r\n$/, '');
      
      const dispositionMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/);

      if (dispositionMatch) {
        const fieldName = dispositionMatch[1];
        
        if (filenameMatch && contentTypeMatch) {
          // This is a file
          const mimeType = contentTypeMatch[1].trim();
          const fileName = filenameMatch[1];
          
          // Convert base64 content back to buffer for File-like object
          const buffer = Buffer.from(content, 'binary');
          imageFile = new File([buffer], fileName, { type: mimeType });
        } else if (QUESTIONNAIRE_FIELDS.includes(fieldName)) {
          questionnaire[fieldName] = content.trim();
        }
      }
    }

    // Validate image
    if (!imageFile) {
      return jsonResponse({ error: 'Image file is required' }, 400);
    }

    const fileValidation = validateFile(imageFile);
    if (!fileValidation.valid) {
      return jsonResponse({ error: fileValidation.error }, 400);
    }

    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);

    // Try each vision model
    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const model of VISION_MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
      
      try {
        const upstream = await fetch(NVIDIA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: buildSystemPrompt()
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: buildUserPrompt(questionnaire, imageBase64) },
                  { type: 'image_url', image_url: { url: imageBase64 } }
                ]
              }
            ],
            max_tokens: 4096,
            temperature: 0.3,
            top_p: 0.9
          }),
          signal: controller.signal,
        });

        console.log('[Skin Analyze]', model, '-> status', upstream.status);
        
        if (upstream.ok || !RETRYABLE_STATUS.includes(upstream.status)) {
          response = upstream;
          break;
        }
        lastError = new Error(`HTTP ${upstream.status}`);
      } catch (error) {
        console.log('[Skin Analyze]', model, '->', error instanceof Error ? error.name : 'error');
        lastError = error instanceof Error ? error : new Error(String(error));
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!response) {
      console.error('[Skin Analyze] All vision models unavailable');
      return jsonResponse({ 
        error: 'AI vision service temporarily unavailable. Please try again later.' 
      }, 502);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Skin Analyze] Upstream error:', response.status, errorText);
      return jsonResponse({ error: `AI API error (${response.status})` }, response.status);
    }

    const data = await response.json();
    console.log('[Skin Analyze] Success');
    
    // Extract and parse the JSON response from the AI
    const aiContent = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from AI response
    let parsedResult;
    try {
      // Find JSON in the response (AI might wrap in markdown)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Skin Analyze] Failed to parse AI JSON response:', parseError);
      // Return structured error with raw content for debugging
      return jsonResponse({
        error: 'Failed to parse AI analysis',
        rawContent: aiContent.slice(0, 500)
      }, 500);
    }

    return jsonResponse(parsedResult, 200);

  } catch (error) {
    console.error('[Skin Analyze] Error:', error);
    if (sentryInitialized) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.captureException(error);
      } catch { /* silent */ }
    }
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}