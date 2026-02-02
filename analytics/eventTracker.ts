/**
 * Event Tracker
 * Central event tracking system for all analytics events
 */

import {
    EVENT_CATEGORIES,
    ANALYTICS_ENV,
    LEAD_SCORING,
    SESSION_CONFIG,
} from './config';
import { consentManager } from './consentManager';
import {
    generateId,
    generateSessionId,
    getOrCreateVisitorId,
    createInitialSessionData,
    getPageNameFromPath,
    sanitizePII,
    debounce,
    throttle,
    calculateScrollDepth,
    getElementPath,
} from './utils';
import type {
    AnalyticsEvent,
    PageViewEvent,
    ScrollEvent,
    ClickEvent,
    FormEvent,
    ChatBotEvent,
    ToolEvent,
    ErrorEvent,
    PerformanceEvent,
    SessionData,
} from './types';

// Session storage key
const SESSION_STORAGE_KEY = 'ayurvritta_session';
const LEAD_SCORE_KEY = 'ayurvritta_lead_score';

/**
 * EventTracker Class
 * Handles all event tracking with consent awareness
 */
class EventTracker {
    private sessionId: string;
    private visitorId: string;
    private sessionData: SessionData;
    private eventQueue: AnalyticsEvent[] = [];
    private maxScrollDepth: number = 0;
    private pageEnterTime: number = Date.now();
    private isInitialized: boolean = false;
    private engagementTimer: number | null = null;
    private lastActivityTime: number = Date.now();

    constructor() {
        this.visitorId = getOrCreateVisitorId();
        this.sessionId = this.getOrCreateSession();
        this.sessionData = this.loadSessionData();
    }

