/**
 * Analytics Configuration
 * Central configuration for all analytics and tracking services
 */

// Google Analytics 4 Measurement ID - Replace with your actual ID
export const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Microsoft Clarity Project ID - Replace with your actual ID
export const CLARITY_PROJECT_ID = 'XXXXXXXXXX';

// Analytics Environment
export const ANALYTICS_ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  debugMode: import.meta.env.DEV,
};

// Event Categories
export const EVENT_CATEGORIES = {
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  INTERACTION: 'interaction',
  CONVERSION: 'conversion',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  CHATBOT: 'chatbot',
  TOOLS: 'tools',
  BOOKING: 'booking',
  CONTENT: 'content',
  EXPERIMENT: 'experiment',
  FEEDBACK: 'feedback',
} as const;

// User Segments
export const USER_SEGMENTS = {
  FIRST_TIME_VISITOR: 'first_time_visitor',
  RETURNING_VISITOR: 'returning_visitor',
  SERVICE_EXPLORER: 'service_explorer',
  TOOL_USER: 'tool_user',
  NEAR_CONVERTER: 'near_converter',
  CONVERTER: 'converter',
  HIGH_ENGAGEMENT: 'high_engagement',
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  scrollDepthThresholds: [25, 50, 75, 90, 100],
  engagementTimeThreshold: 10000, // 10 seconds
  inactivityThreshold: 60000, // 1 minute
};

// Privacy Settings
export const PRIVACY_CONFIG = {
  cookieMaxAge: 365, // days
  dataRetentionMonths: 14,
  anonymizeIp: true,
  respectDoNotTrack: true,
  requireExplicitConsent: true,
};

// Consent Types
export const CONSENT_TYPES = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PERSONALIZATION: 'personalization',
} as const;

// Page Configuration for Analytics
export const PAGE_CONFIG = {
  '/': { name: 'Home', category: 'landing' },
  '/about': { name: 'About Us', category: 'informational' },
  '/services': { name: 'Services', category: 'services' },
  '/services/:id': { name: 'Service Detail', category: 'services' },
  '/programs': { name: 'Programs', category: 'services' },
  '/tools': { name: 'Health Tools', category: 'engagement' },
  '/booking': { name: 'Book Appointment', category: 'conversion' },
  '/insurance': { name: 'Insurance', category: 'informational' },
} as const;

// Lead Scoring Configuration
export const LEAD_SCORING = {
  pageView: 1,
  serviceDetailView: 5,
  toolCompletion: 10,
  chatbotConversation: 15,
  bookingFormStarted: 25,
  bookingCompleted: 50,
  returnVisit: 10,
  highScrollDepth: 3,
  longSessionTime: 5,
} as const;

// Lead Status Thresholds
export const LEAD_STATUS = {
  COLD: { min: 0, max: 20 },
  WARM: { min: 21, max: 50 },
  HOT: { min: 51, max: 80 },
  READY: { min: 81, max: Infinity },
} as const;

// Content Performance Weights
export const CONTENT_SCORING_WEIGHTS = {
  timeOnPage: 0.3,
  scrollDepth: 0.3,
  engagementActions: 0.2,
  conversionRate: 0.2,
} as const;

// Error Severity Levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Export type definitions
export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];
export type UserSegment = typeof USER_SEGMENTS[keyof typeof USER_SEGMENTS];
export type ConsentType = typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];
export type ErrorSeverity = typeof ERROR_SEVERITY[keyof typeof ERROR_SEVERITY];
