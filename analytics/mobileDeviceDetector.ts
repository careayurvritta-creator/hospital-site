/**
 * Mobile Device Detector
 * Comprehensive mobile device intelligence and context detection
 */

// Mobile device types
export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type Platform = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other';
export type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'wifi' | 'offline' | 'unknown';

// Full device information interface
export interface MobileDeviceInfo {
    deviceType: DeviceType;
    platform: Platform;
    screenSize: { width: number; height: number };
    viewportSize: { width: number; height: number };
    orientation: 'portrait' | 'landscape';
    pixelRatio: number;
    hasTouchScreen: boolean;
    hasHover: boolean;
    connectionType: ConnectionType;
    effectiveBandwidth: number; // Mbps estimate
    isSlowNetwork: boolean;
    dataSaverEnabled: boolean;
    isMobileDevice: boolean;
    isTablet: boolean;
    userAgent: string;
    browser: string;
    browserVersion: string;
    osVersion: string;
}

// Storage key
const DEVICE_INFO_KEY = 'ayurvritta_device_info';

/**
 * MobileDeviceDetector Class
 */
class MobileDeviceDetector {
    private deviceInfo: MobileDeviceInfo | null = null;
    private listeners: Set<(info: MobileDeviceInfo) => void> = new Set();

    constructor() {
        if (typeof window !== 'undefined') {
            this.detectDevice();
            this.setupListeners();
        }
    }

    /**
     * Detect device characteristics
     */
    detectDevice(): MobileDeviceInfo {
        const ua = navigator.userAgent;

        // Detect platform
        const platform = this.detectPlatform(ua);

        // Detect device type
        const deviceType = this.detectDeviceType(ua);

        // Screen and viewport
        const screenSize = {
            width: screen.width,
            height: screen.height,
        };

        const viewportSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // Orientation
        const orientation = viewportSize.width > viewportSize.height ? 'landscape' : 'portrait';

        // Touch detection
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Hover detection (true pointer devices)
        const hasHover = window.matchMedia('(hover: hover)').matches;

        // Connection info
        const connection = this.getConnectionInfo();

        // Browser detection
        const browserInfo = this.detectBrowser(ua);

        this.deviceInfo = {
            deviceType,
            platform,
            screenSize,
            viewportSize,
            orientation,
            pixelRatio: window.devicePixelRatio || 1,
            hasTouchScreen,
            hasHover,
            connectionType: connection.type,
            effectiveBandwidth: connection.bandwidth,
            isSlowNetwork: connection.type === '2g' || connection.type === 'slow-2g' || connection.bandwidth < 1,
            dataSaverEnabled: connection.saveData,
            isMobileDevice: deviceType === 'phone' || deviceType === 'tablet',
            isTablet: deviceType === 'tablet',
            userAgent: ua,
            browser: browserInfo.browser,
            browserVersion: browserInfo.version,
            osVersion: this.detectOSVersion(ua, platform),
        };

        // Cache the info
        this.saveDeviceInfo();

        return this.deviceInfo;
    }

    /**
     * Detect platform from user agent
     */
    private detectPlatform(ua: string): Platform {
        if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
        if (/Android/.test(ua)) return 'Android';
        if (/Windows/.test(ua)) return 'Windows';
        if (/Macintosh|Mac OS X/.test(ua)) return 'macOS';
        if (/Linux/.test(ua)) return 'Linux';
        return 'Other';
    }

    /**
     * Detect device type
     */
    private detectDeviceType(ua: string): DeviceType {
        // Tablet detection
        const isTablet = /iPad/.test(ua) ||
            (/Android/.test(ua) && !/Mobile/.test(ua)) ||
            (window.innerWidth >= 768 && window.innerWidth <= 1024 && 'ontouchstart' in window);

        if (isTablet) return 'tablet';

        // Phone detection
        const isMobile = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        if (isMobile) return 'phone';

        // Additional mobile check based on screen
        if (window.innerWidth < 768 && 'ontouchstart' in window) return 'phone';

        return 'desktop';
    }

    /**
     * Get network connection info
     */
    private getConnectionInfo(): { type: ConnectionType; bandwidth: number; saveData: boolean } {
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (!connection) {
            return { type: 'unknown', bandwidth: 10, saveData: false };
        }

        const effectiveType = connection.effectiveType as ConnectionType;
        const downlink = connection.downlink || 10; // Mbps
        const saveData = connection.saveData || false;

        // Offline detection
        if (!navigator.onLine) {
            return { type: 'offline', bandwidth: 0, saveData };
        }

        return {
            type: effectiveType || 'unknown',
            bandwidth: downlink,
            saveData,
        };
    }

    /**
     * Detect browser
     */
    private detectBrowser(ua: string): { browser: string; version: string } {
        const browsers = [
            { name: 'Chrome', regex: /Chrome\/(\d+)/ },
            { name: 'Safari', regex: /Version\/(\d+).*Safari/ },
            { name: 'Firefox', regex: /Firefox\/(\d+)/ },
            { name: 'Edge', regex: /Edg\/(\d+)/ },
            { name: 'Samsung', regex: /SamsungBrowser\/(\d+)/ },
            { name: 'Opera', regex: /OPR\/(\d+)/ },
        ];

        for (const browser of browsers) {
            const match = ua.match(browser.regex);
            if (match) {
                return { browser: browser.name, version: match[1] };
            }
        }

        return { browser: 'Unknown', version: '0' };
    }

