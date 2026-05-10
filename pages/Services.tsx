import React, { useState, useEffect } from 'react';
import { SERVICES } from '../constants';
import { NavLink } from '../components/Layout';
import { ArrowRight, Bed, UserCheck, Sparkles, Award, Clock, CheckCircle2, Phone, Calendar, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';

const Services: React.FC = () => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    const FALLBACK_HERB = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const headerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
    const servicesObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
    const chargesObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });

    const [animatedPrices, setAnimatedPrices] = useState({ room: 1000, visit: 500, newCase: 500, followUp: 300 });

    const serviceCards = [
        { id: 1, title: "Panchakarma", subtitle: "Detoxification", color: "from-cyan-500 to-blue-600", iconBg: "bg-cyan-100 text-cyan-600" },
        { id: 2, title: "Pain Management", subtitle: "Orthopedic Care", color: "from-amber-500 to-orange-600", iconBg: "bg-amber-100 text-amber-600" },
        { id: 3, title: "Women’s Health", subtitle: "Gynae Care", color: "from-pink-500 to-rose-600", iconBg: "bg-pink-100 text-pink-600" }
    ];

    return (
        <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen pb-24 md:pb-20">

            {/* ENHANCED HEADER */}
            <section ref={headerObserver.ref} className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark py-20 md:py-32 text-white overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
                
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                        <Sparkles className="w-5 h-5 text-ayur-accent animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Holistic Healing</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '100ms' }}>
                        Treatments & <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Therapies</span>
                    </h1>
                    
                    <p className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '200ms' }}>
                        Holistic healing protocols tailored to your unique Prakriti.
                    </p>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ayur-cream to-transparent"></div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

                {/* SERVICE CATEGORIES PREVIEW */}
                <section className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serviceCards.map((cat, idx) => (
                            <div 
                                key={cat.id}
                                className={`group relative bg-white rounded-2xl p-6 border-2 border-ayur-subtle hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${servicesObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
                                <div className="relative z-10 text-center">
                                    <div className={`w-16 h-16 ${cat.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <Sparkles size={28} />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-ayur-green mb-1 group-hover:text-white transition-colors duration-300">{cat.title}</h3>
                                    <p className="text-sm text-ayur-gray group-hover:text-white/80 transition-colors duration-300">{cat.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ENHANCED SERVICES GRID - DESKTOP */}
                <section ref={servicesObserver.ref} className="mb-16">
                    <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
                        {SERVICES.map((service, idx) => (
                            <div 
                                key={service.id}
                                className={`group relative bg-white rounded-3xl border-2 border-ayur-subtle overflow-hidden hover:border-ayur-green/30 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(13,135,112,0.25)] hover:-translate-y-3 ${servicesObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                {/* Gradient top bar */}
                                <div className="h-2 bg-gradient-to-r from-ayur-green to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                                
                                {/* Image container */}
                                <div className="relative h-56 bg-ayur-green/5 overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/40 via-transparent to-transparent"></div>
                                    
                                    {/* Icon badge */}
                                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <service.icon size={22} className="text-ayur-green" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-7">
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {service.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gradient-to-r from-ayur-green/5 to-emerald-50 text-ayur-green text-xs font-semibold rounded-full border border-ayur-green/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h3 className="font-serif text-2xl font-bold text-ayur-green mb-3 group-hover:text-ayur-accent transition-colors duration-300">{service.title}</h3>
                                    <p className="text-ayur-gray text-sm leading-relaxed mb-5 line-clamp-2">{service.description}</p>

                                    {/* Sub-services indicator */}
                                    {service.subServices && (
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-8 h-8 bg-ayur-accent/10 rounded-lg flex items-center justify-center">
                                                <Award size={14} className="text-ayur-accent" />
                                            </div>
                                            <span className="text-xs text-ayur-accent font-bold uppercase tracking-wider">
                                                Includes {service.subServices.length} Therapies
                                            </span>
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <div className="pt-5 border-t border-gray-100">
                                        <NavLink
                                            to={`/services/${service.id}`}
                                            className="w-full inline-flex justify-between items-center px-6 py-3.5 bg-transparent border-2 border-ayur-green text-ayur-green font-bold rounded-xl group-hover:bg-ayur-green group-hover:text-white transition-all duration-300"
                                        >
                                            <span>View Treatments</span>
                                            <div className="w-8 h-8 bg-ayur-green/10 rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-300">
                                                <ArrowRight size={16} />
                                            </div>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ENHANCED MOBILE HORIZONTAL SCROLL */}
                    <div className="md:hidden pb-4 -mx-4 px-4">
                        <div className="flex gap-4 overflow-x-auto scroll-snap-x snap-x snap-mandatory pb-4">
                            {SERVICES.map((service, idx) => (
                                <div 
                                    key={service.id}
                                    className="w-[80vw] flex-shrink-0 bg-white rounded-2xl shadow-lg border border-ayur-subtle overflow-hidden scroll-snap-align-start"
                                >
                                    <div className="h-44 bg-ayur-green/10 relative overflow-hidden">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/40 to-transparent"></div>
                                        <div className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur rounded-lg flex items-center justify-center shadow-md">
                                            <service.icon size={18} className="text-ayur-green" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {service.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-ayur-green/5 text-ayur-green text-[10px] font-bold rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-ayur-green mb-2">{service.title}</h3>
                                        <p className="text-ayur-gray text-xs leading-relaxed mb-3 line-clamp-2">{service.description}</p>
                                        {service.subServices && (
                                            <p className="text-[10px] text-ayur-accent font-bold uppercase mb-3">Includes {service.subServices.length} Therapies</p>
                                        )}
                                        <NavLink
                                            to={`/services/${service.id}`}
                                            className="w-full inline-flex justify-center items-center bg-ayur-green text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
                                        >
                                            View Details <ArrowRight size={14} className="ml-2" />
                                        </NavLink>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ENHANCED GENERAL CHARGES SECTION */}
                <section ref={chargesObserver.ref} className={`mb-16 ${chargesObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-ayur-accent/10 rounded-full mb-4">
                            <Award size={18} className="text-ayur-accent" />
                            <span className="text-sm font-bold text-ayur-accent uppercase tracking-wider">Transparent Pricing</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-3">General Hospital Charges</h2>
                        <p className="text-ayur-gray text-lg max-w-xl mx-auto">Standard rates for accommodation and consultation.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                        {/* Room Charges Card */}
                        <div className="group bg-white rounded-3xl p-8 border-2 border-ayur-subtle hover:border-blue-300 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.25)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <Bed size={26} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-ayur-green">Room & Visit Charges</h3>
                                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Accommodation</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Clock size={14} className="text-blue-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">General Ward</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">₹{animatedPrices.room}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <UserCheck size={14} className="text-blue-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">Doctor Visit</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">₹{animatedPrices.visit}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 font-medium">
                                    <CheckCircle2 size={16} />
                                    <span>Per day charges</span>
                                </div>
                            </div>
                        </div>

                        {/* Consultation Charges Card */}
                        <div className="group bg-white rounded-3xl p-8 border-2 border-ayur-subtle hover:border-emerald-300 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <UserCheck size={26} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-ayur-green">Consultation Charges</h3>
                                        <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Medical Visit</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <Sparkles size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">New Case</span>
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-600">₹{animatedPrices.newCase}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <ArrowRight size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">Follow-up</span>
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-600">₹{animatedPrices.followUp}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                    <CheckCircle2 size={16} />
                                    <span>Within 30 days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Banner */}
                    <div className="mt-12 relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-ayur-green to-ayur-green-dark">
                            <img
                                src={FALLBACK_HERB}
                                alt="Book Consultation"
                                className="w-full h-full object-cover mix-blend-overlay opacity-20"
                            />
                        </div>
                        <div className="relative z-10 p-10 md:p-12 text-center">
                            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">Need a Custom Treatment Plan?</h3>
                            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Our physicians will create a personalized protocol based on your unique constitution and health condition.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <NavLink to="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-ayur-accent text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                                    <Calendar className="w-5 h-5" />
                                    Book Consultation
                                </NavLink>
                                <a href="tel:+919426684047" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-ayur-green transition-all duration-300">
                                    <Phone className="w-5 h-5" />
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Services;