/**
 * A/B Testing Framework
 * Client-side A/B testing with variant assignment and tracking
 */

import { eventTracker, consentManager } from './index';
import { generateId } from './utils';
import type { ABTestConfig, ABTestVariant } from './types';

// Storage keys
const AB_TESTS_KEY = 'ayurvritta_ab_tests';
const AB_ASSIGNMENTS_KEY = 'ayurvritta_ab_assignments';

/**
 * ABTestManager Class
 * Manages A/B test configurations and variant assignments
 */
class ABTestManager {
    private tests: Map<string, ABTestConfig> = new Map();
    private assignments: Map<string, string> = new Map();
    private isInitialized: boolean = false;

    constructor() {
        this.loadAssignments();
    }

    /**
     * Initialize with test configurations
     */
    initialize(configs: ABTestConfig[]): void {
        configs.forEach(config => {
            if (config.isActive) {
                this.tests.set(config.testId, config);
            }
        });
        this.isInitialized = true;
    }

    /**
     * Load existing assignments from storage
     */
    private loadAssignments(): void {
        try {
            const saved = localStorage.getItem(AB_ASSIGNMENTS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Record<string, string>;
                Object.entries(parsed).forEach(([testId, variantId]) => {
                    this.assignments.set(testId, variantId);
                });
            }
        } catch (e) {
            console.error('[ABTest] Error loading assignments:', e);
        }
    }

    /**
     * Save assignments to storage
     */
    private saveAssignments(): void {
        try {
            const obj: Record<string, string> = {};
            this.assignments.forEach((variantId, testId) => {
                obj[testId] = variantId;
            });
            localStorage.setItem(AB_ASSIGNMENTS_KEY, JSON.stringify(obj));
        } catch (e) {
            console.error('[ABTest] Error saving assignments:', e);
        }
    }

    /**
     * Get variant for a test (assigns if not already assigned)
     */
    getVariant(testId: string): ABTestVariant | null {
        const test = this.tests.get(testId);
        if (!test || !test.isActive) return null;

        // Check if already assigned
        let variantId = this.assignments.get(testId);

        if (!variantId) {
            // Assign based on weights
            variantId = this.assignVariant(test);
            this.assignments.set(testId, variantId);
            this.saveAssignments();

            // Track assignment
            this.trackAssignment(testId, variantId);
        }

        return test.variants.find(v => v.id === variantId) || null;
    }

    /**
     * Assign variant based on weights
     */
    private assignVariant(test: ABTestConfig): string {
        const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
        const random = Math.random() * totalWeight;

        let cumulative = 0;
        for (const variant of test.variants) {
            cumulative += variant.weight;
            if (random < cumulative) {
                return variant.id;
            }
        }

        // Fallback to first variant
        return test.variants[0]?.id || 'control';
    }

    /**
     * Track variant assignment
     */
    private trackAssignment(testId: string, variantId: string): void {
        if (!consentManager.hasConsentFor('analytics')) return;

        eventTracker.trackEvent({
            category: 'experiment',
            action: 'variant_assigned',
            label: `${testId}:${variantId}`,
            timestamp: Date.now(),
            sessionId: eventTracker.getSessionId(),
            metadata: { testId, variantId },
        });
    }

    /**
     * Track conversion for a test
     */
    trackConversion(testId: string, value?: number): void {
        const variantId = this.assignments.get(testId);
        if (!variantId) return;

        eventTracker.trackEvent({
            category: 'experiment',
            action: 'conversion',
            label: `${testId}:${variantId}`,
            value,
            timestamp: Date.now(),
            sessionId: eventTracker.getSessionId(),
            metadata: { testId, variantId },
        });
    }

    /**
     * Check if user is in specific variant
     */
    isInVariant(testId: string, variantId: string): boolean {
        return this.assignments.get(testId) === variantId;
    }

    /**
     * Get all current assignments
     */
    getAssignments(): Record<string, string> {
        const obj: Record<string, string> = {};
        this.assignments.forEach((variantId, testId) => {
            obj[testId] = variantId;
        });
        return obj;
    }

    /**
     * Force a specific variant (for testing/preview)
     */
    forceVariant(testId: string, variantId: string): void {
        this.assignments.set(testId, variantId);
        this.saveAssignments();
    }

    /**
     * Reset all assignments
     */
    resetAssignments(): void {
        this.assignments.clear();
        localStorage.removeItem(AB_ASSIGNMENTS_KEY);
    }

    /**
     * Get test configuration
     */
    getTest(testId: string): ABTestConfig | undefined {
        return this.tests.get(testId);
    }

    /**
     * Register a new test dynamically
     */
    registerTest(config: ABTestConfig): void {
        this.tests.set(config.testId, config);
    }
}

// Singleton instance
export const abTestManager = new ABTestManager();

/**
 * Default A/B Test Configurations
 */
export const DEFAULT_AB_TESTS: ABTestConfig[] = [
    {
        testId: 'hero_headline',
        testName: 'Hero Headline Test',
        variants: [
            { id: 'control', name: 'Original', weight: 50, isControl: true },
            { id: 'variant_a', name: 'Wellness Focus', weight: 25, isControl: false },
            { id: 'variant_b', name: 'Clinical Focus', weight: 25, isControl: false },
        ],
        isActive: true,
        startDate: Date.now(),
    },
    {
        testId: 'booking_cta',
        testName: 'Booking CTA Style',
        variants: [
            { id: 'control', name: 'Green Button', weight: 50, isControl: true },
            { id: 'variant_a', name: 'Gold Button', weight: 50, isControl: false },
        ],
        isActive: true,
        startDate: Date.now(),
    },
    {
        testId: 'social_proof_style',
        testName: 'Social Proof Display',
        variants: [
            { id: 'control', name: 'No Social Proof', weight: 33, isControl: true },
            { id: 'variant_a', name: 'Counter Style', weight: 34, isControl: false },
            { id: 'variant_b', name: 'Testimonial Style', weight: 33, isControl: false },
        ],
        isActive: true,
        startDate: Date.now(),
    },
];

// Export class for testing
export { ABTestManager };
