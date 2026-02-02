import React from 'react';
import { NavLink } from '../components/Layout';
import { CheckCircle2, ArrowRight, Clock, Target, Sparkles, Activity } from 'lucide-react';
import { PROGRAMS } from '../constants';

const Programs: React.FC = () => {

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    // Helper to get curated, high-quality Unsplash images based on Program ID
    const getProgramImage = (id: string) => {
        switch (id) {
            case 'thyroid':
                return "/images/programs/program-thyroid.png";
            case 'diabetes':
                return "/images/programs/program-diabetes.png"; // Blood test/Lab
            case 'ckd':
                return "/images/programs/program-ckd.png"; // Renal/Doctor care
            case 'stress':
                return "/images/programs/program-stress.png"; // Spa/Relaxation
            case 'weight':
                return "/images/programs/program-weight.png"; // Fitness/Waist
            default:
                return FALLBACK_IMAGE;
        }
    };

    return (
        <div className="bg-ayur-cream min-h-screen pb-24">
            {/* Hero Section */}
            <div className="bg-ayur-green pt-32 pb-24 md:pt-40 md:pb-32 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
                {/* Abstract Background Blurs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-ayur-gold/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 animate-fadeIn">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-ayur-gold text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        Clinical Protocols
                    </span>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Therapeutic Programs</h1>
                    <p className="text-lg md:text-xl text-ayur-cream/90 max-w-2xl mx-auto font-light leading-relaxed">
                        Structured, outcome-oriented care paths designed to reverse chronic lifestyle disorders through root-cause correction.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-16 md:space-y-24">
                {PROGRAMS.map((program, index) => (
                    <div
                        key={program.id}
                        id={program.id}
                        className={`group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-ayur-subtle overflow-hidden flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                    >
                        {/* Visual Section */}
                        <div className="lg:w-[45%] relative h-[300px] lg:h-auto overflow-hidden bg-[#0F3D3E]">

                            {/* CUSTOM POSTER LAYOUT FOR THYROID */}
                            {program.id === 'thyroid' ? (
                                <div className="absolute inset-0 flex flex-col">
                                    {/* Top Text Section */}
                                    <div className="pt-10 px-6 text-center z-20">
                                        <h3 className="font-serif text-3xl md:text-4xl font-bold leading-none text-[#F2E8D5] tracking-wide drop-shadow-lg">
                                            HYPOTHYROIDISM
                                        </h3>
                                        <h3 className="font-serif text-3xl md:text-4xl font-bold leading-none text-[#F2E8D5] tracking-wide mt-2 flex justify-center items-center gap-3 drop-shadow-lg">
                                            <span className="text-ayur-gold font-serif italic text-2xl">&</span> METABOLISM
                                        </h3>
                                        <div className="w-16 h-0.5 bg-ayur-gold/60 mx-auto my-4"></div>
                                        <p className="text-white/90 text-sm font-medium tracking-wide uppercase leading-relaxed max-w-xs mx-auto drop-shadow-md">
                                            Understanding the Root Cause (Nidan) <br className="hidden md:block" /> for Sustainable Wellness
                                        </p>
                                    </div>

                                    {/* Bottom Image Section */}
                                    <div className="relative flex-1 mt-4 overflow-hidden bg-ayur-green">
                                        {/* Glow Effect behind the thyroid area */}
                                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-400/30 rounded-full blur-[50px] z-10 animate-pulse"></div>
                                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-200/40 rounded-full blur-[20px] z-10"></div>

                                        {/* Gradient Fade to blend image top into background */}
                                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0F3D3E] to-transparent z-20"></div>

                                        <img
                                            src="/images/programs/program-thyroid.png"
                                            alt="Healing Hands"
                                            className="w-full h-full object-cover object-top opacity-90 scale-110 translate-y-4"
                                            onError={(e) => {
                                                e.currentTarget.src = FALLBACK_IMAGE;
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Standard Overlay for other programs */}
                                    <img
                                        src={getProgramImage(program.id)}
                                        alt={program.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-ayur-green/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-multiply"></div>

                                    {/* Floating Badge */}
                                    <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-ayur-green">
                                        <Activity size={16} className="text-ayur-gold" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Clinical Track</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 lg:w-[55%] flex flex-col relative">
                            {/* Header */}
                            <div className="flex items-start gap-5 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-ayur-green/5 flex items-center justify-center text-ayur-green shrink-0 group-hover:bg-ayur-green group-hover:text-white transition-colors duration-300">
                                    <program.icon size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-1">{program.title}</h3>
                                    <p className="text-ayur-gold font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                        <Sparkles size={12} /> {program.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-ayur-gray text-lg leading-relaxed mb-8 border-l-4 border-ayur-gold/30 pl-4 italic">
                                "{program.description}"
                            </p>

                            {/* Metrics Bar */}
                            <div className="flex flex-wrap gap-4 md:gap-8 border-y border-gray-100 py-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Duration</span>
                                        <span className="font-bold text-ayur-green">{program.duration}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Approach</span>
                                        <span className="font-bold text-ayur-green">Root Cause (Nidan)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Left Col: Ideal For */}
                                <div>
                                    <h4 className="font-bold text-ayur-green text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Who is this for?
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {program.idealFor.map((item, i) => (
                                            <span key={i} className="inline-block px-3 py-1.5 bg-ayur-cream text-ayur-green text-xs font-bold rounded-lg border border-ayur-subtle">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Col: Inclusions */}
                                <div>
                                    <h4 className="font-bold text-ayur-green text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Therapies Included
                                    </h4>
                                    <ul className="space-y-2">
                                        {program.includes.slice(0, 3).map((item, i) => (
                                            <li key={i} className="flex items-start text-sm text-ayur-gray font-medium">
                                                <CheckCircle2 size={16} className="text-ayur-gold mt-0.5 mr-2 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                        {program.includes.length > 3 && (
                                            <li className="text-xs text-ayur-gold font-bold pl-6">+ {program.includes.length - 3} more specific therapies</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto pt-4 md:pt-0">
                                <NavLink
                                    to="/booking"
                                    className="w-full md:w-auto inline-flex justify-center items-center bg-ayur-green text-white px-8 py-4 rounded-full font-bold hover:bg-ayur-gold transition-all duration-300 shadow-lg group-hover:shadow-xl hover:-translate-y-1"
                                >
                                    Enquire About Program <ArrowRight size={20} className="ml-2" />
                                </NavLink>
                                <p className="text-center md:text-left text-xs text-gray-400 mt-3 ml-2">
                                    * Consultation required for eligibility
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Programs;