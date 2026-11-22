# Image-Based Skin Disease Recognition Feature Plan

## Executive Summary

This document outlines a comprehensive plan for implementing an AI-powered image-based skin disease recognition feature for Ayurvritta Ayurveda Hospital website. The system will allow patients to upload images of their skin conditions and receive preliminary Ayurvedic analysis alongside modern dermatological insights.

---

## 1. Problem Statement

Patients currently face challenges in:
- Self-assessing skin conditions accurately
- Understanding their conditions before doctor visits
- Communicating symptoms effectively to physicians
- Accessing preliminary guidance without financial commitment

---

## 2. Competitive Landscape Analysis

### 2.1 Existing AI-Based Skin Disease Recognition Platforms

| Platform | Provider | Model Type | Accuracy | Features | Limitations |
|----------|----------|------------|----------|----------|-------------|
| **Médecin.ai** | Qualcomm | Ensemble CNN | 91.1% | 27 disease classes, skin tone analysis | Commercial licensing required |
| **DermAI** | Multiple | ViT + CNN | ~85% | Real-time analysis, treatment suggestions | Requires dermatologist review |
| **SkinVision** | SkinVision BV | Custom CNN | FDA-cleared | Malignancy detection, risk assessment | Proprietary model, paid API |
| **Miiskin** | Miiskin | CNN-based | - | Photo tracking, pattern recognition | Limited disease classification |
| **Microsoft Health Bot** | Microsoft | Azure Custom Vision | Configurable | Multi-condition analysis | Requires training data |

### 2.2 Key Learnings from Market Leaders

1. **Hybrid Approach**: Combining computer vision with structured questionnaires improves accuracy
2. **Multi-modal Analysis**: Image + metadata (location, duration, symptoms) yields better results
3. **Confidence Scoring**: Providing confidence levels prevents over-reliance on AI
4. **Medical Disclaimer**: Clear disclaimers about non-diagnostic nature required
5. **Privacy-First**: Secure image handling, no permanent storage, HIPAA considerations
6. **Skin Tone Calibration**: Models often bias toward lighter skin tones - need mitigation

---

## 3. Technical Architecture

### 3.1 System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Patient App   │────▶│  Next.js API    │────▶│  AI Model Proxy  │
│  (Browser/Mobile)│     │   (Vercel Edge) │     │   (Nvidia/NIM)   │
└─────────────────┘     └─────────────────┘     └──────────────────┘
         │                        │                        │
         │ Image Upload           │ Image Transform        │ Model Inference
         │ Metadata Collection      │ Security Check         │ Response
         │                        │ Rate Limiting          │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Ayurvedic Analysis Engine                        │
│  - Dosha Assessment from Image Features                           │
│  - Treatment Recommendations                                       │
│  - Diet & Lifestyle Suggestions                                   │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Response Composition                             │
│  - Primary diagnosis (medical)                                    │
│  - Ayurvedic interpretation                                     │
│  - Actionable recommendations                                   │
│  - Physician consultation prompt                                  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Patient Dashboard │
│ - Results Display │
│ - Save History    │
│ - Share with Doc  │
└─────────────────┘
```

### 3.2 Component Architecture

#### 3.2.1 Frontend Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| `ImageUploader.tsx` | Drag-and-drop/image upload with validation | react-dropzone |
| `SkinConditionForm.tsx` | Structured questionnaire for context | Existing UI patterns |
| `ImageAnalysisResult.tsx` | Display analysis results with Ayurvedic overlay | markdown rendering |
| `ConfidenceMeter.tsx` | Visualize prediction confidence | d3.js or custom SVG |
| `HistoryPanel.tsx` | Previous analysis history (optional) | localStorage/IndexedDB |

#### 3.2.2 Backend API Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/api/skin-analyze` | POST | Main analysis endpoint | 10/min per IP |
| `/api/skin-models` | GET | Available model information | 60/min |
| `/api/skin-webhook` | POST | Webhook for model events | - |

### 3.3 AI Model Architecture

#### 3.3.1 Model Selection Strategy

