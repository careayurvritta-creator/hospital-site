/**
 * Performance Monitor
 * Tracks Core Web Vitals and custom performance metrics
 */

import { eventTracker } from './eventTracker';
import { consentManager } from './consentManager';
import { ANALYTICS_ENV } from './config';
import type { PerformanceEvent } from './types';

/**
 * Performance thresholds based on Google's Core Web Vitals
 */
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
    FID: { good: 100, poor: 300 },         // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },        // Cumulative Layout Shift
    TTFB: { good: 800, poor: 1800 },       // Time to First Byte
    FCP: { good: 1800, poor: 3000 },       // First Contentful Paint
};

/**
 * Get rating based on value and thresholds
 */
function getRating(
    value: number,
    thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * PerformanceMonitor Class
 */
class PerformanceMonitor {
    private observer: PerformanceObserver | null = null;
    private lcpValue: number = 0;
    private clsValue: number = 0;
    private fidValue: number = 0;
    private isInitialized: boolean = false;

    /**
     * Initialize performance monitoring
     */
    initialize(): void {
        if (this.isInitialized) return;
        if (typeof window === 'undefined') return;
        if (!('PerformanceObserver' in window)) return;

        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.measureNavigationTiming();

        // Send metrics when page is about to unload
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.sendMetrics();
            }
        });

        // Also send on pagehide for mobile Safari
        window.addEventListener('pagehide', () => {
            this.sendMetrics();
        });

        this.isInitialized = true;

        if (ANALYTICS_ENV.debugMode) {
            console.log('[Performance] Monitor initialized');
        }
    }

    /**
     * Observe Largest Contentful Paint
     */
    private observeLCP(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;

                if (lastEntry) {
                    this.lcpValue = lastEntry.startTime;

                    if (ANALYTICS_ENV.debugMode) {
                        console.log('[Performance] LCP:', this.lcpValue, getRating(this.lcpValue, THRESHOLDS.LCP));
                    }
                }
            });

            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            console.warn('LCP observation not supported');
        }
    }

    /**
     * Observe First Input Delay
     */
    private observeFID(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry: any) => {
                    if (entry.processingStart && entry.startTime) {
                        this.fidValue = entry.processingStart - entry.startTime;

                        if (ANALYTICS_ENV.debugMode) {
                            console.log('[Performance] FID:', this.fidValue, getRating(this.fidValue, THRESHOLDS.FID));
                        }
                    }
                });
            });

            observer.observe({ type: 'first-input', buffered: true });
        } catch (e) {
            console.warn('FID observation not supported');
        }
    }

    /**
     * Observe Cumulative Layout Shift
     */
    private observeCLS(): void {
        try {
            let sessionValue = 0;
            let sessionEntries: any[] = [];

            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries() as any[];

                entries.forEach((entry) => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

                        // If entry is within 1s of last entry and within 5s of first entry,
                        // include it in the current session
                        if (sessionEntries.length === 0 ||
                            (entry.startTime - lastSessionEntry.startTime < 1000 &&
                                entry.startTime - firstSessionEntry.startTime < 5000)) {
                            sessionEntries.push(entry);
                            sessionValue += entry.value;
                        } else {
                            // Start a new session
                            sessionEntries = [entry];
                            sessionValue = entry.value;
                        }

                        // Update CLS if this session has a higher value
                        if (sessionValue > this.clsValue) {
                            this.clsValue = sessionValue;

                            if (ANALYTICS_ENV.debugMode) {
                                console.log('[Performance] CLS:', this.clsValue, getRating(this.clsValue, THRESHOLDS.CLS));
                            }
                        }
                    }
                });
            });

            observer.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            console.warn('CLS observation not supported');
        }
    }

    /**
     * Measure navigation timing metrics
     */
    private measureNavigationTiming(): void {
        // Wait for load event
        if (document.readyState === 'complete') {
            this.captureNavigationMetrics();
        } else {
            window.addEventListener('load', () => {
                // Use setTimeout to ensure metrics are available
                setTimeout(() => this.captureNavigationMetrics(), 0);
            });
        }
    }

    /**
     * Capture navigation timing metrics
     */
    private captureNavigationMetrics(): void {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
            // Time to First Byte
            const ttfb = navigation.responseStart - navigation.requestStart;
            this.trackMetric('TTFB', ttfb, THRESHOLDS.TTFB);

            if (ANALYTICS_ENV.debugMode) {
                console.log('[Performance] TTFB:', ttfb, getRating(ttfb, THRESHOLDS.TTFB));
            }
        }

        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');

        if (fcpEntry) {
            this.trackMetric('FCP', fcpEntry.startTime, THRESHOLDS.FCP);

            if (ANALYTICS_ENV.debugMode) {
                console.log('[Performance] FCP:', fcpEntry.startTime, getRating(fcpEntry.startTime, THRESHOLDS.FCP));
            }
        }
    }

    /**
     * Track a performance metric
     */
    private trackMetric(
        metric: PerformanceEvent['metric'],
        value: number,
        thresholds?: { good: number; poor: number }
    ): void {
        if (!consentManager.hasConsentFor('analytics')) return;

        const event: PerformanceEvent = {
            metric,
            value: Math.round(value),
            path: window.location.pathname,
            timestamp: Date.now(),
            rating: thresholds ? getRating(value, thresholds) : undefined,
        };

        eventTracker.trackPerformance(event);
    }

    /**
     * Send all collected metrics
     */
    private sendMetrics(): void {
        if (!consentManager.hasConsentFor('analytics')) return;

        // Send LCP
        if (this.lcpValue > 0) {
            this.trackMetric('LCP', this.lcpValue, THRESHOLDS.LCP);
        }

        // Send FID
        if (this.fidValue > 0) {
            this.trackMetric('FID', this.fidValue, THRESHOLDS.FID);
        }

        // Send CLS
        if (this.clsValue > 0) {
            this.trackMetric('CLS', this.clsValue * 1000, THRESHOLDS.CLS); // Multiply for better readability
        }
    }

    /**
     * Measure custom timing
     */
    measureTiming(name: string, startMark: string, endMark?: string): void {
        try {
            if (endMark) {
                performance.measure(name, startMark, endMark);
            } else {
                performance.measure(name, startMark);
            }

            const measures = performance.getEntriesByName(name, 'measure');
            const measure = measures[measures.length - 1];

            if (measure) {
                this.trackMetric('custom', measure.duration);

                if (ANALYTICS_ENV.debugMode) {
                    console.log(`[Performance] Custom timing "${name}":`, measure.duration);
                }
            }
        } catch (e) {
            console.warn(`Failed to measure timing "${name}":`, e);
        }
    }

    /**
     * Start a timing mark
     */
    startMark(name: string): void {
        try {
            performance.mark(`${name}_start`);
        } catch (e) {
            console.warn(`Failed to start mark "${name}":`, e);
        }
    }

    /**
     * End a timing mark and measure
     */
    endMark(name: string): void {
        try {
            performance.mark(`${name}_end`);
            this.measureTiming(name, `${name}_start`, `${name}_end`);
        } catch (e) {
            console.warn(`Failed to end mark "${name}":`, e);
        }
    }

    /**
     * Get current metrics summary
     */
    getMetricsSummary(): Record<string, { value: number; rating: string }> {
        return {
            LCP: { value: this.lcpValue, rating: getRating(this.lcpValue, THRESHOLDS.LCP) },
            FID: { value: this.fidValue, rating: getRating(this.fidValue, THRESHOLDS.FID) },
            CLS: { value: this.clsValue, rating: getRating(this.clsValue, THRESHOLDS.CLS) },
        };
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.isInitialized = false;
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for testing
export { PerformanceMonitor };
