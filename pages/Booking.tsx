import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Check, Phone, Facebook, Instagram } from 'lucide-react';
import { NavLink } from '../components/Layout';
import LocationExplorer from '../components/LocationExplorer';
import VoiceInput from '../components/VoiceInput';
import DateTimePicker from '../components/DateTimePicker';
import { useAvailability } from '../hooks/useAvailability';

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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { checkAvailability, loading } = useAvailability();

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
      <div className="min-h-screen bg-ayur-cream flex items-center justify-center px-4 pt-20">
        <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-ayur-subtle animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-ayur-green mb-4">Request Received</h2>
          <p className="text-ayur-gray mb-8 text-lg leading-relaxed">
            Thank you, <strong>{formData.name}</strong>.<br />
            To speed up confirmation, you can send these details directly to our WhatsApp.
          </p>

          <div className="flex flex-col gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:bg-[#128C7E] transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Phone size={20} /> Send via WhatsApp
            </a>

            <NavLink
              to="/"
              className="w-full bg-ayur-green text-white px-8 py-4 rounded-full font-bold hover:bg-ayur-gold transition-colors shadow-lg"
            >
              Back to Home
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // Mobile-first Input Styling - Large touch targets
  const inputStyle = "input-mobile w-full px-4 py-4 bg-gray-50 text-ayur-green placeholder-gray-400 border border-transparent rounded-xl focus:bg-white focus:border-ayur-green focus:ring-2 focus:ring-ayur-green/20 outline-none transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-ayur-cream flex flex-col lg:flex-row pt-14 lg:pt-20">
      {/* Info Side - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/3 bg-ayur-green text-white p-16 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10 animate-fadeIn">
          <span className="text-ayur-gold font-bold uppercase tracking-widest text-xs mb-4 block">Holistic Care</span>
          <h2 className="font-serif text-4xl font-bold mb-6">Book an Appointment</h2>
          <p className="text-ayur-cream/80 mb-8 text-lg leading-relaxed">
            Take the first step towards holistic healing. Fill out the form or connect with us directly.
          </p>

          {/* Social & Contact Actions */}
          <div className="flex flex-col gap-4 mb-10">
            <a
              href="https://wa.me/919426684047"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-all shadow-lg backdrop-blur-sm"
            >
              <Phone size={20} className="mr-2" /> Connect on WhatsApp
            </a>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61560024669845"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
              >
                <Facebook size={20} className="mr-2" /> Tips
              </a>
              <a
                href="https://www.instagram.com/ayurvritta/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
              >
                <Instagram size={20} className="mr-2" /> Guide
              </a>
            </div>
            <p className="text-xs text-center text-ayur-cream/60">Follow us for daily Ayurveda lifestyle tips</p>
          </div>

          <div className="space-y-8 border-t border-white/10 pt-8">
            <div className="flex items-start">
              <Clock className="mt-1 mr-4 text-ayur-gold" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Hospital Hours</h4>
                <p className="text-ayur-cream/70 font-semibold text-lg">Open 24 Hours</p>
                <p className="text-ayur-cream/70">All Days a Week</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="mt-1 mr-4 text-ayur-gold" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Important</h4>
                <p className="text-ayur-cream/70">Please bring your previous medical reports if applicable.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side - Full width on mobile */}
      <div className="flex-1 lg:w-2/3 p-4 sm:p-6 lg:p-16 bg-white flex flex-col animate-fadeIn">
        {/* Mobile header */}
        <div className="lg:hidden mb-6 text-center">
          <h2 className="font-serif text-2xl font-bold text-ayur-green mb-2">Book Appointment</h2>
          <p className="text-sm text-ayur-gray">Get a callback from our team</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full space-y-5 sm:space-y-6 flex-grow">
          <div className="hidden lg:block">
            <h3 className="font-serif text-3xl font-bold text-ayur-green">Quick Consultation Inquiry</h3>
            <p className="text-gray-400 mt-2">Get a call back from our medical coordinator.</p>
          </div>


          {/* Mobile: Stack, Desktop: 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-bold text-ayur-gray mb-2">Full Name <span className="text-red-500">*</span></label>
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
            <div>
              <label className="block text-sm font-bold text-ayur-gray mb-2">Phone Number <span className="text-red-500">*</span></label>
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

          <div>
            <label className="block text-sm font-bold text-ayur-gray mb-2">Email (Optional)</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="concern" className="block text-sm font-bold text-ayur-gray mb-2 ml-1">Type of Concern</label>
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
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ayur-gray opacity-50">▼</div>
              </div>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-bold text-ayur-gray mb-2 ml-1">Preferred Date</label>
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

          <div>
            <label className="block text-sm font-bold text-ayur-gray mb-2 ml-1 flex justify-between">
              Additional Notes
              <span className="text-xs text-ayur-gold font-normal flex items-center gap-1">Tap mic to speak</span>
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
              <div className="absolute bottom-3 right-3">
                <VoiceInput onTranscript={handleVoiceNote} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-ayur-gold hover:bg-ayur-green text-white font-bold py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
            >
              Confirm Booking Request
            </button>
            <p className="text-xs text-ayur-gray mt-6 text-center opacity-70">
              By submitting this form, you agree to be contacted via WhatsApp/Phone for appointment confirmation.
            </p>
          </div>
        </form>

        {/* Location Explorer Section */}
        <div className="max-w-2xl mx-auto w-full mt-20 pt-10 border-t border-gray-100">
          <LocationExplorer />
        </div>
      </div>
    </div>
  );
};

export default Booking;