**Primary Model**: NVIDIA NIM Medical Imaging Models
- **Model Option 1**: `stabilityai/stable-diffusion-xl-base-1.0` (for image preprocessing)
- **Model Option 2**: Custom fine-tuned CNN for dermatological conditions
- **Model Option 3**: Meta's Vision Transformer for multi-modal analysis

**Fallback Models**:
1. Google Vertex AI Med-PaLM with vision capabilities
2. Azure Health Bot AI models
3. Open-source: `facebook/swin-base-patch32-model` fine-tuned on dermatology datasets

#### 3.3.2 Model Input/Output Schema

```json
{
  "input": {
    "image": "base64 or URL",
    "metadata": {
      "location": "face, arms, chest, back, legs, etc.",
      "duration": "days, weeks, months",
      "symptoms": ["itching", "pain", "burning", "dryness"],
      "triggaers": ["sun", "stress", "food", "weather"],
      "current_treatment": "string",
      "patient_age": "number",
      "patient_sex": "male/female/other",
      "skin_tone": "Fitzpatrick I-VI"
    }
  },
  "output": {
    "diagnoses": [
      {
        "condition": "string",
        "confidence": "0-100",
        "ayurvedic_equivalent": "string",
        "dosha_imbalance": ["vata", "pitta", "kapha"],
        "severity": "mild/moderate/severe",
        "recommendation": "string"
      }
    ],
    "treatments": {
      "topical": ["list of recommendations"],
      "oral": ["list of recommendations"],
      "dietary": ["list of recommendations"],
      "lifestyle": ["list of recommendations"],
      "panchakarma": ["if applicable"]
    },
    "follow_up": {
      "timeline": "string",
      "doctor_consultation": "boolean",
      "red_flags": ["list of warning signs"]
    }
  }
}
```

### 3.4 Data Flow

1. **Image Capture**
   - Patient uploads image via browser camera or file upload
   - Client-side validation (file type, size < 5MB)
   - Resize/compression using Canvas API

2. **Security Processing**
   - Server-side virus/malware scan
   - Content moderation (no inappropriate content)
   - Anonymization (remove EXIF location data)

3. **Analysis Request**
   - Transform image to base64
   - Package with metadata
   - Send to AI proxy via Vercel Edge Function

4. **AI Processing**
   - Proxy routes to appropriate model (Nvidia NIM)
   - Model returns diagnosis with confidence scores
   - Apply Ayurvedic interpretation layer

5. **Response Generation**
   - Format medical insights
   - Overlay Ayurvedic analysis
   - Generate actionable recommendations
   - Include clear disclaimer

6. **Response Delivery**
   - Secure JSON response (no images stored)
   - Optional: Save to session storage
   - Display to patient with share option

---

## 4. Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
**Duration**: 2-3 weeks

**Features**:
- [ ] Image upload component with validation
- [ ] Basic metadata collection form
- [ ] API endpoint `/api/skin-analyze`
- [ ] Integration with existing `aiService` pattern
- [ ] Results display with Ayurvedic overlay
- [ ] Medical disclaimer and safety warnings
- [ ] Rate limiting (10 requests/minute)

**Tech Stack**:
- React 18 + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS (existing design system)
- Nvidia NIM via `/api/nvidia.ts` proxy
- Existing `aiService.ts` for API communication

### Phase 2: Enhanced Features
**Duration**: 3-4 weeks

**Features**:
- [ ] Confidence meter visualization
- [ ] Multiple image analysis
- [ ] Condition history (localStorage)
- [ ] Share results with doctors
- [ ] Mobile camera integration
- [ ] Image comparison tool (before/after)
- [ ] Download report (PDF)

### Phase 3: Advanced Capabilities
**Duration**: 4-6 weeks

**Features**:
- [ ] Ayurvedic dosha visualization
- [ ] Treatment timeline generator
- [ ] Integration with booking system
- [ ] Multi-model ensemble (fallback)
- [ ] A/B testing for model comparison
- [ ] Performance analytics dashboard

---

## 5. Safety and Compliance

### 5.1 Medical Safety

