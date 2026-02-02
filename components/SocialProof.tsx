/**
 * Social Proof Component
 * Displays real-time social proof elements to build trust
 */

import React, { useState, useEffect } from 'react';
import { Users, Star, Clock, TrendingUp, Check } from 'lucide-react';
import { useAnalytics } from './AnalyticsProvider';

// Social proof types
type ProofType = 'booking_counter' | 'recent_activity' | 'reviews' | 'live_visitors';

interface SocialProofProps {
    type?: ProofType;
    position?: 'floating' | 'inline' | 'banner';
    className?: string;
}

// Simulated data (in production, this would come from a backend)
const SIMULATED_DATA = {
    todayBookings: Math.floor(Math.random() * 8) + 5, // 5-12
    weeklyBookings: Math.floor(Math.random() * 30) + 20, // 20-50
    activeVisitors: Math.floor(Math.random() * 15) + 3, // 3-17
    rating: 4.8,
    reviewCount: 247,
    recentActivities: [
        { name: 'Amit S.', action: 'booked', service: 'Panchakarma', time: '5 min ago', city: 'Vadodara' },
        { name: 'Priya M.', action: 'completed', service: 'Prakriti Assessment', time: '12 min ago', city: 'Ahmedabad' },
        { name: 'Rahul K.', action: 'booked', service: 'Consultation', time: '23 min ago', city: 'Mumbai' },
        { name: 'Sneha P.', action: 'booked', service: 'Shirodhara', time: '45 min ago', city: 'Surat' },
        { name: 'Vijay T.', action: 'completed', service: 'Weight Management', time: '1 hr ago', city: 'Vadodara' },
    ],
};

const SocialProof: React.FC<SocialProofProps> = ({
    type = 'booking_counter',
    position = 'floating',
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(0);
    const { trackEvent } = useAnalytics();

    // Show with delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
            trackEvent('engagement', 'social_proof_shown', type);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Rotate activities
    useEffect(() => {
        if (type !== 'recent_activity') return;

        const interval = setInterval(() => {
            setCurrentActivity(prev => (prev + 1) % SIMULATED_DATA.recentActivities.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [type]);

    const handleClose = () => {
        setIsVisible(false);
        trackEvent('engagement', 'social_proof_dismissed', type);
    };

    if (!isVisible) return null;

    const getPositionClasses = () => {
        switch (position) {
            case 'floating':
                return 'fixed bottom-4 left-4 z-40';
            case 'banner':
                return 'w-full';
            case 'inline':
            default:
                return '';
        }
    };

    // Booking Counter Style
    if (type === 'booking_counter') {
        return (
            <div className={`${getPositionClasses()} ${className} animate-slideIn`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0F3D3E]/10 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#0F3D3E]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#0F3D3E]">
                                <span className="text-lg font-bold">{SIMULATED_DATA.todayBookings}</span> bookings today
                            </p>
                            <p className="text-xs text-gray-500">
                                {SIMULATED_DATA.weeklyBookings}+ this week
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                        aria-label="Close notification"
                    >
                        ✕
                    </button>
                </div>
                <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `}</style>
            </div>
        );
    }

    // Recent Activity Style
    if (type === 'recent_activity') {
        const activity = SIMULATED_DATA.recentActivities[currentActivity];
        return (
            <div className={`${getPositionClasses()} ${className} animate-slideIn`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-xs relative overflow-hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0F3D3E]">
                                <span className="font-medium">{activity.name}</span> from {activity.city}
                            </p>
                            <p className="text-xs text-gray-600">
                                {activity.action} {activity.service}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                            </p>
                        </div>
                    </div>
                    {/* Progress bar for next activity */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                        <div
                            className="h-full bg-[#0F3D3E] transition-all duration-[5000ms] ease-linear"
                            style={{ width: '100%', animation: 'shrink 5s linear infinite' }}
                        />
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                        aria-label="Close notification"
                    >
                        ✕
                    </button>
                </div>
                <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `}</style>
            </div>
        );
    }

    // Reviews Style
    if (type === 'reviews') {
        return (
            <div className={`${getPositionClasses()} ${className}`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 inline-flex items-center gap-3">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i <= Math.floor(SIMULATED_DATA.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <div>
                        <span className="font-bold text-[#0F3D3E]">{SIMULATED_DATA.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                            ({SIMULATED_DATA.reviewCount} reviews)
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Live Visitors Style
    if (type === 'live_visitors') {
        return (
            <div className={`${getPositionClasses()} ${className} animate-slideIn`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-xs">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Users className="w-6 h-6 text-[#0F3D3E]" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                <span className="font-bold text-[#0F3D3E]">{SIMULATED_DATA.activeVisitors}</span> people are viewing this page
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                        aria-label="Close notification"
                    >
                        ✕
                    </button>
                </div>
                <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
        `}</style>
            </div>
        );
    }

    return null;
};

export default SocialProof;
