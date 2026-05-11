/**
 * Testimonials Carousel Component
 * Displays rotating patient testimonials for social proof
 * Enhanced with modern animations, auto-scroll, and excellent UX
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, MapPin, ExternalLink } from 'lucide-react';
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
    }
];

const TestimonialsCarousel: React.FC = () => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const observer = useIntersectionObserver({ threshold: 0.3, triggerOnce: false });
    const progressInterval = useRef<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);

    // Auto-scroll to reviews when section becomes visible
    useEffect(() => {
        if (observer.isVisible && sectionRef.current) {
            const offset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    }, [observer.isVisible]);

    useEffect(() => {
        if (!isAutoPlaying || !observer.isVisible || isHovered) return;

        const progressStep = 100 / 50; // 5 seconds = 50 * 100ms
        progressInterval.current = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setDirection('right');
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
    }, [isAutoPlaying, observer.isVisible, isHovered]);

    useEffect(() => {
        if (isHovered && progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    }, [isHovered]);

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 'right' : 'left');
        setCurrentIndex(index);
        setProgress(0);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const nextSlide = () => {
        setDirection('right');
        goToSlide((currentIndex + 1) % TESTIMONIALS.length);
    };

    const prevSlide = () => {
        setDirection('left');
        goToSlide((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    const testimonial = TESTIMONIALS[currentIndex];

    return (
        <section 
            ref={sectionRef}
            id="reviews"
            className="py-20 bg-gradient-to-br from-ayur-cream via-white to-green-50 relative overflow-hidden"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg hover:shadow-xl transition-shadow">
                        <MapPin className="w-4 h-4" />
                        <span>Patient Reviews</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-ayur-green mb-4 relative">
                        <span className="relative inline-block">
                            What Our Patients Say
                            <svg className="absolute -bottom-2 left-0 w-full h-1" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0,5 Q50,10 100,5" stroke="#D4A853" strokeWidth="3" fill="none" />
                            </svg>
                        </span>
                    </h2>
                    
                    <p className="text-lg text-ayur-gray max-w-2xl mx-auto mb-6">
                        Real experiences from patients who transformed their health with Ayurvritta's authentic Ayurvedic treatments.
                    </p>

                    {/* Rating Badge */}
                    <a 
                        href="https://www.google.com/search?q=ayurvritta+ayurveda+hospital+vadodara"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                    >
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <div className="text-left">
                            <span className="font-bold text-ayur-green">4.9/5</span>
                            <span className="text-gray-500 text-sm ml-2">from 250+ reviews</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </a>
                </div>

                {/* Main Card */}
                <div 
                    className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ 
                        transform: `perspective(1000px) rotateY(${direction === 'right' ? -2 : 2}deg)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                        <div 
                            className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 transition-all duration-75"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Floating Quote */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-green-100 to-amber-100 rounded-full flex items-center justify-center">
                        <Quote className="w-8 h-8 text-green-600/40" />
                    </div>

                    {/* Rating Stars */}
                    <div className="absolute top-6 right-6 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="pt-20 pb-16 px-8 md:px-16">
                        <div 
                            className="text-center"
                            key={`testimonial-${testimonial.id}-${currentIndex}`}
                        >
                            {/* Animated Text */}
                            <p 
                                className="text-xl md:text-2xl text-ayur-green leading-relaxed italic font-light mb-8"
                                style={{
                                    animation: 'fadeInScale 0.6s ease-out both'
                                }}
                            >
                                "{testimonial.text}"
                            </p>

                            {/* Patient Info */}
                            <div 
                                className="flex flex-col items-center"
                                style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
                            >
                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                                        <span className="text-3xl font-bold text-white">
                                            {testimonial.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <Star className="w-3 h-3 text-white fill-white" />
                                    </div>
                                </div>

                                <h4 className="font-bold text-ayur-green text-lg">{testimonial.name}</h4>
                                <p className="text-gray-500 text-sm">{testimonial.location}</p>
                                <span className="mt-3 px-4 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full">
                                    {testimonial.condition}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-3 pb-6">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`relative h-3 rounded-full transition-all duration-300 ${
                                    i === currentIndex 
                                    ? 'w-10 bg-green-600' 
                                    : 'w-3 bg-green-300 hover:bg-green-400'
                                }`}
                            >
                                {i === currentIndex && (
                                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View All Reviews Link */}
                <div className="text-center mt-8">
                    <a 
                        href="https://www.google.com/search?q=ayurvritta+ayurveda+hospital+vadodara#mpd=~3072245103650888917/customers/reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors group"
                    >
                        <span>View All {250}+ Google Reviews</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
};

export default TestimonialsCarousel;