**Critical Safeguards**:
1. **Clear Disclaimer**: "This AI analysis is NOT a medical diagnosis"
2. **Emergency Red Flags**: Auto-detect and flag potential serious conditions
3. **Confidence Threshold**: Below 60% confidence = recommend doctor visit
4. **Malignancy Screening**: Model must identify potential skin cancer
5. **Physician Referral**: Strong CTA for all results

**Red Flag Conditions** (Auto-flag):
- Melanoma/Atypical moles
- Severe infection signs
- Bleeding lesions
- Rapidly growing masses
- Systemic symptoms

### 5.2 Privacy & Security

**Data Handling**:
- No permanent image storage
- Images processed in-memory only
- Temporary cache cleared after 1 hour
- GDPR/HIPAA compliant data handling
- No EXIF location data retained

**Security Measures**:
- Rate limiting per IP (prevent abuse)
- Content moderation for uploads
- HTTPS-only transmission
- Input sanitization on all endpoints

### 5.3 Accuracy Considerations

**Model Limitations**:
- Trained primarily on Fitzpatrick skin types I-III
- May have reduced accuracy on darker skin tones
- Cannot replace dermatologist examination
- Lighting/shadowing affects accuracy

**Mitigation Strategies**:
1. Skin tone calibration image option
2. Lighting guidance before upload
3. Multiple angle suggestions
4. Confidence adjustment for dark skin tones

---

## 6. Design System Integration

### 6.1 Component Styling

