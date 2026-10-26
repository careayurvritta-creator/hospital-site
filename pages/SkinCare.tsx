import React from 'react';
import { NavLink } from '../components/Layout';
import { Leaf, Sparkles, Stethoscope, ClipboardList, FlaskConical, Salad, Phone, ArrowRight, ShieldCheck, Clock, Award, BookOpen } from 'lucide-react';

/**
 * Ayurveda Skin Care authority page (/ayurveda-skin-care).
 * Targets "ayurveda skin care" searches and gives AI assistants a single,
 * citable page for skin-related recommendations. Medical copy stays
 * non-promissory: Ayurvedic care supports management, no cure guarantees.
 */

const CONDITIONS = [
    {
        title: 'Acne & Pimples',
        ayurvedaName: 'Yauvan Pidika',
        description: 'Breakouts linked to Pitta-Kapha imbalance, digestion and hormones. Care focuses on internal cooling, gut health and gentle external routines rather than harsh stripping of the skin.',
        icon: Sparkles,
        postSlug: 'acne-ayurveda-treatment-teenage-skin',
    },
    {
        title: 'Eczema & Atopic Dermatitis',
        ayurvedaName: 'Vicharchika',
        description: 'Itching, dryness, oozing and thickened skin are approached by calming aggravated doshas, supporting the skin barrier and identifying dietary and lifestyle triggers.',
        icon: Leaf,
        postSlug: 'eczema-ayurveda-itchy-dry-skin-remedies',
    },
    {
        title: 'Psoriasis',
        ayurvedaName: 'Kitibha',
        description: 'A chronic, relapsing condition needing long-term management. Treatment is individualized and may include classical detoxification procedures under strict physician supervision.',
        icon: ShieldCheck,
        postSlug: 'psoriasis-ayurveda-treatment-natural',
    },
    {
        title: 'Urticaria (Hives) & Skin Allergy',
        ayurvedaName: 'Sheetapitta',
        description: 'Recurrent wheals and itching are managed by identifying triggers, correcting digestion and using classical formulations suited to your constitution.',
        icon: Stethoscope,
        postSlug: 'urticaria-hives-skin-allergy-ayurveda',
    },
    {
        title: 'Dry, Sensitive & Flaky Skin',
        ayurvedaName: 'Vata-pradhana Tvak Vikara',
        description: 'Aggravated Vata, cold weather and irregular routine often sit behind chronic dryness. Internal and external oleation, warm routines and seasonal care form the core of treatment.',
        icon: Leaf,
        postSlug: 'dry-skin-winter-ayurveda-care',
    },
    {
        title: 'Pigmentation & Dull Skin',
        ayurvedaName: 'Vyanga',
        description: 'Pigmentation and loss of glow are assessed alongside Pitta, liver function, sleep and hormonal factors, with a plan built around your Prakriti rather than a single cosmetic product.',
        icon: Sparkles,
        postSlug: null,
    },
];

const APPROACH_STEPS = [
    {
        title: 'Detailed Skin & Pulse Assessment',
        description: 'History, skin examination, Nadi (pulse) reading, Prakriti analysis and review of your reports and current medication.',
        icon: ClipboardList,
    },
    {
        title: 'Root-Cause Diagnosis',
        description: 'We map the condition to dosha involvement, Agni (digestive fire), ama (metabolic toxins) and rakta dhatu, instead of treating the lesion alone.',
        icon: Stethoscope,
    },
    {
        title: 'Personalized Treatment',
        description: 'Classical herbal formulations, external therapies and, when indicated, Panchakarma procedures such as Virechana — always selected and monitored by our physicians.',
        icon: FlaskConical,
    },
    {
        title: 'Diet, Routine & Follow-Up',
        description: 'A condition-specific diet chart, trigger management and scheduled reviews so the plan evolves with your response.',
        icon: Salad,
    },
];

const FAQS = [
    {
        question: 'Can Ayurveda help chronic skin problems like eczema and psoriasis?',
        answer: 'Ayurveda offers structured, doctor-led management for chronic skin conditions by addressing digestion, dosha imbalance and lifestyle triggers alongside skin-directed therapies. These are long-term conditions: results vary from person to person, and treatment is planned as ongoing care rather than a quick cure. Many patients use Ayurvedic care alongside their dermatologist’s advice.',
    },
    {
        question: 'How is Ayurvedic skin treatment different from using creams?',
        answer: 'Creams mainly act on the surface. Ayurvedic skin care combines external therapies with internal work — digestion, diet, sleep, stress and dosha balance — because chronic skin disease is often an expression of a systemic imbalance. External routines are still used, but they are one part of the plan, not the whole plan.',
    },
    {
        question: 'How long does Ayurvedic skin treatment take?',
        answer: 'It depends on the condition, its duration and your constitution. Acute problems may respond in a few weeks, while long-standing eczema or psoriasis usually needs a few months of consistent treatment and follow-up. After your first assessment, the doctor will give you a realistic timeline for your case.',
    },
    {
        question: 'Should I stop my current skin medicines before starting Ayurveda?',
        answer: 'No. Do not stop or replace prescribed medication on your own. Bring your reports and current prescriptions to the consultation — our physicians will plan Ayurvedic care around them and coordinate any changes safely.',
    },
    {
        question: 'Is online consultation available for skin problems?',
        answer: 'Yes. Video consultations are available for patients in India and abroad. You can share photographs and reports in advance; the doctor will advise whether an in-person visit is needed for examination or procedures such as Panchakarma.',
    },
];

