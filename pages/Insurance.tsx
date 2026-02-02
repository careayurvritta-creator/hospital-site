import React, { useState, useEffect } from 'react';
import {
   ShieldCheck, FileText, CheckCircle2, Upload, AlertCircle,
   Loader2, Search, Stethoscope, FileCheck, Building2,
   CreditCard, ChevronDown, ChevronUp, X, Check,
   ArrowRight, Landmark, Filter, Heart, Briefcase, ImageOff
} from 'lucide-react';
import { INSURANCE_PARTNERS } from '../constants';
import { GoogleGenAI } from "@google/genai";

const FAQS = [
   {
      q: "Is Ayurveda covered by all health insurance policies?",
      a: "Not all, but coverage is increasing rapidly. Look for 'AYUSH Benefit' or 'Alternative Treatment' in your policy document. Most comprehensive plans now cover Ayurveda up to the full Sum Insured or a specific percentage."
   },
   {
      q: "What documents do I need for cashless admission?",
      a: "You need your Health Card (E-card), Policy Copy, KYC documents (Aadhar/PAN) of the patient and policyholder, and previous consultation papers if any."
   },
   {
      q: "Do I need to pay anything upfront?",
      a: "For approved cashless claims, you only pay for 'Non-Medical Expenses' (like registration fees, toiletries, certain disposables) or any Co-payment/Deductible mentioned in your specific policy."
   },
   {
      q: "What is the minimum stay required for a claim?",
      a: "Typically, a minimum hospitalization of 24 hours is mandatory for Ayurvedic treatments to be eligible for insurance claims."
   },
];

const PartnerLogo: React.FC<{ partner: typeof INSURANCE_PARTNERS[0], className?: string, fallbackClass?: string }> = ({ partner, className, fallbackClass }) => {
   const [error, setError] = useState(false);

   if (error) {
      return (
         <div className={`${fallbackClass} flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg p-2 border border-gray-100`}>
            <div className="w-10 h-10 rounded-full bg-ayur-cream flex items-center justify-center text-ayur-gold font-serif font-bold text-xl mb-1">
               {partner.name.charAt(0)}
            </div>
            <span className="text-[9px] font-bold text-center leading-tight uppercase tracking-wide px-1 truncate w-full">
               {partner.name.split(' ')[0]}
            </span>
         </div>
      );
   }

   return (
      <img
         src={partner.logo}
         alt={partner.name}
         className={`${className} object-contain`}
         loading="lazy"
         onError={() => setError(true)}
      />
   );
};

