/**
 * Recommendation Engine
 * Provides personalized service recommendations based on user behavior
 */

import { userSegmentation, eventTracker } from './index';
import { USER_SEGMENTS } from './config';

// Service catalog with metadata
export interface ServiceInfo {
    id: string;
    name: string;
    category: string;
    doshaAffinity: string[];
    tags: string[];
    popularity: number;
    conversionRate: number;
}

// Simulated service catalog
const SERVICE_CATALOG: ServiceInfo[] = [
    {
        id: 'panchakarma',
        name: 'Panchakarma Therapy',
        category: 'detox',
        doshaAffinity: ['vata', 'pitta', 'kapha'],
        tags: ['detox', 'cleansing', 'rejuvenation', 'classic'],
        popularity: 95,
        conversionRate: 8.5,
    },
    {
        id: 'abhyanga',
        name: 'Abhyanga Massage',
        category: 'massage',
        doshaAffinity: ['vata'],
        tags: ['relaxation', 'oil', 'stress', 'skin'],
        popularity: 88,
        conversionRate: 12.3,
    },
    {
        id: 'shirodhara',
        name: 'Shirodhara',
        category: 'therapy',
        doshaAffinity: ['pitta', 'vata'],
        tags: ['mental', 'stress', 'headache', 'sleep'],
        popularity: 82,
        conversionRate: 9.1,
    },
    {
        id: 'consultation',
        name: 'Ayurvedic Consultation',
        category: 'consultation',
        doshaAffinity: ['vata', 'pitta', 'kapha'],
        tags: ['diagnosis', 'first-visit', 'assessment'],
        popularity: 90,
        conversionRate: 15.2,
    },
    {
        id: 'udvartana',
        name: 'Udvartana',
        category: 'massage',
        doshaAffinity: ['kapha'],
        tags: ['weight', 'exfoliation', 'energizing', 'cellulite'],
        popularity: 68,
        conversionRate: 7.4,
    },
    {
        id: 'nasya',
        name: 'Nasya Therapy',
        category: 'therapy',
        doshaAffinity: ['kapha', 'vata'],
        tags: ['sinus', 'respiratory', 'mental-clarity'],
        popularity: 55,
        conversionRate: 6.2,
    },
    {
        id: 'basti',
        name: 'Basti Treatment',
        category: 'detox',
        doshaAffinity: ['vata'],
        tags: ['colon', 'detox', 'digestion', 'pain'],
        popularity: 60,
        conversionRate: 5.8,
    },
    {
        id: 'stress-management',
        name: 'Stress Management Program',
        category: 'program',
        doshaAffinity: ['vata', 'pitta'],
        tags: ['stress', 'anxiety', 'lifestyle', 'mental'],
        popularity: 75,
        conversionRate: 11.5,
    },
    {
        id: 'weight-management',
        name: 'Weight Management Program',
        category: 'program',
        doshaAffinity: ['kapha'],
        tags: ['weight', 'metabolism', 'diet', 'exercise'],
        popularity: 78,
        conversionRate: 10.2,
    },
    {
        id: 'skin-care',
        name: 'Ayurvedic Skin Care',
        category: 'wellness',
        doshaAffinity: ['pitta'],
        tags: ['skin', 'beauty', 'acne', 'glow'],
        popularity: 72,
        conversionRate: 8.9,
    },
];

/**
 * RecommendationEngine Class
 */
class RecommendationEngine {
    private viewHistory: string[] = [];
    private interactionScores: Map<string, number> = new Map();

    constructor() {
        this.loadHistory();
    }

    /**
     * Load interaction history
     */
    private loadHistory(): void {
        try {
            const saved = localStorage.getItem('ayurvritta_service_history');
            if (saved) {
                const data = JSON.parse(saved);
                this.viewHistory = data.views || [];
                this.interactionScores = new Map(Object.entries(data.scores || {}));
            }
        } catch (e) {
            console.error('[Recommendations] Error loading history:', e);
        }
    }

    /**
     * Save interaction history
     */
    private saveHistory(): void {
        try {
            const data = {
                views: this.viewHistory.slice(-50), // Keep last 50
                scores: Object.fromEntries(this.interactionScores),
            };
            localStorage.setItem('ayurvritta_service_history', JSON.stringify(data));
        } catch (e) {
            console.error('[Recommendations] Error saving history:', e);
        }
    }

    /**
     * Record a service view
     */
    recordView(serviceId: string): void {
        this.viewHistory.push(serviceId);
        const score = this.interactionScores.get(serviceId) || 0;
        this.interactionScores.set(serviceId, score + 1);
        this.saveHistory();
    }

    /**
     * Record a service interaction (click, expand, etc.)
     */
    recordInteraction(serviceId: string, weight: number = 2): void {
        const score = this.interactionScores.get(serviceId) || 0;
        this.interactionScores.set(serviceId, score + weight);
        this.saveHistory();
    }

