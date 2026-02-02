/**
 * User Segmentation
 * Automatically segments users based on behavior
 */

import { USER_SEGMENTS, LEAD_STATUS, LEAD_SCORING } from './config';
import { getVisitCount, getWithExpiry, setWithExpiry } from './utils';
import { eventTracker } from './eventTracker';
import type { UserSegment, UserProfile } from './types';

// Storage keys
const PROFILE_KEY = 'ayurvritta_user_profile';
const SEGMENTS_KEY = 'ayurvritta_segments';
const INTERESTS_KEY = 'ayurvritta_interests';

/**
 * UserSegmentation Class
 * Manages user segments based on behavior
 */
class UserSegmentation {
    private segments: Set<UserSegment> = new Set();
    private interests: Map<string, number> = new Map();
    private profile: Partial<UserProfile> = {};

    constructor() {
        this.loadData();
    }

    /**
     * Load saved data from localStorage
     */
    private loadData(): void {
        try {
            // Load segments
            const savedSegments = localStorage.getItem(SEGMENTS_KEY);
            if (savedSegments) {
                const parsed = JSON.parse(savedSegments) as UserSegment[];
                this.segments = new Set(parsed);
            }

            // Load interests
            const savedInterests = localStorage.getItem(INTERESTS_KEY);
            if (savedInterests) {
                const parsed = JSON.parse(savedInterests) as [string, number][];
                this.interests = new Map(parsed);
            }

            // Load profile
            const savedProfile = localStorage.getItem(PROFILE_KEY);
            if (savedProfile) {
                this.profile = JSON.parse(savedProfile);
            }
        } catch (e) {
            console.error('[Segmentation] Error loading data:', e);
        }
    }

    /**
     * Save data to localStorage
     */
    private saveData(): void {
        try {
            localStorage.setItem(SEGMENTS_KEY, JSON.stringify([...this.segments]));
            localStorage.setItem(INTERESTS_KEY, JSON.stringify([...this.interests.entries()]));
            localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
        } catch (e) {
            console.error('[Segmentation] Error saving data:', e);
        }
    }

    /**
     * Update segments based on current behavior
     */
    updateSegments(): UserSegment[] {
        const visitCount = getVisitCount();
        const leadScore = eventTracker.getLeadScore();
        const sessionData = eventTracker.getSessionData();

        // First time vs returning visitor
        if (visitCount <= 1) {
            this.addSegment(USER_SEGMENTS.FIRST_TIME_VISITOR);
            this.removeSegment(USER_SEGMENTS.RETURNING_VISITOR);
        } else {
            this.addSegment(USER_SEGMENTS.RETURNING_VISITOR);
            this.removeSegment(USER_SEGMENTS.FIRST_TIME_VISITOR);
        }

        // Service explorer - checked via page history
        const servicePageViews = this.getInterestScore('services');
        if (servicePageViews >= 3) {
            this.addSegment(USER_SEGMENTS.SERVICE_EXPLORER);
        }

        // Tool user
        const toolUsage = this.getInterestScore('tools');
        if (toolUsage >= 1) {
            this.addSegment(USER_SEGMENTS.TOOL_USER);
        }

        // High engagement
        if (sessionData.engagementTime > 120000) { // 2+ minutes
            this.addSegment(USER_SEGMENTS.HIGH_ENGAGEMENT);
        }

        // Lead status based segments
        if (leadScore >= LEAD_STATUS.HOT.min && !this.hasSegment(USER_SEGMENTS.CONVERTER)) {
            this.addSegment(USER_SEGMENTS.NEAR_CONVERTER);
        }

        this.saveData();
        return this.getSegments();
    }

