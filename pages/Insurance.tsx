import React, { useState } from 'react';
import {
    ShieldCheck, FileText, CheckCircle2, Upload, AlertCircle,
    Loader2, Search, Stethoscope, FileCheck, Building2,
    CreditCard, ChevronDown, ChevronUp, X, Check,
    ArrowRight, Landmark, Filter, Sparkles, Phone, Calendar, Bug
} from 'lucide-react';
import { INSURANCE_PARTNERS } from '../constants';
import { NavLink } from '../components/Layout';
import { useIntersectionObserver } from '../hooks';
import { captureError } from '../analytics/errorTracker';
import { aiService } from '../lib/aiService';
import { extractTextFromFile } from '../lib/textExtractor';

function sanitizeAndFormat(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*?)\n/g, '<h4 class="text-lg font-bold mt-6 mb-3 border-l-4 border-ayur-accent pl-3">$1</h4>')
    .replace(/\* (.*?)\n/g, '<li class="ml-4 list-disc marker:text-ayur-accent mb-1">$1</li>');
  return html;
}

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
            <div className="w-10 h-10 rounded-full bg-ayur-cream flex items-center justify-center text-ayur-accent font-serif font-bold text-xl mb-1">
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
   const [showDebug, setShowDebug] = useState(false);
   const [debugInfo, setDebugInfo] = useState<any>(null);

   const handleShowDebug = () => {
      const status = aiService.getStatus();
      aiService.debug();
      setDebugInfo(status);
      setShowDebug(!showDebug);
   };

   const [searchTerm, setSearchTerm] = useState('');
   const [filterCategory, setFilterCategory] = useState<'All' | 'Insurer' | 'TPA'>('All');
   const [visiblePartners, setVisiblePartners] = useState(9);

   const heroObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
   const analyzerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
   const timelineObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
   const partnersObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
   const reimbursementObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
   const faqObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

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
        setAnalysisResult(null);

        try {
           // Debug: Check AI service status
           console.log('[Insurance] AI Service Status:', aiService.getStatus());
           aiService.debug();
           
           // Check if AI service is available
           if (!aiService.isAvailable()) {
              console.error('[Insurance] AI service not available');
              throw new Error('AI service not configured');
           }

           // Step 1: Extract text from file
           console.log('[Insurance] Extracting text from file...');
           const extractedText = await extractTextFromFile(selectedFile);
           console.log('[Insurance] Text extracted, length:', extractedText.length);
           
           if (!extractedText || extractedText.length < 10) {
              throw new Error('Could not extract enough text from the document. Please ensure the document is clear and readable.');
           }

           const prompt = `You are an insurance expert specializing in Indian health insurance policies and AYUSH (Ayurveda, Yoga, Unani, Siddha, Homeopathy) coverage. Analyze this insurance policy document and provide:

1. Is AYUSH/Alternative Treatment covered?
2. What is the coverage limit (percentage of sum insured)?
3. Any specific conditions or exclusions?
4. Room rent cap if any?
5. Co-payment requirements?
6. Waiting period for pre-existing conditions?

Provide your response in this markdown format:
### Coverage Status
* **AYUSH Covered:** [Yes/No]
* **Coverage Limit:** [X% of Sum Insured / Up to Rs. X]

### Key Conditions
* **Room Rent Cap:** [Yes - Rs. X/day / As per policy / Not specified]
* **Co-payment:** [X% applicable / None]
* **Waiting Period:** [X years for pre-existing / 2 years standard / Not specified]

### Recommendation
[Whether to proceed with cashless treatment at our hospital]

If the document is not readable or is not an insurance policy, say "Unable to analyze - Please upload a clear insurance policy document."`;

            console.log('[Insurance] Calling aiService.analyzeDocument...');
            
            // Step 2: Analyze extracted text with Nvidia (with timeout)
            let responseText;
            const analysisPromise = aiService.analyzeDocument(extractedText, selectedFile.type, prompt);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('AI analysis timed out - please try again')), 45000)
            );
            
            responseText = await Promise.race([analysisPromise, timeoutPromise]);
           
            console.log('[Insurance] Analysis successful, response length:', responseText.length);
           setAnalysisResult(responseText);
       } catch (error) {
          console.error('[Insurance] AI Analysis Error:', error);
          console.error('[Insurance] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown',
            stack: error instanceof Error ? error.stack : 'N/A',
            name: error instanceof Error ? error.name : 'Unknown'
          });
          captureError(error instanceof Error ? error : new Error(String(error)), {
             severity: 'high',
             source: 'InsurancePage:handleAnalyze'
          });
          