    /**
     * Initialize the tracker (call after consent is given)
     */
    initialize(): void {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.startEngagementTracking();
        this.isInitialized = true;

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] EventTracker initialized', {
                sessionId: this.sessionId,
                visitorId: this.visitorId,
            });
        }
    }

    /**
     * Get or create session ID
     */
    private getOrCreateSession(): string {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);

        if (stored) {
            try {
                const session = JSON.parse(stored);
                // Check if session is still valid
                if (Date.now() - session.lastActivity < SESSION_CONFIG.sessionTimeout) {
                    return session.id;
                }
            } catch (e) {
                // Invalid session data
            }
        }

        const newSessionId = generateSessionId();
        this.saveSession(newSessionId);
        return newSessionId;
    }

    /**
     * Save session to sessionStorage
     */
    private saveSession(sessionId: string): void {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            id: sessionId,
            lastActivity: Date.now(),
        }));
    }

    /**
     * Load session data
     */
    private loadSessionData(): SessionData {
        return createInitialSessionData(this.sessionId);
    }

    /**
     * Check if tracking is allowed
     */
    private canTrack(): boolean {
        return consentManager.hasConsentFor('analytics');
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Scroll tracking
        window.addEventListener('scroll', throttle(() => {
            this.trackScrollDepth();
        }, 500));

        // Click tracking
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Visibility change (tab focus)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.onPageExit();
        });

        // Error tracking
        window.addEventListener('error', (e) => {
            this.trackError({
                errorType: 'JavaScript Error',
                errorMessage: e.message,
                errorStack: e.error?.stack,
                severity: 'medium',
                path: window.location.pathname,
                timestamp: Date.now(),
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError({
                errorType: 'Unhandled Promise Rejection',
                errorMessage: String(e.reason),
                severity: 'medium',
                path: window.location.pathname,
                timestamp: Date.now(),
            });
        });
    }

    /**
     * Start engagement time tracking
     */
    private startEngagementTracking(): void {
        this.engagementTimer = window.setInterval(() => {
            if (!document.hidden && this.canTrack()) {
                this.sessionData.engagementTime += 1000;
                this.lastActivityTime = Date.now();
            }
        }, 1000);
    }

    /**
     * Track scroll depth
     */
    private trackScrollDepth(): void {
        if (!this.canTrack()) return;

        const depth = calculateScrollDepth();

        if (depth > this.maxScrollDepth) {
            const previousMax = this.maxScrollDepth;
            this.maxScrollDepth = depth;

            // Check threshold crossings
            SESSION_CONFIG.scrollDepthThresholds.forEach(threshold => {
                if (depth >= threshold && previousMax < threshold) {
                    this.trackEvent({
                        category: EVENT_CATEGORIES.ENGAGEMENT,
                        action: 'scroll_depth',
                        label: `${threshold}%`,
                        value: threshold,
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                    });

                    // Add lead score for high scroll
                    if (threshold >= 75) {
                        this.addLeadScore(LEAD_SCORING.highScrollDepth);
                    }
                }
            });
        }
    }

    /**
     * Track click events
     */
    private trackClick(e: MouseEvent): void {
        if (!this.canTrack()) return;

        const target = e.target as HTMLElement;
        if (!target) return;

        // Get element info
        const elementId = target.id || undefined;
        const elementClass = target.className || undefined;
        const elementText = target.textContent?.slice(0, 100) || undefined;
        const elementType = target.tagName.toLowerCase();

        // Only track meaningful clicks
        const trackableElements = ['a', 'button', 'input', 'select', 'label'];
        const isTrackable = trackableElements.includes(elementType) ||
            target.hasAttribute('data-track') ||
            target.closest('[data-track]');

        if (!isTrackable) return;

        const clickEvent: ClickEvent = {
            elementId,
            elementClass: typeof elementClass === 'string' ? elementClass : undefined,
            elementText: elementText ? sanitizePII(elementText) : undefined,
            elementType,
            path: window.location.pathname,
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
        };

        this.sendToGA('click', clickEvent);

        // Track CTA clicks
        if (target.closest('[data-cta]') || target.closest('.cta-button')) {
            this.trackEvent({
                category: EVENT_CATEGORIES.CONVERSION,
                action: 'cta_click',
                label: elementText || elementId || 'unknown',
                timestamp: Date.now(),
                sessionId: this.sessionId,
            });
        }
    }

    /**
     * Track page view
     */
    trackPageView(path: string, title?: string): void {
        if (!this.canTrack()) return;

        const previousPath = sessionStorage.getItem('ayurvritta_previous_page') || '';

        const pageView: PageViewEvent = {
            path,
            title: title || document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            previousPage: previousPath || undefined,
        };

        // Reset scroll tracking for new page
        this.maxScrollDepth = 0;
        this.pageEnterTime = Date.now();

        // Update session data
        this.sessionData.pageViews++;
        this.saveSession(this.sessionId);

        // Store current page as previous
        sessionStorage.setItem('ayurvritta_previous_page', path);

        // Send to GA4
        this.sendToGA('page_view', {
            page_path: path,
            page_title: pageView.title,
            page_location: window.location.href,
        });

        // Add lead score
        this.addLeadScore(LEAD_SCORING.pageView);

        // Special scoring for service pages
        if (path.startsWith('/services/')) {
            this.addLeadScore(LEAD_SCORING.serviceDetailView);
        }

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] Page view tracked:', pageView);
        }
    }

    /**
     * Track generic event
     */
    trackEvent(event: AnalyticsEvent): void {
        if (!this.canTrack()) return;

        this.sessionData.events++;

        this.sendToGA('event', {
            event_category: event.category,
            event_action: event.action,
            event_label: event.label,
            value: event.value,
            ...event.metadata,
        });

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] Event tracked:', event);
        }
    }

    /**
     * Track form events
     */
    trackFormEvent(event: FormEvent): void {
        if (!this.canTrack()) return;

        // Sanitize any field values
        if (event.fieldValue) {
            event.fieldValue = sanitizePII(event.fieldValue);
        }

        this.sendToGA('form_interaction', {
            form_id: event.formId,
            form_name: event.formName,
            form_action: event.action,
            field_name: event.fieldName,
            time_spent: event.timeSpent,
        });

        // Track conversion funnel
        if (event.formName === 'booking') {
            if (event.action === 'start') {
                this.addLeadScore(LEAD_SCORING.bookingFormStarted);
            } else if (event.action === 'submit') {
                this.addLeadScore(LEAD_SCORING.bookingCompleted);
            }
        }

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] Form event tracked:', event);
        }
    }

    /**
     * Track chatbot events
     */
    trackChatBotEvent(event: ChatBotEvent): void {
        if (!this.canTrack()) return;

        // Sanitize message content
        if (event.messageContent) {
            event.messageContent = sanitizePII(event.messageContent);
        }

        this.sendToGA('chatbot', {
            chatbot_action: event.action,
            conversation_id: event.conversationId,
            message_index: event.messageIndex,
            language: event.language,
            response_time: event.responseTime,
            sentiment: event.sentiment,
            intent: event.intent,
        });

        // Add lead score for chatbot engagement
        if (event.action === 'message_sent') {
            this.addLeadScore(LEAD_SCORING.chatbotConversation);
        }

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] ChatBot event tracked:', event);
        }
    }

    /**
     * Track tool usage
     */
    trackToolEvent(event: ToolEvent): void {
        if (!this.canTrack()) return;

        this.sendToGA('tool_usage', {
            tool_name: event.toolName,
            tool_action: event.action,
            step: event.step,
            total_steps: event.totalSteps,
            time_spent: event.timeSpent,
        });

        // Add lead score for tool completion
        if (event.action === 'complete') {
            this.addLeadScore(LEAD_SCORING.toolCompletion);
        }

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] Tool event tracked:', event);
        }
    }

    /**
     * Track errors
     */
    trackError(event: ErrorEvent): void {
        // Error tracking doesn't require consent
        this.sendToGA('error', {
            error_type: event.errorType,
            error_message: event.errorMessage?.slice(0, 500),
            error_severity: event.severity,
            page_path: event.path,
            component: event.componentName,
        });

        if (ANALYTICS_ENV.debugMode) {
            console.error('[Analytics] Error tracked:', event);
        }
    }

    /**
     * Track performance metrics
     */
    trackPerformance(event: PerformanceEvent): void {
        if (!this.canTrack()) return;

        this.sendToGA('performance', {
            metric_name: event.metric,
            metric_value: event.value,
            metric_rating: event.rating,
            page_path: event.path,
        });

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Analytics] Performance tracked:', event);
        }
    }

    /**
     * Track WhatsApp click
     */
    trackWhatsAppClick(source: string): void {
        this.trackEvent({
            category: EVENT_CATEGORIES.INTERACTION,
            action: 'whatsapp_click',
            label: source,
            timestamp: Date.now(),
            sessionId: this.sessionId,
        });
    }

    /**
     * Track social share
     */
    trackShare(platform: string, content: string): void {
        this.trackEvent({
            category: EVENT_CATEGORIES.ENGAGEMENT,
            action: 'share',
            label: `${platform}:${content}`,
            timestamp: Date.now(),
            sessionId: this.sessionId,
        });
    }

    /**
     * Send event to Google Analytics
     */
    private sendToGA(eventName: string, params: Record<string, any>): void {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, {
                ...params,
                session_id: this.sessionId,
                visitor_id: this.visitorId,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Add to lead score
     */
    private addLeadScore(points: number): void {
        const currentScore = parseInt(localStorage.getItem(LEAD_SCORE_KEY) || '0', 10);
        const newScore = currentScore + points;
        localStorage.setItem(LEAD_SCORE_KEY, newScore.toString());

        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('leadScoreUpdated', {
            detail: { score: newScore, added: points },
        }));
    }

    /**
     * Get current lead score
     */
    getLeadScore(): number {
        return parseInt(localStorage.getItem(LEAD_SCORE_KEY) || '0', 10);
    }

    /**
     * Called when page becomes hidden
     */
    private onPageHidden(): void {
        // Pause engagement tracking
        if (this.engagementTimer) {
            clearInterval(this.engagementTimer);
            this.engagementTimer = null;
        }
    }

    /**
     * Called when page becomes visible
     */
    private onPageVisible(): void {
        // Resume engagement tracking
        if (!this.engagementTimer) {
            this.startEngagementTracking();
        }
    }

    /**
     * Called when user exits the page
     */
    private onPageExit(): void {
        if (!this.canTrack()) return;

        const timeOnPage = Date.now() - this.pageEnterTime;

        // Send page exit event with timing
        this.sendToGA('page_exit', {
            page_path: window.location.pathname,
            time_on_page: timeOnPage,
            max_scroll_depth: this.maxScrollDepth,
            engagement_time: this.sessionData.engagementTime,
        });

        // Add lead score for long session
        if (timeOnPage > 60000) { // > 1 minute
            this.addLeadScore(LEAD_SCORING.longSessionTime);
        }
    }

    /**
     * Get session data
     */
    getSessionData(): SessionData {
        return { ...this.sessionData };
    }

    /**
     * Get visitor ID
     */
    getVisitorId(): string {
        return this.visitorId;
    }

    /**
     * Get session ID
     */
    getSessionId(): string {
        return this.sessionId;
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.engagementTimer) {
            clearInterval(this.engagementTimer);
        }
        this.isInitialized = false;
    }
}

// Singleton instance
export const eventTracker = new EventTracker();

// Export class for testing
export { EventTracker };
