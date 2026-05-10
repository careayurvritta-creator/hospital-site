import React, { useState, useEffect, useRef } from 'react';
import { Shield, Award, Clock, Users, Star, Heart } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useIntersectionObserver } from '../hooks';

const TrustBadges: React.FC = () => {
 const { t } = useLanguage();
 const observer = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
 const [counters, setCounters] = useState<Record<number, number>>({});
 const countersRef = useRef<(HTMLDivElement | null)[]>([]);
 const animationRef = useRef<Record<number, number>>({});

 const animateCounter = (index: number, target: number, duration: number = 2000) => {
 const start = 0;
 const startTime = performance.now();
 
 const updateCounter = (currentTime: number) => {
 const elapsed = currentTime - startTime;
 const progress = Math.min(elapsed / duration, 1);
 
 // Easing function for smooth animation
 const easeOutQuart = 1 - Math.pow(1 - progress, 4);
 const currentValue = start + (target - start) * easeOutQuart;
 
 setCounters(prev => ({ ...prev, [index]: currentValue }));
 
 if (progress < 1) {
 animationRef.current[index] = requestAnimationFrame(updateCounter);
 }
 };
 
 animationRef.current[index] = requestAnimationFrame(updateCounter);
 };

 useEffect(() => {
 if (observer.isVisible) {
 BADGES.forEach((badge, index) => {
 if (!badge.isText && !badge.isDecimal) {
 const target = parseInt(badge.value);
 animateCounter(index, target);
 } else if (badge.isDecimal) {
 const target = parseFloat(badge.value);
 animateCounter(index, target);
 }
 });
 }
 
 // Cleanup animations
 return () => {
 Object.values(animationRef.current).forEach(ref => {
 cancelAnimationFrame(ref);
 });
 };
 }, [observer.isVisible]);
    const BADGES = [
        {
            icon: Users,
            value: "10000",
            formatted: "10,000+",
            label: t.trust.patients,
            suffix: "+"
        },
        {
            icon: Clock,
            value: "15",
            formatted: "15+",
            label: t.trust.experience,
            suffix: "+"
        },
        {
            icon: Star,
            value: "4.8",
            formatted: "4.8★",
            label: t.trust.rating,
            suffix: "★",
            isDecimal: true
        },
        {
            icon: Award,
            value: "100",
            formatted: "AYUSH",
            label: t.trust.certified,
            isText: true
        },
        {
            icon: Shield,
            value: "50",
            formatted: "50+",
            label: t.trust.insurance,
            suffix: "+"
        },
        {
            icon: Heart,
            value: "24",
            formatted: "24/7",
            label: t.trust.emergency,
            suffix: "/7"
        }
    ];

     return (
     <section ref={observer.ref} className="py-12 bg-gradient-to-r from-ayur-green to-ayur-green-dark">
     <div className="max-w-6xl mx-auto px-4">
     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
     {BADGES.map((badge, index) => {
     const Icon = badge.icon;
     const animatedValue = counters[index];
     
     return (
     <div
     key={index}
     ref={(el) => (countersRef.current[index] = el)}
     className={`text-center text-white card-glow p-4 rounded-xl scroll-reveal stagger-${index + 1} transition-all duration-500 ${observer.isVisible ? 'visible opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
     >
     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 icon-bounce hover:scale-110 transition-transform duration-300">
     <Icon className="w-6 h-6" />
     </div>
     <div className="text-2xl md:text-3xl font-bold counter-gradient">
     {badge.isText ? badge.formatted : (
     <>
     {badge.isDecimal 
     ? animatedValue !== undefined ? animatedValue.toFixed(1) : "0.0"
     : animatedValue !== undefined ? Math.floor(animatedValue).toLocaleString() : "0"
     }
     {!badge.isText && badge.suffix}
     </>
     )}
     </div>
     <div className="text-sm text-white/80">{badge.label}</div>
     </div>
     );
     })}
     </div>
     </div>
     </section>
     );
    };
export default TrustBadges;
