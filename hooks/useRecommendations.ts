/**
 * useRecommendations Hook
 * React hook for personalized service recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationEngine, ServiceInfo } from '../analytics/recommendationEngine';

interface UseRecommendationsResult {
    recommendations: ServiceInfo[];
    trending: ServiceInfo[];
    isLoading: boolean;
    recordView: (serviceId: string) => void;
    recordInteraction: (serviceId: string) => void;
    getByDosha: (dosha: string) => ServiceInfo[];
    getSimilar: (serviceId: string) => ServiceInfo[];
}

/**
 * useRecommendations Hook
 */
export function useRecommendations(limit: number = 4): UseRecommendationsResult {
    const [recommendations, setRecommendations] = useState<ServiceInfo[]>([]);
    const [trending, setTrending] = useState<ServiceInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load recommendations on mount
    useEffect(() => {
        setIsLoading(true);

        // Get personalized recommendations
        const recs = recommendationEngine.getRecommendations(limit);
        setRecommendations(recs);

        // Get trending
        const trend = recommendationEngine.getTrending(limit);
        setTrending(trend);

        setIsLoading(false);
    }, [limit]);

    // Record a view
    const recordView = useCallback((serviceId: string) => {
        recommendationEngine.recordView(serviceId);
        // Refresh recommendations
        setRecommendations(recommendationEngine.getRecommendations(limit));
    }, [limit]);

    // Record an interaction
    const recordInteraction = useCallback((serviceId: string) => {
        recommendationEngine.recordInteraction(serviceId);
    }, []);

    // Get by dosha
    const getByDosha = useCallback((dosha: string) => {
        return recommendationEngine.getByDosha(dosha, limit);
    }, [limit]);

    // Get similar services
    const getSimilar = useCallback((serviceId: string) => {
        return recommendationEngine.getSimilar(serviceId);
    }, []);

    return {
        recommendations,
        trending,
        isLoading,
        recordView,
        recordInteraction,
        getByDosha,
        getSimilar,
    };
}

export default useRecommendations;
