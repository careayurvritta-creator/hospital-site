/**
 * Exit Intent Detector Hook
 * Detects when user is about to leave the page
 */

import { useState, useEffect, useCallback } from 'react';
import { eventTracker } from '../analytics';

interface ExitIntentOptions {
    threshold?: number; // pixels from top to trigger
    timeout?: number; // delay before showing again
    triggerOnMobile?: boolean;
    onExitIntent?: () => void;
}

interface ExitIntentState {
    hasTriggered: boolean;
    isVisible: boolean;
    triggerCount: number;
}

/**
 * useExitIntent Hook
 */
export function useExitIntent(options: ExitIntentOptions = {}) {
    const {
        threshold = 20,
        timeout = 60000, // 1 minute
        triggerOnMobile = false,
        onExitIntent,
    } = options;

    const [state, setState] = useState<ExitIntentState>({
        hasTriggered: false,
        isVisible: false,
        triggerCount: 0,
    });

    // Check if already shown recently
    const getLastTriggerTime = (): number => {
        const stored = localStorage.getItem('ayurvritta_exit_intent_time');
        return stored ? parseInt(stored, 10) : 0;
    };

    const setLastTriggerTime = (): void => {
        localStorage.setItem('ayurvritta_exit_intent_time', Date.now().toString());
    };

    // Check if on mobile
    const isMobile = (): boolean => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Handle exit intent detection
    const handleMouseLeave = useCallback((e: MouseEvent) => {
        // Only trigger if mouse leaves through top of viewport
        if (e.clientY > threshold) return;

        // Don't trigger if already visible
        if (state.isVisible) return;

        // Check timeout
        const lastTrigger = getLastTriggerTime();
        if (Date.now() - lastTrigger < timeout) return;

        // Trigger exit intent
        setState(prev => ({
            hasTriggered: true,
            isVisible: true,
            triggerCount: prev.triggerCount + 1,
        }));

        setLastTriggerTime();

        // Track event
        eventTracker.trackEvent({
            category: 'engagement',
            action: 'exit_intent_detected',
            label: window.location.pathname,
            timestamp: Date.now(),
            sessionId: '',
        });

        onExitIntent?.();
    }, [threshold, timeout, state.isVisible, onExitIntent]);

    // Handle mobile back button / tab switch
    const handleVisibilityChange = useCallback(() => {
        if (!triggerOnMobile) return;
        if (!isMobile()) return;
        if (document.visibilityState !== 'hidden') return;

        // Check timeout
        const lastTrigger = getLastTriggerTime();
        if (Date.now() - lastTrigger < timeout) return;

        // Track but don't show (page is hidden)
        eventTracker.trackEvent({
            category: 'engagement',
            action: 'exit_intent_mobile',
            label: window.location.pathname,
            timestamp: Date.now(),
            sessionId: '',
        });
    }, [triggerOnMobile, timeout]);

    // Setup listeners
    useEffect(() => {
        // Skip on mobile if not enabled
        if (isMobile() && !triggerOnMobile) return;

        // Desktop: mouse leave detection
        if (!isMobile()) {
            document.addEventListener('mouseleave', handleMouseLeave);
        } else {
            // Mobile: visibility change
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleMouseLeave, handleVisibilityChange, triggerOnMobile]);

    // Close handler
    const close = useCallback(() => {
        setState(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Reset handler (for testing)
    const reset = useCallback(() => {
        setState({ hasTriggered: false, isVisible: false, triggerCount: 0 });
        localStorage.removeItem('ayurvritta_exit_intent_time');
    }, []);

    return {
        ...state,
        close,
        reset,
    };
}

export default useExitIntent;
