import React from 'react';
import { NavLink } from '../components/Layout';
import { ArrowRight, Star, Heart, Shield, Award, Building2, FileCheck, MapPin, CheckCircle2 } from 'lucide-react';

const About: React.FC = () => {
    const FALLBACK_DOCTOR_MALE = "https://images.unsplash.com/photo-1622253692010-333f2da60a71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    const FALLBACK_DOCTOR_FEMALE = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
    const FALLBACK_HERB = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    return (
        <div className="bg-ayur-cream min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-ayur-green py-24 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">About Ayurvritta</h1>
                    <p className="text-xl md:text-2xl text-ayur-cream/80 leading-relaxed font-light">
                        Government Registered & Insurance Compatible.<br />
                        Where classical Ayurveda meets modern diagnostics.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">

                {/* Intro Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-16 border border-ayur-subtle mb-20">
                    <span className="text-ayur-gold font-bold uppercase tracking-widest text-xs mb-4 block">Our Story</span>
                    <h2 className="font-serif text-4xl font-bold text-ayur-green mb-8">Bridging Tradition & Science</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="text-ayur-gray text-lg space-y-6 leading-relaxed">
                            <p>
                                Ayurvritta was founded with a singular vision: to restore the dignity of authentic Ayurveda in an era of quick fixes. We observed that while modern medicine is excellent for acute care, it often manages rather than cures chronic lifestyle diseases.
                            </p>
                            <p>
                                Our clinic is not a spa. It is a hospital. We adhere to the rigorous protocols of the Samhitas (ancient texts) while utilizing modern pathology reports to track progress. This unique "Evidence-Based Ayurveda" approach allows us to confidently treat complex cases.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-ayur-gold/10 rounded-full z-0"></div>
                            <img
                                src="/images/about/about-story.png"
                                alt="Authentic Ayurvedic Herbs"
                                className="rounded-2xl shadow-xl relative z-10"
                                onError={(e) => { e.currentTarget.src = FALLBACK_HERB; }}
                            />
                        </div>
                    </div>
                </div>

                {/* --- MEET OUR MEDICAL TEAM --- */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <span className="text-ayur-gold font-bold uppercase tracking-widest text-xs">Medical Panel</span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mt-2">Meet Our Physicians</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                        {/* Dr. Jinendradutt Sharma */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-ayur-subtle flex flex-col group hover:shadow-2xl transition-all duration-300">
                            <div className="relative pt-[100%] bg-zinc-100 overflow-hidden group-hover:bg-zinc-200 transition-colors">
                                <img
                                    src="/images/about/dr-sharma.png"
                                    alt="Dr. Jinendradutt Sharma"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_MALE; }}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-ayur-gold text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-white/20">Medical Director</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col relative bg-white">
                                <h3 className="font-serif text-2xl font-bold text-ayur-green leading-tight">Dr. Jinendradutt Sharma</h3>
                                <p className="text-ayur-gold font-bold text-xs uppercase tracking-wider mb-6">B.A.M.S., M.D. (Ayurveda) Scholar</p>

                                <div className="bg-ayur-cream/30 p-4 rounded-xl border border-ayur-subtle mb-6">
                                    <div className="flex items-start gap-3">
                                        <Award size={20} className="text-ayur-green mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gujarat Board Reg.</p>
                                            <p className="text-sm font-bold text-ayur-green">GB-I 26922</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-ayur-gray text-sm leading-relaxed mb-6">
                                    Specializing in chronic metabolic disorders, Dr. Sharma integrates classical Nidan (diagnosis) with modern parameters to reverse lifestyle diseases like Diabetes and Thyroid issues.
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    <NavLink to="/booking" className="flex items-center justify-between text-ayur-green font-bold text-sm hover:text-ayur-gold transition-colors">
                                        Book Appointment <div className="bg-ayur-green/10 p-2 rounded-full"><ArrowRight size={16} /></div>
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        {/* Dr. Sharlin Gor */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-ayur-subtle flex flex-col group hover:shadow-2xl transition-all duration-300">
                            <div className="relative pt-[100%] bg-zinc-100 overflow-hidden group-hover:bg-zinc-200 transition-colors">
                                <img
                                    src="/images/about/dr-gor.png"
                                    alt="Dr. Sharlin Hareshbhai Gor"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_FEMALE; }}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-ayur-green text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-white/20">Senior Consultant</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-serif text-2xl font-bold text-ayur-green">Dr. Sharlin H. Gor</h3>
                                <p className="text-ayur-gray font-medium text-sm mb-6">MD (Alternative Medicine)</p>

                                <div className="bg-ayur-cream/50 p-4 rounded-xl border border-ayur-subtle mb-6">
                                    <div className="flex items-start gap-3">
                                        <Award size={20} className="text-ayur-green mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">IIAM Registration</p>
                                            <p className="text-base font-bold text-ayur-green">22MDAM213141</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-ayur-gray text-sm leading-relaxed mb-6">
                                    Certified by the Indian Institute of Alternative Medicine. Dr. Gor focuses on integrative wellness, Yoga therapy, and holistic women's health management.
                                </p>

                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    <NavLink to="/booking" className="flex items-center justify-between text-ayur-green font-bold text-sm hover:text-ayur-gold transition-colors">
                                        Book Consultation <div className="bg-ayur-green/10 p-2 rounded-full"><ArrowRight size={16} /></div>
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- REGULATORY COMPLIANCE SECTION --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-ayur-subtle mb-20 overflow-hidden">
                    <div className="bg-ayur-green text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="font-serif text-3xl font-bold flex items-center gap-3">
                                <Shield size={28} className="text-ayur-gold" /> Accreditations & Compliance
                            </h3>
                            <p className="text-ayur-cream/80 mt-2 max-w-2xl">
                                Ayurvritta is a fully compliant clinical establishment recognized by state and national bodies.
                                We prioritize transparency and standardization to ensure your treatments are safe and insurance-compatible.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gradient-to-b from-white to-ayur-cream/20">

                        {/* Certificate 1: ROHINI */}
                        <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <FileCheck size={120} className="text-blue-600" />
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                                    <FileCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-ayur-green">ROHINI Registry</h4>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-md inline-block mt-1">Insurance Network of India (IIB)</p>
                                </div>
                            </div>

                            {/* Digital Certificate Representation */}
                            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative z-10 space-y-4 font-mono text-sm">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 text-xs font-sans font-bold uppercase">Rohini ID</span>
                                    <span className="font-bold text-lg text-gray-800">8900080700376</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 text-xs font-sans font-bold uppercase">Valid Upto</span>
                                    <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">17 Jul 2028</span>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                                        <strong>Official Certification:</strong> This hospital is registered under the Registry of Hospitals in Network of Insurance (ROHINI) maintained by Insurance Information Bureau of India (IIB).
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-sans italic border-t border-dashed border-gray-200 pt-2">
                                        Ref No: IRDAI/HLT/REG/CIR/193/07/2020
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-bold justify-center md:justify-start">
                                <CheckCircle2 size={14} /> Verified for Cashless Insurance
                            </div>
                        </div>

                        {/* Certificate 2: Clinical Establishment */}
                        <div className="border border-orange-100 bg-orange-50/30 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Building2 size={120} className="text-orange-600" />
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-ayur-green">Govt. of Gujarat</h4>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-md inline-block mt-1">Clinical Establishment Act</p>
                                </div>
                            </div>

                            {/* Digital Certificate Representation */}
                            <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm relative z-10 space-y-4 text-sm">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 text-xs font-bold uppercase">Reg Number</span>
                                    <span className="font-mono font-bold text-lg text-gray-800">GUJVAD202501108PR</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-2">
                                    <div>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase block">Owner / In-Charge</span>
                                        <span className="font-bold text-gray-800 text-xs">Dr. Jinendradutt Sharma</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase block">Valid Upto</span>
                                        <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded text-xs">28/03/2026</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start pt-1">
                                    <MapPin size={16} className="text-orange-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-gray-600 leading-tight">
                                        <span className="font-bold block text-gray-800 mb-1">Registered Address:</span>
                                        Shop No 104, Lotus Enora, Opp. Rutu Villa, Gotri, Vadodara - 390021
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <div className="bg-gray-50 px-3 py-2 rounded border border-gray-100">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Facility Type</span>
                                        <span className="text-xs font-bold text-ayur-green">Hospital (5 Beds)</span>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-2 rounded border border-gray-100">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block">System</span>
                                        <span className="text-xs font-bold text-ayur-green">Ayurveda</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 font-bold justify-center md:justify-start">
                                <CheckCircle2 size={14} /> Provisional Registration Approved
                            </div>
                        </div>

                    </div>
                </div>

                {/* Philosophy Cards */}
                <div className="mb-10">
                    <h3 className="text-center font-serif text-3xl font-bold text-ayur-green mb-12">Our Core Philosophy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Heart, title: "Nidan Parivarjan", desc: "Eliminating the root cause. We don't just treat symptoms; we identify the lifestyle habits creating the disease." },
                            { icon: Shield, title: "Shodhan Chikitsa", desc: "Deep cellular detoxification through Panchakarma to reset metabolic pathways." },
                            { icon: Star, title: "Swasthavritta", desc: "Maintenance of health through personalized Dinacharya (daily routine) and diet." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-ayur-cream/30 p-8 rounded-2xl border border-ayur-subtle text-center hover:bg-ayur-cream hover:shadow-lg transition-all duration-300">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-ayur-green shadow-sm">
                                    <item.icon size={28} />
                                </div>
                                <h4 className="font-serif text-xl font-bold text-ayur-green mb-4">{item.title}</h4>
                                <p className="text-sm text-ayur-gray leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;