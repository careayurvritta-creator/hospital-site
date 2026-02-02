/**
 * Personalization Hook
 * Provides personalized content based on user behavior
 */

import { useState, useEffect, useCallback } from 'react';
import { userSegmentation, USER_SEGMENTS } from '../analytics';
import type { UserSegment } from '../analytics';

// Personalization content types
interface PersonalizedContent {
    heroHeadline: string;
    heroSubheadline: string;
    ctaText: string;
    ctaLink: string;
    featuredServices: string[];
    welcomeMessage?: string;
    specialOffer?: {
        title: string;
        description: string;
        discount?: string;
    };
}

// Default content for new visitors
const DEFAULT_CONTENT: PersonalizedContent = {
    heroHeadline: 'Discover the Ancient Wisdom of Ayurveda',
    heroSubheadline: 'Experience holistic healing at Ayurvritta',
    ctaText: 'Explore Our Services',
    ctaLink: '/services',
    featuredServices: ['panchakarma', 'consultation', 'wellness'],
};

// Content variations based on segments
const SEGMENT_CONTENT: Partial<Record<UserSegment, Partial<PersonalizedContent>>> = {
    [USER_SEGMENTS.RETURNING_VISITOR]: {
        heroHeadline: 'Welcome Back to Ayurvritta',
        heroSubheadline: 'Continue your wellness journey with us',
        ctaText: 'Book Your Next Visit',
        ctaLink: '/booking',
        welcomeMessage: 'Great to see you again!',
    },
    [USER_SEGMENTS.SERVICE_EXPLORER]: {
        heroHeadline: 'Find the Perfect Treatment for You',
        heroSubheadline: 'Compare our services and find your ideal healing path',
        ctaText: 'Compare Services',
        ctaLink: '/services',
        featuredServices: ['panchakarma', 'stress-relief', 'detox'],
    },
    [USER_SEGMENTS.TOOL_USER]: {
        heroHeadline: 'Treatments Tailored to Your Dosha',
        heroSubheadline: 'Based on your Prakriti assessment',
        ctaText: 'View Recommended Services',
        ctaLink: '/services',
    },
    [USER_SEGMENTS.NEAR_CONVERTER]: {
        heroHeadline: 'Ready to Start Your Healing Journey?',
        heroSubheadline: 'Complete your booking today',
        ctaText: 'Complete Booking',
        ctaLink: '/booking',
        specialOffer: {
            title: 'Special Offer',
            description: 'Book today and get a free consultation',
        },
    },
    [USER_SEGMENTS.HIGH_ENGAGEMENT]: {
        heroHeadline: 'Thank You for Exploring Ayurvritta',
        heroSubheadline: "We'd love to welcome you in person",
        ctaText: 'Schedule a Visit',
        ctaLink: '/booking',
    },
};

// Dosha-specific content
const DOSHA_CONTENT: Record<string, Partial<PersonalizedContent>> = {
    vata: {
        heroHeadline: 'Balance Your Vata with Grounding Therapies',
        heroSubheadline: 'Calming treatments specially selected for Vata constitution',
        featuredServices: ['abhyanga', 'shirodhara', 'warm-oil-therapy'],
    },
    pitta: {
        heroHeadline: 'Cool and Calm Your Pitta',
        heroSubheadline: 'Cooling therapies to balance your fiery nature',
        featuredServices: ['cooling-massage', 'detox', 'stress-relief'],
    },
    kapha: {
        heroHeadline: 'Energize Your Kapha Constitution',
        heroSubheadline: 'Invigorating treatments to boost your energy',
        featuredServices: ['udvartana', 'detox', 'weight-management'],
    },
};

/**
 * usePersonalization Hook
 */
export function usePersonalization() {
    const [content, setContent] = useState<PersonalizedContent>(DEFAULT_CONTENT);
    const [isPersonalized, setIsPersonalized] = useState(false);

    // Build personalized content
    const buildContent = useCallback(() => {
        // Start with defaults
        let personalizedContent: PersonalizedContent = { ...DEFAULT_CONTENT };

        // Check if personalization should be applied
        if (!userSegmentation.shouldShowPersonalization()) {
            return personalizedContent;
        }

        // Get user's segments
        const segments = userSegmentation.getSegments();

        // Apply segment-based content (priority order)
        const priorityOrder: UserSegment[] = [
            USER_SEGMENTS.NEAR_CONVERTER,
            USER_SEGMENTS.TOOL_USER,
            USER_SEGMENTS.SERVICE_EXPLORER,
            USER_SEGMENTS.HIGH_ENGAGEMENT,
            USER_SEGMENTS.RETURNING_VISITOR,
        ];

        for (const segment of priorityOrder) {
            if (segments.includes(segment) && SEGMENT_CONTENT[segment]) {
                personalizedContent = {
                    ...personalizedContent,
                    ...SEGMENT_CONTENT[segment],
                };
                break; // Only apply first matching segment
            }
        }

        // Apply dosha-specific content if available
        const dosha = userSegmentation.getDoshaPreference();
        if (dosha && DOSHA_CONTENT[dosha.toLowerCase()]) {
            personalizedContent = {
                ...personalizedContent,
                ...DOSHA_CONTENT[dosha.toLowerCase()],
            };
        }

        return personalizedContent;
    }, []);

    // Update content on mount and when segments change
    useEffect(() => {
        const newContent = buildContent();
        setContent(newContent);
        setIsPersonalized(userSegmentation.shouldShowPersonalization());

        // Listen for segment updates
        const handleSegmentUpdate = () => {
            const updatedContent = buildContent();
            setContent(updatedContent);
            setIsPersonalized(true);
        };

        window.addEventListener('segmentAdded', handleSegmentUpdate);
        return () => window.removeEventListener('segmentAdded', handleSegmentUpdate);
    }, [buildContent]);

    // Get time-based greeting
    const getTimeBasedGreeting = (): string => {
        const hour = new Date().getHours();

        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 21) return 'Good evening';
        return 'Namaste';
    };

    // Get recommended CTA
    const getRecommendedCTA = () => {
        return userSegmentation.getRecommendedCTA();
    };

    // Get top interests
    const getTopInterests = (): string[] => {
        return userSegmentation.getTopInterests();
    };

    return {
        content,
        isPersonalized,
        getTimeBasedGreeting,
        getRecommendedCTA,
        getTopInterests,
    };
}

export default usePersonalization;
