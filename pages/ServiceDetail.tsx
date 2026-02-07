import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SERVICES } from '../constants';
import { NavLink } from '../components/Layout';
import { ArrowLeft, CheckCircle2, AlertCircle, Phone, Calendar } from 'lucide-react';

const ServiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const service = SERVICES.find(s => s.id === id);

    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    if (!service) {
        return <Navigate to="/services" replace />;
    }

    return (
        <div className="bg-ayur-cream min-h-screen pb-32 md:pb-20">
            {/* Hero Section - Reduced on mobile */}
            <div className="relative h-[300px] md:h-[500px] bg-ayur-green overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        loading="eager"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ayur-green via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8 md:pb-24">
                    <NavLink to="/services" className="text-white/80 hover:text-ayur-gold mb-4 md:mb-6 flex items-center gap-2 w-fit transition-colors text-sm md:text-base">
                        <ArrowLeft size={18} /> Back to Treatments
                    </NavLink>
                    <h1 className="font-serif text-2xl md:text-6xl font-bold text-white mb-2 md:mb-4 animate-fadeIn">{service.title}</h1>
                    <p className="text-base md:text-2xl text-ayur-cream/90 max-w-3xl font-light leading-relaxed animate-fadeIn line-clamp-2 md:line-clamp-none">
                        {service.description}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* Left Column: Details & Benefits */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-ayur-subtle">
                            <h3 className="font-serif text-2xl font-bold text-ayur-green mb-6">Clinical Insight</h3>
                            <p className="text-ayur-gray text-lg leading-relaxed mb-8">
                                {service.fullDescription || service.description}
                            </p>

                            {service.benefits && (
                                <div className="bg-ayur-green/5 rounded-2xl p-6 md:p-8">
                                    <h4 className="font-bold text-ayur-green mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={20} className="text-ayur-gold" /> Key Therapeutic Benefits
                                    </h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {service.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-ayur-gray text-sm md:text-base">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ayur-green mt-2 shrink-0"></div>
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sub-Services Table (Schedule of Charges) */}
                        {service.subServices && service.subServices.length > 0 && (
                            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-ayur-subtle">
                                <div className="bg-ayur-green p-6 md:p-8 text-white">
                                    <h3 className="font-serif text-2xl font-bold">Therapy Menu & Charges</h3>
                                    <p className="opacity-80 text-sm mt-1">Standard rates per session.</p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {service.subServices.map((sub, idx) => (
                                        <div key={idx} className="group p-5 md:p-8 hover:bg-ayur-cream/20 transition-colors duration-300">
                                            <div className="flex gap-5 md:gap-8">

                                                {/* Image - Thumbnail */}
                                                <div className="shrink-0 w-20 h-20 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm border border-ayur-subtle bg-gray-50 relative">
                                                    <img
                                                        src={sub.image || service.image}
                                                        alt={sub.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        loading="lazy"
                                                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                                    />
                                                </div>

                                                {/* Content Wrapper */}
                                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">

                                                    {/* Text Details */}
                                                    <div className="flex-1 space-y-2">
                                                        <h4 className="font-serif text-lg md:text-xl font-bold text-ayur-green leading-tight group-hover:text-ayur-gold transition-colors">
                                                            {sub.name}
                                                        </h4>
                                                        {sub.description && (
                                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
                                                                {sub.description}
                                                            </p>
                                                        )}

                                                        {/* Mobile Price & Action Row (Visible only on mobile) */}
                                                        <div className="flex md:hidden items-center justify-between pt-3 mt-1 border-t border-gray-100 border-dashed">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cost</span>
                                                                <span className="font-serif text-xl font-bold text-ayur-green leading-none mt-0.5">
                                                                    <span className="text-sm text-ayur-gold mr-0.5 font-sans align-top">₹</span>{sub.price}
                                                                </span>
                                                            </div>
                                                            <NavLink
                                                                to="/booking"
                                                                className="bg-ayur-green text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm active:scale-95 transition-transform"
                                                            >
                                                                Book
                                                            </NavLink>
                                                        </div>
                                                    </div>

                                                    {/* Desktop Price & Action Column (Hidden on mobile) */}
                                                    <div className="hidden md:flex flex-col items-end gap-3 min-w-[140px] pl-6 border-l border-gray-100 border-dashed my-1">
                                                        <div className="text-right">
                                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Per Session</span>
                                                            <span className="font-serif text-3xl font-bold text-ayur-green leading-none">
                                                                <span className="text-lg text-ayur-gold mr-1 font-sans align-top">₹</span>{sub.price}
                                                            </span>
                                                        </div>
                                                        <NavLink
                                                            to="/booking"
                                                            className="bg-ayur-green text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md hover:bg-ayur-gold hover:shadow-lg hover:-translate-y-0.5 transition-all w-full text-center"
                                                        >
                                                            Book Now
                                                        </NavLink>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-ayur-subtle sticky top-24">
                            <h3 className="font-serif text-2xl font-bold text-ayur-green mb-2">Ready to Heal?</h3>
                            <p className="text-ayur-gray text-sm mb-6">Consult our doctors to determine the right therapy for your condition.</p>

                            <NavLink to="/booking" className="w-full flex items-center justify-center bg-ayur-gold text-white py-4 rounded-xl font-bold text-lg hover:bg-ayur-green transition-all shadow-lg mb-4">
                                <Calendar size={20} className="mr-2" /> Book Appointment
                            </NavLink>

                            <a href="tel:+919426684047" className="w-full flex items-center justify-center border-2 border-ayur-subtle text-ayur-gray py-4 rounded-xl font-bold hover:border-ayur-green hover:text-ayur-green transition-all">
                                <Phone size={20} className="mr-2" /> Call Clinic
                            </a>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-ayur-gold shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        <strong>Note:</strong> Therapies like Vamana & Virechana require prior consultation and preparatory procedures (Snehapana).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-40 md:hidden safe-area-bottom">
                <div className="flex gap-3">
                    <NavLink
                        to="/booking"
                        className="flex-1 flex items-center justify-center bg-ayur-gold text-white py-4 rounded-xl font-bold min-h-[52px] active:scale-95 transition-transform"
                    >
                        <Calendar size={18} className="mr-2" /> Book Now
                    </NavLink>
                    <a
                        href="tel:+919426684047"
                        className="w-14 h-14 flex items-center justify-center border-2 border-ayur-green text-ayur-green rounded-xl active:scale-95 transition-transform"
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