    /**
     * Get personalized recommendations
     */
    getRecommendations(limit: number = 4): ServiceInfo[] {
        const scores = new Map<string, number>();

        // Initialize all services
        SERVICE_CATALOG.forEach(service => {
            scores.set(service.id, 0);
        });

        // Factor 1: Dosha affinity (highest weight)
        const userDosha = userSegmentation.getDoshaPreference();
        if (userDosha) {
            SERVICE_CATALOG.forEach(service => {
                if (service.doshaAffinity.includes(userDosha.toLowerCase())) {
                    const current = scores.get(service.id) || 0;
                    scores.set(service.id, current + 30);
                }
            });
        }

        // Factor 2: Past interactions
        this.interactionScores.forEach((interactionScore, serviceId) => {
            const current = scores.get(serviceId) || 0;
            scores.set(serviceId, current + (interactionScore * 5));
        });

        // Factor 3: User interests from segmentation
        const interests = userSegmentation.getTopInterests();
        SERVICE_CATALOG.forEach(service => {
            const matchCount = service.tags.filter(tag =>
                interests.some(interest =>
                    interest.toLowerCase().includes(tag) || tag.includes(interest.toLowerCase())
                )
            ).length;
            const current = scores.get(service.id) || 0;
            scores.set(service.id, current + (matchCount * 10));
        });

        // Factor 4: Segment-based boosting
        const segments = userSegmentation.getSegments();
        if (segments.includes(USER_SEGMENTS.TOOL_USER)) {
            // Boost services related to dosha
            SERVICE_CATALOG.forEach(service => {
                if (service.tags.includes('assessment') || service.category === 'consultation') {
                    const current = scores.get(service.id) || 0;
                    scores.set(service.id, current + 15);
                }
            });
        }

        if (segments.includes(USER_SEGMENTS.FIRST_TIME_VISITOR)) {
            // Boost entry-level services
            SERVICE_CATALOG.forEach(service => {
                if (service.tags.includes('first-visit') || service.id === 'consultation') {
                    const current = scores.get(service.id) || 0;
                    scores.set(service.id, current + 20);
                }
            });
        }

        // Factor 5: Popularity baseline
        SERVICE_CATALOG.forEach(service => {
            const current = scores.get(service.id) || 0;
            scores.set(service.id, current + (service.popularity * 0.2));
        });

        // Don't recommend recently viewed (except if score is very high)
        const recentViews = new Set(this.viewHistory.slice(-5));

        // Sort by score and return top recommendations
        return SERVICE_CATALOG
            .map(service => ({
                service,
                score: scores.get(service.id) || 0,
                recentlyViewed: recentViews.has(service.id),
            }))
            .sort((a, b) => {
                // Penalize recently viewed unless score is much higher
                const aPenalty = a.recentlyViewed ? 20 : 0;
                const bPenalty = b.recentlyViewed ? 20 : 0;
                return (b.score - bPenalty) - (a.score - aPenalty);
            })
            .slice(0, limit)
            .map(item => item.service);
    }

    /**
     * Get recommendations by dosha
     */
    getByDosha(dosha: string, limit: number = 4): ServiceInfo[] {
        return SERVICE_CATALOG
            .filter(s => s.doshaAffinity.includes(dosha.toLowerCase()))
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }

    /**
     * Get recommendations by category
     */
    getByCategory(category: string, limit: number = 4): ServiceInfo[] {
        return SERVICE_CATALOG
            .filter(s => s.category === category)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }

    /**
     * Get similar services
     */
    getSimilar(serviceId: string, limit: number = 3): ServiceInfo[] {
        const service = SERVICE_CATALOG.find(s => s.id === serviceId);
        if (!service) return [];

        return SERVICE_CATALOG
            .filter(s => s.id !== serviceId)
            .map(s => {
                let similarity = 0;
                // Same category
                if (s.category === service.category) similarity += 30;
                // Overlapping doshas
                const doshaOverlap = s.doshaAffinity.filter(d => service.doshaAffinity.includes(d));
                similarity += doshaOverlap.length * 15;
                // Overlapping tags
                const tagOverlap = s.tags.filter(t => service.tags.includes(t));
                similarity += tagOverlap.length * 10;
                return { service: s, similarity };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.service);
    }

    /**
     * Get trending services
     */
    getTrending(limit: number = 4): ServiceInfo[] {
        return SERVICE_CATALOG
            .sort((a, b) => (b.popularity * b.conversionRate) - (a.popularity * a.conversionRate))
            .slice(0, limit);
    }

    /**
     * Get service by ID
     */
    getService(id: string): ServiceInfo | undefined {
        return SERVICE_CATALOG.find(s => s.id === id);
    }

    /**
     * Get all services
     */
    getAllServices(): ServiceInfo[] {
        return [...SERVICE_CATALOG];
    }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();

// Export class for testing
export { RecommendationEngine };
