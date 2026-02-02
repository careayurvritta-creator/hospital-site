import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import {
  Utensils, Search, Loader2, ChevronRight, ExternalLink,
  Calendar, Sun, CloudRain, Snowflake, Wind, Leaf, Coffee,
  Moon, Sunrise, Sunset, AlertCircle, CheckCircle2, User,
  UserCircle, Activity, Wheat, Grape, Carrot, Milk, Bean,
  Flower, Zap, MapPin, Printer, Download, ThumbsUp, ThumbsDown,
  Clock
} from 'lucide-react';
import ShareResults from '../ShareResults';
import { useLanguage } from '../LanguageContext';

// --- Ayurvedic Season Logic ---
const getAyurvedicSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  if (month === 1 || month === 2) return { name: "Sisira", english: "Late Winter", icon: Snowflake, quality: "Cold & Dry (Accumulates Kapha)" };
  if (month === 3 || month === 4) return { name: "Vasanta", english: "Spring", icon: Leaf, quality: "Warm & Moist (Liquefies Kapha)" };
  if (month === 5 || month === 6) return { name: "Grishma", english: "Summer", icon: Sun, quality: "Hot & Dry (Accumulates Vata)" };
  if (month === 7 || month === 8) return { name: "Varsha", english: "Monsoon", icon: CloudRain, quality: "Humid & Weak Digestion (Aggravates Vata)" };
  if (month === 9 || month === 10) return { name: "Sharad", english: "Autumn", icon: Wind, quality: "Clear & Hot (Aggravates Pitta)" };
  return { name: "Hemanta", english: "Early Winter", icon: Snowflake, quality: "Cold & Strong Digestion (Balances Pitta)" };
};

// --- Icons Helper ---
const getCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes('cereal') || c.includes('grain')) return <Wheat size={24} className="text-amber-600" />;
  if (c.includes('fruit')) return <Grape size={24} className="text-purple-600" />;
  if (c.includes('veg')) return <Carrot size={24} className="text-orange-600" />;
  if (c.includes('dairy') || c.includes('milk')) return <Milk size={24} className="text-blue-500" />;
  if (c.includes('pulse') || c.includes('dal') || c.includes('legume')) return <Bean size={24} className="text-emerald-600" />;
  return <Utensils size={24} className="text-ayur-gray" />;
};

interface DietMeal {
  time: string;
  category: string;
  food: string;
  benefit: string;
}

const DietGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'diet' | 'lifestyle' | 'seasonal'>('diet');
  const [formData, setFormData] = useState({
    name: "",
    gender: "Female",
    condition: "",
    age: "",
    preference: "Vegetarian",
    digestiveState: "Variable (Vishamagni)",
    location: ""
  });
  const { language } = useLanguage();

  const [parsedResult, setParsedResult] = useState<{
    seasonal: string;
    diet: DietMeal[];
    pathya: string;
    apathya: string;
    lifestyle: string;
    yoga: string;
    foodTable: Array<{ category: string, good: string, bad: string }>;
    rituName?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const currentSeason = getAyurvedicSeason();
  const reportRef = useRef<HTMLDivElement>(null);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: `Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)}`
          }));
        },
        (error) => {
          console.error("Loc error", error);
          alert("Could not detect location. Please enter manually.");
        }
      );
    }
  };

  const generatePlan = async () => {
    if (!formData.condition || !formData.age) return;
    setLoading(true);
    setStep(2);
    setParsedResult(null);

    try {
      // Use Vite's import.meta.env for client-side environment variables
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
      Act as a Senior Ayurvedic Physician.
      Patient: ${formData.name || 'Patient'}, ${formData.age} yrs, ${formData.gender}.
      Location: ${formData.location || "India (Default)"}.
      Condition: ${formData.condition}.
      Preferences: ${formData.preference}, Digestion: ${formData.digestiveState}.
      Current Date: ${new Date().toDateString()}.
      Target Language: ${language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English'}.
      
      TASK:
      1. Determine Ayurvedic Season (Ritu) based on date/location.
      2. Create a detailed diet plan & lifestyle protocol tailored to the condition and season.
      3. OUTPUT ALL TEXT CONTENT IN THE TARGET LANGUAGE (${language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English'}).
      `;

      // Structured JSON Output Schema
      const schema = {
        type: Type.OBJECT,
        properties: {
          rituName: { type: Type.STRING, description: "Name of the Ayurvedic season (e.g. Sisira, Grishma)" },
          seasonalContext: { type: Type.STRING, description: "Explanation of the season and its effect on the patient's condition" },
          dietChart: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                category: { type: Type.STRING },
                food: { type: Type.STRING },
                benefit: { type: Type.STRING }
              }
            }
          },
          foodTable: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                good: { type: Type.STRING },
                bad: { type: Type.STRING }
              }
            }
          },
          pathya: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of foods to favor" },
          apathya: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of foods to avoid" },
          lifestyle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of recommended daily habits" },
          yoga: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of recommended Asanas and Pranayama" }
        },
        required: ["rituName", "seasonalContext", "dietChart", "foodTable", "pathya", "apathya", "lifestyle", "yoga"]
      };

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        },
      });

      const jsonStr = result.text;
      const data = JSON.parse(jsonStr);

      setParsedResult({
        seasonal: data.seasonalContext,
        diet: data.dietChart,
        pathya: data.pathya.join('\n'),
        apathya: data.apathya.join('\n'),
        lifestyle: data.lifestyle.join('\n'),
        yoga: data.yoga.join('\n'),
        foodTable: data.foodTable,
        rituName: data.rituName
      });

    } catch (e) {
      console.error("AI Generation Error", e);
      setParsedResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getTimeTheme = (timeStr: string) => {
    const t = timeStr.toLowerCase();
    if (t.includes('morning') || t.includes('am') || t.includes('breakfast'))
      return { icon: Sunrise, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (t.includes('noon') || t.includes('lunch') || t.includes('snack'))
      return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
  };

  const inputStyle = "w-full p-4 bg-white text-ayur-green placeholder-gray-400 border border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-1 focus:ring-ayur-green outline-none transition-all shadow-sm text-base";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #diet-report-container, #diet-report-container * { visibility: visible; }
            #diet-report-container { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-ayur-green text-white p-6 md:p-8 relative overflow-hidden flex-shrink-0 no-print">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Utensils className="text-ayur-gold" /> AI Diet Planner
          </h2>
          <p className="opacity-80 mt-2 text-xs md:text-base">
            Generating location-specific Ritu protocols.
          </p>
        </div>
      </div>

      {step === 1 && (
        <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-3xl mx-auto w-full space-y-6 animate-fadeIn pb-24">
          <div className="bg-ayur-cream/30 p-4 md:p-6 rounded-2xl border border-ayur-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Patient Name</label>
                <div className="relative">
                  <UserCircle className="absolute top-4 left-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    className={`${inputStyle} pl-10`}
                    placeholder="Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Location</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute top-4 left-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    className={`${inputStyle} pl-10 pr-12`}
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                  <button
                    onClick={detectLocation}
                    className="absolute right-3 top-3 p-1.5 bg-ayur-cream rounded-lg text-ayur-gold hover:text-ayur-green min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Detect my location"
                    title="Detect my location"
                  >
                    <MapPin size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <label className="block text-sm font-bold text-ayur-gray mb-2">Condition</label>
              <input
                type="text"
                placeholder="e.g. Hypothyroidism"
                className={inputStyle}
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Age</label>
                <input
                  type="number"
                  placeholder="35"
                  className={inputStyle}
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="gender-select" className="block text-sm font-bold text-ayur-gray mb-2">Gender</label>
                <select
                  id="gender-select"
                  className={inputStyle}
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div>
                <label htmlFor="preference-select" className="block text-sm font-bold text-ayur-gray mb-2">Preference</label>
                <select
                  id="preference-select"
                  className={inputStyle}
                  value={formData.preference}
                  onChange={e => setFormData({ ...formData, preference: e.target.value })}
                >
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={!formData.condition || !formData.age}
            className="w-full bg-ayur-green text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-ayur-gold disabled:opacity-50 transition-colors mt-8 flex items-center justify-center gap-2 mb-safe"
          >
            Generate Plan <ChevronRight size={20} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-ayur-green p-8 text-center">
              <Loader2 size={48} className="animate-spin text-ayur-gold mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">Analyzing...</h3>
              <p className="text-gray-500">Formulating classical protocol in {language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Gujarati'}.</p>
            </div>
          ) : parsedResult ? (
            <div id="diet-report-container" ref={reportRef} className="flex-1 flex flex-col max-w-5xl mx-auto w-full md:p-8 bg-gray-50 print:bg-white print:p-0">

              {/* Dashboard Header */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-ayur-subtle mb-6 flex flex-col md:flex-row justify-between items-center gap-6 print:border-none print:shadow-none print:p-0 print:mb-8">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-ayur-green/10 rounded-2xl flex items-center justify-center text-ayur-green print:hidden shrink-0">
                    <User size={24} className="md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green">{formData.name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">{formData.gender}, {formData.age} • {formData.condition}</p>
                  </div>
                </div>
                <div className="bg-ayur-gold/5 px-6 py-3 rounded-2xl border border-ayur-gold/20 flex items-center gap-4 w-full md:w-auto">
                  <currentSeason.icon size={32} className="text-ayur-gold" />
                  <div>
                    <span className="block text-[10px] font-bold text-ayur-gold uppercase tracking-widest">Season</span>
                    <span className="block font-serif text-xl font-bold text-ayur-green">{parsedResult.rituName || currentSeason.name}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs - Horizontal Scroll on Mobile */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-print px-4 md:px-0 -mx-4 md:mx-0 snap-x">
                {['diet', 'seasonal', 'lifestyle'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all snap-center ${activeTab === t ? 'bg-ayur-green text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                  >
                    {t === 'diet' ? 'Diet Chart' : t === 'seasonal' ? 'Scorecard' : 'Lifestyle'}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 px-4 md:px-0 pb-8 print:px-0">

                {/* DIET CHART (Card View) */}
                <div className={activeTab === 'diet' ? 'block' : 'hidden print:block'}>
                  <div className="space-y-6 animate-fadeIn">
                    <h4 className="font-serif text-2xl font-bold text-ayur-green mb-4 flex items-center gap-2">
                      <Utensils className="text-ayur-gold" /> Meals
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {parsedResult.diet.length > 0 ? parsedResult.diet.map((meal, idx) => {
                        const theme = getTimeTheme(meal.time);
                        return (
                          <div key={idx} className={`bg-white rounded-2xl border-l-8 ${theme.border.replace('border', 'border-l')} border-y border-r border-gray-100 shadow-sm overflow-hidden`}>
                            {/* Meal Header */}
                            <div className={`px-4 py-3 ${theme.bg} flex justify-between items-center border-b border-gray-100`}>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className={theme.color} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${theme.color}`}>{meal.time}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-600 font-medium text-xs truncate max-w-[120px]">{meal.category}</span>
                              </div>
                            </div>

                            {/* Meal Body */}
                            <div className="p-5">
                              <h5 className="font-serif text-xl font-bold text-ayur-green mb-3 leading-tight">
                                {meal.food}
                              </h5>
                              <div className="flex items-start gap-2 pt-3 border-t border-gray-50">
                                <Leaf size={14} className="text-ayur-gold mt-1 shrink-0" />
                                <p className="text-xs text-gray-500 italic leading-relaxed">
                                  "{meal.benefit}"
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }) : (
                        <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
                          No chart generated.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOD SCORECARD (Stacked Cards on Mobile) */}
                <div className={activeTab === 'seasonal' ? 'block' : 'hidden print:block'}>
                  <div className="space-y-6 animate-fadeIn mt-4 print:mt-4">
                    {parsedResult.foodTable.length > 0 && (
                      <div className="space-y-4">
                        {parsedResult.foodTable.map((row, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-ayur-subtle shadow-sm overflow-hidden flex flex-col md:flex-row print:border print:mb-4 print:break-inside-avoid">
                            {/* Category Header */}
                            <div className="bg-ayur-cream/50 p-4 md:p-6 w-full md:w-1/4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-ayur-subtle">
                              <div className="p-2 bg-white rounded-xl shadow-sm border border-ayur-subtle">
                                {getCategoryIcon(row.category)}
                              </div>
                              <span className="font-bold text-ayur-green text-lg">{row.category}</span>
                            </div>

                            {/* Good Side */}
                            <div className="flex-1 p-4 md:p-6 bg-green-50/50 border-b md:border-b-0 md:border-r border-ayur-subtle">
                              <div className="flex items-center gap-2 mb-2">
                                <ThumbsUp size={16} className="text-green-600" />
                                <h5 className="text-xs font-bold uppercase tracking-widest text-green-700">Favor</h5>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{row.good}</p>
                            </div>

                            {/* Bad Side */}
                            <div className="flex-1 p-4 md:p-6 bg-red-50/50">
                              <div className="flex items-center gap-2 mb-2">
                                <ThumbsDown size={16} className="text-red-500" />
                                <h5 className="text-xs font-bold uppercase tracking-widest text-red-700">Avoid</h5>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{row.bad}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* LIFESTYLE TAB */}
                <div className={activeTab === 'lifestyle' ? 'block' : 'hidden print:block'}>
                  <div className="space-y-6 animate-fadeIn mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-ayur-subtle shadow-sm">
                        <h5 className="font-bold text-ayur-green mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                          <Sun size={20} className="text-orange-500" /> Habits
                        </h5>
                        <ul className="space-y-3">
                          {parsedResult.lifestyle.split('\n').filter(l => l.length > 2).map((line, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle2 size={16} className="text-ayur-gold mt-0.5 shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-ayur-subtle shadow-sm">
                        <h5 className="font-bold text-ayur-green mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                          <Flower size={20} className="text-purple-500" /> Yoga
                        </h5>
                        <ul className="space-y-3">
                          {parsedResult.yoga.split('\n').filter(l => l.length > 2).map((line, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <Zap size={16} className="text-purple-500 mt-0.5 shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 no-print pb-10">
                  <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:text-ayur-green font-medium">
                    New Plan
                  </button>
                  <button onClick={handlePrint} className="bg-ayur-green text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-ayur-gold transition-colors flex items-center justify-center gap-2">
                    <Download size={18} /> Save PDF
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <AlertCircle size={48} className="text-red-400 mb-4" />
              <h3 className="font-serif text-xl font-bold text-ayur-green">Failed</h3>
              <p className="text-gray-500 mb-6">Check connection.</p>
              <button onClick={() => setStep(1)} className="text-ayur-gold font-bold">Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DietGenerator;