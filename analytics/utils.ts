/**
 * Analytics Utilities
 * Helper functions for analytics operations
 */

import { SESSION_CONFIG, PRIVACY_CONFIG } from './config';
import type { SessionData } from './types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
    return `sess_${generateId()}`;
}

/**
 * Generate a visitor ID
 */
export function generateVisitorId(): string {
    return `vis_${generateId()}`;
}

/**
 * Get or create visitor ID from localStorage
 */
export function getOrCreateVisitorId(): string {
    const storageKey = 'ayurvritta_visitor_id';
    let visitorId = localStorage.getItem(storageKey);

    if (!visitorId) {
        visitorId = generateVisitorId();
        localStorage.setItem(storageKey, visitorId);
    }

    return visitorId;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }

    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
        return 'mobile';
    }

    return 'desktop';
}

/**
 * Get browser information
 */
export function getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'IE';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Edg')) browser = 'Edge Chromium';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    return browser;
}

/**
 * Get OS information
 */
export function getOSInfo(): string {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return os;
}

/**
 * Get screen resolution
 */
export function getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUTMParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = params.get(param);
        if (value) {
            utmParams[param.replace('utm_', '')] = value;
        }
    });

    return utmParams;
}

/**
 * Get referrer information
 */
export function getReferrerInfo(): { referrer: string; referrerDomain: string | null } {
    const referrer = document.referrer;
    let referrerDomain = null;

    if (referrer) {
        try {
            referrerDomain = new URL(referrer).hostname;
        } catch {
            referrerDomain = null;
        }
    }

    return { referrer, referrerDomain };
}

/**
 * Check if user is new (first visit)
 */
export function isNewUser(): boolean {
    const firstVisitKey = 'ayurvritta_first_visit';
    const firstVisit = localStorage.getItem(firstVisitKey);

    if (!firstVisit) {
        localStorage.setItem(firstVisitKey, Date.now().toString());
        return true;
    }

    return false;
}

/**
 * Get visit count
 */
export function getVisitCount(): number {
    const countKey = 'ayurvritta_visit_count';
    const count = parseInt(localStorage.getItem(countKey) || '0', 10);
    return count;
}

/**
 * Increment visit count
 */
export function incrementVisitCount(): number {
    const countKey = 'ayurvritta_visit_count';
    const count = getVisitCount() + 1;
    localStorage.setItem(countKey, count.toString());
    return count;
}

/**
 * Calculate scroll depth percentage
 */
export function calculateScrollDepth(): number {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return 100;

    return Math.min(Math.round((scrollTop / scrollHeight) * 100), 100);
}

/**
 * Check if element is visible in viewport
 */
export function isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get element path (CSS selector-like path to element)
 */
export function getElementPath(element: Element): string {
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
            selector += `#${current.id}`;
        } else if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
            if (classes) selector += `.${classes}`;
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.join(' > ');
}

/**
 * Anonymize IP address (for privacy compliance)
 */
export function anonymizeIP(ip: string): string {
    if (!ip) return '';

    // IPv4
    if (ip.includes('.')) {
        return ip.split('.').slice(0, 3).join('.') + '.0';
    }

    // IPv6
    if (ip.includes(':')) {
        return ip.split(':').slice(0, 4).join(':') + ':0:0:0:0';
    }

    return ip;
}

/**
 * Hash a string (for anonymization)
 */
export async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize PII from string
 */
export function sanitizePII(text: string): string {
    let sanitized = text;

    // Email
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');

    // Phone (Indian format)
    sanitized = sanitized.replace(/(\+91[\-\s]?)?[0]?(91)?[789]\d{9}/g, '[PHONE]');

    // Credit card (basic pattern)
    sanitized = sanitized.replace(/\b\d{4}[\-\s]?\d{4}[\-\s]?\d{4}[\-\s]?\d{4}\b/g, '[CARD]');

    // Aadhaar (Indian ID)
    sanitized = sanitized.replace(/\b\d{4}[\-\s]?\d{4}[\-\s]?\d{4}\b/g, '[AADHAAR]');

    return sanitized;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Check if Do Not Track is enabled
 */
export function isDoNotTrackEnabled(): boolean {
    if (!PRIVACY_CONFIG.respectDoNotTrack) return false;

    return (
        navigator.doNotTrack === '1' ||
        (window as any).doNotTrack === '1'
    );
}

/**
 * Get page name from path
 */
export function getPageNameFromPath(path: string): string {
    const pathMap: Record<string, string> = {
        '/': 'Home',
        '/about': 'About Us',
        '/services': 'Services',
        '/programs': 'Programs',
        '/tools': 'Health Tools',
        '/booking': 'Book Appointment',
        '/insurance': 'Insurance',
    };

    // Check for dynamic routes
    if (path.startsWith('/services/')) {
        return 'Service Detail';
    }

    return pathMap[path] || 'Unknown Page';
}

/**
 * Store data in localStorage with expiry
 */
export function setWithExpiry(key: string, value: any, ttlMs: number): void {
    const item = {
        value,
        expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Get data from localStorage, checking expiry
 */
export function getWithExpiry<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) return null;

    try {
        const item = JSON.parse(itemStr);

        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value as T;
    } catch {
        return null;
    }
}

/**
 * Create initial session data
 */
export function createInitialSessionData(sessionId: string): SessionData {
    const utmParams = parseUTMParams();
    const { referrer } = getReferrerInfo();

    return {
        sessionId,
        startTime: Date.now(),
        lastActivityTime: Date.now(),
        pageViews: 0,
        events: 0,
        engagementTime: 0,
        referrer,
        utmSource: utmParams.source,
        utmMedium: utmParams.medium,
        utmCampaign: utmParams.campaign,
        deviceType: getDeviceType(),
        browser: getBrowserInfo(),
        os: getOSInfo(),
        screenResolution: getScreenResolution(),
        language: navigator.language,
        isNewUser: isNewUser(),
        segments: [],
    };
}
