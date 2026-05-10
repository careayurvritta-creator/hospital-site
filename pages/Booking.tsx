import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Check, Phone, Facebook, Instagram, MapPin, Mail, Send, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { NavLink } from '../components/Layout';
import { useIntersectionObserver } from '../hooks';

const Booking: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    concern: 'General Consultation',
    date: '',
    time: '',
    message: ''
  });

  const sidebarObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
  const formObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });
  const locationObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoiceNote = (text: string) => {
    setFormData(prev => ({
      ...prev,
      message: prev.message ? prev.message + " " + text : text
    }));
  };

  if (submitted) {
    const whatsappMessage = `Hi Dr. Sharma, I would like to confirm my appointment.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nConcern: ${formData.concern}\nDate: ${formData.date}\nTime: ${formData.time || 'Flexible'}\n\nAdditional: ${formData.message}`;
    const whatsappUrl = `https://wa.me/919426684047?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 flex items-center justify-center px-4 pt-20 pb-10">
        <div className="relative bg-white p-10 md:p-14 rounded-3xl shadow-2xl max-w-lg w-full text-center border-2 border-ayur-subtle hover:border-ayur-green/30 hover:shadow-[0_20px_60px_-15px_rgba(13,135,112,0.25)] transition-all duration-500 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-ayur-green/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-ayur-accent/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounceIn">
              <Check size={48} strokeWidth={3} className="text-white" />
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4">Request Received!</h2>
            <p className="text-ayur-gray mb-8 text-lg leading-relaxed">
              Thank you, <strong className="text-ayur-green">{formData.name}</strong>.<br />
              To speed up confirmation, you can send these details directly to our WhatsApp.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-8 py-5 rounded-2xl font-bold hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Phone size={22} />
                <span>Send via WhatsApp</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <NavLink
                to="/"
                className="w-full bg-ayur-green text-white px-8 py-5 rounded-2xl font-bold hover:bg-ayur-green-dark hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                Back to Home
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full px-5 py-4 bg-gray-50 text-ayur-green placeholder-gray-400 border-2 border-transparent rounded-xl focus:bg-white focus:border-ayur-green focus:ring-2 focus:ring-ayur-green/20 outline-none transition-all shadow-sm hover:shadow-md";

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 flex flex-col lg:flex-row pt-14 lg:pt-20">
      
      {/* ENHANCED INFO SIDEBAR - DESKTOP */}
      <div ref={sidebarObserver.ref} className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark text-white p-10 lg:p-12 xl:p-16 flex-col justify-center relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

        <div className={`relative z-10 ${sidebarObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Sparkles size={16} className="text-ayur-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider">Holistic Care</span>
          </div>
          
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Book an <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Appointment</span>
          </h2>
          <p className="text-white/80 mb-10 text-lg leading-relaxed">
            Take the first step towards holistic healing. Fill out the form or connect with us directly.
          </p>

          {/* Enhanced Social & Contact Actions */}
          <div className="flex flex-col gap-4 mb-10">
            <a
              href="https://wa.me/919426684047"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
            >
              <Phone size={20} className="mr-3" /> 
              <span>Connect on WhatsApp</span>
              <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61560024669845"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all border border-white/10 hover:border-white/30"
              >
                <Facebook size={20} className="mr-2" /> 
                <span>Tips</span>
              </a>
              <a
                href="https://www.instagram.com/ayurvritta/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all border border-white/10 hover:border-white/30"
              >
                <Instagram size={20} className="mr-2" /> 
                <span>Guide</span>
              </a>
            </div>
            <p className="text-xs text-center text-white/50">Follow us for daily Ayurveda lifestyle tips</p>
          </div>

          {/* Info Sections */}
          <div className="space-y-6 border-t border-white/10 pt-8">
            <div className="flex items-start group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-ayur-accent/20 transition-colors">
                <Clock className="text-ayur-accent" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Hospital Hours</h4>
                <p className="text-white/80 font-semibold text-lg">Open 24 Hours</p>
                <p className="text-white/60">All Days a Week</p>
              </div>
            </div>
            
            <div className="flex items-start group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-ayur-accent/20 transition-colors">
                <AlertCircle className="text-ayur-accent" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Important Note</h4>
                <p className="text-white/70">Please bring your previous medical reports if applicable.</p>
              </div>
            </div>
            
            <div className="flex items-start group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-ayur-accent/20 transition-colors">
                <MapPin className="text-ayur-accent" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Visit Us</h4>
                <p className="text-white/70 text-sm">FF 104-107, Lotus Enora Complex,</p>
                <p className="text-white/70 text-sm">Opp. Rutu Villa, New Alkapuri,</p>
                <p className="text-white/70 text-sm">Vadodara - 390021</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SIDE */}
      <div ref={formObserver.ref} className={`flex-1 lg:w-2/3 p-6 sm:p-8 lg:p-12 xl:p-16 bg-white flex flex-col ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
        
        {/* Mobile header */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-green/10 rounded-full mb-4">
            <Sparkles size={14} className="text-ayur-accent" />
            <span className="text-xs font-bold text-ayur-accent uppercase tracking-wider">Book Now</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-ayur-green mb-2">Book Appointment</h2>
          <p className="text-sm text-ayur-gray">Get a callback from our team</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full space-y-6">
          <div className="hidden lg:block">
            <h3 className="font-serif text-3xl font-bold text-ayur-green">Quick Consultation Inquiry</h3>
            <p className="text-gray-400 mt-2 mb-8">Get a call back from our medical coordinator.</p>
          </div>

          {/* Name & Phone Row */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '100ms' }}>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ayur-gray ml-1">Full Name <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ayur-gray ml-1">Phone Number <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputStyle}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </div>

          {/* Email */}
          <div className={`space-y-2 ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '150ms' }}>
            <label className="block text-sm font-bold text-ayur-gray ml-1">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
              placeholder="your@email.com"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Concern & Date */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="space-y-2">
              <label htmlFor="concern" className="block text-sm font-bold text-ayur-gray ml-1">Type of Concern</label>
              <div className="relative">
                <select
                  id="concern"
                  name="concern"
                  value={formData.concern}
                  onChange={handleChange}
                  className={`${inputStyle} appearance-none cursor-pointer`}
                  aria-label="Select your health concern"
                >
                  <option>General Consultation</option>
                  <option>Thyroid / Hormonal Issue</option>
                  <option>Diabetes / Metabolic</option>
                  <option>Panchakarma Detox</option>
                  <option>Kidney Care (CKD)</option>
                  <option>Joint Pain / Arthritis</option>
                  <option>Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ayur-gray opacity-50">
                  <ChevronRight size={20} className="rotate-90" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-bold text-ayur-gray ml-1">Preferred Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${inputStyle} cursor-pointer`}
              />
            </div>
          </div>

          {/* Message with Voice Input */}
          <div className={`space-y-2 ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '250ms' }}>
            <label className="block text-sm font-bold text-ayur-gray ml-1 flex justify-between">
              Additional Notes
              <span className="text-xs text-ayur-accent font-normal flex items-center gap-1">
                <Sparkles size={12} /> Tap mic to speak
              </span>
            </label>
            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className={`${inputStyle} pr-14`}
                placeholder="Briefly describe your symptoms..."
              ></textarea>
              <button
                type="button"
                className="absolute bottom-3 right-3 w-10 h-10 bg-ayur-green/10 hover:bg-ayur-green/20 rounded-xl flex items-center justify-center transition-colors"
                title="Voice input"
              >
                <Sparkles size={18} className="text-ayur-green" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className={`pt-6 ${formObserver.isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '300ms' }}>
            <button
              type="submit"
              className="group w-full bg-gradient-to-r from-ayur-accent to-amber-500 hover:from-ayur-accent/90 hover:to-amber-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-ayur-accent/30 hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <Send size={22} className="group-hover:translate-x-1 transition-transform" />
              <span>Confirm Booking Request</span>
            </button>
            <p className="text-xs text-ayur-gray mt-5 text-center opacity-70">
              By submitting this form, you agree to be contacted via WhatsApp/Phone for appointment confirmation.
            </p>
          </div>
        </form>

        {/* Location Section */}
        <div ref={locationObserver.ref} className={`max-w-2xl mx-auto w-full mt-16 pt-10 border-t border-gray-100 ${locationObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-green/10 rounded-full mb-4">
              <MapPin size={14} className="text-ayur-green" />
              <span className="text-xs font-bold text-ayur-green uppercase tracking-wider">Find Us</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-ayur-green">Visit Our Hospital</h3>
          </div>

          {/* Location Card */}
          <div className="group bg-gradient-to-br from-ayur-cream to-white rounded-3xl p-8 border-2 border-ayur-subtle hover:border-ayur-green/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ayur-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-ayur-green" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-ayur-green mb-1">Ayurvritta Ayurveda Hospital</h4>
                    <p className="text-ayur-gray text-sm leading-relaxed">
                      FF 104-107, Lotus Enora Complex,<br />
                      Opp. Rutu Villa, New Alkapuri,<br />
                      Vadodara - 390021
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ayur-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={22} className="text-ayur-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-ayur-green mb-1">Call Us</h4>
                    <a href="tel:+919426684047" className="text-ayur-accent font-semibold hover:underline">+91 94266 84047</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-ayur-green mb-1">Email</h4>
                    <a href="mailto:care.ayurvritta@gmail.com" className="text-blue-600 font-semibold hover:underline">care.ayurvritta@gmail.com</a>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-48 h-48 bg-gray-100 rounded-2xl overflow-hidden border border-ayur-subtle">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.705049512858!2d73.155!3d22.322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDEzJzE4LjAiTiA3M1KwMDknMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hospital Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;