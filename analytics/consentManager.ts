/**
 * Consent Manager
 * Handles user consent for cookies and tracking with GDPR/DPDP compliance
 */

import { CONSENT_TYPES, PRIVACY_CONFIG } from './config';
import type { ConsentState } from './types';

const CONSENT_STORAGE_KEY = 'ayurvritta_consent';
const CONSENT_VERSION = '1.0';

// Default consent state
const DEFAULT_CONSENT: ConsentState = {
    essential: true, // Always true - required for site functionality
    analytics: false,
    marketing: false,
    personalization: false,
    timestamp: 0,
    version: CONSENT_VERSION,
};

/**
 * ConsentManager Class
 * Manages user consent preferences
 */
class ConsentManager {
    private state: ConsentState;
    private listeners: ((state: ConsentState) => void)[] = [];

    constructor() {
        this.state = this.loadConsent();
    }

    /**
     * Load consent from localStorage
     */
    private loadConsent(): ConsentState {
        try {
            const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as ConsentState;

                // Check if consent version matches
                if (parsed.version !== CONSENT_VERSION) {
                    // Version changed, need to re-consent
                    return DEFAULT_CONSENT;
                }

                return parsed;
            }
        } catch (error) {
            console.error('Error loading consent:', error);
        }

        return DEFAULT_CONSENT;
    }

    /**
     * Save consent to localStorage
     */
    private saveConsent(): void {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving consent:', error);
        }
    }

    /**
     * Get current consent state
     */
    getConsent(): ConsentState {
        return { ...this.state };
    }

    /**
     * Check if user has made a consent choice
     */
    hasConsented(): boolean {
        return this.state.timestamp > 0;
    }

    /**
     * Check if specific consent type is granted
     */
    hasConsentFor(type: keyof Omit<ConsentState, 'timestamp' | 'version'>): boolean {
        return this.state[type] === true;
    }

    /**
     * Update consent state
     */
    updateConsent(updates: Partial<Omit<ConsentState, 'timestamp' | 'version'>>): void {
        this.state = {
            ...this.state,
            ...updates,
            essential: true, // Always keep essential true
            timestamp: Date.now(),
            version: CONSENT_VERSION,
        };

        this.saveConsent();
        this.notifyListeners();

        // Apply consent changes to tracking
        this.applyConsentToTracking();
    }

    /**
     * Accept all consent types
     */
    acceptAll(): void {
        this.updateConsent({
            analytics: true,
            marketing: true,
            personalization: true,
        });
    }

    /**
     * Reject all optional consent types
     */
    rejectAll(): void {
        this.updateConsent({
            analytics: false,
            marketing: false,
            personalization: false,
        });
    }

    /**
     * Accept only essential cookies
     */
    acceptEssentialOnly(): void {
        this.rejectAll();
    }

    /**
     * Revoke all consent
     */
    revokeConsent(): void {
        this.state = DEFAULT_CONSENT;
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        this.notifyListeners();
        this.applyConsentToTracking();
    }

    /**
     * Apply consent settings to tracking services
     */
    private applyConsentToTracking(): void {
        // Update Google Analytics consent
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: this.state.analytics ? 'granted' : 'denied',
                ad_storage: this.state.marketing ? 'granted' : 'denied',
                personalization_storage: this.state.personalization ? 'granted' : 'denied',
            });
        }

        // Dispatch custom event for other services
        window.dispatchEvent(new CustomEvent('consentUpdated', {
            detail: this.state
        }));
    }

    /**
     * Subscribe to consent changes
     */
    subscribe(listener: (state: ConsentState) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Export consent for GDPR data portability
     */
    exportConsent(): string {
        return JSON.stringify({
            consent: this.state,
            exportDate: new Date().toISOString(),
            site: 'Ayurvritta Ayurveda Hospital',
        }, null, 2);
    }

    /**
     * Get consent for audit logging
     */
    getConsentAuditLog(): object {
        return {
            consentGiven: this.hasConsented(),
            consentTimestamp: this.state.timestamp
                ? new Date(this.state.timestamp).toISOString()
                : null,
            consentVersion: this.state.version,
            analyticsConsent: this.state.analytics,
            marketingConsent: this.state.marketing,
            personalizationConsent: this.state.personalization,
        };
    }
}

// Singleton instance
export const consentManager = new ConsentManager();

// Export class for testing
export { ConsentManager };
