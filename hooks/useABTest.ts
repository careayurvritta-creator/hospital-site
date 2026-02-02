/**
 * useABTest Hook
 * React hook for A/B testing integration
 */

import { useState, useEffect, useCallback } from 'react';
import { abTestManager, DEFAULT_AB_TESTS } from '../analytics/abTestManager';
import type { ABTestVariant } from '../analytics';

interface UseABTestResult {
    variant: ABTestVariant | null;
    isControl: boolean;
    variantId: string | null;
    trackConversion: (value?: number) => void;
}

/**
 * useABTest Hook
 * Get variant assignment for an A/B test
 */
export function useABTest(testId: string): UseABTestResult {
    const [variant, setVariant] = useState<ABTestVariant | null>(null);

    useEffect(() => {
        // Initialize with default tests if not already done
        abTestManager.initialize(DEFAULT_AB_TESTS);

        // Get variant assignment
        const assignedVariant = abTestManager.getVariant(testId);
        setVariant(assignedVariant);
    }, [testId]);

    const trackConversion = useCallback((value?: number) => {
        abTestManager.trackConversion(testId, value);
    }, [testId]);

    return {
        variant,
        isControl: variant?.isControl ?? true,
        variantId: variant?.id ?? null,
        trackConversion,
    };
}

/**
 * useABTestVariants Hook
 * Get all current A/B test assignments
 */
export function useABTestVariants(): Record<string, string> {
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    useEffect(() => {
        abTestManager.initialize(DEFAULT_AB_TESTS);
        setAssignments(abTestManager.getAssignments());
    }, []);

    return assignments;
}

export default useABTest;