    /**
     * Add a segment
     */
    addSegment(segment: UserSegment): void {
        this.segments.add(segment);
        this.saveData();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('segmentAdded', { detail: { segment } }));
    }

    /**
     * Remove a segment
     */
    removeSegment(segment: UserSegment): void {
        this.segments.delete(segment);
        this.saveData();
    }

    /**
     * Check if user has segment
     */
    hasSegment(segment: UserSegment): boolean {
        return this.segments.has(segment);
    }

    /**
     * Get all segments
     */
    getSegments(): UserSegment[] {
        return [...this.segments];
    }

    /**
     * Mark user as converted
     */
    markAsConverted(): void {
        this.addSegment(USER_SEGMENTS.CONVERTER);
        this.removeSegment(USER_SEGMENTS.NEAR_CONVERTER);
        this.saveData();
    }

    /**
     * Track interest in a topic
     */
    trackInterest(topic: string, weight: number = 1): void {
        const current = this.interests.get(topic) || 0;
        this.interests.set(topic, current + weight);
        this.saveData();
    }

    /**
     * Get interest score for a topic
     */
    getInterestScore(topic: string): number {
        return this.interests.get(topic) || 0;
    }

    /**
     * Get top interests
     */
    getTopInterests(limit: number = 5): string[] {
        const sorted = [...this.interests.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
        return sorted.map(([topic]) => topic);
    }

    /**
     * Update dosha preference
     */
    setDoshaPreference(dosha: string): void {
        this.profile.preferences = {
            ...this.profile.preferences,
            language: this.profile.preferences?.language || navigator.language,
            doshaType: dosha,
        };
        this.trackInterest(`dosha_${dosha.toLowerCase()}`, 5);
        this.saveData();
    }

    /**
     * Get user's dosha type
     */
    getDoshaPreference(): string | undefined {
        return this.profile.preferences?.doshaType;
    }

    /**
     * Get lead status based on score
     */
    getLeadStatus(): 'cold' | 'warm' | 'hot' | 'ready' {
        const score = eventTracker.getLeadScore();

        if (score >= LEAD_STATUS.READY.min) return 'ready';
        if (score >= LEAD_STATUS.HOT.min) return 'hot';
        if (score >= LEAD_STATUS.WARM.min) return 'warm';
        return 'cold';
    }

    /**
     * Get recommended content based on interests
     */
    getRecommendedContentTypes(): string[] {
        const interests = this.getTopInterests(3);
        const recommendations: string[] = [];

        // Map interests to content types
        interests.forEach(interest => {
            switch (interest) {
                case 'panchakarma':
                case 'detox':
                    recommendations.push('detox-services', 'wellness-programs');
                    break;
                case 'consultation':
                    recommendations.push('doctors', 'booking');
                    break;
                case 'tools':
                case 'prakriti':
                    recommendations.push('health-tools', 'dosha-content');
                    break;
                case 'services':
                    recommendations.push('service-comparison', 'testimonials');
                    break;
                default:
                    recommendations.push(interest);
            }
        });

        return [...new Set(recommendations)];
    }

    /**
     * Check if user should see personalized content
     */
    shouldShowPersonalization(): boolean {
        // Show personalization for returning visitors with some interests
        return this.hasSegment(USER_SEGMENTS.RETURNING_VISITOR) &&
            this.interests.size > 0;
    }

    /**
     * Get segment-based CTA recommendation
     */
    getRecommendedCTA(): { text: string; action: string } {
        if (this.hasSegment(USER_SEGMENTS.NEAR_CONVERTER)) {
            return { text: 'Complete Your Booking', action: '/booking' };
        }

        if (this.hasSegment(USER_SEGMENTS.SERVICE_EXPLORER)) {
            return { text: 'Compare Our Services', action: '/services' };
        }

        if (this.hasSegment(USER_SEGMENTS.TOOL_USER)) {
            return { text: 'See Services for Your Dosha', action: '/services' };
        }

        if (this.hasSegment(USER_SEGMENTS.RETURNING_VISITOR)) {
            return { text: 'Book Your Visit Today', action: '/booking' };
        }

        return { text: 'Discover Ayurveda', action: '/about' };
    }

    /**
     * Export profile for GDPR data portability
     */
    exportProfile(): string {
        return JSON.stringify({
            segments: this.getSegments(),
            interests: Object.fromEntries(this.interests),
            leadStatus: this.getLeadStatus(),
            profile: this.profile,
            exportDate: new Date().toISOString(),
        }, null, 2);
    }

    /**
     * Clear all user data
     */
    clearData(): void {
        this.segments.clear();
        this.interests.clear();
        this.profile = {};
        localStorage.removeItem(SEGMENTS_KEY);
        localStorage.removeItem(INTERESTS_KEY);
        localStorage.removeItem(PROFILE_KEY);
    }
}

// Singleton instance
export const userSegmentation = new UserSegmentation();

// Export class for testing
export { UserSegmentation };