const Insurance: React.FC = () => {
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [analysisResult, setAnalysisResult] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   // Enhanced Search & Filter State
   const [searchTerm, setSearchTerm] = useState('');
   const [filterCategory, setFilterCategory] = useState<'All' | 'Insurer' | 'TPA'>('All');
   const [visiblePartners, setVisiblePartners] = useState(9); // Pagination state


   // Logic to categorize and filter
   const filteredPartners = INSURANCE_PARTNERS.filter(partner => {
      const name = partner.name.toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());

      const isTPA = partner.type === 'TPA';
      const isInsurer = !isTPA;

      if (!matchesSearch) return false;

      if (filterCategory === 'TPA') return isTPA;
      if (filterCategory === 'Insurer') return isInsurer;

      return true;
   });

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         setSelectedFile(file);
         if (file.type.includes('image')) {
            setPreviewUrl(URL.createObjectURL(file));
         } else {
            setPreviewUrl(null);
         }
         setAnalysisResult(null);
      }
   };

   const handleRemoveFile = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setAnalysisResult(null);
   };

   const handleAnalyze = async () => {
      if (!selectedFile) return;
      setLoading(true);

      try {
         const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
         if (!apiKey) throw new Error("API Key missing. Please check your environment configuration.");

         // Validate file size (max 20MB)
         const maxSize = 20 * 1024 * 1024; // 20MB
         if (selectedFile.size > maxSize) {
            throw new Error("File too large. Please upload a file under 20MB.");
         }

         // Validate file type
         const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
         if (!validTypes.includes(selectedFile.type)) {
            throw new Error("Invalid file type. Please upload a JPG, PNG, WebP, GIF image or PDF.");
         }

         const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
         });

         const base64String = base64Data.split(',')[1];
         const mimeType = selectedFile.type;

         const ai = new GoogleGenAI({ apiKey });
         const prompt = `
        Analyze this health insurance policy document image/PDF.
        I need to verify if this policy covers "AYUSH" or "Ayurveda" treatments.
        
        Please provide a structured summary in Markdown format:
        
        ### Coverage Status
        *   **AYUSH Covered:** [Yes/No/Unclear]
        *   **Specific Limit:** [e.g., Upto ₹50,000 or 100% of Sum Insured]
        
        ### Key Conditions
        *   **Room Rent Cap:** [Mention limit if any]
        *   **Co-payment:** [Mention percentage if any]
        *   **Waiting Period:** [Mention if relevant for pre-existing diseases]
        
        ### Recommendation
        [One sentence advice on whether they can proceed with cashless at an Ayurvedic hospital]

        If the document is not legible or not a policy, please state that clearly.
      `;

         // Use the correct API structure for @google/genai
         const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
               {
                  role: 'user',
                  parts: [
                     { 
                        inlineData: { 
                           mimeType: mimeType, 
                           data: base64String 
                        } 
                     },
                     { text: prompt }
                  ]
               }
            ]
         });

         const resultText = response.text || 
                           (response.candidates?.[0]?.content?.parts?.[0] as { text?: string })?.text;
         
         if (resultText) {
            setAnalysisResult(resultText);
         } else {
            throw new Error("No response received from AI");
         }

      } catch (error: unknown) {
         console.error("Analysis failed:", error);
         const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
         
         if (errorMessage.includes("API Key")) {
            setAnalysisResult("Configuration error: API key is missing. Please contact support.");
         } else if (errorMessage.includes("File too large")) {
            setAnalysisResult("Error: File is too large. Please upload a file under 20MB.");
         } else if (errorMessage.includes("Invalid file type")) {
            setAnalysisResult("Error: Invalid file type. Please upload a valid Image (JPG/PNG/WebP) or PDF file.");
         } else if (errorMessage.includes("Could not process")) {
            setAnalysisResult("Error: The document could not be processed. Please ensure the image is clear and readable, or try a different file.");
         } else {
            setAnalysisResult("Error analyzing the document. Please ensure the file is a valid Image (JPG/PNG) or PDF under 20MB. If the problem persists, try with a clearer image of your policy document.");
         }
      } finally {
         setLoading(false);
      }
   };

   const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

   // Marquee Keyframes
   const styles = `
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: scroll 80s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `;

   return (
      <div className="bg-ayur-cream min-h-screen">
         <style>{styles}</style>

         {/* --- HERO SECTION --- */}
         <div className="relative bg-[#0F3D3E] text-white overflow-hidden pb-48">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-ayur-gold/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-44 relative z-10">
               <div className="flex flex-col lg:flex-row items-center gap-16">

                  {/* Left Content */}
                  <div className="lg:w-1/2 text-center lg:text-left space-y-8 animate-fadeIn">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-ayur-gold text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
                        <ShieldCheck size={16} />
                        ROHINI ID: 8900080700376
                     </div>

                     <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight">
                        Healing is Yours.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-gold to-yellow-200">
                           Claims are Ours.
                        </span>
                     </h1>

                     <p className="text-lg md:text-xl text-ayur-cream/80 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                        Ayurvritta is a government-authorized hospital on the ROHINI registry.
                        Experience seamless cashless treatments for chronic conditions with over 30+ insurance partners.
                     </p>

                     <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <button
                           onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
                           className="bg-ayur-gold text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-white hover:text-ayur-green transition-all"
                        >
                           Check Your Insurer
                        </button>
                        <div className="flex items-center gap-2 px-6 py-4 rounded-full border border-white/20 text-white/80">
                           <CheckCircle2 size={18} className="text-green-400" />
                           <span className="text-sm font-medium">TPA Desk Support</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Graphic: Cashless Card */}
                  <div className="lg:w-1/2 relative flex justify-center perspective-1000">
                     <div className="relative w-full max-w-md aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-8 flex flex-col justify-between transform hover:rotate-1 transition-transform duration-700 group">
                        {/* Card Shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"></div>

                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <div className="text-xs text-ayur-gold font-bold uppercase tracking-widest">Health Card</div>
                              <div className="text-2xl font-serif font-bold text-white">Cashless Approved</div>
                           </div>
                           <ShieldCheck size={40} className="text-ayur-gold opacity-80" />
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-14 rounded bg-white/20"></div> {/* Chip Sim */}
                              <div className="text-sm text-white/60 tracking-widest font-mono">**** **** 8900</div>
                           </div>
                           <div className="flex justify-between items-end border-t border-white/10 pt-4">
                              <div>
                                 <div className="text-[10px] text-white/50 uppercase">Hospital Registry</div>
                                 <div className="text-sm font-bold text-white">ROHINI NETWORK</div>
                              </div>
                              <div className="text-right">
                                 <div className="text-[10px] text-white/50 uppercase">Valid</div>
                                 <div className="text-sm font-bold text-white">24/7 Support</div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Decorative Badge */}
                     <div className="absolute -bottom-6 -right-4 bg-white text-ayur-green p-4 rounded-2xl shadow-xl z-20 flex flex-col items-center animate-bounce duration-[3000ms]">
                        <span className="text-xs font-bold uppercase text-gray-400">Network</span>
                        <span className="text-3xl font-bold text-ayur-gold leading-none">30+</span>
                        <span className="text-xs font-bold">Partners</span>
                     </div>
                  </div>

               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-32 space-y-24 pb-24">

            {/* --- SECTION 1: AI POLICY ANALYZER (Floating Card) --- */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-ayur-subtle overflow-hidden relative">
               {/* Top Accent Line */}
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ayur-green via-ayur-gold to-ayur-green"></div>

               <div className="flex flex-col lg:flex-row h-full">

                  {/* Left: Interactive Upload Area */}
                  <div className="lg:w-5/12 bg-gray-50 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col relative">
                     <div className="mb-8 relative z-10">
                        <span className="inline-block py-1 px-3 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-3">AI Powered</span>
                        <h2 className="font-serif text-3xl font-bold text-ayur-green mb-3">Check Eligibility Instantly</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                           Unsure if your policy covers Ayurveda? Upload your policy schedule (first page) and our AI will extract the AYUSH benefit clause for you.
                        </p>
                     </div>

                     <div className="flex-1 flex flex-col justify-center relative z-10">
                        {!selectedFile ? (
                           <label className="border-2 border-dashed border-gray-300 hover:border-ayur-gold hover:bg-white rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden">
                              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                              <div className="absolute inset-0 bg-ayur-gold/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>

                              <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform text-ayur-green border border-gray-100 relative z-10">
                                 <Upload size={28} />
                              </div>
                              <p className="font-bold text-gray-600 group-hover:text-ayur-green transition-colors relative z-10">Click to Upload Policy</p>
                              <p className="text-xs text-gray-400 mt-2 relative z-10">PDF, JPG, PNG (Max 10MB)</p>
                           </label>
                        ) : (
                           <div className="bg-white border border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center relative group shadow-inner">
                              <button
                                 onClick={handleRemoveFile}
                                 className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                                 title="Remove file"
                              >
                                 <X size={16} />
                              </button>

                              {selectedFile.type === 'application/pdf' ? (
                                 <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText size={40} className="text-red-500" />
                                 </div>
                              ) : (
                                 previewUrl && (
                                    <div className="relative mb-4">
                                       <img src={previewUrl} alt="Preview" className="h-32 w-auto object-contain rounded-lg shadow-sm" />
                                       <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">IMG</div>
                                    </div>
                                 )
                              )}

                              <p className="font-bold text-gray-800 px-8 text-center truncate w-full">{selectedFile.name}</p>
                              <p className="text-xs text-ayur-gold mt-1 font-medium">Ready to Analyze</p>
                           </div>
                        )}

                        <button
                           onClick={handleAnalyze}
                           disabled={!selectedFile || loading}
                           className="w-full mt-6 bg-ayur-green text-white py-4 rounded-xl font-bold shadow-lg hover:bg-ayur-gold hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                           {loading ? (
                              <>
                                 <Loader2 className="animate-spin" size={20} />
                                 <span>Scanning Document...</span>
                              </>
                           ) : (
                              <>
                                 <span className="relative z-10">Analyze Coverage</span>
                                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform relative z-10" />
                              </>
                           )}
                        </button>
                     </div>

                     {/* Decorative bg element */}
                     <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Right: Results Display */}
                  <div className="lg:w-7/12 p-8 md:p-12 bg-white flex flex-col">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <div>
                           <h3 className="font-bold text-lg text-ayur-green flex items-center gap-2">
                              <FileText size={18} className="text-ayur-gold" /> Analysis Report
                           </h3>
                           <p className="text-xs text-gray-400 mt-1">AI-generated summary based on your document</p>
                        </div>
                        {analysisResult && (
                           <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <Check size={12} /> Completed
                           </span>
                        )}
                     </div>

                     {analysisResult ? (
                        <div className="flex-1 animate-fadeIn bg-gray-50 rounded-2xl p-6 border border-gray-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                           <div className="prose prose-sm prose-headings:text-ayur-green prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-ayur-green max-w-none">
                              <div dangerouslySetInnerHTML={{
                                 __html: analysisResult
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/### (.*?)\n/g, '<h4 class="text-lg font-bold mt-6 mb-3 border-l-4 border-ayur-gold pl-3">$1</h4>')
                                    .replace(/\* (.*?)\n/g, '<li class="ml-4 list-disc marker:text-ayur-gold mb-1">$1</li>')
                              }} />
                           </div>
                           <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
                              <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-800 leading-relaxed">
                                 <strong>Disclaimer:</strong> This is an AI estimation. Actual approval depends on the TPA (Third Party Administrator) and the specific terms of your policy at the time of admission.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-60 py-10">
                           <div className="relative">
                              <div className="absolute inset-0 bg-ayur-green/10 rounded-full blur-2xl animate-pulse"></div>
                              <img
                                 src="https://cdn-icons-png.flaticon.com/512/2666/2666505.png"
                                 alt="Policy Icon"
                                 className="w-28 h-28 relative z-10 grayscale opacity-40"
                                 onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                           </div>
                           <div className="max-w-xs mx-auto">
                              <h4 className="font-bold text-gray-700 mb-4">We check the fine print for:</h4>
                              <div className="space-y-3">
                                 {["AYUSH Coverage Limit", "Room Rent Capping", "Co-payment Clauses", "Waiting Periods"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                       <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {item}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* --- SECTION 2: PROCESS TIMELINE --- */}
            <div>
               <div className="text-center mb-16 max-w-2xl mx-auto">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4">Seamless Cashless Journey</h2>
                  <p className="text-gray-500 text-lg">We have a dedicated TPA desk to handle your paperwork from admission to discharge.</p>
               </div>

               <div className="relative px-4">
                  {/* Desktop Connecting Line */}
                  <div className="hidden md:block absolute top-[50px] left-10 right-10 h-1 bg-gradient-to-r from-gray-200 via-ayur-green/20 to-gray-200 rounded-full -z-10"></div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                     {[
                        { title: "Admission", desc: "Submit Policy Card & KYC Documents.", icon: Building2 },
                        { title: "Pre-Auth", desc: "Hospital sends request to TPA.", icon: FileCheck },
                        { title: "Approval", desc: "Treatment starts upon TPA approval.", icon: Stethoscope },
                        { title: "Discharge", desc: "Sign final bill & go home.", icon: CreditCard },
                     ].map((step, idx) => (
                        <div key={idx} className="relative flex flex-row md:flex-col items-center gap-6 md:gap-0 group">
                           {/* Mobile Vertical Line */}
                           {idx < 3 && (
                              <div className="md:hidden absolute left-[35px] top-[70px] bottom-[-48px] w-0.5 bg-gray-200"></div>
                           )}

                           {/* Icon Circle */}
                           <div className="w-[70px] h-[70px] rounded-full bg-white border-4 border-ayur-cream group-hover:border-ayur-gold shadow-lg flex items-center justify-center text-ayur-green group-hover:text-ayur-gold transition-all duration-300 relative z-10 shrink-0">
                              <step.icon size={28} />
                              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-ayur-green text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                                 {idx + 1}
                              </div>
                           </div>

                           <div className="md:mt-6 md:text-center">
                              <h3 className="font-bold text-xl text-ayur-green mb-1 group-hover:text-ayur-gold transition-colors">{step.title}</h3>
                              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* --- SECTION 3: NETWORK PARTNERS (MARQUEE & GRID) --- */}
            <div id="partners" className="scroll-mt-24">
               {/* Section Header with Category Tabs */}
               <div className="mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                     <div>
                        <span className="text-ayur-gold font-bold uppercase tracking-widest text-xs mb-2 block">Our Network</span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green">Insurance Partners & TPAs</h2>
                        <p className="text-gray-500 mt-2 text-lg">Trusted by {INSURANCE_PARTNERS.length}+ leading insurers and TPAs.</p>
                     </div>

                     {/* Search Input */}
                     <div className="relative w-full md:w-[350px] group z-20">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Search className="text-gray-400 group-focus-within:text-ayur-gold transition-colors" size={20} />
                        </div>
                        <input
                           type="text"
                           placeholder="Search partner (e.g. HDFC)..."
                           className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-ayur-gold focus:ring-4 focus:ring-ayur-gold/10 shadow-lg shadow-ayur-green/5 transition-all text-base"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                           <button
                              onClick={() => setSearchTerm('')}
                              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Clear search"
                           >
                              <X size={18} />
                           </button>
                        )}
                     </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                     {[
                        { id: 'All', label: 'All Partners', icon: Building2 },
                        { id: 'Insurer', label: 'Insurance Companies', icon: ShieldCheck },
                        { id: 'TPA', label: 'TPA Network', icon: FileCheck }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setFilterCategory(tab.id as any)}
                           className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${filterCategory === tab.id
                              ? 'bg-ayur-green text-white border-ayur-green shadow-md'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-ayur-green hover:text-ayur-green'
                              }`}
                        >
                           <tab.icon size={16} />
                           {tab.label}
                        </button>
                     ))}
                  </div>
               </div>

               {/* PARTNER CONTENT: SHOW MARQUEE IF NO SEARCH/FILTER, ELSE SHOW GRID */}
               <div className="relative min-h-[400px]">

                  {searchTerm === '' && filterCategory === 'All' ? (
                     // 1. MARQUEE VIEW (Infinite Scroll)
                     <div className="w-full relative overflow-hidden py-10">
                        {/* Edge Fades */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-ayur-cream via-ayur-cream/80 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-ayur-cream via-ayur-cream/80 to-transparent z-10 pointer-events-none"></div>

                        <div className="flex animate-marquee w-max hover:pause">
                           {/* Loop twice to create seamless infinite scroll */}
                           {[...INSURANCE_PARTNERS, ...INSURANCE_PARTNERS].map((partner, idx) => (
                              <div key={`${idx}-${partner.name}`} className="w-[300px] md:w-[420px] px-4 md:px-6 flex-shrink-0">
                                 <div className="bg-white h-[280px] rounded-[2rem] border border-ayur-subtle shadow-md hover:shadow-2xl hover:border-ayur-gold/30 transition-all duration-500 flex flex-col items-center justify-center p-10 group cursor-pointer relative overflow-hidden transform hover:-translate-y-2">

                                    {/* Hover Effect: Soft Gold Glow Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-ayur-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Type Badge */}
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${partner.type === 'TPA' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                          {partner.type || 'Insurer'}
                                       </span>
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center gap-6">
                                       {/* Logo: Large & Prominent */}
                                       <PartnerLogo
                                          partner={partner}
                                          className="h-20 md:h-24 w-auto p-2"
                                          fallbackClass="h-20 md:h-24 w-full"
                                       />
                                       <h4 className="text-lg md:text-xl font-bold text-gray-400 group-hover:text-ayur-green transition-colors text-center leading-tight">
                                          {partner.name}
                                          {partner.type === 'TPA' && <span className="block text-xs text-ayur-gold mt-1 font-normal uppercase tracking-wider">TPA Partner</span>}
                                       </h4>
                                    </div>

                                    {/* Hover CTA */}
                                    <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                       <span className="text-xs font-bold uppercase tracking-widest text-ayur-gold flex items-center gap-2">
                                          Accepted <CheckCircle2 size={16} />
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     // 2. GRID VIEW (Filtered Results) - Uses same Large Card style
                     <div className="bg-white rounded-3xl p-8 border border-ayur-subtle shadow-sm animate-fadeIn">
                        {/* Result Count */}
                        <div className="flex justify-between items-center mb-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                           <span>Found {filteredPartners.length} matches</span>
                           {filterCategory !== 'All' && <span>Filter: {filterCategory}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {filteredPartners.length > 0 ? (
                              <>
                                 {filteredPartners.slice(0, visiblePartners).map((partner, idx) => (
                                    <div
                                       key={idx}
                                       className="bg-white h-[260px] rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-ayur-gold/40 hover:-translate-y-1 flex flex-col items-center justify-center p-8 group relative overflow-hidden"
                                    >
                                       <div className="absolute inset-0 bg-gradient-to-br from-ayur-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                       <div className="absolute top-4 right-4 group-hover:opacity-100 transition-opacity duration-300">
                                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${partner.type === 'TPA' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                             {partner.type || 'Insurer'}
                                          </span>
                                       </div>

                                       <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 gap-4">
                                          <PartnerLogo
                                             partner={partner}
                                             className="h-20 w-auto p-2"
                                             fallbackClass="h-20 w-full"
                                          />
                                          <h4 className="text-lg font-bold text-gray-400 group-hover:text-ayur-green transition-colors text-center leading-tight px-4">
                                             {partner.name}
                                          </h4>
                                       </div>
                                    </div>
                                 ))}
                              </>
                           ) : (
                              <div className="col-span-full py-20 text-center flex flex-col items-center">
                                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 border border-gray-100">
                                    <Filter size={32} />
                                 </div>
                                 <h3 className="text-gray-800 font-bold text-lg mb-2">No partners found</h3>
                                 <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                                    We couldn't find any insurer matching "{searchTerm}" in the {filterCategory === 'All' ? 'network' : filterCategory} category.
                                 </p>
                                 <button
                                    onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                                    className="text-ayur-gold font-bold text-sm bg-ayur-gold/10 px-6 py-2 rounded-full hover:bg-ayur-gold hover:text-white transition-colors"
                                 >
                                    Clear Filters
                                 </button>
                              </div>
                           )}
                        </div>

                        {/* Load More Button */}
                        {filteredPartners.length > visiblePartners && (
                           <div className="mt-10 text-center">
                              <button
                                 onClick={() => setVisiblePartners(prev => prev + 9)}
                                 className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-8 py-3 rounded-full font-bold hover:bg-ayur-gold hover:text-white hover:border-ayur-gold transition-all shadow-sm"
                              >
                                 Load More Partners <ChevronDown size={16} />
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Grid Footer CTA */}
               <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4">
                  <p className="text-sm text-gray-400 italic">
                     *List updated as of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-ayur-green cursor-pointer hover:text-ayur-gold transition-colors">
                     Don't see your insurer? Call TPA Desk <ArrowRight size={16} />
                  </div>
               </div>

            </div>

            {/* --- SECTION 4: REIMBURSEMENT INFO --- */}
            <div className="bg-[#FDF8F0] rounded-3xl p-8 md:p-12 border border-ayur-gold/20 flex flex-col md:flex-row items-center gap-10 md:gap-16">
               <div className="flex-1">
                  <span className="inline-block py-1 px-3 rounded-full bg-white border border-ayur-gold/30 text-ayur-gold text-[10px] font-bold uppercase tracking-wider mb-4">Alternative Option</span>
                  <h3 className="font-serif text-3xl font-bold text-ayur-green mb-4">No Cashless? No Problem.</h3>
                  <p className="text-ayur-gray text-lg leading-relaxed mb-8">
                     If your insurance provider is not in our network, or if TPA denies cashless, you can still avail <strong>Reimbursement</strong>. We provide a complete kit to ensure your claim is processed smoothly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                        "Detailed Discharge Summary",
                        "Final Bill with GST",
                        "Pharmacy & Lab Receipts",
                        "Claim Form Assistance"
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-ayur-subtle shadow-sm">
                           <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                           <span className="text-sm font-medium text-ayur-gray">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="w-full md:w-auto flex justify-center">
                  <div className="relative group">
                     <div className="absolute inset-0 bg-ayur-gold/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                     <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-ayur-subtle flex flex-col items-center w-64">
                        <div className="w-16 h-16 bg-ayur-cream rounded-full flex items-center justify-center text-ayur-gold mb-4">
                           <Landmark size={32} />
                        </div>
                        <p className="text-center font-bold text-ayur-green text-lg">Reimbursement Kit</p>
                        <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
                           Ready within 24hrs of discharge for hassle-free submission.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- SECTION 5: FAQ --- */}
            <div className="max-w-3xl mx-auto">
               <h2 className="text-center font-serif text-3xl font-bold text-ayur-green mb-10">Frequently Asked Questions</h2>
               <div className="space-y-4">
                  {FAQS.map((faq, idx) => (
                     <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                        <button
                           onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                           className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                           <span className={`font-bold text-lg transition-colors ${activeFAQ === idx ? 'text-ayur-gold' : 'text-ayur-green'}`}>
                              {faq.q}
                           </span>
                           <div className={`p-2 rounded-full transition-colors ${activeFAQ === idx ? 'bg-ayur-gold text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {activeFAQ === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                           </div>
                        </button>
                        <div
                           className={`px-6 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${activeFAQ === idx ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                           <p className="border-l-4 border-ayur-cream pl-4 ml-1">
                              {faq.a}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="mt-12 text-center bg-white p-8 rounded-3xl border border-ayur-subtle shadow-sm">
                  <p className="text-ayur-green font-bold text-lg mb-2">Still have questions?</p>
                  <p className="text-gray-500 mb-6">Our dedicated Insurance Desk is available to guide you.</p>
                  <a href="tel:+919426684047" className="inline-flex items-center justify-center bg-ayur-green text-white px-8 py-3 rounded-full font-bold hover:bg-ayur-gold transition-colors shadow-lg">
                     Call Insurance Desk
                  </a>
               </div>
            </div>

         </div>
      </div>
   );
};

export default Insurance;