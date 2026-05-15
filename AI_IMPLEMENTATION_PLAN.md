# Comprehensive Nvidia NIM API Integration Plan

## Part 1: Research Summary

### Nvidia NIM Free API Features:
- **Free access** with ~40 requests/minute rate limit
- **100+ models** including Llama, Gemma, DeepSeek, Qwen, Mistral, and NVIDIA's Nemotron
- **OpenAI-compatible API** endpoints - easy to integrate
- **No credit card required** - sign up at https://build.nvidia.com
- **API Key format**: `nvapi-xxxx...`
- **Base URL**: `https://integrate.api.nvidia.com/v1`

---

## Part 2: Current AI Usage Analysis

### Files Using AI (Google Gemini):

| Feature | File | Purpose |
|---------|------|---------|
| Insurance Document Analysis | `pages/Insurance.tsx` | Analyze uploaded policy documents |
| AI Chatbot | `components/ChatBot.tsx` | Patient assistance |
| Prakriti Avatar | `components/tools/PrakritiTool.tsx` | Generate constitution-based image |
| AI Diet Plan | `components/tools/DietGenerator.tsx` | Personalized diet recommendations |
| Location Assistant | `components/LocationExplorer.tsx` | Nearby place recommendations |

### Error in Image:
The "Analysis Service Unavailable" message is from the **Insurance page** where users upload insurance documents for AI-powered verification.

---

## Part 3: Integration Strategy

### Option A: Replace Google Gemini with Nvidia (Recommended)
**Pros:**
- Free tier available (no per-token costs)
- 100+ model options
- OpenAI-compatible API (minimal code changes)
- Better for Vadodara/India region latency

**Cons:**
- Rate limit ~40 req/min (may need queuing for high traffic)
- Some models may have different capabilities than Gemini

### Option B: Dual API System (Hybrid)
**Implementation:**
- Primary: Nvidia NIM (free)
- Fallback: Google Gemini (if Nvidia fails)
- Switch based on availability

---

## Part 4: Technical Implementation Plan

### Step 1: Create Unified AI Service
```typescript
// services/aiService.ts - New unified AI wrapper

export type ModelProvider = 'nvidia' | 'google';

interface AIConfig {
  provider: ModelProvider;
  model: string;
  apiKey: string;
}

// Default to Nvidia for cost savings
const defaultConfig: AIConfig = {
  provider: 'nvidia',
  model: 'nvidia/llama-3.1-nemotron-nano-8b-v1',
  apiKey: import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
};
```

### Step 2: Environment Variables
```env
# Vercel Environment Variables
VITE_NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxx
# Keep Google as fallback
VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxx
```

### Step 3: API Client Structure
```typescript
// lib/nvidiaClient.ts
const NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1';

async function generateContent(prompt: string, model?: string) {
  const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'nvidia/llama-3.1-nemotron-nano-8b-v1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  return response.json();
}
```

---

## Part 5: Feature-Specific Integration

### A. Insurance Document Analysis (Priority 1)

**Current Flow:**
1. User uploads insurance PDF/image
2. Google Gemini analyzes document
3. Returns: Coverage details, TPA contact, claim process

**New Flow with Nvidia:**
```typescript
// Insurance.tsx - Document Analysis
const analyzeInsuranceDoc = async (file: File) => {
  // Convert to base64
  const base64 = await fileToBase64(file);

  // Use Nvidia LLM for document parsing
  const prompt = `You are an Ayurvedic hospital insurance expert.
    Analyze this insurance document and provide:
    1. Policy validity status
    2. Coverage amount and limits
    3. Cashless facility availability
    4. Pre-authorization requirements
    5. TPA contact details if mentioned

    Document: ${base64.substring(0, 1000)}...`;

  return await nvidiaChat(prompt);
};
```

**Fallback Message Improvement:**
- Current: Generic "Service Unavailable"
- New: Try Nvidia → If fails, try Google → If both fail, show manual assistance options

---

### B. Prakriti Assessment Avatar (Priority 2)

**Current:** Google Gemini 2.5 for image generation

**Nvidia Alternative:**
- Nvidia doesn't have native image generation in free tier
- **Solution**: Use text-based analysis only, or use alternative
- **Recommendation**: Keep Gemini for image, use Nvidia for text analysis

---

### C. AI Diet Planner (Priority 2)

**Current:** Google Gemini generates personalized diet

