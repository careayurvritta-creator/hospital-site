/**
 * Booking Funnel Tracker
 * Tracks user progress through the booking process
 */

import { eventTracker, userSegmentation } from '../analytics';
import type { BookingFunnel, FunnelStep } from '../analytics';

// Storage key
const BOOKING_FUNNEL_KEY = 'ayurvritta_booking_funnel';

/**
 * Funnel Steps Definition
 */
export const BOOKING_STEPS = {
    VIEW_FORM: 'view_form',
    ENTER_NAME: 'enter_name',
    ENTER_CONTACT: 'enter_contact',
    SELECT_SERVICE: 'select_service',
    SELECT_DATE: 'select_date',
    SELECT_TIME: 'select_time',
    ENTER_CONCERNS: 'enter_concerns',
    SUBMIT: 'submit',
    CONFIRMATION: 'confirmation',
} as const;

type BookingStep = typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS];

/**
 * BookingFunnelTracker Class
 */
class BookingFunnelTracker {
    private funnel: BookingFunnel | null = null;
    private stepTimers: Map<string, number> = new Map();

    /**
     * Start a new booking funnel
     */
    startFunnel(): void {
        this.funnel = {
            sessionId: eventTracker.getSessionId(),
            startTime: Date.now(),
            steps: [],
            completed: false,
        };

        this.saveFunnel();
        this.trackStep(BOOKING_STEPS.VIEW_FORM);

        // Track form start event
        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'start',
            timestamp: Date.now(),
        });
    }

    /**
     * Track a funnel step
     */
    trackStep(stepName: BookingStep): void {
        if (!this.funnel) {
            this.startFunnel();
        }

        const step: FunnelStep = {
            name: stepName,
            path: window.location.pathname,
            timestamp: Date.now(),
            completed: true,
        };

        // Calculate time spent on previous step
        const previousStep = this.funnel!.steps[this.funnel!.steps.length - 1];
        if (previousStep) {
            previousStep.timeSpent = Date.now() - previousStep.timestamp;
        }

        this.funnel!.steps.push(step);
        this.saveFunnel();

        // Track as event
        eventTracker.trackEvent({
            category: 'booking',
            action: 'funnel_step',
            label: stepName,
            value: this.funnel!.steps.length,
            timestamp: Date.now(),
            sessionId: this.funnel!.sessionId,
        });
    }

    /**
     * Track field focus
     */
    trackFieldFocus(fieldName: string): void {
        this.stepTimers.set(fieldName, Date.now());

        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'field_focus',
            fieldName,
            timestamp: Date.now(),
        });
    }

    /**
     * Track field blur (completion)
     */
    trackFieldBlur(fieldName: string, hasValue: boolean): void {
        const startTime = this.stepTimers.get(fieldName);
        const timeSpent = startTime ? Date.now() - startTime : undefined;

        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'field_blur',
            fieldName,
            timestamp: Date.now(),
            timeSpent,
        });

        // Map field to step
        const fieldStepMap: Record<string, BookingStep> = {
            name: BOOKING_STEPS.ENTER_NAME,
            phone: BOOKING_STEPS.ENTER_CONTACT,
            email: BOOKING_STEPS.ENTER_CONTACT,
            service: BOOKING_STEPS.SELECT_SERVICE,
            date: BOOKING_STEPS.SELECT_DATE,
            time: BOOKING_STEPS.SELECT_TIME,
            concerns: BOOKING_STEPS.ENTER_CONCERNS,
        };

        const step = fieldStepMap[fieldName];
        if (step && hasValue) {
            this.trackStep(step);
        }
    }

    /**
     * Track field error
     */
    trackFieldError(fieldName: string, errorMessage: string): void {
        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'field_error',
            fieldName,
            errorMessage,
            timestamp: Date.now(),
        });
    }

    /**
     * Complete the funnel
     */
    completeFunnel(formData?: Record<string, any>): void {
        if (!this.funnel) return;

        this.funnel.completed = true;
        this.funnel.completionTime = Date.now() - this.funnel.startTime;

        if (formData) {
            // Store sanitized form data (no PII)
            this.funnel.formData = {
                service: formData.service,
                date: formData.date,
                time: formData.time,
            };
        }

        this.trackStep(BOOKING_STEPS.SUBMIT);
        this.saveFunnel();

        // Track conversion
        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'submit',
            timestamp: Date.now(),
            timeSpent: this.funnel.completionTime,
        });

        // Mark user as converter
        userSegmentation.markAsConverted();

        // Clear funnel after successful completion
        setTimeout(() => {
            this.clearFunnel();
        }, 1000);
    }

    /**
     * Track funnel abandonment
     */
    trackAbandonment(reason?: string): void {
        if (!this.funnel || this.funnel.completed) return;

        const lastStep = this.funnel.steps[this.funnel.steps.length - 1];
        this.funnel.abandonmentPoint = lastStep?.name || 'unknown';

        eventTracker.trackFormEvent({
            formId: 'booking_form',
            formName: 'booking',
            action: 'abandon',
            fieldName: lastStep?.name,
            timestamp: Date.now(),
            timeSpent: Date.now() - this.funnel.startTime,
        });

        // Track with reason if provided
        if (reason) {
            eventTracker.trackEvent({
                category: 'booking',
                action: 'abandonment_reason',
                label: reason,
                timestamp: Date.now(),
                sessionId: this.funnel.sessionId,
            });
        }
    }

    /**
     * Get current funnel progress
     */
    getProgress(): { current: number; total: number; percentage: number } {
        const totalSteps = Object.keys(BOOKING_STEPS).length;
        const currentStep = this.funnel?.steps.length || 0;

        return {
            current: currentStep,
            total: totalSteps,
            percentage: Math.round((currentStep / totalSteps) * 100),
        };
    }

    /**
     * Get funnel analytics
     */
    getFunnelAnalytics(): object | null {
        if (!this.funnel) return null;

        return {
            sessionId: this.funnel.sessionId,
            startTime: new Date(this.funnel.startTime).toISOString(),
            stepsCompleted: this.funnel.steps.length,
            completed: this.funnel.completed,
            completionTime: this.funnel.completionTime,
            abandonmentPoint: this.funnel.abandonmentPoint,
            steps: this.funnel.steps.map(s => ({
                name: s.name,
                timeSpent: s.timeSpent,
            })),
        };
    }

    /**
     * Save funnel to storage
     */
    private saveFunnel(): void {
        if (this.funnel) {
            try {
                sessionStorage.setItem(BOOKING_FUNNEL_KEY, JSON.stringify(this.funnel));
            } catch (e) {
                console.error('Error saving booking funnel:', e);
            }
        }
    }

    /**
     * Load funnel from storage
     */
    loadFunnel(): BookingFunnel | null {
        try {
            const saved = sessionStorage.getItem(BOOKING_FUNNEL_KEY);
            if (saved) {
                this.funnel = JSON.parse(saved);
                return this.funnel;
            }
        } catch (e) {
            console.error('Error loading booking funnel:', e);
        }
        return null;
    }

    /**
     * Clear funnel data
     */
    clearFunnel(): void {
        this.funnel = null;
        this.stepTimers.clear();
        sessionStorage.removeItem(BOOKING_FUNNEL_KEY);
    }
}

// Singleton instance
export const bookingFunnelTracker = new BookingFunnelTracker();

// Export class for testing
export { BookingFunnelTracker };
