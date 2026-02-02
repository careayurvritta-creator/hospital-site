/**
 * Analytics Index
 * Main entry point for the analytics system
 */

// Export all modules
export { consentManager, ConsentManager } from './consentManager';
export { eventTracker, EventTracker } from './eventTracker';
export { performanceMonitor, PerformanceMonitor } from './performanceMonitor';
export { userSegmentation, UserSegmentation } from './userSegmentation';
export { bookingFunnelTracker, BookingFunnelTracker, BOOKING_STEPS } from './bookingFunnelTracker';
export { chatBotAnalytics, ChatBotAnalytics } from './chatBotAnalytics';

// Phase 3: A/B Testing and Content
export { abTestManager, ABTestManager, DEFAULT_AB_TESTS } from './abTestManager';
export { contentPerformanceTracker, ContentPerformanceTracker } from './contentPerformanceTracker';

// Phase 4: AI-Powered Insights
export { recommendationEngine, RecommendationEngine } from './recommendationEngine';
export type { ServiceInfo } from './recommendationEngine';
export { sentimentAnalyzer, SentimentAnalyzer } from './sentimentAnalyzer';
export { reportGenerator, ReportGenerator } from './reportGenerator';

// Phase 5: Governance
export { dataGovernance, DataGovernance } from './dataGovernance';

// Mobile Analytics (Phase M1-M5)
export { mobileDeviceDetector, MobileDeviceDetector } from './mobileDeviceDetector';
export type { MobileDeviceInfo, DeviceType, Platform, ConnectionType } from './mobileDeviceDetector';
export { touchTracker, TouchTracker } from './touchTracker';
export { mobileScrollTracker, MobileScrollTracker } from './mobileScrollTracker';

// Export configuration
export * from './config';

// Export types
export * from './types';

// Export utilities
export * from './utils';

// Import for initialization
import { consentManager } from './consentManager';
import { eventTracker } from './eventTracker';
import { performanceMonitor } from './performanceMonitor';
import { userSegmentation } from './userSegmentation';
import { GA4_MEASUREMENT_ID, CLARITY_PROJECT_ID, ANALYTICS_ENV } from './config';

/**
 * Initialize all analytics services
 * Call this once when the app loads
 */
export function initializeAnalytics(): void {
    // Check if consent has been given for analytics
    if (consentManager.hasConsentFor('analytics')) {
        startTracking();
    }

    // Listen for consent changes
    consentManager.subscribe((state) => {
        if (state.analytics) {
            startTracking();
        }
    });

    if (ANALYTICS_ENV.debugMode) {
        console.log('[Analytics] System initialized');
    }
}

/**
 * Start tracking after consent is given
 */
function startTracking(): void {
    eventTracker.initialize();
    performanceMonitor.initialize();
    userSegmentation.updateSegments();
}

/**
 * Load Google Analytics 4 script
 */
export function loadGA4(): void {
    if (!consentManager.hasConsentFor('analytics')) return;
    if (GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('[Analytics] GA4 Measurement ID not configured');
        return;
    }

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());

    // Configure with consent mode
    gtag('config', GA4_MEASUREMENT_ID, {
        anonymize_ip: true,
        send_page_view: false, // We'll send manually
    });

    // Set default consent state
    gtag('consent', 'default', {
        analytics_storage: consentManager.hasConsentFor('analytics') ? 'granted' : 'denied',
        ad_storage: consentManager.hasConsentFor('marketing') ? 'granted' : 'denied',
        personalization_storage: consentManager.hasConsentFor('personalization') ? 'granted' : 'denied',
    });

    if (ANALYTICS_ENV.debugMode) {
        console.log('[Analytics] GA4 loaded');
    }
}

/**
 * Load Microsoft Clarity script
 */
export function loadClarity(): void {
    if (!consentManager.hasConsentFor('analytics')) return;
    if (CLARITY_PROJECT_ID === 'XXXXXXXXXX') {
        console.warn('[Analytics] Clarity Project ID not configured');
        return;
    }

    (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r);
        t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

    if (ANALYTICS_ENV.debugMode) {
        console.log('[Analytics] Clarity loaded');
    }
}

/**
 * Track page view with routing
 */
export function trackPageView(path: string, title?: string): void {
    eventTracker.trackPageView(path, title);

    // Update segments on each page view
    userSegmentation.updateSegments();

    // Track interests based on page
    if (path.startsWith('/services')) {
        userSegmentation.trackInterest('services');
    } else if (path === '/tools') {
        userSegmentation.trackInterest('tools');
    } else if (path === '/booking') {
        userSegmentation.trackInterest('booking');
    } else if (path === '/programs') {
        userSegmentation.trackInterest('programs');
    }
}

/**
 * Cleanup analytics (call on app unmount if needed)
 */
export function cleanupAnalytics(): void {
    eventTracker.destroy();
    performanceMonitor.destroy();
}
