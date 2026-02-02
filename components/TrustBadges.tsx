import React from 'react';
import { Shield, Award, Clock, Users, Star, Heart } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const TrustBadges: React.FC = () => {
    const { t } = useLanguage();

    const BADGES = [
        {
            icon: Users,
            value: "10,000+",
            label: t.trust.patients
        },
        {
            icon: Clock,
            value: "15+",
            label: t.trust.experience
        },
        {
            icon: Star,
            value: "4.8★",
            label: t.trust.rating
        },
        {
            icon: Award,
            value: "AYUSH",
            label: t.trust.certified
        },
        {
            icon: Shield,
            value: "50+",
            label: t.trust.insurance
        },
        {
            icon: Heart,
            value: "24/7",
            label: t.trust.emergency
        }
    ];

    return (
        <section className="py-12 bg-gradient-to-r from-ayur-green to-ayur-green-dark">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {BADGES.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={index}
                                className="text-center text-white"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-2xl font-bold">{badge.value}</div>
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
