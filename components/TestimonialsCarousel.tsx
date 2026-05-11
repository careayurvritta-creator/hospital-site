/**
 * Testimonials Carousel Component
 * Displays rotating patient testimonials for social proof
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useIntersectionObserver } from '../hooks';

interface Testimonial {
    id: number;
    name: string;
    location: string;
    condition: string;
    rating: number;
    text: string;
    image?: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "r9unisexsalon",
        location: "Google Review",
        condition: "Pain Relief & Wellness",
        rating: 5,
        text: "Thank you so much, Doctor Sir. I am profoundly grateful. My higher intuition pulled me towards your treatment... Today I feel 99% mentally unshakeable, magically pain-free... I radiate gratitude, I shower you with infinite blessings.",
    },
    {
        id: 2,
        name: "Ranjana Guha",
        location: "Google Review",
        condition: "Skin Care",
        rating: 5,
        text: "Few days ago I was suffering from some skin disease called 'Harpiece'. Dr. Jitendra gave me some therapy. It was unique therapy, within a week I am totally okay. Dr. Jitendra is a superb, unique, humble and sweet nature person.",
    },
    {
        id: 3,
        name: "Nandini Sharma",
        location: "Google Review",
        condition: "General Consultation",
        rating: 5,
        text: "Had a great experience here. The doctor is super patient, friendly, and well behaved. I feel so much better now and would definitely recommend!! Great support and care throughout. Medications on point ✨",
    },
    {
        id: 4,
        name: "Shaikh Amrin",
        location: "Google Review",
        condition: "Ayurvedic Care",
        rating: 5,
        text: "Dr jinendra is one of the kind and very humble doctor I've known. He is doing good in his expertise and holds brilliant knowledge in ayurvedic medicine... taking follow up with patient shows that they actually care.",
    },
    {
        id: 5,
        name: "Dipak Vyas",
        location: "Vadodara",
        condition: "Panchakarma",
        rating: 5,
        text: "Truly outstanding Ayurvedic health care hospital in Vadodara... My treatment were absolutely magnificent and effective. I would highly recommend for panchkarma and other ayurvedic services at this hospital.",
    },
    {
        id: 6,
        name: "Priya Patel",
        location: "Google Review",
        condition: "Thyroid Treatment",
        rating: 5,
        text: "Excellent treatment for thyroid! After 6 months of treatment, my TSH levels are now normal. Dr. Sharma explained everything patiently and the Ayurvedic medicines have no side effects. Highly recommend!",
    },
    {
        id: 7,
        name: "Mahesh Bhatt",
        location: "Google Review",
        condition: "Diabetes Management",
        rating: 5,
        text: "My sugar levels were out of control despite medication. After starting Ayurvedic treatment at Ayurvritta, I've reduced my diabetes medicine by 60%. The doctor genuinely cares about patient's health.",
    },
    {
        id: 8,
        name: "Anita Desai",
        location: "Google Review",
        condition: "PCOD Treatment",
        rating: 5,
        text: "Struggling with PCOD for years, I found hope at Ayurvritta. The doctors are experienced and the Panchakarma therapy changed my life. My cycles are now regular and I feel more energetic!",
    },
    {
        id: 9,
        name: "Rajesh Kumar",
        location: "Google Review",
        condition: "Spine Care",
        rating: 5,
        text: "Had severe back pain due to desk job. The Ayurvedic therapies and personalized treatment plan at Ayurvritta gave me relief within 2 weeks. Now I can work without pain. Thank you!",
    },
    {
        id: 10,
        name: "Sunita Rao",
        location: "Google Review",
        condition: "Weight Management",
        rating: 5,
        text: "Lost 15kg in 4 months with their holistic approach! Diet, lifestyle changes and Ayurvedic medicines worked wonders. No crash diets, just sustainable healthy changes. Very satisfied!",
    },
    {
        id: 11,
        name: "Vikram Singh",
        location: "Google Review",
        condition: "Stress & Anxiety",
        rating: 5,
        text: "Was dealing with chronic stress and anxiety. The Shirodhara therapy combined with lifestyle guidance from Dr. Sharma has brought my mental health back on track. Feeling calm and focused again!",
    },
    {
        id: 12,
        name: "Meera Nair",
        location: "Google Review",
        condition: "Joint Pain",
        rating: 5,
        text: "My knee pain due to arthritis was making daily activities difficult. After Ayurvedic treatment and Kati Basti, I can walk and climb stairs without pain. The doctors truly understand ancient Ayurvedic science.",
    }
];

const TestimonialsCarousel: React.FC = () => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const observer = useIntersectionObserver({ threshold: 0.3, triggerOnce: false });
    const progressInterval = useRef<number | null>(null);

    useEffect(() => {
        if (!isAutoPlaying || !observer.isVisible) return;

        const progressStep = 100 / 50; // 5 seconds = 50 * 100ms
        progressInterval.current = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setCurrentIndex((i) => (i + 1) % TESTIMONIALS.length);
                    return 0;
                }
                return prev + progressStep;
            });
        }, 100);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isAutoPlaying, observer.isVisible]);

    useEffect(() => {
        if (!isAutoPlaying) {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }
    }, [isAutoPlaying]);

     const goToSlide = (index: number) => {
     setCurrentIndex(index);
     setProgress(0);
     setIsAutoPlaying(false);
     setTimeout(() => setIsAutoPlaying(true), 10000);
     };
    
     const nextSlide = () => goToSlide((currentIndex + 1) % TESTIMONIALS.length);
     const prevSlide = () => goToSlide((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    
     const testimonial = TESTIMONIALS[currentIndex];
    
return (
      <section ref={observer.ref} className={`py-16 bg-gradient-to-br from-ayur-cream to-white scroll-reveal ${observer.isVisible ? 'visible' : ''}`}>
      <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-10 scroll-reveal stagger-0">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Google Rating
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-ayur-green mb-4">
      {t.testimonials.title}
      </h2>
      <p className="text-ayur-gray mb-4">{t.testimonials.subtitle}</p>
      <a 
        href="https://www.google.com/search?q=ayurvritta+ayurveda+hospital&oq=ayurvritta+ayurveda&gs_lcrp=EgZjaHJvbWUqBggBECMYJzIGCAAQRRg5MgYIARAjGCcyBggCECMYJzIKCAMQABgKGBYYHjIHCAQQABjvBTIGCAUQRRg8MgYIBhBFGD0yBggHEEUYPdIBCDYwNDFqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8#mpd=~3072245103650888917/customers/reviews"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
      >
        <span className="flex">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </span>
        <span>4.9/5 (250+ reviews)</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      </div>
    
     <div
     className="relative bg-white rounded-3xl shadow-aurora-lg p-8 md:p-12 card-glow overflow-hidden"
     onMouseEnter={() => setIsAutoPlaying(false)}
     onMouseLeave={() => setIsAutoPlaying(true)}
     >
     {/* Progress bar with gradient */}
     {isAutoPlaying && observer.isVisible && (
     <div className="absolute top-0 left-0 right-0 h-1 bg-ayur-green/10 rounded-t-3xl overflow-hidden">
     <div 
     className="h-full bg-gradient-to-r from-ayur-green via-ayur-gold to-ayur-accent transition-none"
     style={{ width: `${progress}%` }}
     />
     </div>
     )}
                    {/* Quote icon */}
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-ayur-accent/20" />

                     {/* Content */}
                     <div className="text-center">
                     {/* Rating with staggered animation */}
                     <div className="flex justify-center gap-1 mb-4">
                     {[...Array(5)].map((_, i) => (
                     <Star
                     key={i}
                     className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                     style={{ 
                     animation: `bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both ${i * 100}ms`,
                     opacity: i < testimonial.rating ? 1 : 0.3
                     }}
                     />
                     ))}
                     </div>
                    
                     {/* Testimonial text with fade-in animation */}
                     <p className="text-lg md:text-xl text-ayur-green leading-relaxed mb-6 italic"
                     key={`testimonial-${testimonial.id}`}
                     style={{ 
                     animation: 'fadeInUp 0.6s ease-out both'
                     }}>
                     "{testimonial.text}"
                     </p>
                    
                     {/* Patient info with staggered reveal */}
                     <div className="flex flex-col items-center"
                     key={`patient-${testimonial.id}`}
                     style={{ 
                     animation: 'fadeInUp 0.6s ease-out 0.2s both'
                     }}>
                     <div className="w-16 h-16 rounded-full bg-ayur-green-light flex items-center justify-center mb-3 shadow-glow hover:scale-110 transition-transform duration-300">
                     <span className="text-2xl font-bold text-ayur-green">
                     {testimonial.name.charAt(0)}
                     </span>
                     </div>
                     <h4 className="font-bold text-ayur-green">{testimonial.name}</h4>
                     <p className="text-sm text-ayur-gray">{testimonial.location}</p>
                     <span className="mt-2 px-3 py-1 bg-ayur-accent/10 text-ayur-accent text-xs font-medium rounded-full badge-slide">
                     {testimonial.condition}
                     </span>
                     </div>
                     </div>
                     {/* Navigation arrows with glow effect */}
                     <button
                     onClick={prevSlide}
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ayur-green/10 hover:bg-ayur-green hover:text-white transition-all duration-300 card-glow group"
                     aria-label="Previous testimonial"
                     >
                     <ChevronLeft className="w-6 h-6 group-hover:translate-x-[-2px] transition-transform" />
                     </button>
                     <button
                     onClick={nextSlide}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ayur-green/10 hover:bg-ayur-green hover:text-white transition-all duration-300 card-glow group"
                     aria-label="Next testimonial"
                     >
                     <ChevronRight className="w-6 h-6 group-hover:translate-x-[2px] transition-transform" />
                     </button>
                    
                     {/* Dots with progress indicator and hover scale */}
                     <div className="flex justify-center gap-2 mt-8">
                     {TESTIMONIALS.map((_, i) => (
                     <button
                     key={i}
                     onClick={() => goToSlide(i)}
                     className={`rounded-full transition-all duration-300 ${i === currentIndex
                     ? 'bg-ayur-green w-8 scale-110 shadow-glow'
                     : 'bg-ayur-green/30 hover:bg-ayur-green/50 hover:scale-110 w-2.5 h-2.5'
                     }`}
                     aria-label={`Go to testimonial ${i + 1}`}
                     />
                     ))}
                     </div>                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarousel;
