/**
 * Error Tracking System
 * Centralized error handling with optional Sentry integration
 * To enable Sentry: npm install @sentry/react and uncomment the import
 */

import { eventTracker } from './eventTracker';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error context interface
interface ErrorContext {
  severity?: ErrorSeverity;
  source?: string;
  componentStack?: string;
  userId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

// Sentry integration (optional - only works if @sentry/react is installed)
let Sentry: typeof import('@sentry/react') | null = null;
let isSentryInitialized = false;

/**
 * Initialize error tracking (Sentry optional)
 */
export const initErrorTracking = (): void => {
  // Try to import Sentry if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/react');
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn && dsn !== 'YOUR_SENTRY_DSN') {
      Sentry.init({
        dsn,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      isSentryInitialized = true;
      console.info('[ErrorTracker] Sentry initialized successfully');
    }
  } catch {
    // Sentry not available - use fallback tracking
    console.info('[ErrorTracker] Using fallback error tracking');
  }
};

/**
 * Capture an error with context
 */
export const captureError = (
  error: Error | unknown,
  context: ErrorContext = {}
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  // Track to analytics
  try {
    eventTracker.trackError(
      error instanceof Error ? error : new Error(errorMessage),
      {
        componentStack: context.componentStack,
        source: context.source,
      }
    );
  } catch {
    // Silent fail - don't break on tracking failure
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    const style = getSeverityStyle(context.severity || 'medium');
    console.error(
      `%c[Error] ${errorMessage}`,
      style,
      context.source ? `[${context.source}]` : ''
    );
  }

  // Send to Sentry if available
  if (isSentryInitialized && Sentry) {
    Sentry.captureException(error, {
      tags: context.tags,
      extra: context.extra,
      level: mapSeverity(context.severity),
    });
  }
};

/**
 * Capture a message (non-error)
 */
export const captureMessage = (
  message: string,
  level: ErrorSeverity = 'medium'
): void => {
  if (import.meta.env.DEV) {
    console.warn(`[Message] ${message}`);
  }

  if (isSentryInitialized && Sentry) {
    Sentry.captureMessage(message, mapSeverity(level));
  }
};

/**
 * Add breadcrumb for error context
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>
): void => {
  if (isSentryInitialized && Sentry) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, email?: string): void => {
  if (isSentryInitialized && Sentry) {
    Sentry.setUser({ id: userId, email });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = (): void => {
  if (isSentryInitialized && Sentry) {
    Sentry.setUser(null);
  }
};

// Helper: Map severity to Sentry level
function mapSeverity(severity?: ErrorSeverity): 'debug' | 'info' | 'warning' | 'error' | 'fatal' {
  switch (severity) {
    case 'low': return 'info';
    case 'medium': return 'warning';
    case 'high': return 'error';
    case 'critical': return 'fatal';
    default: return 'error';
  }
}

// Helper: Console style based on severity
function getSeverityStyle(severity: ErrorSeverity): string {
  switch (severity) {
    case 'low': return 'color: #6c757d';
    case 'medium': return 'color: #ffc107; font-weight: bold';
    case 'high': return 'color: #fd7e14; font-weight: bold';
    case 'critical': return 'color: #dc3545; font-weight: bold';
    default: return 'color: #dc3545';
  }
}

// Default export with all methods
export default {
  initErrorTracking,
  captureError,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
};