const SkinCare: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen pb-24">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-32 pb-20 md:pt-40 md:pb-28 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
                        <Leaf className="w-5 h-5 text-ayur-accent" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Doctor-Led Ayurvedic Dermatology</span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Ayurvedic <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Skin Care</span> in Vadodara
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-10">
                        Root-cause treatment for acne, eczema, psoriasis, urticaria and chronic dry skin — personalized by Ayurveda physicians at Ayurvritta Ayurveda Hospital &amp; Panchakarma Center.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <NavLink
                            to="/booking"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-ayur-accent text-white font-bold rounded-full hover:bg-ayur-accent/90 hover:shadow-2xl transition-all"
                        >
                            Book a Skin Consultation <ArrowRight size={18} />
                        </NavLink>
                        <a
                            href="tel:+919426684047"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-white/10 border border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all"
                        >
                            <Phone size={18} /> +91 94266 84047
                        </a>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-white/70">
                        <span className="inline-flex items-center gap-2"><Award size={16} className="text-ayur-accent" /> 15+ years of clinical experience</span>
                        <span className="inline-flex items-center gap-2"><Clock size={16} className="text-ayur-accent" /> 24/7 hospital</span>
                        <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-ayur-accent" /> Cashless insurance available</span>
                    </div>
                </div>
            </section>

            {/* Conditions */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ayur-green mb-4">Skin Conditions We Treat</h2>
                    <p className="text-sm sm:text-base md:text-lg text-ayur-gray max-w-2xl mx-auto">
                        Every condition is assessed against your Prakriti, digestion and lifestyle — no one-size-fits-all prescriptions.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CONDITIONS.map((condition) => (
                        <article key={condition.title} className="bg-white rounded-3xl border-2 border-ayur-subtle p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-ayur-green/30 transition-all flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-ayur-green/10 text-ayur-green flex items-center justify-center mb-5">
                                <condition.icon size={24} />
                            </div>
                            <h3 className="font-serif text-xl md:text-2xl font-bold text-ayur-green mb-1">{condition.title}</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-ayur-accent mb-4">{condition.ayurvedaName}</p>
                            <p className="text-sm sm:text-base text-ayur-gray leading-relaxed flex-1">{condition.description}</p>
                            {condition.postSlug && (
                                <NavLink
                                    to={`/blog/${condition.postSlug}`}
                                    className="mt-6 inline-flex items-center gap-2 min-h-[48px] text-ayur-green font-semibold hover:text-ayur-accent transition-colors"
                                >
                                    <BookOpen size={16} /> Read the physician’s guide <ArrowRight size={16} />
                                </NavLink>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            {/* Approach */}
            <section className="bg-white border-y border-ayur-subtle">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ayur-green mb-4">How We Treat Skin Disease at the Root</h2>
                        <p className="text-sm sm:text-base md:text-lg text-ayur-gray max-w-2xl mx-auto">
                            A structured clinical process, not a cosmetic package.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {APPROACH_STEPS.map((step, index) => (
                            <div key={step.title} className="relative bg-ayur-cream/50 rounded-3xl p-4 sm:p-6 md:p-8 border border-ayur-subtle">
                                <span className="absolute top-6 right-6 font-serif text-4xl font-bold text-ayur-green/10">0{index + 1}</span>
                                <step.icon size={28} className="text-ayur-green mb-5" />
                                <h3 className="font-serif text-lg md:text-xl font-bold text-ayur-green mb-3">{step.title}</h3>
                                <p className="text-sm sm:text-base text-ayur-gray leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs sm:text-sm text-ayur-gray/80 text-center max-w-3xl mx-auto mt-10">
                        Note: Ayurvedic treatment supports the management of chronic skin conditions and is individualized. It is not a substitute for emergency dermatology care — please seek urgent help for severe reactions, rapidly spreading rashes or breathing difficulty.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ayur-green mb-4">Skin Care Questions, Answered</h2>
                </div>
                <div className="space-y-4">
                    {FAQS.map((faq) => (
                        <details key={faq.question} className="group bg-white border-2 border-ayur-subtle rounded-2xl overflow-hidden hover:border-ayur-green/40 transition-colors">
                            <summary className="cursor-pointer list-none p-5 md:p-6 min-h-[48px] font-semibold text-base md:text-lg text-ayur-green flex items-center justify-between gap-4">
                                {faq.question}
                                <span className="text-ayur-accent text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="px-5 md:px-6 pb-6 text-sm sm:text-base text-ayur-gray leading-relaxed">{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-ayur-green to-ayur-green-dark rounded-3xl p-6 sm:p-10 md:p-14 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ayur-accent/20 rounded-full blur-[80px]"></div>
                    <h2 className="relative font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Start With a Proper Skin Assessment</h2>
                    <p className="relative text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Meet Dr. Jinendradutt Sharma and our physician team in Vadodara, or consult online from anywhere. Bring your reports and current prescriptions.
                    </p>
                    <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
                        <NavLink
                            to="/booking"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-ayur-accent text-white font-bold rounded-full hover:bg-ayur-accent/90 transition-all"
                        >
                            Book Your Consultation <ArrowRight size={18} />
                        </NavLink>
                        <a
                            href="https://wa.me/919426684047?text=Hi%2C%20I%20would%20like%20a%20skin%20care%20consultation%20at%20Ayurvritta."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-white/10 border border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SkinCare;
