import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SERVICES } from '../constants';
import { NavLink } from '../components/Layout';
import { ArrowLeft, CheckCircle2, AlertCircle, Phone, Calendar, ArrowRight, Sparkles, Award, Clock, Shield, Star, ChevronDown, Heart, Leaf } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';

const ServiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const service = SERVICES.find(s => s.id === id);

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    const FALLBACK_HERB = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const heroObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
    const contentObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
    const therapyObserver = useIntersectionObserver({ threshold: 0.05, rootMargin: '-50px' });
    const widgetObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });

    const [expandedTherapy, setExpandedTherapy] = useState<number | null>(null);

    const toggleTherapy = (idx: number) => {
        setExpandedTherapy(expandedTherapy === idx ? null : idx);
    };

    if (!service) {
        return <Navigate to="/services" replace />;
    }

    return (
        <div className="bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 min-h-screen pb-32 md:pb-20">

            {/* ENHANCED HERO SECTION */}
            <section ref={heroObserver.ref} className="relative h-[350px] md:h-[500px] bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>

                {/* Background image with overlay */}
                <div className="absolute inset-0">
                    <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                        loading="eager"
                        onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ayur-green via-ayur-green/50 to-transparent"></div>
                </div>

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8 md:pb-24">
                    {/* Back button with animation */}
                    <NavLink 
                        to="/services" 
                        className={`inline-flex items-center gap-2 text-white/80 hover:text-ayur-accent mb-4 md:mb-6 w-fit transition-all duration-300 group ${heroObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                    >
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:-translate-x-1 transition-all duration-300">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-sm md:text-base font-medium">Back to Treatments</span>
                    </NavLink>

                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-fit mb-4 ${heroObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '100ms' }}>
                        <Sparkles size={16} className="text-ayur-accent" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-white">Ayurvedic Therapy</span>
                    </div>

                    <h1 className={`font-serif text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 tracking-tight ${heroObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '150ms' }}>
                        {service.title}
                    </h1>
                    
                    <p className={`text-lg md:text-2xl text-white/85 max-w-3xl font-light leading-relaxed ${heroObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '200ms' }}>
                        {service.description}
                    </p>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ayur-cream to-transparent"></div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* Left Column: Details & Benefits */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CLINICAL INSIGHT SECTION */}
                        <section ref={contentObserver.ref} className={`bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-ayur-subtle ${contentObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-ayur-green to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green">Clinical Insight</h3>
                                    <p className="text-sm text-ayur-gray">Understanding the therapy</p>
                                </div>
                            </div>

                            <p className="text-ayur-gray text-lg leading-relaxed mb-8">
                                {service.fullDescription || service.description}
                            </p>

                            {service.benefits && (
                                <div className="bg-gradient-to-br from-ayur-green/5 to-emerald-50 rounded-2xl p-6 md:p-8 border border-ayur-green/10">
                                    <h4 className="font-bold text-xl text-ayur-green mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-ayur-accent/20 rounded-xl flex items-center justify-center">
                                            <Award size={20} className="text-ayur-accent" />
                                        </div>
                                        Key Therapeutic Benefits
                                    </h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {service.benefits.map((benefit, idx) => (
                                            <li 
                                                key={idx} 
                                                className={`flex items-start gap-3 text-ayur-gray text-sm md:text-base group ${contentObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="w-6 h-6 bg-ayur-green/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-ayur-green/20 transition-colors">
                                                    <CheckCircle2 size={14} className="text-ayur-green" />
                                                </div>
                                                <span className="leading-relaxed">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>

                        {/* THERAPY MENU SECTION */}
                        {service.subServices && service.subServices.length > 0 && (
                            <section ref={therapyObserver.ref} className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-ayur-subtle">
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-ayur-green via-[#0a6b5a] to-ayur-green-dark p-8 md:p-10 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-ayur-accent/10 rounded-full blur-2xl"></div>
                                    
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <Leaf size={28} className="text-ayur-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white">Therapy Menu & Charges</h3>
                                            <p className="text-white/70 text-sm mt-1">Standard rates per session</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Therapy List */}
                                <div className="divide-y divide-gray-100">
                                    {service.subServices.map((sub, idx) => (
                                        <div 
                                            key={idx}
                                            className={`group p-6 md:p-8 hover:bg-gradient-to-r hover:from-ayur-green/5 hover:to-transparent transition-all duration-500 cursor-pointer ${therapyObserver.isVisible ? 'animate-fadeInUp' : ''}`}
                                            style={{ animationDelay: `${idx * 80}ms` }}
                                            onClick={() => toggleTherapy(idx)}
                                        >
                                            <div className="flex gap-5 md:gap-8 items-start">
                                                {/* Image */}
                                                <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-ayur-subtle group-hover:border-ayur-green/30 group-hover:shadow-xl transition-all duration-300 relative">
                                                    <img
                                                        src={sub.image || service.image}
                                                        alt={sub.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        loading="lazy"
                                                        onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="font-serif text-lg md:text-xl font-bold text-ayur-green leading-tight mb-2 group-hover:text-ayur-accent transition-colors duration-300">
                                                                {sub.name}
                                                            </h4>
                                                            {sub.description && (
                                                                <p className={`text-sm text-gray-500 leading-relaxed transition-all duration-300 ${expandedTherapy === idx ? 'line-clamp-none' : 'line-clamp-2 md:line-clamp-none'}`}>
                                                                    {sub.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Expand indicator */}
                                                        <div className="hidden md:flex w-8 h-8 bg-gray-100 rounded-full items-center justify-center group-hover:bg-ayur-green/10 transition-colors">
                                                            <ChevronDown size={16} className={`text-gray-400 group-hover:text-ayur-green transition-transform duration-300 ${expandedTherapy === idx ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>

                                                    {/* Price & Action - Mobile */}
                                                    <div className="flex md:hidden items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                                        <div>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Per Session</span>
                                                            <div className="flex items-baseline mt-1">
                                                                <span className="text-lg text-ayur-accent font-bold">₹</span>
                                                                <span className="text-2xl font-bold text-ayur-green">{sub.price}</span>
                                                            </div>
                                                        </div>
                                                        <NavLink
                                                            to="/booking"
                                                            className="px-5 py-2.5 bg-ayur-green text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:bg-ayur-green-dark hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                                        >
                                                            Book
                                                        </NavLink>
                                                    </div>
                                                </div>

                                                {/* Price & Action - Desktop */}
                                                <div className="hidden md:flex flex-col items-end gap-3 min-w-[160px] pl-6 border-l border-gray-100 border-dashed">
                                                    <div className="text-right">
                                                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Per Session</span>
                                                        <div className="flex items-baseline justify-end">
                                                            <span className="text-lg text-ayur-accent font-bold">₹</span>
                                                            <span className="text-3xl font-bold text-ayur-green">{sub.price}</span>
                                                        </div>
                                                    </div>
                                                    <NavLink
                                                        to="/booking"
                                                        className="w-full flex items-center justify-center gap-2 bg-ayur-green text-white text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:bg-ayur-accent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:bg-ayur-accent"
                                                    >
                                                        <span>Book Now</span>
                                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: ENHANCED STICKY BOOKING WIDGET */}
                    <div className="lg:col-span-1">
                        <div ref={widgetObserver.ref} className={`lg:sticky lg:top-28 ${widgetObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-ayur-subtle hover:border-ayur-green/30 hover:shadow-[0_20px_60px_-15px_rgba(13,135,112,0.2)] transition-all duration-500 overflow-hidden relative">
                                {/* Background effects */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ayur-green/5 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-ayur-accent/5 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-ayur-green to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <Heart size={28} className="text-white" />
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold text-ayur-green mb-2">Ready to Heal?</h3>
                                        <p className="text-ayur-gray text-sm leading-relaxed">Consult our doctors to determine the right therapy for your condition.</p>
                                    </div>

                                    {/* Primary CTA */}
                                    <NavLink 
                                        to="/booking" 
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ayur-accent to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-ayur-accent/90 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 mb-4 group"
                                    >
                                        <Calendar size={20} />
                                        <span>Book Appointment</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </NavLink>

                                    {/* Secondary CTA */}
                                    <a 
                                        href="tel:+919426684047" 
                                        className="w-full flex items-center justify-center gap-2 border-2 border-ayur-subtle text-ayur-gray py-4 rounded-xl font-bold hover:border-ayur-green hover:text-ayur-green transition-all hover:bg-ayur-green/5"
                                    >
                                        <Phone size={20} />
                                        <span>Call Clinic</span>
                                    </a>

                                    {/* Trust Badges */}
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 p-3 bg-ayur-green/5 rounded-xl">
                                                <div className="w-8 h-8 bg-ayur-green/10 rounded-lg flex items-center justify-center">
                                                    <Shield size={16} className="text-ayur-green" />
                                                </div>
                                                <span className="text-xs font-semibold text-ayur-green">Govt. Registered</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-3 bg-ayur-accent/5 rounded-xl">
                                                <div className="w-8 h-8 bg-ayur-accent/10 rounded-lg flex items-center justify-center">
                                                    <Award size={16} className="text-ayur-accent" />
                                                </div>
                                                <span className="text-xs font-semibold text-ayur-accent">Insurance Accepted</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-ayur-accent/20">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-ayur-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <AlertCircle size={16} className="text-ayur-accent" />
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                <strong>Note:</strong> Therapies like Vamana & Virechana require prior consultation and preparatory procedures (Snehapana).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MOBILE STICKY CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-2xl z-40 md:hidden safe-area-bottom">
                <div className="flex gap-3">
                    <NavLink
                        to="/booking"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-ayur-accent to-amber-500 text-white py-4 rounded-xl font-bold min-h-[52px] hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                        <Calendar size={18} />
                        <span>Book Now</span>
                    </NavLink>
                    <a
                        href="tel:+919426684047"
                        className="w-14 h-14 flex items-center justify-center border-2 border-ayur-green text-ayur-green rounded-xl hover:bg-ayur-green hover:text-white transition-all"
                        aria-label="Call clinic"
                    >
                        <Phone size={22} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;