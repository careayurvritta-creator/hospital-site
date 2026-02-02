/**
 * Testimonials Carousel Component
 * Displays rotating patient testimonials for social proof
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useLanguage } from './LanguageContext';

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

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => goToSlide((currentIndex + 1) % TESTIMONIALS.length);
    const prevSlide = () => goToSlide((currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

    const testimonial = TESTIMONIALS[currentIndex];

    return (
        <section className="py-16 bg-gradient-to-br from-ayur-cream to-white">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-ayur-green mb-4">
                        {t.testimonials.title}
                    </h2>
                    <p className="text-ayur-gray">{t.testimonials.subtitle}</p>
                </div>

                <div
                    className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {/* Quote icon */}
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-ayur-accent/20" />

                    {/* Content */}
                    <div className="text-center">
                        {/* Rating */}
                        <div className="flex justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>

                        {/* Testimonial text */}
                        <p className="text-lg md:text-xl text-ayur-green leading-relaxed mb-6 italic">
                            "{testimonial.text}"
                        </p>

                        {/* Patient info */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-ayur-green-light flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-ayur-green">
                                    {testimonial.name.charAt(0)}
                                </span>
                            </div>
                            <h4 className="font-bold text-ayur-green">{testimonial.name}</h4>
                            <p className="text-sm text-ayur-gray">{testimonial.location}</p>
                            <span className="mt-2 px-3 py-1 bg-ayur-accent/10 text-ayur-accent text-xs font-medium rounded-full">
                                {testimonial.condition}
                            </span>
                        </div>
                    </div>

                    {/* Navigation arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ayur-green/10 hover:bg-ayur-green/20 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6 text-ayur-green" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ayur-green/10 hover:bg-ayur-green/20 transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6 text-ayur-green" />
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex
                                    ? 'bg-ayur-green w-8'
                                    : 'bg-ayur-green/30 hover:bg-ayur-green/50'
                                    }`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarousel;
