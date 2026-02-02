/**
 * AnalyticsProvider Component
 * React context provider for analytics functionality
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
    initializeAnalytics,
    loadGA4,
    loadClarity,
    trackPageView,
    consentManager,
    eventTracker,
    userSegmentation,
    cleanupAnalytics,
} from '../analytics';
import type { ConsentState, UserSegment, SessionData } from '../analytics';

// Analytics Context Type
interface AnalyticsContextType {
    // Consent
    hasConsented: boolean;
    consent: ConsentState;
    updateConsent: (updates: Partial<ConsentState>) => void;

    // Session Info
    sessionId: string;
    visitorId: string;
    sessionData: SessionData | null;

    // User Segments
    segments: UserSegment[];
    leadScore: number;
    leadStatus: 'cold' | 'warm' | 'hot' | 'ready';

    // Tracking Methods
    trackEvent: (category: string, action: string, label?: string, value?: number) => void;
    trackFormEvent: (formName: string, action: string, fieldName?: string) => void;
    trackToolEvent: (toolName: string, action: string, step?: number, result?: any) => void;
    trackChatBotMessage: (message: string, isUser: boolean) => void;
    trackWhatsAppClick: (source: string) => void;
    trackShare: (platform: string, content: string) => void;

    // User Info
    setDoshaPreference: (dosha: string) => void;
    getDoshaPreference: () => string | undefined;
    getTopInterests: () => string[];
    getRecommendedCTA: () => { text: string; action: string };
}

// Default context value
const defaultContext: AnalyticsContextType = {
    hasConsented: false,
    consent: { essential: true, analytics: false, marketing: false, personalization: false, timestamp: 0, version: '' },
    updateConsent: () => { },
    sessionId: '',
    visitorId: '',
    sessionData: null,
    segments: [],
    leadScore: 0,
    leadStatus: 'cold',
    trackEvent: () => { },
    trackFormEvent: () => { },
    trackToolEvent: () => { },
    trackChatBotMessage: () => { },
    trackWhatsAppClick: () => { },
    trackShare: () => { },
    setDoshaPreference: () => { },
    getDoshaPreference: () => undefined,
    getTopInterests: () => [],
    getRecommendedCTA: () => ({ text: 'Discover Ayurveda', action: '/about' }),
};

// Create Context
const AnalyticsContext = createContext<AnalyticsContextType>(defaultContext);

// Provider Props
interface AnalyticsProviderProps {
    children: ReactNode;
}

/**
 * Analytics Provider Component
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
    const location = useLocation();
    const [consent, setConsent] = useState<ConsentState>(consentManager.getConsent());
    const [segments, setSegments] = useState<UserSegment[]>([]);
    const [leadScore, setLeadScore] = useState(0);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [chatConversationId] = useState(() => `chat_${Date.now()}`);
    const [chatMessageIndex, setChatMessageIndex] = useState(0);

    // Initialize analytics on mount
    useEffect(() => {
        initializeAnalytics();

        // Load third-party scripts if consent is given
        if (consent.analytics) {
            loadGA4();
            loadClarity();
        }

        // Subscribe to consent changes
        const unsubscribe = consentManager.subscribe((newConsent) => {
            setConsent(newConsent);
            if (newConsent.analytics) {
                loadGA4();
                loadClarity();
            }
        });

        // Listen for lead score updates
        const handleLeadScoreUpdate = (e: CustomEvent) => {
            setLeadScore(e.detail.score);
        };
        window.addEventListener('leadScoreUpdated', handleLeadScoreUpdate as EventListener);

        // Listen for segment updates
        const handleSegmentUpdate = () => {
            setSegments(userSegmentation.getSegments());
        };
        window.addEventListener('segmentAdded', handleSegmentUpdate);

        // Initial state
        setSegments(userSegmentation.getSegments());
        setLeadScore(eventTracker.getLeadScore());
        setSessionData(eventTracker.getSessionData());

        return () => {
            unsubscribe();
            window.removeEventListener('leadScoreUpdated', handleLeadScoreUpdate as EventListener);
            window.removeEventListener('segmentAdded', handleSegmentUpdate);
            cleanupAnalytics();
        };
    }, []);

    // Track page views on route change
    useEffect(() => {
        const path = location.pathname;
        const title = document.title;

        // Track page view
        trackPageView(path, title);

        // Update segments
        setSegments(userSegmentation.getSegments());
    }, [location.pathname]);

    // Context value
    const value: AnalyticsContextType = {
        hasConsented: consentManager.hasConsented(),
        consent,
        updateConsent: (updates) => {
            consentManager.updateConsent(updates);
        },

        sessionId: eventTracker.getSessionId(),
        visitorId: eventTracker.getVisitorId(),
        sessionData,

        segments,
        leadScore,
        leadStatus: userSegmentation.getLeadStatus(),

        trackEvent: (category, action, label, value) => {
            eventTracker.trackEvent({
                category: category as any,
                action,
                label,
                value,
                timestamp: Date.now(),
                sessionId: eventTracker.getSessionId(),
            });
        },

        trackFormEvent: (formName, action, fieldName) => {
            eventTracker.trackFormEvent({
                formId: formName,
                formName,
                action: action as any,
                fieldName,
                timestamp: Date.now(),
            });
        },

        trackToolEvent: (toolName, action, step, result) => {
            eventTracker.trackToolEvent({
                toolName,
                action: action as any,
                step,
                result,
                timestamp: Date.now(),
            });
        },

        trackChatBotMessage: (message, isUser) => {
            const currentIndex = chatMessageIndex;
            setChatMessageIndex(prev => prev + 1);

            eventTracker.trackChatBotEvent({
                action: isUser ? 'message_sent' : 'message_received',
                messageContent: message,
                messageLength: message.length,
                conversationId: chatConversationId,
                messageIndex: currentIndex,
                language: navigator.language,
                timestamp: Date.now(),
            });
        },

        trackWhatsAppClick: (source) => {
            eventTracker.trackWhatsAppClick(source);
        },

        trackShare: (platform, content) => {
            eventTracker.trackShare(platform, content);
        },

        setDoshaPreference: (dosha) => {
            userSegmentation.setDoshaPreference(dosha);
        },

        getDoshaPreference: () => userSegmentation.getDoshaPreference(),

        getTopInterests: () => userSegmentation.getTopInterests(),

        getRecommendedCTA: () => userSegmentation.getRecommendedCTA(),
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};

/**
 * Hook to use analytics context
 */
export const useAnalytics = (): AnalyticsContextType => {
    const context = useContext(AnalyticsContext);

    if (!context) {
        console.warn('useAnalytics must be used within an AnalyticsProvider');
        return defaultContext;
    }

    return context;
};

export default AnalyticsProvider;