**New Flow:**
```typescript
// DietGenerator.tsx
const generateDietPlan = async (patientData) => {
  const prompt = `Act as an Ayurvedic physician.
    Create a personalized diet plan for:
    - Constitution: ${patientData.prakriti}
    - Condition: ${patientData.condition}
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    - Digestive Strength: ${patientData.digestiveState}

    Include:
    - Morning routine (Dinacharya)
    - Breakfast, Lunch, Dinner recommendations
    - Foods to avoid (Apathya)
    - Seasonal adjustments (Ritucharya)

    Format in ${patientData.language || 'English'}`;

  return await nvidiaChat(prompt);
};
```

---

### D. ChatBot (Priority 3)

**Current:** Google Gemini 2.0 Flash

**New Flow:**
- Primary: Nvidia Llama-3.1-8B (free, fast)
- Fine-tuned for Ayurvedic responses

---

## Part 6: Fallback Strategy

### Error Handling Architecture:
```typescript
// lib/aiService.ts - Smart fallback
async function smartAIRequest(prompt: string, preferredProvider: 'nvidia' | 'google' = 'nvidia') {
  try {
    // Try primary (Nvidia)
    if (preferredProvider === 'nvidia') {
      return await nvidiaRequest(prompt);
    }
  } catch (error) {
    console.warn('Nvidia failed, trying Google:', error);

    try {
      // Fallback to Google
      return await googleRequest(prompt);
    } catch (googleError) {
      console.error('Both AI services failed');
      return {
        success: false,
        error: 'AI service temporarily unavailable',
        fallbackMessage: getManualAssistanceMessage()
      };
    }
  }
}
```

### User-Friendly Messages:
- "Our AI is currently busy. You can still proceed with cashless treatment. Contact TPA desk: +91 94266 84047"
- "Getting your diet plan ready... This may take a moment."

---

## Part 7: Implementation Phases

### Phase 1: Infrastructure (Day 1)
1. Create `lib/nvidiaClient.ts` - Nvidia API wrapper
2. Create `lib/aiService.ts` - Unified AI service with fallback
3. Add environment variables to Vercel

### Phase 2: Insurance Page (Day 2)
1. Replace Google Gemini calls with `aiService`
2. Update error handling
3. Test document analysis

### Phase 3: Tools Integration (Day 3-4)
1. PrakritiTool: Keep Gemini for image, use Nvidia for text
2. DietGenerator: Use Nvidia primary
3. ChatBot: Test with Nvidia Llama

### Phase 4: Monitoring (Day 5)
1. Track AI service usage
2. Monitor rate limits
3. Add analytics for fallback events

---

## Part 8: Questions Before Implementation

1. **Which Nvidia models should we prioritize?**
   - `nvidia/llama-3.1-nemotron-nano-8b-v1` (fast, free)
   - `meta/llama-3.1-8b-instruct` (larger context)
   - `deepseek-ai/deepseek-r1` (reasoning)

2. **Rate limit handling?**
   - Implement request queuing?
   - Show user wait times?

3. **Which features should use Nvidia vs keep Google?**
   - Image generation → Keep Gemini
   - Text chat/analysis → Use Nvidia
   - Document parsing → Test both

4. **Manual fallback message enhancement?**
   - Current: Show TPA number
   - Add: Quick WhatsApp link?
   - Add: Appointment booking option?

---

## Implementation Details

### Selected Approach: Dual API System with Smart Fallback

**Primary Provider:** Nvidia NIM (free tier)
- Model: `nvidia/llama-3.1-nemotron-nano-8b-v1` (fast, reliable)
- Used for: Chat, diet plans, document analysis, location recommendations

**Fallback Provider:** Google Gemini
- Model: `gemini-2.0-flash` (fast, reliable)
- Used for: Image generation only (Prakriti avatar)

**Rate Limit Strategy:**
- Show user-friendly "AI is busy" message with retry option
- Auto-fallback to Google if Nvidia rate limited

### File Structure Changes:

```
lib/
  aiService.ts        - Unified AI service (NEW)
  nvidiaClient.ts     - Nvidia API wrapper (NEW)
  googleClient.ts     - Existing Google client (MODIFY)

pages/
  Insurance.tsx       - Update to use aiService (MODIFY)

components/
  ChatBot.tsx         - Update to use aiService (MODIFY)
  LocationExplorer.tsx - Update to use aiService (MODIFY)

components/tools/
  PrakritiTool.tsx    - Keep Gemini for images, Nvidia for text (MODIFY)
  DietGenerator.tsx   - Update to use aiService (MODIFY)
```

### Environment Variables Required:

```env
# Vercel Environment Variables (add these)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
```

### Testing Plan:
1. Test Insurance document upload with sample PDF
2. Test ChatBot with sample Ayurvedic questions
3. Test DietGenerator with sample patient data
4. Test PrakritiTool for text analysis and image generation
5. Test LocationExplorer with sample queries
6. Verify fallback works when primary fails