/**
 * Touch Tracker
 * Tracks touch interactions for mobile analytics
 */

import { eventTracker, consentManager } from './index';
import { mobileDeviceDetector } from './mobileDeviceDetector';
import { throttle } from './utils';

// Touch event types
export type TouchEventType = 'tap' | 'double_tap' | 'long_press' | 'swipe' | 'pinch' | 'scroll';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface TouchEvent {
    type: TouchEventType;
    timestamp: number;
    target: string;
    targetPath: string;
    position: { x: number; y: number };
    // Swipe specific
    direction?: SwipeDirection;
    velocity?: number;
    distance?: number;
    // Pinch specific
    scale?: number;
    // Zone info
    thumbZone: 'safe' | 'natural' | 'stretch';
    // Device context
    orientation: 'portrait' | 'landscape';
}

export interface RageTapEvent {
    count: number;
    element: string;
    position: { x: number; y: number };
    timestamp: number;
}

// Configuration
const TOUCH_CONFIG = {
    longPressThreshold: 500, // ms
    doubleTapThreshold: 300, // ms
    swipeThreshold: 50, // px
    swipeVelocityThreshold: 0.3, // px/ms
    rageTapThreshold: 3, // taps
    rageTapWindow: 1000, // ms
};

/**
 * TouchTracker Class
 */
class TouchTracker {
    private isInitialized = false;
    private touchStartTime = 0;
    private touchStartPos = { x: 0, y: 0 };
    private lastTapTime = 0;
    private lastTapPos = { x: 0, y: 0 };
    private tapCount = 0;
    private tapTimer: number | null = null;
    private longPressTimer: number | null = null;
    private isLongPress = false;
    private touchEvents: TouchEvent[] = [];
    private rageTaps: Map<string, { count: number; lastTime: number }> = new Map();

    constructor() {
        if (typeof window !== 'undefined' && mobileDeviceDetector.isMobile()) {
            this.initialize();
        }
    }

