import React, { useState, useMemo, useRef, useEffect } from 'react';
import { aiService } from '../lib/aiService';

// ─── Knowledge file import via Vite ───
const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// ─── Build searchable index ───
interface ConditionEntry {
  id: string;
  label: string;
  category: string;
  keywords: string[];
  rawPath: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Digestive': ['acidity', 'gerd', 'constipation', 'diarrhoea', 'ibs', 'crohn', 'colitis', 'digestion', 'gall', 'celiac', 'fistula', 'piles', 'hemorrhoids'],
  'Metabolic': ['diabetes', 'diabetic', 'obesity', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'cholesterol', 'triglyceride'],
  'Liver & Kidney': ['liver', 'kidney', 'jaundice', 'hepatitis', 'nephrotic', 'ascites', 'cirrhosis'],
  'Respiratory': ['asthma', 'sinus', 'common-cold', 'breathing'],
  'Joint & Bone': ['arthritis', 'rheumatoid', 'gout', 'osteoporosis', 'back-pain', 'slipped-disc', 'fibromyalgia'],
  'Heart & Blood': ['hypertension', 'hypotension', 'heart', 'anemia', 'edema', 'itp'],
  'Neurological': ['migraine', 'headache', 'depression', 'bells-palsy'],
  'Skin': ['psoriasis', 'eczema', 'skin-problems', 'scleroderma'],
  "Women's Health": ['menopause', 'ovarian', 'fibroid', 'premenstrual', 'amenorrhea', 'pregnant', 'endometriosis', 'adenomyosis'],
  "Men's Health": ['prostate', 'oligospermia'],
  'Cancer & Immunity': ['cancer', 'allergy', 'dengue', 'herpes', 'lymph'],
  'Children': ['toddlers', 'school-going', 'childhood'],
  'Prakriti': ['vata-prakriti', 'pitta-prakriti', 'kapha-prakriti'],
};

function getConditionCategory(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'General';
}