// Check error type and show appropriate message
           const errorMessage = error instanceof Error ? error.message : '';
           console.log('[Insurance] Error caught:', errorMessage);
           
            if (errorMessage.includes('timed out')) {
               setAnalysisResult("### AI Service Taking Too Long\n\nThe AI is taking longer than expected to analyze your document.\n\n**Options:**\n1. Try uploading a smaller document (less text)\n2. Try a text-based PDF instead of scanned\n3. Call our TPA desk: +91 94266 84047 for immediate help");
            } else if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
               setAnalysisResult("### AI Service Temporarily Busy\n\nOur AI analysis service has reached its usage limit. This resets automatically.\n\n**No worries! You can still proceed with cashless treatment:**\n\n1. **Call our TPA desk**: +91 94266 84047\n2. **Email your policy**: insurance@ayurvritta.in\n3. **Visit us**: Our team will verify your policy manually\n\nWe accept cashless treatment with 50+ insurance partners including Star Health, HDFC ERGO, ICICI Lombard, and more.");
            } else if (errorMessage.includes('Could not extract') || errorMessage.includes('text from')) {
               setAnalysisResult("### Document Text Extraction Failed\n\nWe couldn't extract text from your document. This may happen if:\n\n- The document is image-based (scanned)\n- The PDF is password protected\n- The image quality is too low\n\n**Try these alternatives:**\n1. Upload a clearer image or text-based PDF\n2. Copy-paste the policy text directly\n3. Call our TPA desk: +91 94266 84047");
            } else if (errorMessage.includes('not configured') || errorMessage.includes('Nvidia API key') || errorMessage.includes('500')) {
               setAnalysisResult(`### AI Analysis Unavailable ⚠️

**Status:** NVIDIA_API_KEY not configured in Vercel server environment.

#### To Enable AI Document Analysis:
The administrator must add the API key in Vercel:

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Go to **Environment Variables**  
3. Add: **NVIDIA_API_KEY** = your key from https://build.nvidia.com
4. Redeploy the project

#### Manual Verification Available Now:
We still provide **free policy verification** through our Insurance Desk:

📞 **Call**: +91 94266 84047
📧 **Email**: insurance@ayurvritta.in  
💬 **WhatsApp**: +91 94266 84047

#### What We'll Check:
- AYUSH treatment coverage
- Coverage limits & percentage
- Room rent caps
- Co-payment requirements  
- Pre-existing disease waiting periods
- Pre-authorization requirements

**50+ cashless partners:** Star Health, HDFC ERGO, ICICI Lombard, New India, Oriental, National, and more.`);
            } else if (errorMessage.includes('504') || errorMessage.includes('timeout') || errorMessage.includes('FUNCTION_INVOCATION_TIMEOUT')) {
               setAnalysisResult(`### AI Service Timeout ⚠️

The AI document analysis took too long and timed out. This can happen with large documents or slow API responses.

**Quick Solutions:**
1. Try uploading a smaller/shorter policy document
2. Try a text-based PDF (not scanned image)
3. Try again in a few moments

**Alternative - Manual Verification:**
We still provide **free policy verification** instantly:

📞 **Call**: +91 94266 84047
📧 **Email**: insurance@ayurvritta.in  
💬 **WhatsApp**: +91 94266 84047

We'll check your coverage and help with cashless pre-authorization within minutes.`);
            } else {
              // Show actual error for debugging
              setAnalysisResult(`### Analysis Error\n\nSomething went wrong: ${errorMessage.substring(0, 100)}\n\n**Try again or contact:** +91 94266 84047`);
           }
       } finally {
          setLoading(false);
       }
    };

   const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

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
      <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen">
         <style>{styles}</style>

         {/* --- ENHANCED HERO SECTION --- */}
         <section ref={heroObserver.ref} className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark text-white overflow-hidden pb-32 md:pb-48">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-36 relative z-10">
               <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                  {/* Left Content */}
                  <div className={`lg:w-1/2 text-center lg:text-left space-y-8 ${heroObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                     <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-bold uppercase tracking-widest">
                        <ShieldCheck size={18} className="text-ayur-accent" />
                        <span>ROHINI ID: 8900080700376</span>
                     </div>

                     <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                        Healing is Yours.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">
                           Claims are Ours.
                        </span>
                     </h1>

                     <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                        Ayurvritta is a government-authorized hospital on the ROHINI registry.
                        Experience seamless cashless treatments for chronic conditions with over 30+ insurance partners.
                     </p>

                     <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <button
                           onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
                           className="group flex items-center gap-3 bg-gradient-to-r from-ayur-accent to-amber-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                        >
                           <span>Check Your Insurer</span>
                           <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-3 px-6 py-4 rounded-full border border-white/20 text-white/80 bg-white/5 backdrop-blur-sm">
                           <CheckCircle2 size={18} className="text-green-400" />
                           <span className="text-sm font-medium">TPA Desk Support</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Graphic: Cashless Card */}
                  <div className="lg:w-1/2 relative flex justify-center perspective-1000">
                     <div className="relative w-full max-w-md aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-8 flex flex-col justify-between transform hover:rotate-1 transition-transform duration-700 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"></div>

                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <div className="text-xs text-ayur-accent font-bold uppercase tracking-widest">Health Card</div>
                              <div className="text-2xl font-serif font-bold text-white">Cashless Approved</div>
                           </div>
                           <ShieldCheck size={40} className="text-ayur-accent opacity-80" />
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-14 rounded bg-white/20"></div>
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
                     <div className="absolute -bottom-6 -right-4 bg-white text-ayur-green p-5 rounded-2xl shadow-2xl z-20 flex flex-col items-center animate-float">
                        <span className="text-xs font-bold uppercase text-gray-400">Network</span>
                        <span className="text-3xl font-bold text-ayur-accent leading-none">30+</span>
                        <span className="text-xs font-bold">Partners</span>
                     </div>
                  </div>

               </div>
            </div>

            {/* Wave divider */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ayur-cream to-transparent"></div>
         </section>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-12 space-y-20 pb-20">

            {/* --- SECTION 1: AI POLICY ANALYZER --- */}
            <section ref={analyzerObserver.ref} className={`bg-white rounded-3xl shadow-2xl border-2 border-ayur-subtle overflow-hidden ${analyzerObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ayur-green via-ayur-accent to-ayur-green"></div>

               <div className="flex flex-col lg:flex-row">

                   {/* Left: Interactive Upload Area */}
                   <div className="lg:w-5/12 bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-ayur-accent/5 rounded-full blur-3xl"></div>
                      
                      <div className="mb-8 relative z-10">
                         <div className="flex items-center justify-between mb-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                               <Sparkles size={12} /> AI Powered
                            </div>
                            <button 
                               onClick={handleShowDebug}
                               className="text-xs text-gray-400 hover:text-ayur-green flex items-center gap-1"
                               title="Debug AI Service"
                            >
                               <Bug size={12} /> Debug
                            </button>
                         </div>
                         
                         {showDebug && debugInfo && (
                            <div className="mb-4 p-3 bg-gray-900 text-green-400 text-xs rounded-lg font-mono">
                               <div>Nvidia NIM: {debugInfo.nvidia ? '✅ Connected' : '❌ Not Available'}</div>
                               {debugInfo.error && <div className="text-red-400">Error: {debugInfo.error}</div>}
                            </div>
                         )}
                         
                         <h2 className="font-serif text-3xl font-bold text-ayur-green mb-3">Check Eligibility Instantly</h2>
                         <p className="text-gray-500 text-sm leading-relaxed">
                            Unsure if your policy covers Ayurveda? Upload your policy schedule (first page) and our AI will extract the AYUSH benefit clause for you.
                         </p>
                      </div>

                     <div className="flex-1 flex flex-col justify-center relative z-10">
                        {!selectedFile ? (
                           <label className="border-2 border-dashed border-gray-300 hover:border-ayur-accent hover:bg-white rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden">
                              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                              <div className="absolute inset-0 bg-ayur-accent/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>

                              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform text-ayur-green border border-gray-100 relative z-10">
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
                              <p className="text-xs text-ayur-accent mt-1 font-medium">Ready to Analyze</p>
                           </div>
                        )}

                        <button
                           onClick={handleAnalyze}
                           disabled={!selectedFile || loading}
                           className="group w-full mt-6 bg-gradient-to-r from-ayur-green to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-ayur-green/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                  </div>

                  {/* Right: Results Display */}
                  <div className="lg:w-7/12 p-8 md:p-12 bg-white flex flex-col">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <div>
                           <h3 className="font-bold text-lg text-ayur-green flex items-center gap-2">
                              <FileText size={18} className="text-ayur-accent" /> Analysis Report
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
                        <div className="flex-1 animate-fadeIn bg-gray-50 rounded-2xl p-6 border border-gray-100 overflow-y-auto max-h-[400px]">
                           <div className="prose prose-sm prose-headings:text-ayur-green prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-ayur-green max-w-none">
                              <div dangerouslySetInnerHTML={{
                                 __html: sanitizeAndFormat(analysisResult)
                              }} />
                           </div>
                           <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-800 leading-relaxed">
                                 <strong>Disclaimer:</strong> This is an AI estimation. Actual approval depends on the TPA (Third Party Administrator) and the specific terms of your policy at the time of admission.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-60 py-10">
                           <div className="relative">
                              <div className="absolute inset-0 bg-ayur-green/10 rounded-full blur-2xl animate-pulse"></div>
                              <div className="w-24 h-24 bg-ayur-cream rounded-full flex items-center justify-center relative z-10">
                                 <FileText size={40} className="text-ayur-accent" />
                              </div>
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
            </section>

            {/* --- SECTION 2: PROCESS TIMELINE --- */}
            <section ref={timelineObserver.ref}>
               <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-accent/10 rounded-full mb-4">
                     <Sparkles size={14} className="text-ayur-accent" />
                     <span className="text-xs font-bold text-ayur-accent uppercase tracking-wider">Process</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4">Seamless Cashless Journey</h2>
                  <p className="text-gray-500 text-lg">We have a dedicated TPA desk to handle your paperwork from admission to discharge.</p>
               </div>

               <div className="relative px-4">
                  <div className="hidden md:block absolute top-[50px] left-10 right-10 h-1 bg-gradient-to-r from-gray-200 via-ayur-accent/20 to-gray-200 rounded-full -z-10"></div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
                     {[
                        { title: "Admission", desc: "Submit Policy Card & KYC Documents.", icon: Building2 },
                        { title: "Pre-Auth", desc: "Hospital sends request to TPA.", icon: FileCheck },
                        { title: "Approval", desc: "Treatment starts upon TPA approval.", icon: Stethoscope },
                        { title: "Discharge", desc: "Sign final bill & go home.", icon: CreditCard },
                     ].map((step, idx) => (
                        <div 
                           key={idx} 
                           className={`relative flex flex-row md:flex-col items-center gap-6 md:gap-0 group ${timelineObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                           style={{ animationDelay: `${idx * 100}ms` }}
                        >
                           {idx < 3 && (
                              <div className="md:hidden absolute left-[35px] top-[70px] bottom-[-32px] w-0.5 bg-gray-200"></div>
                           )}

                           <div className="w-[70px] h-[70px] rounded-full bg-white border-4 border-ayur-cream group-hover:border-ayur-accent shadow-lg flex items-center justify-center text-ayur-green group-hover:text-ayur-accent transition-all duration-300 relative z-10 shrink-0 group-hover:scale-110">
                              <step.icon size={28} />
                              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-ayur-green text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                                 {idx + 1}
                              </div>
                           </div>

                           <div className="md:mt-6 md:text-center">
                              <h3 className="font-bold text-xl text-ayur-green mb-1 group-hover:text-ayur-accent transition-colors">{step.title}</h3>
                              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* --- SECTION 3: NETWORK PARTNERS --- */}
            <section id="partners" ref={partnersObserver.ref} className="scroll-mt-24">
               <div className="mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                     <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-accent/10 rounded-full mb-4">
                           <ShieldCheck size={14} className="text-ayur-accent" />
                           <span className="text-xs font-bold text-ayur-accent uppercase tracking-wider">Our Network</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green">Insurance Partners & TPAs</h2>
                        <p className="text-gray-500 mt-2 text-lg">Trusted by {INSURANCE_PARTNERS.length}+ leading insurers and TPAs.</p>
                     </div>

                     <div className="relative w-full md:w-[350px] group z-20">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Search className="text-gray-400 group-focus-within:text-ayur-accent transition-colors" size={20} />
                        </div>
                        <input
                           type="text"
                           placeholder="Search partner (e.g. HDFC)..."
                           className="w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ayur-accent focus:ring-4 focus:ring-ayur-accent/10 shadow-lg shadow-ayur-green/5 transition-all text-base"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                           <button
                              onClick={() => setSearchTerm('')}
                              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                           >
                              <X size={18} />
                           </button>
                        )}
                     </div>
                  </div>

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

               <div className="relative min-h-[400px]">

                  {searchTerm === '' && filterCategory === 'All' ? (
                     <div className="w-full relative overflow-hidden py-10">
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-ayur-cream via-ayur-cream/80 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-ayur-cream via-ayur-cream/80 to-transparent z-10 pointer-events-none"></div>

                        <div className="flex animate-marquee w-max hover:pause">
                           {[...INSURANCE_PARTNERS, ...INSURANCE_PARTNERS].map((partner, idx) => (
                              <div key={`${idx}-${partner.name}`} className="w-[300px] md:w-[420px] px-4 md:px-6 flex-shrink-0">
                                 <div className={`bg-white h-[280px] rounded-[2rem] border-2 border-ayur-subtle shadow-md hover:shadow-2xl hover:border-ayur-accent/30 transition-all duration-500 flex flex-col items-center justify-center p-10 group cursor-pointer relative overflow-hidden transform hover:-translate-y-3 ${partnersObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: `${(idx % 10) * 50}ms` }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-ayur-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${partner.type === 'TPA' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                          {partner.type || 'Insurer'}
                                       </span>
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center gap-6">
                                       <PartnerLogo
                                          partner={partner}
                                          className="h-20 md:h-24 w-auto p-2"
                                          fallbackClass="h-20 md:h-24 w-full"
                                       />
                                       <h4 className="text-lg md:text-xl font-bold text-gray-400 group-hover:text-ayur-green transition-colors text-center leading-tight">
                                          {partner.name}
                                          {partner.type === 'TPA' && <span className="block text-xs text-ayur-accent mt-1 font-normal uppercase tracking-wider">TPA Partner</span>}
                                       </h4>
                                    </div>

                                    <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                       <span className="text-xs font-bold uppercase tracking-widest text-ayur-accent flex items-center gap-2">
                                          Accepted <CheckCircle2 size={16} />
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="bg-white rounded-3xl p-8 border-2 border-ayur-subtle shadow-sm animate-fadeIn">
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
                                       className="bg-white h-[260px] rounded-[2rem] border-2 border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-ayur-accent/40 hover:-translate-y-2 flex flex-col items-center justify-center p-8 group relative overflow-hidden"
                                    >
                                       <div className="absolute inset-0 bg-gradient-to-br from-ayur-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

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
                                    className="text-ayur-accent font-bold text-sm bg-ayur-accent/10 px-6 py-2 rounded-full hover:bg-ayur-accent hover:text-white transition-colors"
                                 >
                                    Clear Filters
                                 </button>
                              </div>
                           )}
                        </div>

                        {filteredPartners.length > visiblePartners && (
                           <div className="mt-10 text-center">
                              <button
                                 onClick={() => setVisiblePartners(prev => prev + 9)}
                                 className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-600 px-8 py-3 rounded-full font-bold hover:bg-ayur-accent hover:text-white hover:border-ayur-accent transition-all shadow-sm hover:shadow-lg"
                              >
                                 Load More Partners <ChevronDown size={16} />
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4">
                  <p className="text-sm text-gray-400 italic">
                     *List updated as of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-ayur-green cursor-pointer hover:text-ayur-accent transition-colors">
                     Don't see your insurer? Call TPA Desk <ArrowRight size={16} />
                  </div>
               </div>
            </section>

            {/* --- SECTION 4: REIMBURSEMENT INFO --- */}
            <section ref={reimbursementObserver.ref} className={`bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 md:p-12 border-2 border-ayur-accent/20 flex flex-col md:flex-row items-center gap-10 md:gap-16 ${reimbursementObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
               <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ayur-accent/30 rounded-full mb-4">
                     <Sparkles size={14} className="text-ayur-accent" />
                     <span className="text-xs font-bold text-ayur-accent uppercase tracking-wider">Alternative Option</span>
                  </div>
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
                        <div key={i} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-ayur-subtle shadow-sm hover:shadow-md transition-shadow">
                           <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                           <span className="text-sm font-medium text-ayur-gray">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="w-full md:w-auto flex justify-center">
                  <div className="relative group">
                     <div className="absolute inset-0 bg-ayur-accent/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                     <div className="relative bg-white p-8 rounded-2xl shadow-xl border-2 border-ayur-subtle flex flex-col items-center w-64">
                        <div className="w-16 h-16 bg-ayur-accent/10 rounded-full flex items-center justify-center text-ayur-accent mb-4">
                           <Landmark size={32} />
                        </div>
                        <p className="text-center font-bold text-ayur-green text-lg">Reimbursement Kit</p>
                        <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
                           Ready within 24hrs of discharge for hassle-free submission.
                        </p>
                     </div>
                  </div>
               </div>
            </section>

            {/* --- SECTION 5: FAQ --- */}
            <section ref={faqObserver.ref}>
               <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-green/10 rounded-full mb-4">
                     <AlertCircle size={14} className="text-ayur-green" />
                     <span className="text-xs font-bold text-ayur-green uppercase tracking-wider">Support</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-ayur-green">Frequently Asked Questions</h2>
               </div>
               
               <div className="space-y-4 max-w-3xl mx-auto">
                  {FAQS.map((faq, idx) => (
                     <div 
                        key={idx} 
                        className={`bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${faqObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                     >
                        <button
                           onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                           className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                           <span className={`font-bold text-lg transition-colors ${activeFAQ === idx ? 'text-ayur-accent' : 'text-ayur-green'}`}>
                              {faq.q}
                           </span>
                           <div className={`p-2 rounded-full transition-all duration-300 ${activeFAQ === idx ? 'bg-ayur-accent text-white scale-110' : 'bg-gray-100 text-gray-500 hover:bg-ayur-accent/10'}`}>
                              {activeFAQ === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                           </div>
                        </button>
                        <div
                           className={`px-6 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${activeFAQ === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                           <p className="border-l-4 border-ayur-accent pl-4 ml-1">
                              {faq.a}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="mt-12 text-center bg-white p-8 rounded-3xl border-2 border-ayur-subtle shadow-lg hover:shadow-xl transition-shadow">
                  <p className="text-ayur-green font-bold text-lg mb-2">Still have questions?</p>
                  <p className="text-gray-500 mb-6">Our dedicated Insurance Desk is available to guide you.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <a href="tel:+919426684047" className="inline-flex items-center justify-center gap-2 bg-ayur-green text-white px-8 py-3 rounded-2xl font-bold hover:bg-ayur-green-dark hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all">
                        <Phone size={18} />
                        Call Insurance Desk
                     </a>
                     <NavLink to="/booking" className="inline-flex items-center justify-center gap-2 border-2 border-ayur-green text-ayur-green px-8 py-3 rounded-2xl font-bold hover:bg-ayur-green hover:text-white transition-all">
                        <Calendar size={18} />
                        Book Consultation
                     </NavLink>
                  </div>
               </div>
            </section>

         </div>
      </div>
   );
};

export default Insurance;