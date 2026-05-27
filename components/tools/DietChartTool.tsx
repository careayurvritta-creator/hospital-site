import React, { useState, useMemo } from 'react';

// Vite import.meta.glob: load all diet chart .md files as raw strings
const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

// Build searchable condition list from filenames
interface ConditionEntry {
  id: string;
  label: string;
  keywords: string[];
  rawContent: string;
}

function buildConditions(): ConditionEntry[] {
  const entries: ConditionEntry[] = [];

  for (const [path, content] of Object.entries(knowledgeModules)) {
    const filename = path.split('/').pop()?.replace('.md', '') || '';
    if (filename === 'README') continue;

    // Generate human-readable label
    const label = filename
      .replace(/^diet-chart-for-/, '')
      .replace(/^diet-plan-for-/, '')
      .replace(/^diet-plan-for/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    // Build keywords for fuzzy matching
    const words = filename.replace(/^(diet-(chart|plan)-for-?)/, '').split('-');
    const keywords = [
      ...words,
      label.toLowerCase(),
      filename,
    ];

    entries.push({ id: filename, label, keywords, rawContent: content });
  }

  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

const CONDITIONS = buildConditions();

// Common complaint aliases for better matching
const COMPLAINT_ALIASES: Record<string, string[]> = {
  'sugar': ['diabetes', 'diabetic'],
  'bp': ['hypertension', 'blood pressure', 'high bp'],
  'low bp': ['hypotension'],
  'thyroid': ['hypothyroidism', 'hyperthyroidism'],
  'acidity': ['gerd', 'acid reflux', 'heartburn'],
  'gas': ['ibs', 'bloating', 'flatulence'],
  'constipated': ['constipation'],
  'loose motion': ['diarrhoea', 'diarrhea'],
  'kidney': ['kidney-diseases', 'chronic-kidney-disease', 'nephrotic-syndrome'],
  'liver': ['fatty-liver', 'liver-cirrhosis', 'liver-disease', 'jaundice'],
  'joint pain': ['arthritis', 'rheumatoid-arthritis', 'gout'],
  'back pain': ['back-pain', 'slipped-disc'],
  'skin': ['psoriasis', 'eczema', 'skin-problems'],
  'hair': ['skin-problems'],
  'pcod': ['ovarian-cysts-and-fibroids'],
  'pcos': ['ovarian-cysts-and-fibroids'],
  'periods': ['premenstrual-syndrome', 'amenorrhea'],
  'pregnancy': ['pregnant-women'],
  'overweight': ['obesity'],
  'obese': ['obesity'],
  'fat': ['obesity', 'cholesterol'],
  'cholesterol': ['bad-cholesterol-high-triglycerides', 'triglycerides'],
  'heart': ['heart-disease'],
  'stone': ['kidney-stones', 'gall-stones'],
  'piles': ['piles-hemorrhoids'],
  'cancer': ['life-support-diet-for-cancer-patients'],
  'child': ['childhood-asthma', 'toddlers', 'school-going-children'],
  'baby': ['toddlers'],
  'infant': ['toddlers'],
  'elderly': ['adulthood'],
  'old age': ['adulthood'],
  'migraine': ['migraine', 'headache'],
  'headache': ['headache', 'migraine'],
  'sinus': ['sinusitis'],
  'cold': ['common-cold'],
  'cough': ['asthma', 'common-cold'],
  'breathing': ['asthma'],
  'asthma': ['asthma', 'childhood-asthma'],
  'anemia': ['anemia'],
  'anaemia': ['anemia'],
  'depression': ['depression'],
  'anxiety': ['depression'],
  'stress': ['depression'],
  'fertility': ['infertility', 'oligospermia'],
  'infertility': ['infertility'],
  'menopause': ['menopause'],
  'urine': ['urinary-tract-infection'],
  'uti': ['urinary-tract-infection'],
  'allergy': ['allergy'],
  'hernia': ['hernia'],
  'celiac': ['celiac-disease'],
  'fibromyalgia': ['fibromyalgia'],
  'ascites': ['ascites'],
  'edema': ['edema'],
  'swelling': ['edema'],
};

function searchConditions(query: string): ConditionEntry[] {
  if (!query.trim()) return CONDITIONS;

  const q = query.toLowerCase().trim();

  // Check aliases first
  const aliasMatches = new Set<string>();
  for (const [alias, targets] of Object.entries(COMPLAINT_ALIASES)) {
    if (q.includes(alias) || alias.includes(q)) {
      targets.forEach(t => aliasMatches.add(t));
    }
  }

  return CONDITIONS.filter(c => {
    const searchText = `${c.label} ${c.keywords.join(' ')}`.toLowerCase();
    // Alias match
    if (aliasMatches.size > 0) {
      for (const alias of aliasMatches) {
        if (searchText.includes(alias)) return true;
      }
    }
    // Direct match
    return searchText.includes(q) || q.split(/\s+/).some(word => word.length > 2 && searchText.includes(word));
  });
}

interface DietInputs {
  prakriti: string;
  ageGroup: string;
  dietaryPreference: string;
  allergies: string[];
}

const ALLERGIES_LIST = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Soy', 'Seafood', 'Nightshades', 'Legumes'];

const DietChartTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState(0); // 0=search, 1=details, 2=loading, 3=result
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<ConditionEntry | null>(null);
  const [inputs, setInputs] = useState<DietInputs>({
    prakriti: '',
    ageGroup: '',
    dietaryPreference: '',
    allergies: [],
  });
  const [aiResult, setAiResult] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [error, setError] = useState('');

  const filteredConditions = useMemo(() => searchConditions(searchQuery), [searchQuery]);

  const toggleAllergy = (allergy: string) => {
    setInputs(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const generateDiet = async () => {
    if (!selectedCondition) return;
    setStep(2);
    setError('');

    const knowledge = selectedCondition.rawContent;
    // Trim knowledge to avoid exceeding token limits (keep first 3000 chars)
    const trimmedKnowledge = knowledge.length > 3000 ? knowledge.slice(0, 3000) + '\n...(truncated)' : knowledge;

    const allergyNote = inputs.allergies.length > 0
      ? `\nPatient has allergies/restrictions to: ${inputs.allergies.join(', ')}.`
      : '';

    const prompt = `You are an expert Ayurvedic nutritionist at Ayurvritta Ayurveda Hospital, trained in Charaka Samhita, Ashtanga Hridayam, and modern Ayurvedic dietetics.

A patient needs a personalized diet chart for: **${selectedCondition.label}**

${inputs.prakriti ? `Patient Prakriti (Constitution): ${inputs.prakriti}` : ''}
${inputs.ageGroup ? `Age Group: ${inputs.ageGroup}` : ''}
${inputs.dietaryPreference ? `Dietary Preference: ${inputs.dietaryPreference}` : ''}
${allergyNote}

REFERENCE DIET CHART FROM KNOWLEDGE BASE:
---
${trimmedKnowledge}
---

Based on the above reference diet chart and Ayurvedic principles, create a comprehensive, personalized diet plan. Format your response as:

**EARLY MORNING** (with specific items and Ayurvedic reasoning)
**BREAKFAST** (2-3 options with reasoning)
**MID-MORNING** (light snack/drink)
**LUNCH** (main meal with detailed items)
**EVENING SNACK** (2-3 options)
**DINNER** (light, digestible options)
**BEDTIME** (if applicable)

Then add these sections:

**FOODS TO FAVOR** (specific to their condition and constitution)
**FOODS TO STRICTLY AVOID** (with Ayurvedic reasoning)
**SPICES & HERBS** (5 specific spices beneficial for this condition)
**LIFESTYLE TIPS** (3-4 specific Dinacharya recommendations)
**IMPORTANT NOTES** (any special precautions)

Be specific, practical, and rooted in authentic Ayurvedic principles. Reference the knowledge base diet chart but personalize it based on the patient's constitution and preferences. Keep the response under 2000 words.`;

    try {
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      if (content) {
        setAiResult(content);
        setIsLocal(false);
        setStep(3);
      } else {
        throw new Error('Empty response');
      }
    } catch {
      // Fallback: show the raw .md knowledge content directly
      setAiResult(knowledge);
      setIsLocal(true);
      setStep(3);
    }
  };

  // --- STEP 0: Search & Select Condition ---
  if (step === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all min-h-[48px] px-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Exit
        </button>

        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
          <h2 className="font-serif text-xl font-bold text-ayur-green mb-1">AI Diet Chart Generator</h2>
          <p className="text-sm text-gray-500 mb-4">Select your health condition for a personalized Ayurvedic diet plan</p>

          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search condition... (e.g. diabetes, thyroid, acidity)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
            {filteredConditions.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No matching conditions found. Try different keywords.</p>
            ) : (
              filteredConditions.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCondition(c); setStep(1); }}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-ayur-green/40 hover:bg-ayur-green/5 transition-all min-h-[48px] flex items-center"
                >
                  <span className="text-sm font-medium text-gray-700">{c.label}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          {CONDITIONS.length} condition-specific diet charts available
        </div>
      </div>
    );
  }

  // --- STEP 1: Patient Details ---
  if (step === 1) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setStep(0)} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all min-h-[48px] px-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-ayur-green/10 text-ayur-green text-xs font-semibold rounded-full mb-2">
              {selectedCondition?.label}
            </span>
            <h2 className="font-serif text-xl font-bold text-ayur-green">Personalize Your Diet Plan</h2>
            <p className="text-sm text-gray-500">Optional details help AI tailor the plan to you</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Constitution (Prakriti)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic', 'Unknown'].map(p => (
                  <button
                    key={p}
                    onClick={() => setInputs(prev => ({ ...prev, prakriti: p }))}
                    className={`p-2 rounded-xl border-2 text-center text-xs font-medium transition-all min-h-[44px] ${
                      inputs.prakriti === p ? 'border-ayur-green bg-ayur-green/5 text-ayur-green' : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'child', label: 'Child (2-12)' },
                  { value: 'teen', label: 'Teen (13-19)' },
                  { value: 'young', label: 'Adult (20-35)' },
                  { value: 'middle', label: 'Middle (36-55)' },
                  { value: 'senior', label: 'Senior (55+)' },
                  { value: '', label: 'Skip' },
                ].map(a => (
                  <button
                    key={a.value + a.label}
                    onClick={() => setInputs(prev => ({ ...prev, ageGroup: a.value }))}
                    className={`p-2 rounded-xl border-2 text-center text-xs transition-all min-h-[44px] ${
                      inputs.ageGroup === a.value ? 'border-ayur-green bg-ayur-green/5 text-ayur-green font-medium' : 'border-gray-100 text-gray-600'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
                  { value: 'non-vegetarian', label: 'Non-Veg', icon: '🍗' },
                  { value: 'vegan', label: 'Vegan', icon: '🌱' },
                  { value: '', label: 'No Preference', icon: '🍽️' },
                ].map(d => (
                  <button
                    key={d.value + d.label}
                    onClick={() => setInputs(prev => ({ ...prev, dietaryPreference: d.value }))}
                    className={`p-2 rounded-xl border-2 text-center text-xs transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                      inputs.dietaryPreference === d.value ? 'border-ayur-green bg-ayur-green/5' : 'border-gray-100 hover:border-ayur-green/30'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span className={inputs.dietaryPreference === d.value ? 'text-ayur-green font-medium' : 'text-gray-600'}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies / Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES_LIST.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleAllergy(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border min-h-[40px] ${
                      inputs.allergies.includes(a)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generateDiet}
          className="w-full py-3.5 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-2xl hover:shadow-lg transition-all min-h-[52px]"
        >
          Generate Diet Chart with AI
        </button>
      </div>
    );
  }

  // --- STEP 2: Loading ---
  if (step === 2) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-ayur-green mb-2">Generating Your Diet Chart...</h3>
        <p className="text-gray-600 text-center max-w-xs text-sm">
          AI is analyzing {selectedCondition?.label} knowledge base and creating your personalized plan.
        </p>
        <div className="mt-6 flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 bg-ayur-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 3: Result ---
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => { setStep(0); setSelectedCondition(null); setAiResult(''); }} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all min-h-[48px] px-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        New Search
      </button>

      <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-5 text-white text-center mb-4">
        <div className="text-2xl font-bold mb-1">Diet Chart for {selectedCondition?.label}</div>
        <div className="text-white/80 text-sm">
          {inputs.prakriti && `${inputs.prakriti} • `}
          {inputs.ageGroup && `${inputs.ageGroup} • `}
          {inputs.dietaryPreference || 'All diets'}
        </div>
      </div>

      {isLocal && (
        <div className="mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          Showing reference diet chart from Ayurveda knowledge base. AI enhancement requires NVIDIA API access.
        </div>
      )}

      {error && (
        <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {aiResult.split('\n').map((line, i) => {
            const trimmed = line.trim();
            // Bold section headers
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
              return <h3 key={i} className="font-bold text-ayur-green text-base mt-4 mb-2 first:mt-0">{trimmed.replace(/\*\*/g, '')}</h3>;
            }
            // Sub-headers
            if (trimmed.startsWith('### ')) {
              return <h4 key={i} className="font-semibold text-gray-800 mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
            }
            // Bullet points
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-ayur-accent">•</span><span>{trimmed.slice(2)}</span></div>;
            }
            // Numbered items
            if (/^\d+\./.test(trimmed)) {
              return <div key={i} className="ml-2 mb-1">{trimmed}</div>;
            }
            // Empty lines
            if (!trimmed) return <div key={i} className="h-2"></div>;
            // Regular text
            return <p key={i} className="mb-1">{line}</p>;
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setStep(0); setSelectedCondition(null); setAiResult(''); }}
          className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all"
        >
          New Condition
        </button>
        <button
          onClick={() => { setStep(1); setAiResult(''); }}
          className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Change Details
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        Based on Ayurvedic knowledge base • {CONDITIONS.length} condition charts • AI-enhanced by Nvidia NIM
      </div>
    </div>
  );
};

export default DietChartTool;