function getConditionLabel(slug: string): string {
  return slug
    .replace(/^diet-(chart|plan)-for-/, '')
    .replace(/^diet-to-/, '')
    .replace(/-patients?$/, '')
    .replace(/-patient$/, '')
    .replace(/-disease$/, '')
    .replace(/-problems?$/, '')
    .replace(/-problem$/, '')
    .replace(/-syndrome$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const ALL_CONDITIONS: ConditionEntry[] = Object.keys(knowledgeModules)
  .filter(p => !p.endsWith('README.md'))
  .map(path => {
    const slug = path.split('/').pop()!.replace('.md', '');
    const words = slug.replace(/^diet-(chart|plan)-for-?/, '').split('-').filter(w => w.length > 2);
    return {
      id: slug,
      label: getConditionLabel(slug),
      category: getConditionCategory(slug),
      keywords: [...words, slug],
      rawPath: path,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

// ─── Popular complaints with clean names ───
const POPULAR_COMPLAINTS = [
  { label: 'Diabetes', icon: '🩸', keywords: ['diabetes', 'diabetic'] },
  { label: 'Acidity & GERD', icon: '🔥', keywords: ['acidity', 'gerd', 'reflux'] },
  { label: 'Obesity', icon: '⚖️', keywords: ['obesity', 'overweight'] },
  { label: 'Hypertension', icon: '💓', keywords: ['hypertension', 'blood-pressure'] },
  { label: 'Thyroid Disorders', icon: '🦋', keywords: ['thyroid', 'hypothyroidism', 'hyperthyroidism'] },
  { label: 'Arthritis', icon: '🦴', keywords: ['arthritis', 'rheumatoid'] },
  { label: 'Kidney Disease', icon: '🫘', keywords: ['kidney', 'nephrotic'] },
  { label: 'Liver Disease', icon: '🫀', keywords: ['liver', 'fatty-liver', 'jaundice', 'hepatitis'] },
  { label: 'Constipation', icon: '🚽', keywords: ['constipation'] },
  { label: 'Migraine', icon: '🧠', keywords: ['migraine', 'headache'] },
  { label: 'Skin Problems', icon: '🧴', keywords: ['skin', 'psoriasis', 'eczema'] },
  { label: 'High Cholesterol', icon: '🩺', keywords: ['cholesterol', 'triglyceride'] },
  { label: 'PCOS & Ovarian Cysts', icon: '🌸', keywords: ['ovarian', 'cyst', 'fibroid'] },
  { label: 'Depression', icon: '🧘', keywords: ['depression'] },
  { label: 'Anemia', icon: '💉', keywords: ['anemia'] },
  { label: 'Infertility', icon: '👶', keywords: ['infertility', 'oligospermia'] },
  { label: 'Asthma', icon: '🫁', keywords: ['asthma'] },
  { label: 'Heart Disease', icon: '❤️', keywords: ['heart', 'cardiac'] },
  { label: 'Menopause', icon: '🌡️', keywords: ['menopause'] },
  { label: 'Gout', icon: '🦶', keywords: ['gout'] },
];

function searchConditions(query: string): ConditionEntry[] {
  if (!query.trim()) return ALL_CONDITIONS;
  const q = query.toLowerCase().trim();
  return ALL_CONDITIONS.filter(c => {
    const text = `${c.label} ${c.keywords.join(' ')} ${c.category}`.toLowerCase();
    return text.includes(q) || q.split(/\s+/).some(w => w.length > 2 && text.includes(w));
  });
}

function matchComplaintsToFiles(complaints: string): ConditionEntry[] {
  const lower = complaints.toLowerCase();
  const matched: ConditionEntry[] = [];
  const seen = new Set<string>();

  for (const condition of ALL_CONDITIONS) {
    const text = `${condition.label} ${condition.keywords.join(' ')}`.toLowerCase();
    if (lower.split(/[\s,;]+/).some(w => w.length > 2 && text.includes(w)) && !seen.has(condition.id)) {
      seen.add(condition.id);
      matched.push(condition);
    }
  }
  return matched.slice(0, 3);
}

// ─── Interfaces ───
interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  occupation: string;
}

interface DietInputs {
  patient: PatientInfo;
  complaints: string[];
  customComplaint: string;
  prakriti: string;
  dietaryPref: string;
  allergies: string[];
}

type Phase = 'welcome' | 'patient' | 'complaints' | 'profile' | 'generating' | 'result';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const PRAKRITI_OPTIONS = ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic', 'Not Sure'];
const DIET_OPTIONS = [
  { value: 'Vegetarian', icon: '🥬' },
  { value: 'Non-Vegetarian', icon: '🍗' },
  { value: 'Vegan', icon: '🌱' },
  { value: 'Eggetarian', icon: '🥚' },
];
const ALLERGY_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Soy', 'Seafood', 'Nightshades', 'None'];

// ─── Component ───
const DietChartTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [inputs, setInputs] = useState<DietInputs>({
    patient: { name: '', age: '', gender: '', occupation: '' },
    complaints: [],
    customComplaint: '',
    prakriti: '',
    dietaryPref: '',
    allergies: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [matchedFiles, setMatchedFiles] = useState<ConditionEntry[]>([]);
  const [animatedPhase, setAnimatedPhase] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredConditions = useMemo(() => searchConditions(searchQuery), [searchQuery]);

  // Phase transition with animation trigger
  const goToPhase = (p: Phase) => {
    setAnimatedPhase(false);
    setTimeout(() => {
      setPhase(p);
      setAnimatedPhase(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const toggleComplaint = (label: string) => {
    setInputs(prev => ({
      ...prev,
      complaints: prev.complaints.includes(label)
        ? prev.complaints.filter(c => c !== label)
        : prev.complaints.length < 3 ? [...prev.complaints, label] : prev.complaints,
    }));
  };

  const toggleAllergy = (a: string) => {
    setInputs(prev => ({
      ...prev,
      allergies: a === 'None' ? ['None'] : prev.allergies.includes(a)
        ? prev.allergies.filter(x => x !== a)
        : [...prev.allergies.filter(x => x !== 'None'), a],
    }));
  };

  const generateDiet = async () => {
    goToPhase('generating');

    // Build complaint text
    const complaintText = [...inputs.complaints, inputs.customComplaint].filter(Boolean).join(', ');

    // Match knowledge files
    const matched = matchComplaintsToFiles(complaintText);
    setMatchedFiles(matched);

    const knowledgeContent = matched
      .map(e => `${e.label}:\n${(knowledgeModules[e.rawPath] || '').substring(0, 500)}`)
      .join('\n\n');

    const prompt = `Create a personalized Ayurvedic diet plan for:
${inputs.patient.name}, ${inputs.patient.age}y, ${inputs.patient.gender}${inputs.patient.occupation ? `, ${inputs.patient.occupation}` : ''}
Prakriti: ${inputs.prakriti || 'Not assessed'} | Diet: ${inputs.dietaryPref || 'Veg'}${inputs.allergies.length > 0 ? ` | Allergies: ${inputs.allergies.join(', ')}` : ''}
Condition: ${complaintText || 'General wellness'}

${knowledgeContent ? `Ref:\n${knowledgeContent}\n\n` : ''}Sections (ALL CAPS, one per line): EARLY MORNING, BREAKFAST, MID-MORNING, LUNCH, EVENING SNACK, DINNER, BEDTIME, FOODS TO FAVOR, FOODS TO AVOID, BENEFICIAL HERBS, LIFESTYLE TIPS, PRECAUTIONS.

Each: 2-3 Indian foods with brief Ayurvedic reasoning. Include 5 herbs with dosage. Under 800 words.`;

    try {
      const systemInstruction = 'You are an Ayurvedic dietitian at Ayurvritta Ayurveda Hospital, Vadodara. Create practical, personalized diet plans rooted in classical Ayurvedic principles. Use Indian food names. Format sections in ALL CAPS on separate lines.';

      // Add timeout wrapper (matching Insurance page pattern)
      const generatePromise = aiService.generate(prompt, systemInstruction, {
        temperature: 0.6,
        max_tokens: 1000,
      });
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out - please try again')), 45000)
      );

      const content = await Promise.race([generatePromise, timeoutPromise]);

      if (content) {
        setAiResult(content);
        setIsLocal(false);
        goToPhase('result');
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '';
      console.error('[DietChart] AI Error:', errorMsg);

      // Show user-friendly error for timeout scenarios
      if (errorMsg.includes('timed out') || errorMsg.includes('504') || errorMsg.includes('timeout')) {
        setAiResult(`### AI Service Taking Too Long

The AI is taking longer than expected to generate your diet plan.

**Options:**
1. Try selecting fewer conditions (1-2 max)
2. Try again in a few moments
3. Call us for a personalized plan: +91 94266 84047

**Reference diet chart from our knowledge base:**

${matched.length > 0
  ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n')
  : 'No specific diet chart found for your condition.'}`);
        setIsLocal(true);
        goToPhase('result');
        return;
      }

      // Fallback: use raw knowledge
      const fallback = matched.length > 0
        ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n')
        : `No specific diet chart found for "${complaintText}" in our knowledge base.\n\nPlease consult Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital for a personalized diet plan.\n\nContact: +91 94266 84047`;
      setAiResult(fallback);
      setIsLocal(true);
      goToPhase('result');
    }
  };

  // ─── Progress bar ───
  const phaseOrder: Phase[] = ['welcome', 'patient', 'complaints', 'profile', 'generating', 'result'];
  const currentIdx = phaseOrder.indexOf(phase);
  const progressPct = phase === 'generating' ? 90 : phase === 'result' ? 100 : (currentIdx / (phaseOrder.length - 2)) * 100;

  // ─── Render ───
  return (
    <div ref={scrollRef} className="min-h-screen bg-gradient-to-br from-ayur-green-light via-white to-ayur-accent-light">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-ayur-green/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold hover:gap-3 transition-all min-h-[44px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-serif font-bold text-ayur-green text-sm">AI Diet Chart</span>
          </div>
          <div className="w-16" />
        </div>
        {/* Progress bar */}
        {phase !== 'welcome' && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`max-w-2xl mx-auto px-4 py-6 transition-all duration-300 ${animatedPhase ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══ WELCOME PHASE ═══ */}
        {phase === 'welcome' && (
          <div className="animate-fadeIn">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ayur-green via-ayur-green-dark to-ayur-green p-8 text-white text-center mb-6 shadow-glow">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-ayur-accent/30 translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative">
                <div className="text-5xl mb-4">🌿</div>
                <h1 className="font-serif text-3xl font-bold mb-2">AI Diet Chart Generator</h1>
                <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
                  Get a personalized Ayurvedic diet plan powered by AI, trained on authentic Ayurvedic knowledge from 85+ condition-specific diet charts
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: '🧠', label: 'AI-Powered', sub: 'Nvidia NIM' },
                { icon: '📚', label: '85+ Charts', sub: 'Knowledge Base' },
                { icon: '⚕️', label: 'Authentic', sub: 'Ayurvedic Texts' },
              ].map(f => (
                <div key={f.label} className="bg-white rounded-2xl p-4 text-center shadow-soft border border-gray-100">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="text-xs font-bold text-ayur-green">{f.label}</div>
                  <div className="text-[10px] text-gray-400">{f.sub}</div>
                </div>
              ))}
            </div>

            {/* Attribution */}
            <div className="bg-white rounded-2xl p-4 border border-ayur-accent/20 mb-6 text-center">
              <div className="text-xs text-gray-500 mb-1">Created by AI trained on</div>
              <div className="font-serif font-bold text-ayur-green text-sm">Authentic Ayurveda Sources</div>
              <div className="text-xs text-ayur-accent font-medium mt-1">by Dr. Jinendradutt Sharma</div>
              <div className="text-[10px] text-gray-400 mt-1">Ayurvritta Ayurveda Hospital, Vadodara</div>
            </div>

            <button
              onClick={() => goToPhase('patient')}
              className="w-full py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-2xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
            >
              Start Your Diet Plan →
            </button>
          </div>
        )}

        {/* ═══ PATIENT INFO PHASE ═══ */}
        {phase === 'patient' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">👤</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Patient Information</h2>
              <p className="text-sm text-gray-500">Tell us about yourself for a personalized plan</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
                <input
                  type="text"
                  value={inputs.patient.name}
                  onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, name: e.target.value } }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age *</label>
                  <input
                    type="number"
                    value={inputs.patient.age}
                    onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, age: e.target.value } }))}
                    placeholder="Years"
                    min="1"
                    max="120"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                  />
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender *</label>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g}
                        onClick={() => setInputs(prev => ({ ...prev, patient: { ...prev.patient, gender: g } }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border-2 min-h-[44px] ${
                          inputs.patient.gender === g
                            ? 'border-ayur-green bg-ayur-green/5 text-ayur-green'
                            : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Occupation</label>
                <input
                  type="text"
                  value={inputs.patient.occupation}
                  onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, occupation: e.target.value } }))}
                  placeholder="e.g., Software Engineer, Teacher, Homemaker..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => goToPhase('welcome')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={() => goToPhase('complaints')}
                disabled={!inputs.patient.name || !inputs.patient.age || !inputs.patient.gender}
                className={`flex-[2] py-3 font-bold rounded-xl transition-all ${
                  inputs.patient.name && inputs.patient.age && inputs.patient.gender
                    ? 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-glow'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ COMPLAINTS PHASE ═══ */}
        {phase === 'complaints' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🩺</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Health Concerns</h2>
              <p className="text-sm text-gray-500">Select up to 3 conditions or describe your concern</p>
            </div>

            {/* Quick select */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {POPULAR_COMPLAINTS.map(c => (
                <button
                  key={c.label}
                  onClick={() => toggleComplaint(c.label)}
                  className={`p-3 rounded-xl border-2 text-left transition-all min-h-[48px] flex items-center gap-2 ${
                    inputs.complaints.includes(c.label)
                      ? 'border-ayur-green bg-ayur-green/5 shadow-md ring-2 ring-ayur-green/20'
                      : 'border-gray-100 hover:border-ayur-green/30 bg-white'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className={`text-xs font-medium ${inputs.complaints.includes(c.label) ? 'text-ayur-green' : 'text-gray-700'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>

            {inputs.complaints.length >= 3 && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-3">
                Maximum 3 conditions selected. Remove one to add another.
              </div>
            )}

            {/* Custom search */}
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or search from 85+ conditions</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g., sinus, hernia, eczema...)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px] mb-3"
              />
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredConditions.slice(0, 10).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setInputs(prev => ({ ...prev, customComplaint: c.label }));
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-ayur-green/5 transition-colors flex items-center gap-2"
                    >
                      <span className="text-ayur-green">•</span>
                      <span className="text-gray-700">{c.label}</span>
                      <span className="text-gray-400 text-[10px] ml-auto">{c.category}</span>
                    </button>
                  ))}
                  {filteredConditions.length === 0 && <p className="text-xs text-gray-400 py-2">No matching conditions found</p>}
                </div>
              )}
            </div>

            {/* Custom text */}
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Describe in your own words</label>
              <textarea
                value={inputs.customComplaint}
                onChange={e => setInputs(prev => ({ ...prev, customComplaint: e.target.value }))}
                placeholder="e.g., I have frequent acidity and joint stiffness in the morning..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm resize-none min-h-[72px]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToPhase('patient')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={() => goToPhase('profile')}
                disabled={inputs.complaints.length === 0 && !inputs.customComplaint.trim()}
                className={`flex-[2] py-3 font-bold rounded-xl transition-all ${
                  inputs.complaints.length > 0 || inputs.customComplaint.trim()
                    ? 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-glow'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ PROFILE PHASE ═══ */}
        {phase === 'profile' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🧬</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Ayurvedic Profile</h2>
              <p className="text-sm text-gray-500">Help us personalize your diet plan</p>
            </div>

            {/* Prakriti */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Constitution (Prakriti)</label>
              <div className="grid grid-cols-2 gap-2">
                {PRAKRITI_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => setInputs(prev => ({ ...prev, prakriti: p }))}
                    className={`p-2.5 rounded-xl border-2 text-center text-xs font-medium transition-all min-h-[44px] ${
                      inputs.prakriti === p
                        ? 'border-ayur-green bg-ayur-green/5 text-ayur-green shadow-md'
                        : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet pref */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setInputs(prev => ({ ...prev, dietaryPref: d.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all min-h-[44px] flex items-center justify-center gap-2 ${
                      inputs.dietaryPref === d.value
                        ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                        : 'border-gray-100 hover:border-ayur-green/30'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span className={`text-xs font-medium ${inputs.dietaryPref === d.value ? 'text-ayur-green' : 'text-gray-600'}`}>{d.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Allergies / Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleAllergy(a)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all border-2 min-h-[40px] ${
                      inputs.allergies.includes(a)
                        ? a === 'None' ? 'bg-gray-100 border-gray-300 text-gray-600' : 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToPhase('complaints')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={generateDiet}
                className="flex-[2] py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
              >
                Generate Diet Chart ✨
              </button>
            </div>
          </div>
        )}

        {/* ═══ GENERATING PHASE ═══ */}
        {phase === 'generating' && (
          <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated spinner with multiple rings */}
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-pulse">🌿</span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-ayur-green mb-2">Creating Your Diet Plan...</h3>

            {/* Animated status messages */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-gray-500 text-sm">
                Analyzing <span className="font-medium text-ayur-green">{inputs.complaints.join(', ') || inputs.customComplaint}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-ayur-green rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span>Matching with 85+ Ayurvedic diet charts</span>
              </div>
            </div>

            {/* Progress steps */}
            <div className="w-full max-w-xs space-y-3">
              {[
                { label: 'Matching conditions', icon: '🔍', delay: 0 },
                { label: 'Loading knowledge base', icon: '📚', delay: 1000 },
                { label: 'Generating with AI', icon: '✨', delay: 2000 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-gray-100 animate-pulse" style={{ animationDelay: `${step.delay}ms` }}>
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-xs text-gray-500">{step.label}</span>
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-ayur-green/30 border-t-ayur-green rounded-full animate-spin" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pulsing dots */}
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ RESULT PHASE ═══ */}
        {phase === 'result' && (
          <div className="animate-fadeInUp">
            {/* Patient info card */}
            <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-6 text-white mb-4 shadow-glow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-serif font-bold">{inputs.patient.name}'s Diet Plan</div>
                  <div className="text-white/70 text-sm mt-1">
                    {inputs.patient.age} yrs • {inputs.patient.gender}
                    {inputs.patient.occupation && ` • ${inputs.patient.occupation}`}
                  </div>
                </div>
                <div className="text-4xl animate-bounce">📋</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[...inputs.complaints, inputs.customComplaint].filter(Boolean).map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">{c}</span>
                ))}
                {inputs.prakriti && <span className="px-3 py-1 bg-ayur-accent/30 rounded-full text-xs font-medium backdrop-blur-sm">{inputs.prakriti}</span>}
              </div>
            </div>

            {/* Matched knowledge files */}
            {matchedFiles.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-4">
                <h4 className="font-bold text-emerald-800 mb-2 text-xs uppercase tracking-wide">📚 Based on Knowledge Charts</h4>
                <div className="flex flex-wrap gap-2">
                  {matchedFiles.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{f.label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Local fallback notice */}
            {isLocal && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 flex items-start gap-2">
                <span className="text-lg mt-0.5">⚠️</span>
                <div>
                  <div className="font-bold mb-1">Showing reference diet chart from knowledge base</div>
                  <div>AI enhancement requires NVIDIA API access. Configure NVIDIA_API_KEY in Vercel for personalized AI-generated plans.</div>
                </div>
              </div>
            )}

            {/* Diet plan content with rich visuals */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden mb-4">
              {/* Section icon map */}
              {(() => {
                const sectionIcons: Record<string, { icon: string; color: string; bg: string }> = {
                  'EARLY MORNING': { icon: '🌅', color: 'text-orange-600', bg: 'bg-orange-50' },
                  'BREAKFAST': { icon: '🥣', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  'MID-MORNING': { icon: '⏰', color: 'text-amber-600', bg: 'bg-amber-50' },
                  'LUNCH': { icon: '🍛', color: 'text-green-600', bg: 'bg-green-50' },
                  'EVENING SNACK': { icon: '🍵', color: 'text-teal-600', bg: 'bg-teal-50' },
                  'DINNER': { icon: '🥘', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  'BEDTIME': { icon: '🌙', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  'FOODS TO FAVOR': { icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
                  'FOODS TO AVOID': { icon: '🚫', color: 'text-red-600', bg: 'bg-red-50' },
                  'BENEFICIAL HERBS': { icon: '🌿', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  'LIFESTYLE TIPS': { icon: '💡', color: 'text-blue-600', bg: 'bg-blue-50' },
                  'PRECAUTIONS': { icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50' },
                };

                const lines = aiResult.split('\n');
                const sections: { header: string; items: string[] }[] = [];
                let currentSection: { header: string; items: string[] } | null = null;

                lines.forEach(line => {
                  const t = line.trim();
                  if (t.match(/^[A-Z][A-Z\s&()\-:]+$/) && t.length > 3 && t.length < 80) {
                    if (currentSection) sections.push(currentSection);
                    currentSection = { header: t, items: [] };
                  } else if (currentSection && t) {
                    currentSection.items.push(t);
                  } else if (!currentSection && t) {
                    // Content before first section
                    if (!sections.length) {
                      sections.push({ header: 'OVERVIEW', items: [t] });
                    }
                  }
                });
                if (currentSection) sections.push(currentSection);

                return (
                  <div className="p-5 md:p-6">
                    {sections.map((section, sIdx) => {
                      const sectionKey = section.header.replace(/[^A-Z\s]/g, '').trim();
                      const meta = sectionIcons[sectionKey] || { icon: '📌', color: 'text-gray-600', bg: 'bg-gray-50' };

                      return (
                        <div key={sIdx} className="mb-6 last:mb-0" style={{ animationDelay: `${sIdx * 100}ms` }}>
                          {/* Section header with icon */}
                          <div className={`${meta.bg} rounded-2xl p-4 mb-3 border border-${meta.color.replace('text-', '')}/20`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{meta.icon}</span>
                              <h3 className={`font-serif font-bold ${meta.color} text-lg m-0`}>{section.header}</h3>
                            </div>
                          </div>

                          {/* Section items */}
                          <div className="space-y-2 ml-2">
                            {section.items.map((item, iIdx) => {
                              const t = item;
                              // Bullet points
                              if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
                                return (
                                  <div key={iIdx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <span className={`${meta.color} text-sm mt-0.5 shrink-0`}>●</span>
                                    <span className="text-sm leading-relaxed text-gray-700">{t.replace(/^[-*•]\s*/, '')}</span>
                                  </div>
                                );
                              }
                              // Bold items
                              if (t.startsWith('**') && t.includes(':**')) {
                                const parts = t.replace(/\*\*/g, '').split(':');
                                return (
                                  <div key={iIdx} className="p-3 bg-gray-50 rounded-xl">
                                    <span className="font-bold text-ayur-green text-sm">{parts[0]}:</span>
                                    {parts.slice(1).join(':') && <span className="text-gray-600 text-sm ml-1">{parts.slice(1).join(':')}</span>}
                                  </div>
                                );
                              }
                              // Regular text
                              return (
                                <div key={iIdx} className="p-3 bg-gray-50 rounded-xl">
                                  <span className="text-sm leading-relaxed text-gray-700">{t}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: '🕐', label: 'Meals', value: '7-8', sub: 'per day' },
                { icon: '🌿', label: 'Herbs', value: '5+', sub: 'recommended' },
                { icon: '🥗', label: 'Balance', value: inputs.prakriti || 'Tridoshic', sub: 'constitution' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xs font-bold text-ayur-green">{stat.label}</div>
                  <div className="text-lg font-serif font-bold text-gray-800">{stat.value}</div>
                  <div className="text-[10px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Attribution footer */}
            <div className="bg-gradient-to-r from-ayur-accent-light to-white rounded-2xl p-4 border border-ayur-accent/20 mb-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Created by AI trained on</div>
              <div className="font-serif font-bold text-ayur-green text-sm">Authentic Ayurveda Sources</div>
              <div className="text-xs text-ayur-accent font-medium mt-1">by Dr. Jinendradutt Sharma</div>
              <div className="text-[10px] text-gray-400 mt-1">Ayurvritta Ayurveda Hospital, Vadodara, Gujarat • +91 94266 84047</div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('welcome');
                  setInputs({ patient: { name: '', age: '', gender: '', occupation: '' }, complaints: [], customComplaint: '', prakriti: '', dietaryPref: '', allergies: [] });
                  setAiResult('');
                  setSearchQuery('');
                }}
                className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all active:scale-[0.98]"
              >
                New Diet Plan
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                More Tools
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietChartTool;
