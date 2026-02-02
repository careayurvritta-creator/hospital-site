/**
 * Analytics Types
 * Type definitions for the analytics system
 */

import { EventCategory, UserSegment, ConsentType, ErrorSeverity } from './config';

// Base Event Interface
export interface AnalyticsEvent {
    category: EventCategory;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
    sessionId: string;
    userId?: string;
    metadata?: Record<string, any>;
}

// Page View Event
export interface PageViewEvent {
    path: string;
    title: string;
    referrer: string;
    timestamp: number;
    sessionId: string;
    previousPage?: string;
    loadTime?: number;
}

// Scroll Event
export interface ScrollEvent {
    path: string;
    depth: number;
    maxDepth: number;
    timestamp: number;
}

// Click Event
export interface ClickEvent {
    elementId?: string;
    elementClass?: string;
    elementText?: string;
    elementType: string;
    path: string;
    x: number;
    y: number;
    timestamp: number;
}

// Form Event
export interface FormEvent {
    formId: string;
    formName: string;
    action: 'start' | 'field_focus' | 'field_blur' | 'field_error' | 'submit' | 'abandon';
    fieldName?: string;
    fieldValue?: string;
    errorMessage?: string;
    timestamp: number;
    timeSpent?: number;
}

// ChatBot Event
export interface ChatBotEvent {
    action: 'open' | 'close' | 'message_sent' | 'message_received' | 'error';
    messageContent?: string;
    messageLength?: number;
    conversationId: string;
    messageIndex: number;
    language: string;
    timestamp: number;
    responseTime?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    intent?: string;
}

// Tool Usage Event
export interface ToolEvent {
    toolName: string;
    action: 'start' | 'progress' | 'complete' | 'abandon' | 'share';
    step?: number;
    totalSteps?: number;
    result?: Record<string, any>;
    timestamp: number;
    timeSpent?: number;
}

// Error Event
export interface ErrorEvent {
    errorType: string;
    errorMessage: string;
    errorStack?: string;
    severity: ErrorSeverity;
    path: string;
    componentName?: string;
    timestamp: number;
    userAction?: string;
}

// Performance Event
export interface PerformanceEvent {
    metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'custom';
    value: number;
    path: string;
    timestamp: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
}

// Session Data
export interface SessionData {
    sessionId: string;
    userId?: string;
    startTime: number;
    lastActivityTime: number;
    pageViews: number;
    events: number;
    engagementTime: number;
    referrer: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
    screenResolution: string;
    language: string;
    isNewUser: boolean;
    segments: UserSegment[];
}

// User Profile
export interface UserProfile {
    visitorId: string;
    firstVisit: number;
    totalVisits: number;
    totalPageViews: number;
    totalEngagementTime: number;
    leadScore: number;
    segments: UserSegment[];
    preferences: {
        language: string;
        theme?: string;
        doshaType?: string;
    };
    interests: string[];
    lastVisit: number;
    conversionHistory: ConversionEvent[];
}

// Conversion Event
export interface ConversionEvent {
    type: 'booking' | 'contact' | 'newsletter' | 'tool_completion';
    timestamp: number;
    value?: number;
    details?: Record<string, any>;
}

// Consent State
export interface ConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    timestamp: number;
    version: string;
}

// Funnel Step
export interface FunnelStep {
    name: string;
    path: string;
    timestamp: number;
    completed: boolean;
    timeSpent?: number;
    dropOffReason?: string;
}

// Booking Funnel
export interface BookingFunnel {
    sessionId: string;
    startTime: number;
    steps: FunnelStep[];
    completed: boolean;
    completionTime?: number;
    abandonmentPoint?: string;
    formData?: Partial<{
        name: string;
        phone: string;
        email: string;
        service: string;
        date: string;
        time: string;
    }>;
}

// Content Performance
export interface ContentPerformance {
    path: string;
    pageViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;
    bounceRate: number;
    exitRate: number;
    engagementRate: number;
    conversionRate: number;
    score: number;
}

// A/B Test Configuration
export interface ABTestConfig {
    testId: string;
    testName: string;
    variants: ABTestVariant[];
    targetingRules?: TargetingRule[];
    startDate: number;
    endDate?: number;
    isActive: boolean;
}

export interface ABTestVariant {
    id: string;
    name: string;
    weight: number;
    isControl: boolean;
}

export interface TargetingRule {
    type: 'segment' | 'device' | 'location' | 'referrer' | 'custom';
    operator: 'equals' | 'contains' | 'regex' | 'in';
    value: string | string[];
}

// Personalization Rule
export interface PersonalizationRule {
    id: string;
    name: string;
    trigger: PersonalizationTrigger;
    action: PersonalizationAction;
    priority: number;
    isActive: boolean;
}

export interface PersonalizationTrigger {
    type: 'segment' | 'behavior' | 'context' | 'time';
    conditions: Record<string, any>;
}

export interface PersonalizationAction {
    type: 'show_content' | 'hide_content' | 'modify_content' | 'redirect' | 'popup';
    target: string;
    content?: string;
    url?: string;
}

// Heatmap Data Point
export interface HeatmapDataPoint {
    x: number;
    y: number;
    value: number;
    elementPath?: string;
}

// Session Recording
export interface SessionRecording {
    sessionId: string;
    startTime: number;
    endTime?: number;
    events: RecordingEvent[];
    metadata: SessionData;
}

export interface RecordingEvent {
    type: 'click' | 'scroll' | 'input' | 'navigation' | 'resize' | 'visibility';
    timestamp: number;
    data: Record<string, any>;
}

// Feedback
export interface UserFeedback {
    type: 'nps' | 'csat' | 'ces' | 'custom';
    score: number;
    maxScore: number;
    comment?: string;
    timestamp: number;
    path: string;
    trigger: string;
}

// Alert Configuration
export interface AlertConfig {
    id: string;
    name: string;
    metric: string;
    condition: 'above' | 'below' | 'change';
    threshold: number;
    windowMinutes: number;
    channels: ('email' | 'slack' | 'sms')[];
    isActive: boolean;
}