**Color Palette**:
- Primary: `ayur-green` (#4CAF50) for positive outcomes
- Secondary: `ayur-accent` (#FF9800) for warnings
- Error: `ayur-red` (#F44336) for red flags
- Background: `ayur-cream` with proper contrast

**Accessibility**:
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- Color contrast ratios ≥ 4.5:1
- Reduced motion support (CSS media queries)

### 6.2 Mobile-First Design

**Responsive Considerations**:
- Touch targets ≥ 48px (per mobile-first rules)
- Safe area insets for mobile browsers
- Lazy loading for images
- Reduced motion for mobile users
- Camera access optimization

---

## 7. API Design

### 7.1 Endpoint Specification

**`POST /api/skin-analyze`**

Request:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "metadata": {
    "location": "arms",
    "duration": "weeks",
    "symptoms": ["dryness", "itching"],
    "age": 35,
    "sex": "female",
    "skin_tone": "III"
  }
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "condition": "Atopic Dermatitis",
    "ayurvedic": "Vicharchika",
    "confidence": 82.5,
    "dosha_imbalance": ["vata", "pitta"],
    "recommendations": {
      "immediate": ["Apply oatmeal paste", "Avoid hot showers"],
      "short_term": ["Increase omega-3 intake", "Use colloidal oatmeal baths"],
      "long_term": ["Regular sesame oil massage", "Avoid triggering foods"]
    },
    "follow_up": {
      "doctor_consultation": true,
      "timeline": "Within 48 hours if worsening"
    }
  },
  "disclaimer": "This is not a medical diagnosis..."
}
```

### 7.2 Error Handling

| Error Code | Meaning | Client Action |
|------------|---------|---------------|
| 400 | Invalid image/metadata | Show validation error |
| 401 | API key missing | Redirect to health page |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Model unavailable | Retry with exponential backoff |
| 502 | Model error | Show service unavailable |

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Image validation logic
- API request/response parsing
- Ayurvedic analysis calculations
- Confidence scoring adjustments

### 8.2 Integration Tests
- Full image analysis pipeline
- Model API integration
- Database/history operations
- Rate limiting functionality

### 8.3 Manual Testing
- Various skin conditions (real anonymized cases)
- Different skin tones (Fitzpatrick I-VI)
- Lighting variations
- Mobile vs desktop performance

### 8.4 Safety Testing
- Red flag condition detection
- Emergency scenario handling
- Edge case inputs
- Error state UI

---

## 9. Performance Optimization

### 9.1 Image Processing
- Client-side compression (reduce to ~500KB)
- Resize to max 1080px on longest side
- WebP format when supported
- Lazy loading for gallery view

### 9.2 API Performance
- Vercel Edge Functions for low latency
- Response caching (5 minutes)
- Streaming responses for long operations
- CDN for static assets

### 9.3 Budget Considerations
- Estimated cost: $0.01-0.05 per analysis (Nvidia NIM)
- Free tier support: ~40 requests/minute
- Cost monitoring via Vercel analytics
- Usage alerts at 80% threshold

---

## 10. Deployment Plan

### 10.1 Preview Environment
- Feature branch: `feature/image-skin-recognition`
- Vercel preview deployment
- QA testing with sample images
- Stakeholder review

### 10.2 Production Rollout
1. Deploy to staging environment
2. A/B test with 10% of users
3. Monitor error rates and accuracy
4. Gradual rollout to 100%
5. Post-deployment monitoring

### 10.3 Rollback Plan
- Revert to previous deployment if issues detected
- Feature flag to disable quickly
- Monitoring alerts for >5% error rate

---

## 11. Success Metrics

### 11.1 Technical Metrics
- API response time < 10 seconds
- Image upload success rate > 95%
- API uptime > 99.5%
- Error rate < 1%

### 11.2 Business Metrics
- Usage: >50 analyses/week
- Conversion to booking: >5%
- User satisfaction (if surveyed): >4/5
- Reduction in support tickets about skin concerns

### 11.3 Safety Metrics
- Red flag detection rate: 100%
- Emergency referral compliance: 100%
- Patient escalation rate: <5% (expected, not negative)

---

## 12. Content & Copy Requirements

### 12.1 Page Content
- Title: "Get AI-Powered Second Opinion on Your Skin Concern"
- Description: "Upload an image and receive personalized Ayurvedic insights"
- Call-to-action: "Get Started", "Book Consultation", "See Your Results"

### 12.2 Disclaimer Text
```
Important: This AI analysis is for educational purposes only and does not 
replace professional medical diagnosis. Skin conditions require proper 
in-person evaluation. If you notice concerning changes, bleeding, 
rapid growth, or systemic symptoms, please seek immediate 
medical attention.
```

### 12.3 Email Template (Optional)
- Subject: "Your Skin Analysis Summary"
- Body: Results + booking link + follow-up reminders

---

## 13. Resource Requirements

### 13.1 Development Hours
- Frontend component: 40 hours
- Backend API: 30 hours
- AI integration: 30 hours
- Testing: 20 hours
- Documentation: 10 hours
- **Total: ~130 hours**

### 13.2 Infrastructure
- Vercel Edge Functions (covered by existing plan)
- Nvidia NIM API credits (estimated 1000 analyses/month)
- No additional server costs

### 13.3 Third-Party Dependencies
- New: `react-dropzone` for image upload
- New: `html2canvas` for image processing (existing?)
- Existing: `aiService.ts`, `/api/nvidia.ts`

---

## 14. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Misdiagnosis | Medium | High | Strong disclaimers, red flag detection |
| Privacy breach | Low | High | No storage, secure transmission |
| Model bias | Medium | Medium | Skin tone calibration, confidence adjustment |
| Cost overrun | Low | Medium | Usage monitoring, rate limiting |
| API downtime | Low | Medium | Fallback to text-based tool |

---

## 15. Next Steps

1. **Stakeholder Approval**: Review plan with medical team
2. **Legal Review**: Verify disclaimer language
3. **Model Selection**: Choose specific Nvidia NIM model
4. **Dataset Preparation**: Collect anonymized training data
5. **Begin Phase 1 Implementation**: Start with MVP

---

## 16. References

- [FDA Guidance on AI/ML-Based Software as a Medical Device](https://www.fda.gov/medical-devices/software-medical-device-samd/fda-guidance-ai-ml-based-software-medical-device)
- [WHO Digital Health Guidelines](https://www.who.int/publications/i/item/9789240025518)
- [Ayurvedic Dermatology Principles](https://www.ayurveda.com)
- [Nvidia NIM Documentation](https://docs.nvidia.com/nim)
- [HIPAA Compliance Checklist](https://www.hhs.gov/hipaa)

---

*Plan created: November 2026*
*Version: 1.0*
*Author: AI Architecture Planning*