import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from '../components/Layout';
import { ArrowRight, Star, Heart, Shield, Award, Building2, FileCheck, MapPin, CheckCircle2, Phone, Mail, Calendar, Users, Clock, Sparkles, Quote, GraduationCap, Briefcase, TrendingUp, Activity, Leaf, Droplet } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';

const About: React.FC = () => {
    const FALLBACK_DOCTOR_MALE = "https://images.unsplash.com/photo-1622253692010-333f2da60a71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    const FALLBACK_DOCTOR_FEMALE = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    const FALLBACK_HERB = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const heroObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
    const introObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
    const statsObserver = useIntersectionObserver({ threshold: 0.3, rootMargin: '-50px' });
    const teamObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
    const complianceObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
    const philosophyObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
    const ctaObserver = useIntersectionObserver({ threshold: 0.3, rootMargin: '-50px' });

    const [animatedValues, setAnimatedValues] = useState({ patients: 0, years: 0, partners: 0, care: 0 });
    const [statsAnimated, setStatsAnimated] = useState(false);

    useEffect(() => {
        if (!statsAnimated) {
            setStatsAnimated(true);
            const targets = { patients: 10000, years: 15, partners: 50, care: 24 };
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;
            
            let step = 0;
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                setAnimatedValues({
                    patients: Math.round(targets.patients * easeOut),
                    years: Math.round(targets.years * easeOut),
                    partners: Math.round(targets.partners * easeOut),
                    care: Math.round(targets.care * easeOut)
                });
                
                if (step >= steps) clearInterval(timer);
            }, interval);
            
            return () => clearInterval(timer);
        }
    }, []);

    const doctors = [
        {
            name: "Dr. Jinendradutt Sharma",
            title: "B.A.M.S., M.D. (Ayurveda) Scholar",
            role: "Medical Director",
            regNumber: "GB-I 26922",
            image: "/images/about/dr-sharma.png",
            fallback: FALLBACK_DOCTOR_MALE,
            color: "from-emerald-500 to-cyan-600",
            iconColor: "bg-emerald-100 text-emerald-600",
            specializations: ["Chronic Metabolic Disorders", "Diabetes & Thyroid", "Panchakarma Therapy", "Lifestyle Disease Management"],
            experience: "15+ Years Experience"
        },
        {
            name: "Dr. Sharlin H. Gor",
            title: "M.D. (A.M.), B.A.M.S.",
            role: "Senior Consultant",
            regNumber: "GB-I 26015",
            image: "/images/about/dr-gor.png",
            fallback: FALLBACK_DOCTOR_FEMALE,
            color: "from-amber-500 to-orange-600",
            iconColor: "bg-amber-100 text-amber-600",
            specializations: ["Women's Health", "Yoga Therapy", "Integrative Wellness", "Stress Management"],
            experience: "10+ Years Experience"
        }
    ];

    const stats = [
        { icon: Users, value: animatedValues.patients, label: "Patients Treated", suffix: "+", color: "emerald" },
        { icon: Clock, value: animatedValues.years, label: "Years Experience", suffix: "+", color: "amber" },
        { icon: Award, value: animatedValues.partners, label: "Insurance Partners", suffix: "+", color: "emerald" },
        { icon: Heart, value: animatedValues.care, label: "Emergency Care", suffix: "/7", color: "amber" }
    ];

    const philosophyCards = [
        { icon: Leaf, title: "Nidan Parivarjan", desc: "Eliminating the root cause. We don't just treat symptoms; we identify the lifestyle habits creating the disease.", color: "from-green-500 to-emerald-600", iconBg: "bg-green-100 text-green-600" },
        { icon: Droplet, title: "Shodhan Chikitsa", desc: "Deep cellular detoxification through Panchakarma to reset metabolic pathways.", color: "from-blue-500 to-cyan-600", iconBg: "bg-blue-100 text-blue-600" },
        { icon: Activity, title: "Swasthavritta", desc: "Maintenance of health through personalized Dinacharya (daily routine) and diet.", color: "from-amber-500 to-orange-600", iconBg: "bg-amber-100 text-amber-600" }
    ];

    const complianceCards = [
        {
            icon: FileCheck,
            title: "ROHINI Registry",
            subtitle: "Insurance Network of India (IIB)",
            color: "blue",
            iconBg: "bg-blue-600",
            iconText: "text-white",
            badgeBg: "bg-blue-100",
            badgeText: "text-blue-700",
            borderColor: "border-blue-200",
            hoverBorder: "hover:border-blue-400",
            textColor: "text-blue-700",
            verifiedColor: "text-blue-700",
            details: [
                { label: "Rohini ID", value: "8900080700376" },
                { label: "Valid Upto", value: "17 Jul 2028", isValid: true }
            ],
            verified: "Verified for Cashless Insurance"
        },
        {
            icon: Building2,
            title: "Govt. of Gujarat",
            subtitle: "Clinical Establishment Act",
            color: "orange",
            iconBg: "bg-orange-600",
            iconText: "text-white",
            badgeBg: "bg-orange-100",
            badgeText: "text-orange-700",
            borderColor: "border-orange-200",
            hoverBorder: "hover:border-orange-400",
            textColor: "text-orange-700",
            verifiedColor: "text-orange-700",
            details: [
                { label: "Reg Number", value: "GUJVAD202501108PR" },
                { label: "Valid Upto", value: "28/03/2026", isValid: true }
            ],
            verified: "Provisional Registration Approved"
        }
    ];

    const formatValue = (val: number, suffix: string) => {
        if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k' + suffix;
        return val + suffix;
    };

    return (
        <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen pb-20">
            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark py-28 md:py-36 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/40 to-transparent rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/30 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
                
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-10 animate-fadeInUp">
                        <Sparkles className="w-5 h-5 text-ayur-accent animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-widest">Est. 2010</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 animate-fadeInUp animation-delay-100 tracking-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Ayurvritta</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-3xl mx-auto animate-fadeInUp animation-delay-200">
                        Government Registered & Insurance Compatible.<br />
                        <span className="text-ayur-accent font-semibold text-2xl">Where classical Ayurveda meets modern diagnostics.</span>
                    </p>

                    {/* Enhanced Stats row */}
                    <div ref={statsObserver.ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 animate-fadeInUp animation-delay-300">
                        {stats.map((stat, idx) => (
                            <div 
                                key={idx} 
                                className="group relative bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/20 hover:border-white/30 hover:-translate-y-2 transition-all duration-500 cursor-default"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${stat.color === 'emerald' ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-amber-500/20 group-hover:bg-amber-500/30'} transition-all duration-300 group-hover:scale-110`}>
                                        <stat.icon size={24} className={stat.color === 'emerald' ? 'text-emerald-300' : 'text-amber-300'} />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                        {idx === 0 ? formatValue(stat.value, stat.suffix) : stat.value + stat.suffix}
                                    </div>
                                    <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider font-medium">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ayur-cream to-transparent"></div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">

                {/* INTRO CARD */}
                <section ref={introObserver.ref} className={`bg-white rounded-3xl shadow-2xl p-8 md:p-16 border border-ayur-subtle mb-16 ${introObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-12 bg-gradient-to-b from-ayur-accent to-ayur-green rounded-full"></div>
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-ayur-accent/20 to-ayur-green/20 text-ayur-green font-bold uppercase tracking-widest text-xs rounded-full">Our Story</span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ayur-green mb-8">Bridging Tradition & Science</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6">
                            <p className="text-ayur-gray text-lg leading-relaxed">
                                Ayurvritta was founded with a singular vision: to restore the dignity of authentic Ayurveda in an era of quick fixes. We observed that while modern medicine is excellent for acute care, it often manages rather than cures chronic lifestyle diseases.
                            </p>
                            <p className="text-ayur-gray text-lg leading-relaxed">
                                Our clinic is not a spa. It is a hospital. We adhere to the rigorous protocols of the Samhitas (ancient texts) while utilizing modern pathology reports to track progress. This unique "Evidence-Based Ayurveda" approach allows us to confidently treat complex cases.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-4">
                                {["Evidence-Based", "Government Registered", "Insurance Compatible"].map((tag, idx) => (
                                    <span key={idx} className="px-5 py-2.5 bg-gradient-to-r from-ayur-green/10 to-emerald-100 text-ayur-green text-sm font-bold rounded-full border border-ayur-green/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative group">
                            <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-ayur-accent/20 to-transparent rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-tl from-ayur-green/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-[0_0_40px_rgba(13,135,112,0.3)] transition-all duration-500">
                                <img
                                    src="/images/about/about-story.png"
                                    alt="Authentic Ayurvedic Herbs"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/40 via-ayur-green/10 to-transparent"></div>
                            </div>
                            <div className="absolute bottom-2 left-2 md:-bottom-6 md:-left-6 bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl animate-float border border-ayur-subtle">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-ayur-accent to-amber-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                                        <Award size={18} className="md:w-6 md:h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-ayur-gray uppercase font-bold tracking-wider">Certified</p>
                                        <p className="text-sm md:text-lg font-bold text-ayur-green">AYUSH Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MEET OUR MEDICAL TEAM */}
                <section ref={teamObserver.ref} className="mb-16">
                    <div className="text-center mb-12">
                        <span className="inline-block px-5 py-2 bg-gradient-to-r from-ayur-green/10 to-emerald-100 text-ayur-green font-bold uppercase tracking-widest text-xs rounded-full mb-4">Medical Panel</span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ayur-green">Meet Our Physicians</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {doctors.map((doctor, idx) => (
                            <div 
                                key={idx} 
                                className={`group bg-white rounded-3xl overflow-hidden border-2 border-ayur-subtle hover:border-ayur-green/30 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(13,135,112,0.25)] hover:-translate-y-3 ${teamObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className={`h-3 bg-gradient-to-r ${doctor.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`}></div>
                                
                                <div className="relative pt-[85%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = doctor.fallback; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="absolute top-5 left-5">
                                        <span className={`bg-gradient-to-r ${doctor.color} text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm`}>
                                            {doctor.role}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    <h3 className="font-serif text-2xl font-bold text-ayur-green leading-tight mb-2">{doctor.name}</h3>
                                    <p className="text-ayur-accent font-bold text-sm uppercase tracking-wider mb-6">{doctor.title}</p>

                                    <div className="bg-gradient-to-br from-ayur-cream to-white p-5 rounded-xl border border-ayur-subtle mb-6 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${doctor.iconColor} rounded-lg flex items-center justify-center`}>
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gujarat Board Reg.</p>
                                                <p className="text-base font-bold text-ayur-green">{doctor.regNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-8 h-8 bg-ayur-accent/10 rounded-lg flex items-center justify-center">
                                            <Clock size={16} className="text-ayur-accent" />
                                        </div>
                                        <span className="text-sm font-bold text-ayur-gray">{doctor.experience}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {doctor.specializations.map((spec, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-ayur-green/5 to-emerald-50 text-ayur-green text-xs font-semibold rounded-full border border-ayur-green/10">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <NavLink to="/booking" className="flex items-center justify-between text-ayur-green font-bold text-sm group-hover:text-ayur-accent transition-colors duration-300">
                                            <span>Book Appointment</span>
                                            <div className="w-11 h-11 bg-ayur-green/10 rounded-full flex items-center justify-center group-hover:bg-ayur-accent group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* REGULATORY COMPLIANCE */}
                <section ref={complianceObserver.ref} className="bg-white rounded-3xl shadow-2xl border border-ayur-subtle mb-16 overflow-hidden">
                    <div className="bg-gradient-to-r from-ayur-green via-[#0a6b5a] to-ayur-green-dark p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-ayur-accent/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <h3 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-ayur-accent to-amber-400 rounded-xl flex items-center justify-center shadow-lg">
                                        <Shield size={26} className="text-white" />
                                    </div>
                                    <span className="text-white">Accreditations & Compliance</span>
                                </h3>
                                <p className="text-white/80 text-lg max-w-2xl">
                                    Ayurvritta is a fully compliant clinical establishment recognized by state and national bodies.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { icon: CheckCircle2, label: "Verified", bg: "bg-emerald-500/20", border: "border-emerald-400/30", text: "text-emerald-300" },
                                    { icon: Award, label: "Certified", bg: "bg-amber-500/20", border: "border-amber-400/30", text: "text-amber-300" },
                                    { icon: Shield, label: "Insured", bg: "bg-sky-500/20", border: "border-sky-400/30", text: "text-sky-300" }
                                ].map((item, idx) => (
                                    <div key={idx} className={`flex items-center gap-2.5 ${item.bg} backdrop-blur-sm px-5 py-2.5 rounded-full border ${item.border} hover:bg-white/20 transition-all duration-300`}>
                                        <item.icon size={18} className={item.text} />
                                        <span className="text-sm font-bold text-white">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gradient-to-b from-white to-ayur-cream/20">
                        {complianceCards.map((card, idx) => (
                            <div 
                                key={idx} 
                                className={`group relative bg-white rounded-2xl p-8 border-2 ${card.borderColor} ${card.hoverBorder} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${complianceObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                    <card.icon size={120} className={card.textColor} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                            <card.icon size={32} className={card.iconText} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-2xl text-ayur-green">{card.title}</h4>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${card.badgeText} ${card.badgeBg} px-3 py-1 rounded-md`}>{card.subtitle}</span>
                                        </div>
                                    </div>

                                    <div className="bg-ayur-cream/50 p-6 rounded-xl border border-ayur-subtle/50 space-y-4">
                                        {card.details.map((detail, i) => (
                                            <div key={i} className="flex justify-between items-center border-b border-ayur-subtle/30 pb-3 last:border-0 last:pb-0">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{detail.label}</span>
                                                <span className={`font-mono font-bold text-sm px-3 py-1.5 rounded-lg ${detail.isValid ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                                                    {detail.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-5 flex items-center gap-2.5 text-sm font-bold ${card.verifiedColor}`}>
                                        <CheckCircle2 size={18} className={card.verifiedColor} /> 
                                        <span>{card.verified}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PHILOSOPHY CARDS */}
                <section ref={philosophyObserver.ref} className="mb-16">
                    <h3 className="text-center font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ayur-green mb-12">Our Core Philosophy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {philosophyCards.map((item, idx) => (
                            <div 
                                key={idx}
                                className={`group relative bg-white rounded-3xl p-10 border-2 border-ayur-subtle hover:border-transparent transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(13,135,112,0.2)] hover:-translate-y-3 overflow-hidden ${philosophyObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                                
                                <div className="relative z-10 text-center">
                                    <div className={`w-24 h-24 ${item.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-120 group-hover:rotate-6 transition-all duration-500`}>
                                        <item.icon size={44} />
                                    </div>
                                    <h4 className="font-serif text-xl font-bold text-ayur-green mb-5 group-hover:text-white transition-colors duration-300 text-xl">{item.title}</h4>
                                    <p className="text-base text-ayur-gray leading-relaxed group-hover:text-white/90 transition-colors duration-300">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA BANNER */}
                <section ref={ctaObserver.ref} className={`relative rounded-3xl overflow-hidden mb-12 ${ctaObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-ayur-green via-[#0a6b5a] to-ayur-green-dark">
                        <img
                            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                            alt="Ayurvritta Clinic"
                            className="w-full h-full object-cover mix-blend-overlay opacity-25"
                            onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/60 to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 p-12 md:p-16 text-center">
                        <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Start Your Healing Journey?</h3>
                        <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">Schedule a consultation with our experienced Ayurvedic physicians and discover the path to natural healing.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-5">
                            <NavLink to="/booking" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-ayur-accent to-amber-500 text-white rounded-full font-bold text-lg shadow-[0_10px_30px_rgba(201,162,39,0.4)] hover:shadow-[0_15px_40px_rgba(201,162,39,0.5)] hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
                                <Calendar className="w-6 h-6" />
                                Book Appointment
                            </NavLink>
                            <a href="tel:+919426684047" className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/50 text-white rounded-full font-bold text-lg hover:bg-white hover:text-ayur-green transition-all duration-300 backdrop-blur-sm">
                                <Phone className="w-6 h-6" />
                                Call Now
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default About;