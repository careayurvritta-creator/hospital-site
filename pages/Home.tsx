import React from 'react';
import { NavLink } from '../components/Layout';
import { ArrowRight, Leaf, Activity, Droplet, HeartPulse, ShieldCheck, Stethoscope, Brain, Award as AwardIcon, Sparkles } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import FAQ from '../components/FAQ';
import { useLanguage } from '../components/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  const navItems = [
    { label: 'Services', path: '/services', icon: Leaf },
    { label: 'Programs', path: '/programs', icon: Activity },
    { label: 'About', path: '/about', icon: HeartPulse },
    { label: 'Tools', path: '/tools', icon: Brain },
    { label: 'Insurance', path: '/insurance', icon: ShieldCheck },
    { label: 'Book Now', path: '/booking', icon: Stethoscope },
  ];

  const triageCards = [
    { title: "Thyroid & Hormones", icon: Activity, desc: "PCOS, Hypothyroidism & weight issues.", link: "/programs#thyroid", color: "from-amber-500 to-orange-500" },
    { title: "Diabetes Management", icon: HeartPulse, desc: "Natural sugar control & metabolic correction.", link: "/programs#diabetes", color: "from-red-500 to-rose-600" },
    { title: "Detox & Panchakarma", icon: Droplet, desc: "Deep cellular cleansing therapies.", link: "/services", color: "from-cyan-500 to-blue-600" },
    { title: "Kidney Care (CKD)", icon: Stethoscope, desc: "Supportive care for renal health.", link: "/programs#ckd", color: "from-purple-500 to-violet-600" },
  ];

  const toolCards = [
    { title: "Prakriti Analysis", desc: "Discover your unique Vata, Pitta, or Kapha constitution.", icon: Leaf, color: "from-green-500 to-emerald-600" },
    { title: "Health Risk Score", desc: "Assess your risk for metabolic disorders like Diabetes.", icon: Activity, color: "from-amber-500 to-orange-600" },
    { title: "Stress & Sleep", desc: "Analyze your mental state (Manasika Bala).", icon: Brain, color: "from-purple-500 to-violet-600" },
  ];

  const philosophyPoints = [
    { title: "Doctor-Led Care", text: "Every therapy is prescribed and monitored by qualified physicians.", icon: Stethoscope },
    { title: "Evidence-Based", text: "We integrate lab reports to track your clinical progress.", icon: Activity },
    { title: "Authentic Medicines", text: "Using classical formulations, not generic commercial products.", icon: Leaf }
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-green/20 to-ayur-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-ayur-accent/15 to-ayur-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23009688\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Hero Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ayur-green text-white text-xs md:text-sm font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeInUp">
              <Sparkles className="w-4 h-4 animate-pulse" />
              {t.hero.tagline}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-ayur-green animate-fadeInUp animation-delay-100">
              {t.hero.title_prefix} <br />
              <span className="text-ayur-accent italic">
                {t.hero.title_suffix}
              </span>
            </h1>

            <p className="text-base md:text-xl text-ayur-gray leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fadeInUp animation-delay-200">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start animate-fadeInUp animation-delay-300">
              <NavLink
                to="/booking"
                className="btn-primary shadow-xl hover:shadow-2xl hover:shadow-ayur-green/30 hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                {t.common.book_consultation}
              </NavLink>
              <NavLink
                to="/tools"
                className="btn-secondary hover:border-ayur-green hover:text-ayur-green"
              >
                {t.common.assess_health}
              </NavLink>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm font-medium animate-fadeInUp animation-delay-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-ayur-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5 text-ayur-green" />
                </div>
                <span className="text-ayur-gray">{t.hero.badge_doctors}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-ayur-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Leaf className="w-5 h-5 text-ayur-accent" />
                </div>
                <span className="text-ayur-gray">{t.hero.badge_therapies}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[300px] xs:h-[350px] md:h-[500px] lg:h-[600px] w-full mx-auto max-w-md lg:max-w-none">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl group hover:shadow-aurora-lg transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/30 via-transparent to-transparent z-10"></div>
              <img
                src="/images/home/home-hero.png"
                alt="Modern Ayurveda Consultation & Therapy"
                fetchPriority="high"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              />
              <div className="absolute inset-4 border-2 border-white/30 rounded-[1.5rem] pointer-events-none z-20"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute bottom-2 left-2 md:-bottom-6 md:left-8 z-30 animate-float">
              <div className="bg-white/95 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-xl border border-white/50 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-ayur-accent p-2 md:p-2.5 rounded-lg md:rounded-xl text-white shadow-lg">
                    <Stethoscope size={18} className="md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-ayur-gray uppercase tracking-wider">{t.hero.float_approach}</p>
                    <p className="text-xs md:text-base font-bold text-ayur-green">{t.hero.float_integrated}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-2 right-2 md:-top-4 md:right-0 z-30 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/95 backdrop-blur-md px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-xl border border-white/50 flex items-center gap-2 md:gap-3 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="text-right">
                  <p className="text-xl md:text-3xl font-bold text-ayur-green leading-none">15+</p>
                  <p className="text-[10px] md:text-xs text-ayur-gray font-semibold uppercase">Years Exp.</p>
                </div>
                <div className="w-px h-6 md:h-10 bg-gray-200"></div>
                <div className="text-ayur-accent">
                  <AwardIcon size={20} className="md:w-7 md:h-7" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* QUICK ACCESS NAVIGATION */}
      <section className="py-10 bg-gradient-to-b from-white to-ayur-cream/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ayur-green/5 to-transparent animate-gradient"></div>
        <div className="px-4 relative z-10">
          <h3 className="text-sm font-bold text-ayur-gray/50 uppercase tracking-widest mb-6 text-center">
            Quick Access
          </h3>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="group flex items-center gap-2 md:gap-2.5 px-4 py-2.5 md:px-6 md:py-3.5 rounded-full bg-white border-2 border-ayur-subtle text-ayur-green font-semibold text-xs md:text-sm hover:border-ayur-green hover:bg-ayur-green hover:text-white active:scale-95 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-ayur-green/20 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="text-ayur-green group-hover:text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <item.icon size={16} className="md:w-5 md:h-5" />
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAGE CARDS */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ayur-subtle to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ayur-green mb-4 animate-fadeInUp">What brings you here?</h2>
            <p className="text-ayur-gray max-w-2xl mx-auto text-base md:text-lg animate-fadeInUp animation-delay-100">Select a concern to find specialized Ayurvedic protocols crafted for your condition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {triageCards.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.link}
                className="group relative bg-white rounded-2xl p-6 md:p-8 border-2 border-ayur-subtle hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:shadow-ayur-green/20 hover:-translate-y-2 overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Color bar on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <item.icon size={28} className="text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-ayur-green-text mb-2 group-hover:text-ayur-accent transition-colors duration-300">{item.title}</h3>
                  <p className="text-sm text-ayur-gray mb-4 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center text-ayur-accent text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn more</span>
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* WHY AYURVRITTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-ayur-green to-ayur-green-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-1.5 bg-ayur-accent/20 text-ayur-accent text-sm font-bold uppercase tracking-widest rounded-full mb-4 animate-fadeInUp">Our Philosophy</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight animate-fadeInUp animation-delay-100">
                A Hospital for <span className="text-ayur-accent">Holistic Healing.</span>
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 animate-fadeInUp animation-delay-200">
                We bridge the gap between ancient wisdom and modern pathology. Our treatments are clinical procedures aimed at root-cause elimination (Nidan Parivarjan), not just relaxation.
              </p>

              <div className="space-y-5">
                {philosophyPoints.map((point, i) => (
                  <div key={i} className="flex items-start group animate-fadeInUp" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ayur-accent/20 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-ayur-accent/30 transition-all duration-300">
                      <point.icon size={22} className="text-ayur-accent group-hover:animate-bounce-short" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold mb-1">{point.title}</h4>
                      <p className="text-white/60 text-sm">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-6 border-2 border-ayur-accent/30 rounded-full opacity-50 animate-spin-slow hidden md:block"></div>
              <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl mx-auto group">
                <div className="absolute inset-0 bg-ayur-green/20 mix-blend-multiply z-10 transition-opacity duration-500 group-hover:opacity-0"></div>
                <img
                  src="/images/home/home-philosophy.jpg"
                  alt="Authentic Ayurvedic Medicine Preparation"
                  loading="lazy"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/30 backdrop-blur-sm">
                  <span className="bg-white text-ayur-green px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:scale-110 hover:animate-bounceIn transition-all duration-300">
                    Authentic Treatment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS PREVIEW */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-ayur-cream/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ayur-green mb-4 animate-fadeInUp">Know Your Body</h2>
            <p className="text-ayur-gray text-base md:text-lg animate-fadeInUp animation-delay-100">Ayurveda is about self-awareness. Use our free interactive tools to understand your constitution and health risks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toolCards.map((item, idx) => (
              <NavLink to="/tools" key={idx} className="group relative bg-white rounded-3xl p-8 border-2 border-ayur-subtle hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:shadow-ayur-green/20 hover:-translate-y-2 overflow-hidden animate-fadeInUp" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    <item.icon size={32} className="text-white group-hover:animate-bounce-short" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-ayur-green-text mb-3 group-hover:text-white transition-colors duration-300">{item.title}</h3>
                  <p className="text-ayur-gray mb-6 leading-relaxed group-hover:text-white/80 transition-colors duration-300">{item.desc}</p>
                  <div className="flex items-center text-ayur-accent font-semibold group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                    <span>Get Started</span>
                    <ArrowRight size={18} className="ml-2" />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* FAQ */}
      <FAQ />

      {/* CONTACT CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ayur-green to-ayur-green-dark">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Ayurvritta Clinic Exterior"
            loading="lazy"
            className="w-full h-full object-cover mix-blend-overlay opacity-40"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fadeInUp">Start Your Healing Journey</h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fadeInUp animation-delay-100">
            Book a consultation today and take the first step towards a life of balance and vitality.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp animation-delay-200">
            <NavLink to="/booking" className="px-10 py-4 bg-ayur-accent text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:shadow-ayur-accent/30 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 group">
              <span className="group-hover:animate-shimmer">Schedule Appointment</span>
            </NavLink>
            <a href="tel:+919426684047" className="px-10 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-ayur-green hover:scale-105 hover:shadow-xl transition-all duration-300 group">
              <span className="group-hover:inline-block group-hover:animate-bounce-short">Call +91 94266 84047</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;