    /**
     * Initialize touch tracking
     */
    initialize(): void {
        if (this.isInitialized) return;
        if (!consentManager.hasConsentFor('analytics')) return;

        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });

        this.isInitialized = true;
        console.log('[TouchTracker] Initialized');
    }

    /**
     * Handle touch start
     */
    private handleTouchStart(e: globalThis.TouchEvent): void {
        if (e.touches.length !== 1) return; // Ignore multi-touch for basic gestures

        const touch = e.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.isLongPress = false;

        // Start long press timer
        this.longPressTimer = window.setTimeout(() => {
            this.isLongPress = true;
            this.trackTouch({
                type: 'long_press',
                target: e.target as HTMLElement,
                position: this.touchStartPos,
            });
        }, TOUCH_CONFIG.longPressThreshold);
    }

    /**
     * Handle touch end
     */
    private handleTouchEnd(e: globalThis.TouchEvent): void {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isLongPress) {
            this.isLongPress = false;
            return;
        }

        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        const touch = e.changedTouches[0];
        const endPos = { x: touch.clientX, y: touch.clientY };

        // Calculate distance
        const dx = endPos.x - this.touchStartPos.x;
        const dy = endPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check for swipe
        if (distance > TOUCH_CONFIG.swipeThreshold) {
            const velocity = distance / touchDuration;
            if (velocity > TOUCH_CONFIG.swipeVelocityThreshold) {
                const direction = this.getSwipeDirection(dx, dy);
                this.trackTouch({
                    type: 'swipe',
                    target: e.target as HTMLElement,
                    position: endPos,
                    direction,
                    velocity,
                    distance,
                });
                return;
            }
        }

        // Check for double tap
        const timeSinceLastTap = touchEndTime - this.lastTapTime;
        const distFromLastTap = Math.sqrt(
            Math.pow(endPos.x - this.lastTapPos.x, 2) +
            Math.pow(endPos.y - this.lastTapPos.y, 2)
        );

        if (timeSinceLastTap < TOUCH_CONFIG.doubleTapThreshold && distFromLastTap < 50) {
            this.trackTouch({
                type: 'double_tap',
                target: e.target as HTMLElement,
                position: endPos,
            });
            this.lastTapTime = 0;
            return;
        }

        // Single tap
        this.lastTapTime = touchEndTime;
        this.lastTapPos = endPos;

        // Check for rage tap
        this.checkRageTap(e.target as HTMLElement, endPos);

        // Track tap
        this.trackTouch({
            type: 'tap',
            target: e.target as HTMLElement,
            position: endPos,
        });
    }

    /**
     * Handle touch move (for scroll tracking)
     */
    private handleTouchMove = throttle((e: globalThis.TouchEvent) => {
        // Scroll tracking is handled separately
    }, 100);

    /**
     * Get swipe direction
     */
    private getSwipeDirection(dx: number, dy: number): SwipeDirection {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > absDy) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    /**
     * Check for rage tap pattern
     */
    private checkRageTap(target: HTMLElement, position: { x: number; y: number }): void {
        const key = this.getElementPath(target);
        const now = Date.now();
        const existing = this.rageTaps.get(key);

        if (existing && now - existing.lastTime < TOUCH_CONFIG.rageTapWindow) {
            existing.count++;
            existing.lastTime = now;

            if (existing.count >= TOUCH_CONFIG.rageTapThreshold) {
                this.trackRageTap({
                    count: existing.count,
                    element: key,
                    position,
                    timestamp: now,
                });
                existing.count = 0; // Reset after reporting
            }
        } else {
            this.rageTaps.set(key, { count: 1, lastTime: now });
        }
    }

    /**
     * Track touch event
     */
    private trackTouch(data: {
        type: TouchEventType;
        target: HTMLElement;
        position: { x: number; y: number };
        direction?: SwipeDirection;
        velocity?: number;
        distance?: number;
        scale?: number;
    }): void {
        const deviceInfo = mobileDeviceDetector.getDeviceInfo();
        const thumbZones = mobileDeviceDetector.getThumbZone();

        // Determine thumb zone
        let thumbZone: 'safe' | 'natural' | 'stretch' = 'natural';
        if (data.position.y >= thumbZones.safeZone.top) {
            thumbZone = 'safe';
        } else if (data.position.y <= thumbZones.stretchZone.bottom) {
            thumbZone = 'stretch';
        }

        const event: TouchEvent = {
            type: data.type,
            timestamp: Date.now(),
            target: data.target.tagName.toLowerCase(),
            targetPath: this.getElementPath(data.target),
            position: data.position,
            direction: data.direction,
            velocity: data.velocity,
            distance: data.distance,
            scale: data.scale,
            thumbZone,
            orientation: deviceInfo.orientation,
        };

        this.touchEvents.push(event);

        // Keep only last 100 events
        if (this.touchEvents.length > 100) {
            this.touchEvents.shift();
        }

        // Track to main analytics
        eventTracker.trackEvent({
            category: 'interaction',
            action: `touch_${data.type}`,
            label: event.targetPath,
            timestamp: event.timestamp,
            sessionId: '',
            metadata: {
                thumbZone,
                direction: data.direction,
                velocity: data.velocity,
                orientation: deviceInfo.orientation,
            },
        });
    }

    /**
     * Track rage tap
     */
    private trackRageTap(data: RageTapEvent): void {
        eventTracker.trackEvent({
            category: 'interaction',
            action: 'rage_tap',
            label: data.element,
            value: data.count,
            timestamp: data.timestamp,
            sessionId: '',
            metadata: {
                position: data.position,
                count: data.count,
            },
        });

        console.warn('[TouchTracker] Rage tap detected:', data.element);
    }

    /**
     * Get element path for identification
     */
    private getElementPath(element: HTMLElement): string {
        const parts: string[] = [];
        let el: HTMLElement | null = element;

        while (el && el !== document.body && parts.length < 5) {
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector += `#${el.id}`;
            } else if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').filter(c => c).slice(0, 2);
                if (classes.length) {
                    selector += `.${classes.join('.')}`;
                }
            }
            parts.unshift(selector);
            el = el.parentElement;
        }

        return parts.join(' > ');
    }

    /**
     * Get touch analytics summary
     */
    getSummary(): {
        totalTouches: number;
        byType: Record<TouchEventType, number>;
        byThumbZone: Record<string, number>;
        rageTaps: number;
    } {
        const byType: Record<TouchEventType, number> = {
            tap: 0,
            double_tap: 0,
            long_press: 0,
            swipe: 0,
            pinch: 0,
            scroll: 0,
        };

        const byThumbZone = { safe: 0, natural: 0, stretch: 0 };
        let rageTaps = 0;

        this.touchEvents.forEach(event => {
            byType[event.type]++;
            byThumbZone[event.thumbZone]++;
        });

        this.rageTaps.forEach(tap => {
            if (tap.count >= TOUCH_CONFIG.rageTapThreshold) {
                rageTaps++;
            }
        });

        return {
            totalTouches: this.touchEvents.length,
            byType,
            byThumbZone,
            rageTaps,
        };
    }

    /**
     * Get recent touch events
     */
    getRecentEvents(limit: number = 20): TouchEvent[] {
        return this.touchEvents.slice(-limit);
    }

    /**
     * Clear stored events
     */
    clear(): void {
        this.touchEvents = [];
        this.rageTaps.clear();
    }
}

// Singleton instance
export const touchTracker = new TouchTracker();

// Export class for testing
export { TouchTracker };
