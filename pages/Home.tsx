import React from 'react';
import { NavLink } from '../components/Layout';
import { ArrowRight, CheckCircle2, Leaf, Activity, Droplet, HeartPulse, Scale, ShieldCheck, Stethoscope, Brain, Award } from 'lucide-react';
import { TESTIMONIALS } from '../constants';
import TrustBadges from '../components/TrustBadges';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import FAQ from '../components/FAQ';
import { useLanguage } from '../components/LanguageContext';


const Home: React.FC = () => {
  const { t } = useLanguage();
  // Fallback to a generic Ayurveda bowl/herbs image if the main one fails, rather than a spa image
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="flex flex-col w-full overflow-hidden">

      {/* 
        HERO SECTION 
        Mobile: Vertical Stack, Smaller Text
      */}
      <section className="relative min-h-[85vh] flex items-center bg-ayur-cream overflow-hidden pt-10 md:pt-20">
        {/* Abstract organic shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ayur-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ayur-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Hero Content */}
          <div className="space-y-6 md:space-y-8 animate-fadeIn text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ayur-green/10 text-ayur-green text-[10px] md:text-xs font-bold uppercase tracking-widest border border-ayur-green/20">
              <span className="w-1.5 h-1.5 rounded-full bg-ayur-green mr-2 animate-pulse"></span>
              {t.hero.tagline}
            </div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-ayur-green">
              {t.hero.title_prefix} <br />
              <span className="text-ayur-accent italic pr-1">
                {t.hero.title_suffix}
              </span>
            </h1>

            <p className="text-base md:text-xl text-ayur-gray leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <NavLink
                to="/booking"
                className="btn-primary"
              >
                {t.common.book_consultation}
              </NavLink>
              <NavLink
                to="/tools"
                className="btn-secondary"
              >
                {t.common.assess_health}
              </NavLink>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 pt-4 text-xs md:text-sm font-medium text-ayur-gray/80">
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-ayur-accent mr-1.5" /> {t.hero.badge_doctors}</span>
              <span className="flex items-center"><Leaf className="w-4 h-4 md:w-5 md:h-5 text-ayur-accent mr-1.5" /> {t.hero.badge_therapies}</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[650px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl lg:translate-x-0 mx-auto max-w-md lg:max-w-none group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 transition-opacity duration-500 opacity-60 group-hover:opacity-40"></div>
            <img
              src="/images/home/home-hero.png"
              alt="Modern Ayurveda Consultation & Therapy"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            {/* Decorative overlay frame */}
            <div className="absolute inset-0 border-[1px] border-white/20 m-4 rounded-[2rem] pointer-events-none z-20"></div>

            {/* Floating Tag */}
            <div className="absolute bottom-8 left-8 z-30 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/20 animate-slideUp">
              <div className="flex items-center gap-3">
                <div className="bg-ayur-accent p-2 rounded-xl text-white shadow-lg">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-0.5">{t.hero.float_approach}</p>
                  <p className="text-base font-bold text-white">{t.hero.float_integrated}</p>
                </div>
              </div>
            </div>

            {/* Additional Floating Badge (Experience) */}
            <div className="hidden md:flex absolute top-8 right-8 z-30 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl items-center gap-3 animate-slideDown delay-100">
              <div className="text-right">
                <p className="text-2xl font-bold text-ayur-green leading-none">{t.hero.experience_years}</p>
                <p className="text-[10px] text-ayur-gray font-bold uppercase tracking-wider">{t.hero.experience_text}</p>
              </div>
              <div className="h-8 w-0.5 bg-gray-200"></div>
              <div className="text-ayur-accent">
                <Award size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <TrustBadges />

      {/* 
        MOBILE QUICK NAVIGATION 
        Easy access to all main pages - Mobile Only
      */}
      <section className="py-6 bg-white md:hidden">
        <div className="px-4">
          <h3 className="text-sm font-bold text-ayur-gray/60 uppercase tracking-wider mb-4 text-center">
            Explore
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Services', path: '/services', icon: '🌿' },
              { label: 'Programs', path: '/programs', icon: '📋' },
              { label: 'About Us', path: '/about', icon: '🏥' },
              { label: 'AI Tools', path: '/tools', icon: '🤖' },
              { label: 'Insurance', path: '/insurance', icon: '📄' },
              { label: 'Book Now', path: '/booking', icon: '📅' },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-ayur-cream border border-ayur-subtle text-ayur-green font-medium text-sm active:scale-95 active:bg-ayur-green active:text-white transition-all duration-150 touch-manipulation"
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* 
        QUICK TRIAGE TILES 
        Mobile: Single Column with improved touch feedback
      */}
      <section className="py-16 md:py-20 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-3">What brings you here?</h2>
            <p className="text-ayur-gray max-w-2xl mx-auto text-sm md:text-base">Select a concern to find specialized Ayurvedic protocols crafted for your condition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Thyroid & Hormones", icon: Activity, desc: "PCOS, Hypothyroidism & weight issues.", link: "/programs#thyroid" },
              { title: "Diabetes Management", icon: HeartPulse, desc: "Natural sugar control & metabolic correction.", link: "/programs#diabetes" },
              { title: "Detox & Panchakarma", icon: Droplet, desc: "Deep cellular cleansing therapies.", link: "/services" },
              { title: "Kidney Care (CKD)", icon: Stethoscope, desc: "Supportive care for renal health.", link: "/programs#ckd" },
            ].map((item, idx) => (
              <NavLink
                key={idx}
                to={item.link}
                className="group card-luxury p-5 md:p-6 flex items-center md:block active:scale-[0.98] transition-transform duration-150 touch-manipulation"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-ayur-green/10 flex items-center justify-center text-ayur-green md:mb-6 mr-4 md:mr-0 shrink-0 group-hover:bg-ayur-green group-hover:text-white group-active:bg-ayur-green group-active:text-white transition-colors">
                  <item.icon size={24} strokeWidth={1.5} className="md:w-7 md:h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-ayur-green-text mb-1 md:mb-2 group-hover:text-ayur-accent transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-ayur-gray mb-1 md:mb-6 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center text-ayur-accent text-xs font-bold uppercase tracking-wider">
                    <span className="md:hidden">View →</span>
                    <span className="hidden md:flex items-center">Learn more <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>


      {/* 
        WHY AYURVRITTA 
        Mobile: Stacked, Image last
      */}
      <section className="py-16 md:py-24 bg-ayur-green text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-ayur-gold font-bold tracking-widest uppercase text-xs mb-2 block">Our Philosophy</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Not a Spa.<br />A Hospital for <span className="text-ayur-accent-light">Holistic Healing.</span>
              </h2>
              <p className="text-ayur-cream/80 text-base md:text-lg leading-relaxed mb-8">
                We bridge the gap between ancient wisdom and modern pathology. Our treatments are clinical procedures aimed at root-cause elimination (Nidan Parivarjan), not just relaxation.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Doctor-Led Care", text: "Every therapy is prescribed and monitored by qualified physicians." },
                  { title: "Evidence-Based", text: "We integrate lab reports to track your clinical progress." },
                  { title: "Authentic Medicines", text: "Using classical formulations, not generic commercial products." }
                ].map((point, i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 md:mr-6 mt-1">
                      <div className="w-8 h-8 rounded-full border border-ayur-accent-light flex items-center justify-center text-ayur-accent-light">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif text-lg md:text-xl font-bold mb-1">{point.title}</h4>
                      <p className="text-ayur-cream/60 text-sm">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2 w-full perspective-1000">
              <div className="absolute -inset-4 border-2 border-ayur-accent/30 rounded-full opacity-50 animate-spin-slow hidden md:block"></div>
              <div className="relative rounded-2xl md:rounded-t-[10rem] md:rounded-b-[2rem] overflow-hidden shadow-2xl mx-auto z-10 group">
                <div className="absolute inset-0 bg-ayur-green/20 mix-blend-multiply z-10 transition-opacity duration-500 group-hover:opacity-0"></div>
                <img
                  src="/images/home/home-philosophy.jpg"
                  alt="Authentic Ayurvedic Medicine Preparation"
                  loading="lazy"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                {/* Overlay text on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/20 backdrop-blur-[2px]">
                  <span className="bg-white/90 text-ayur-green px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Authentic Preparation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        TOOLS PREVIEW 
      */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4">Know Your Body</h2>
            <p className="text-ayur-gray text-base md:text-lg">Ayurveda is about self-awareness. Use our free interactive tools to understand your constitution and health risks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Tool 1 */}
            <NavLink to="/tools" className="group bg-ayur-cream/40 rounded-2xl p-6 md:p-8 hover:bg-ayur-green hover:text-white active:bg-ayur-green active:text-white active:scale-[0.98] transition-all duration-200 relative overflow-hidden touch-manipulation">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Leaf size={80} />
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ayur-green mb-4 md:mb-6">
                <Leaf size={24} />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 md:mb-3">Prakriti Analysis</h3>
              <p className="text-xs md:text-sm opacity-80 mb-4 md:mb-6 leading-relaxed">Discover your unique Vata, Pitta, or Kapha constitution.</p>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-1">Start <ArrowRight size={12} className="ml-2" /></span>
            </NavLink>

            {/* Tool 2 */}
            <NavLink to="/tools" className="group bg-ayur-cream/40 rounded-2xl p-6 md:p-8 hover:bg-ayur-green hover:text-white active:bg-ayur-green active:text-white active:scale-[0.98] transition-all duration-200 relative overflow-hidden touch-manipulation">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={80} />
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ayur-green mb-4 md:mb-6">
                <Activity size={24} />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 md:mb-3">Health Risk Score</h3>
              <p className="text-xs md:text-sm opacity-80 mb-4 md:mb-6 leading-relaxed">Assess your risk for metabolic disorders like Diabetes.</p>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-1">Check <ArrowRight size={12} className="ml-2" /></span>
            </NavLink>

            {/* Tool 3 */}
            <NavLink to="/tools" className="group bg-ayur-cream/40 rounded-2xl p-6 md:p-8 hover:bg-ayur-green hover:text-white active:bg-ayur-green active:text-white active:scale-[0.98] transition-all duration-200 relative overflow-hidden touch-manipulation">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={80} />
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ayur-green mb-4 md:mb-6">
                <Brain size={24} />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 md:mb-3">Stress & Sleep</h3>
              <p className="text-xs md:text-sm opacity-80 mb-4 md:mb-6 leading-relaxed">Analyze your mental state (Manasika Bala).</p>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-1">Analyze <ArrowRight size={12} className="ml-2" /></span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* FAQ */}
      <FAQ />

      {/* 
        CONTACT CTA 
        Mobile: Compact
      */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-ayur-green">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Ayurvritta Clinic Exterior"
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply opacity-60"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-ayur-green/40"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6">Start Your Healing Journey</h2>
          <p className="text-base md:text-xl text-ayur-cream/80 mb-8 md:mb-10">
            Book a consultation today and take the first step towards a life of balance and vitality.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <NavLink to="/booking" className="w-full sm:w-auto px-8 py-4 bg-ayur-accent text-white rounded-full font-bold shadow-lg hover:bg-white hover:text-ayur-accent transition-all duration-300">
              Schedule Appointment
            </NavLink>
            <a href="tel:+919426684047" className="w-full sm:w-auto px-8 py-4 border border-white text-white rounded-full font-bold hover:bg-white hover:text-ayur-green transition-all duration-300">
              Call +91 94266 84047
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;