    /**
     * Detect OS version
     */
    private detectOSVersion(ua: string, platform: Platform): string {
        const patterns: Record<Platform, RegExp> = {
            'iOS': /OS (\d+[_\.]\d+)/,
            'Android': /Android (\d+\.?\d*)/,
            'Windows': /Windows NT (\d+\.?\d*)/,
            'macOS': /Mac OS X (\d+[_\.]\d+)/,
            'Linux': /Linux/,
            'Other': /./,
        };

        const match = ua.match(patterns[platform]);
        if (match) {
            return match[1].replace(/_/g, '.');
        }
        return 'Unknown';
    }

    /**
     * Setup orientation and connection listeners
     */
    private setupListeners(): void {
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDevice();
                this.notifyListeners();
            }, 100);
        });

        // Resize (also catches orientation)
        let resizeTimer: number;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                this.detectDevice();
                this.notifyListeners();
            }, 250);
        });

        // Network change
        const connection = (navigator as any).connection;
        if (connection) {
            connection.addEventListener('change', () => {
                this.detectDevice();
                this.notifyListeners();
            });
        }

        // Online/offline
        window.addEventListener('online', () => {
            this.detectDevice();
            this.notifyListeners();
        });

        window.addEventListener('offline', () => {
            this.detectDevice();
            this.notifyListeners();
        });
    }

    /**
     * Subscribe to device changes
     */
    subscribe(callback: (info: MobileDeviceInfo) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        if (this.deviceInfo) {
            this.listeners.forEach(cb => cb(this.deviceInfo!));
        }
    }

    /**
     * Get current device info
     */
    getDeviceInfo(): MobileDeviceInfo {
        if (!this.deviceInfo) {
            return this.detectDevice();
        }
        return this.deviceInfo;
    }

    /**
     * Check if device is mobile
     */
    isMobile(): boolean {
        return this.getDeviceInfo().isMobileDevice;
    }

    /**
     * Check if on slow network
     */
    isSlowNetwork(): boolean {
        return this.getDeviceInfo().isSlowNetwork;
    }

    /**
     * Check if data saver is enabled
     */
    isDataSaverEnabled(): boolean {
        return this.getDeviceInfo().dataSaverEnabled;
    }

    /**
     * Get content loading strategy based on network
     */
    getContentStrategy(): {
        images: 'high' | 'medium' | 'low';
        video: 'autoplay' | 'poster' | 'link';
        animations: boolean;
        lazyLoadThreshold: number; // px
    } {
        const info = this.getDeviceInfo();

        if (info.dataSaverEnabled || info.connectionType === '2g' || info.connectionType === 'slow-2g') {
            return { images: 'low', video: 'link', animations: false, lazyLoadThreshold: 50 };
        }

        if (info.connectionType === '3g' || info.effectiveBandwidth < 2) {
            return { images: 'medium', video: 'poster', animations: false, lazyLoadThreshold: 100 };
        }

        return { images: 'high', video: 'autoplay', animations: true, lazyLoadThreshold: 200 };
    }

    /**
     * Get thumb zone info for CTA placement
     */
    getThumbZone(): {
        safeZone: { top: number; bottom: number };
        naturalZone: { top: number; bottom: number };
        stretchZone: { top: number; bottom: number };
    } {
        const height = this.getDeviceInfo().viewportSize.height;

        return {
            // Easy to reach (bottom 1/3)
            safeZone: { top: height * 0.67, bottom: height },
            // Natural reach (middle 1/3)
            naturalZone: { top: height * 0.33, bottom: height * 0.67 },
            // Stretch zone (top 1/3)
            stretchZone: { top: 0, bottom: height * 0.33 },
        };
    }

    /**
     * Save device info to storage
     */
    private saveDeviceInfo(): void {
        if (this.deviceInfo) {
            try {
                sessionStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(this.deviceInfo));
            } catch (e) {
                // Storage might be full
            }
        }
    }

    /**
     * Get device analytics data
     */
    getAnalyticsData(): Record<string, string | number | boolean> {
        const info = this.getDeviceInfo();
        return {
            deviceType: info.deviceType,
            platform: info.platform,
            screenWidth: info.screenSize.width,
            screenHeight: info.screenSize.height,
            viewportWidth: info.viewportSize.width,
            viewportHeight: info.viewportSize.height,
            orientation: info.orientation,
            pixelRatio: info.pixelRatio,
            hasTouchScreen: info.hasTouchScreen,
            connectionType: info.connectionType,
            isSlowNetwork: info.isSlowNetwork,
            dataSaverEnabled: info.dataSaverEnabled,
            browser: info.browser,
            browserVersion: info.browserVersion,
            osVersion: info.osVersion,
        };
    }
}

// Singleton instance
export const mobileDeviceDetector = new MobileDeviceDetector();

// Export class for testing
export { MobileDeviceDetector };
