import React, { useState, useEffect } from 'react';
import { NavLink } from '../components/Layout';
import { CheckCircle2, ArrowRight, Clock, Target, Sparkles, Activity, X, Droplet, Stethoscope, Moon, Scale } from 'lucide-react';
import { PROGRAMS } from '../constants';
import { useIntersectionObserver } from '../hooks';

const iconMap: Record<string, React.ElementType> = {
  Activity,
  Droplet,
  Stethoscope,
  Moon,
  Scale
};

const Programs: React.FC = () => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
    const headerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
    const programsObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

    useEffect(() => {
        return () => { document.body.style.overflow = ''; };
    }, []);

    const getProgramImage = (id: string) => {
        const images: Record<string, string> = {
            thyroid: "/images/programs/program-thyroid.png",
            diabetes: "/images/programs/program-diabetes.png",
            ckd: "/images/programs/program-ckd.png",
            stress: "/images/programs/program-stress.png",
            weight: "/images/programs/program-weight.png"
        };
        return images[id] || FALLBACK_IMAGE;
    };

    const getTheme = (id: string) => {
        const themes: Record<string, any> = {
            thyroid: { gradient: 'from-amber-500 to-orange-500', glow: 'from-amber-400/30 to-orange-400/20', border: 'border-amber-200', tagBg: 'bg-amber-50', tagText: 'text-amber-700', iconBg: 'bg-amber-100 text-amber-600', accent: 'text-amber-600' },
            diabetes: { gradient: 'from-green-500 to-emerald-600', glow: 'from-green-400/30 to-emerald-400/20', border: 'border-emerald-200', tagBg: 'bg-green-50', tagText: 'text-green-700', iconBg: 'bg-green-100 text-green-600', accent: 'text-green-600' },
            ckd: { gradient: 'from-purple-500 to-violet-600', glow: 'from-purple-400/30 to-violet-400/20', border: 'border-violet-200', tagBg: 'bg-purple-50', tagText: 'text-purple-700', iconBg: 'bg-purple-100 text-purple-600', accent: 'text-purple-600' },
            stress: { gradient: 'from-indigo-500 to-blue-600', glow: 'from-indigo-400/30 to-blue-400/20', border: 'border-indigo-200', tagBg: 'bg-indigo-50', tagText: 'text-indigo-700', iconBg: 'bg-indigo-100 text-indigo-600', accent: 'text-indigo-600' },
            weight: { gradient: 'from-rose-500 to-red-600', glow: 'from-rose-400/30 to-red-400/20', border: 'border-rose-200', tagBg: 'bg-rose-50', tagText: 'text-rose-700', iconBg: 'bg-rose-100 text-rose-600', accent: 'text-rose-600' }
        };
        return themes[id] || themes.thyroid;
    };

    const getIcon = (iconName: string) => iconMap[iconName] || Activity;

    const openModal = (id: string) => { setSelectedProgram(id); document.body.style.overflow = 'hidden'; };
    const closeModal = () => { setSelectedProgram(null); document.body.style.overflow = ''; };

    const selectedData = selectedProgram ? PROGRAMS.find(p => p.id === selectedProgram) : null;
    const selectedTheme = selectedData ? getTheme(selectedData.id) : null;

    return (
        <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen pb-24">
            <section ref={headerObserver.ref} className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-32 pb-24 md:pt-40 md:pb-32 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
                <div className={`max-w-4xl mx-auto px-4 relative z-10 text-center ${headerObserver.isVisible ? 'animate-fadeIn' : ''}`}>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5 text-ayur-accent animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Clinical Protocols</span>
                    </div>
                    <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '100ms' }}>
                        Therapeutic <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Programs</span>
                    </h1>
                    <p className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '200ms' }}>
                        Structured, outcome-oriented care paths designed to reverse chronic lifestyle disorders through root-cause correction.
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ayur-cream to-transparent"></div>
            </section>

            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-ayur-subtle py-3 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto">
                    {PROGRAMS.map(p => {
                        const t = getTheme(p.id);
                        return <a key={p.id} href={`#${p.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:scale-105 transition-transform border border-transparent hover:border-ayur-subtle"><div className={`w-2 h-2 rounded-full bg-gradient-to-r ${t.gradient}`}></div><span className="text-ayur-gray hover:text-ayur-green">{p.title.split(' ')[0]}</span></a>;
                    })}
                </div>
            </div>

            <div ref={programsObserver.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-16">
                {PROGRAMS.map((program, index) => {
                    const theme = getTheme(program.id);
                    const IconComponent = getIcon(program.icon?.toString() || 'Activity');
                    return (
                        <div key={program.id} id={program.id} className={`group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border ${theme.border} overflow-hidden flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} ${programsObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: `${index * 150}ms` }}>
                            <div className="lg:w-[45%] relative h-[300px] lg:h-auto overflow-hidden bg-[#0F3D3E]">
                                <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow}`}></div>
                                <img src={getProgramImage(program.id)} alt={program.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-ayur-green/10 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-multiply"></div>
                                <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-ayur-green hover:scale-110 transition-transform">
                                    <Activity size={16} className="text-ayur-accent" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Clinical Track</span>
                                </div>
                                <button onClick={() => openModal(program.id)} className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-ayur-green text-sm font-bold hover:bg-ayur-accent hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                                    <Sparkles size={14} /> Quick View
                                </button>
                            </div>
                            <div className="p-8 md:p-12 lg:w-[55%] flex flex-col relative">
                                <div className="flex items-start gap-5 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md`}>
                                        <IconComponent size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-1 group-hover:text-ayur-accent transition-colors">{program.title}</h3>
                                        <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme.accent}`}><Sparkles size={12} /> {program.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-ayur-gray text-lg leading-relaxed mb-8 border-l-4 border-ayur-accent/30 pl-4 italic">"{program.description}"</p>
                                <div className="flex flex-wrap gap-4 md:gap-8 border-y border-gray-100 py-6 mb-8">
                                    <div className="flex items-center gap-3 group/metric hover:-translate-y-1 transition-transform"><div className={`p-3 ${theme.tagBg} rounded-xl group-hover/metric:scale-110 transition-transform`}><Clock size={20} className={theme.accent} /></div><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Duration</span><span className="font-bold text-ayur-green">{program.duration}</span></div></div>
                                    <div className="flex items-center gap-3 group/metric hover:-translate-y-1 transition-transform"><div className={`p-3 ${theme.tagBg} rounded-xl group-hover/metric:scale-110 transition-transform`}><Target size={20} className={theme.accent} /></div><div><span className="block text-[10px] uppercase text-gray-400 font-bold">Approach</span><span className="font-bold text-ayur-green">Root Cause</span></div></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <h4 className="font-bold text-ayur-green text-sm uppercase tracking-widest mb-4">Who is this for?</h4>
                                        <div className="flex flex-wrap gap-2">{program.idealFor.map((item, i) => <span key={i} className={`px-3 py-1.5 ${theme.tagBg} ${theme.tagText} text-xs font-bold rounded-lg border border-ayur-subtle hover:scale-105 hover:shadow-md transition-all`}>{item}</span>)}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ayur-green text-sm uppercase tracking-widest mb-4">Therapies Included</h4>
                                        <ul className="space-y-2">{program.includes.slice(0, 3).map((item, i) => <li key={i} className="flex items-start text-sm text-ayur-gray font-medium group/item hover:text-ayur-green"><span className={`w-5 h-5 rounded-full ${theme.tagBg} flex items-center justify-center mr-2 shrink-0 group-hover/item:scale-110 transition-transform`}><CheckCircle2 size={12} className={theme.accent} /></span>{item}</li>)}</ul>
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-4">
                                    <NavLink to="/booking" className="flex-1 inline-flex justify-center items-center bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-8 py-4 rounded-full font-bold hover:from-ayur-accent hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">Enquire About Program <ArrowRight size={20} className="ml-2" /></NavLink>
                                    <button onClick={() => openModal(program.id)} className="flex-1 inline-flex justify-center items-center bg-white border-2 border-ayur-green text-ayur-green px-8 py-4 rounded-full font-bold hover:bg-ayur-green hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">View Details</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedData && selectedTheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-ayur-green/80 backdrop-blur-sm animate-fadeIn" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-zoomIn">
                        <button onClick={closeModal} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-ayur-gray hover:text-ayur-green hover:scale-110 transition-all shadow-lg"><X size={20} /></button>
                        <div className={`relative h-48 bg-gradient-to-br ${selectedTheme.glow}`}>
                            <img src={getProgramImage(selectedData.id)} alt={selectedData.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-6">
                                <span className={`inline-block px-3 py-1 ${selectedTheme.tagBg} ${selectedTheme.tagText} text-xs font-bold rounded-full mb-2`}>{selectedData.duration}</span>
                                <h2 className="font-serif text-2xl font-bold text-white">{selectedData.title}</h2>
                                <p className={`text-sm ${selectedTheme.accent}`}>{selectedData.subtitle}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-ayur-green uppercase tracking-wider text-sm mb-3">About</h3>
                            <p className="text-ayur-gray mb-6">{selectedData.description}</p>
                            <h3 className="font-bold text-ayur-green uppercase tracking-wider text-sm mb-3">Ideal For</h3>
                            <div className="flex flex-wrap gap-2 mb-6">{selectedData.idealFor.map((item, i) => <span key={i} className={`px-4 py-2 ${selectedTheme.tagBg} ${selectedTheme.tagText} text-sm font-bold rounded-full border border-ayur-subtle`}>{item}</span>)}</div>
                            <h3 className="font-bold text-ayur-green uppercase tracking-wider text-sm mb-3">All Therapies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">{selectedData.includes.map((item, i) => <div key={i} className="flex items-center gap-3 p-3 bg-ayur-cream/50 rounded-xl border border-ayur-subtle"><div className={`w-8 h-8 rounded-full ${selectedTheme.iconBg} flex items-center justify-center shrink-0`}><CheckCircle2 size={16} className={selectedTheme.accent} /></div><span className="text-sm text-ayur-gray font-medium">{item}</span></div>)}</div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <NavLink to="/booking" onClick={closeModal} className="flex-1 inline-flex justify-center items-center bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-6 py-4 rounded-full font-bold hover:from-ayur-accent hover:to-amber-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">Book Consultation <ArrowRight size={18} className="ml-2" /></NavLink>
                                <button onClick={closeModal} className="flex-1 inline-flex justify-center items-center border-2 border-ayur-subtle text-ayur-gray px-6 py-4 rounded-full font-bold hover:border-ayur-green hover:text-ayur-green transition-all">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Programs;