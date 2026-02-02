/**
 * Mobile Scroll Tracker
 * Advanced scroll behavior analytics for mobile
 */

import { eventTracker, consentManager } from './index';
import { mobileDeviceDetector } from './mobileDeviceDetector';
import { throttle } from './utils';

export interface ScrollEvent {
    depth: number; // 0-100%
    velocity: 'slow' | 'medium' | 'fast';
    direction: 'up' | 'down';
    timestamp: number;
}

export interface ScrollAnalytics {
    maxScrollDepth: number;
    scrollDepthMilestones: number[]; // 25, 50, 75, 100 reached
    avgScrollVelocity: number;
    directionChanges: number;
    pausePoints: number[]; // Positions where user paused
    pullToRefreshAttempts: number;
    bounceScrolls: number;
    totalScrollDistance: number;
    timeToMaxDepth: number;
}

/**
 * MobileScrollTracker Class
 */
class MobileScrollTracker {
    private isInitialized = false;
    private scrollStartTime = 0;
    private lastScrollY = 0;
    private lastScrollTime = 0;
    private lastDirection: 'up' | 'down' = 'down';
    private directionChanges = 0;
    private pauseTimer: number | null = null;
    private pausePoints: number[] = [];
    private maxDepth = 0;
    private reachedMilestones: Set<number> = new Set();
    private pullToRefreshAttempts = 0;
    private bounceScrolls = 0;
    private totalDistance = 0;
    private velocities: number[] = [];
    private pageHeight = 0;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initialize();
        }
    }

    /**
     * Initialize scroll tracking
     */
    initialize(): void {
        if (this.isInitialized) return;
        if (!consentManager.hasConsentFor('analytics')) return;

        this.scrollStartTime = Date.now();
        this.pageHeight = this.getPageHeight();
        this.lastScrollY = window.scrollY;

        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);

        // Touch events for pull-to-refresh detection
        document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: true });

        this.isInitialized = true;
    }

    /**
     * Handle scroll events
     */
    private handleScroll = throttle(() => {
        const now = Date.now();
        const currentY = window.scrollY;
        const distance = Math.abs(currentY - this.lastScrollY);
        const timeDelta = now - this.lastScrollTime;

        // Calculate velocity (px/ms)
        const velocity = timeDelta > 0 ? distance / timeDelta : 0;
        this.velocities.push(velocity);

        // Keep only last 20 velocities
        if (this.velocities.length > 20) {
            this.velocities.shift();
        }

        // Determine direction
        const direction = currentY > this.lastScrollY ? 'down' : 'up';

        // Track direction changes
        if (direction !== this.lastDirection) {
            this.directionChanges++;
            this.lastDirection = direction;
        }

        // Track total distance
        this.totalDistance += distance;

        // Calculate depth
        const depth = this.calculateScrollDepth();

        // Update max depth
        if (depth > this.maxDepth) {
            this.maxDepth = depth;
        }

        // Check milestones
        this.checkMilestones(depth);

        // Detect pause points
        this.detectPausePoint(depth);

        // Detect bounce scroll (overscroll at bottom)
        if (currentY + window.innerHeight >= this.pageHeight - 10) {
            this.bounceScrolls++;
        }

        // Update last values
        this.lastScrollY = currentY;
        this.lastScrollTime = now;
    }, 100);

    /**
     * Handle resize
     */
    private handleResize = () => {
        this.pageHeight = this.getPageHeight();
    };

    /**
     * Touch start handling
     */
    private touchStartY = 0;
    private handleTouchStart = (e: TouchEvent) => {
        this.touchStartY = e.touches[0].clientY;
    };

    /**
     * Touch move for pull-to-refresh detection
     */
    private handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - this.touchStartY;

        // Pull-to-refresh detection (at top, pulling down)
        if (window.scrollY === 0 && deltaY > 50) {
            this.pullToRefreshAttempts++;
        }
    };

    /**
     * Get page height
     */
    private getPageHeight(): number {
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );
    }

    /**
     * Calculate scroll depth percentage
     */
    private calculateScrollDepth(): number {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = this.pageHeight;

        const scrollableHeight = docHeight - windowHeight;
        if (scrollableHeight <= 0) return 100;

        return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));
    }

    /**
     * Check and track milestone depths
     */
    private checkMilestones(depth: number): void {
        const milestones = [25, 50, 75, 90, 100];

        for (const milestone of milestones) {
            if (depth >= milestone && !this.reachedMilestones.has(milestone)) {
                this.reachedMilestones.add(milestone);

                // Track milestone event
                eventTracker.trackEvent({
                    category: 'engagement',
                    action: 'scroll_milestone',
                    label: `${milestone}%`,
                    value: milestone,
                    timestamp: Date.now(),
                    sessionId: '',
                    metadata: {
                        timeToReach: Date.now() - this.scrollStartTime,
                        isMobile: mobileDeviceDetector.isMobile(),
                    },
                });
            }
        }
    }

    /**
     * Detect pause points (where user stops scrolling)
     */
    private detectPausePoint(depth: number): void {
        // Clear existing pause timer
        if (this.pauseTimer) {
            clearTimeout(this.pauseTimer);
        }

        // Set new pause timer
        this.pauseTimer = window.setTimeout(() => {
            // User paused for 1 second
            this.pausePoints.push(depth);

            // Keep only last 10 pause points
            if (this.pausePoints.length > 10) {
                this.pausePoints.shift();
            }
        }, 1000);
    }

    /**
     * Get scroll velocity category
     */
    private getVelocityCategory(): 'slow' | 'medium' | 'fast' {
        const avg = this.getAverageVelocity();
        if (avg < 0.5) return 'slow';
        if (avg < 2) return 'medium';
        return 'fast';
    }

    /**
     * Get average velocity
     */
    private getAverageVelocity(): number {
        if (this.velocities.length === 0) return 0;
        return this.velocities.reduce((a, b) => a + b, 0) / this.velocities.length;
    }

    /**
     * Get scroll analytics summary
     */
    getAnalytics(): ScrollAnalytics {
        return {
            maxScrollDepth: this.maxDepth,
            scrollDepthMilestones: Array.from(this.reachedMilestones).sort((a, b) => a - b),
            avgScrollVelocity: Math.round(this.getAverageVelocity() * 100) / 100,
            directionChanges: this.directionChanges,
            pausePoints: this.pausePoints,
            pullToRefreshAttempts: this.pullToRefreshAttempts,
            bounceScrolls: this.bounceScrolls,
            totalScrollDistance: Math.round(this.totalDistance),
            timeToMaxDepth: this.reachedMilestones.size > 0 ? Date.now() - this.scrollStartTime : 0,
        };
    }

    /**
     * Get current scroll depth
     */
    getCurrentDepth(): number {
        return this.calculateScrollDepth();
    }

    /**
     * Reset tracking (call on page change)
     */
    reset(): void {
        this.scrollStartTime = Date.now();
        this.lastScrollY = window.scrollY;
        this.lastScrollTime = Date.now();
        this.lastDirection = 'down';
        this.directionChanges = 0;
        this.pausePoints = [];
        this.maxDepth = 0;
        this.reachedMilestones.clear();
        this.pullToRefreshAttempts = 0;
        this.bounceScrolls = 0;
        this.totalDistance = 0;
        this.velocities = [];
        this.pageHeight = this.getPageHeight();
    }

    /**
     * Destroy tracker
     */
    destroy(): void {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);

        if (this.pauseTimer) {
            clearTimeout(this.pauseTimer);
        }

        this.isInitialized = false;
    }
}

// Singleton instance
export const mobileScrollTracker = new MobileScrollTracker();

// Export class for testing
export { MobileScrollTracker };
