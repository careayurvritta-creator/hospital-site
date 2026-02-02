/**
 * useMobileDevice Hook
 * React hook for accessing mobile device information
 */

import { useState, useEffect } from 'react';
import { mobileDeviceDetector, MobileDeviceInfo } from '../analytics/mobileDeviceDetector';

interface UseMobileDeviceResult {
    deviceInfo: MobileDeviceInfo | null;
    isMobile: boolean;
    isTablet: boolean;
    isSlowNetwork: boolean;
    orientation: 'portrait' | 'landscape';
    contentStrategy: {
        images: 'high' | 'medium' | 'low';
        video: 'autoplay' | 'poster' | 'link';
        animations: boolean;
        lazyLoadThreshold: number;
    };
    thumbZone: {
        safeZone: { top: number; bottom: number };
        naturalZone: { top: number; bottom: number };
        stretchZone: { top: number; bottom: number };
    };
}

/**
 * useMobileDevice Hook
 */
export function useMobileDevice(): UseMobileDeviceResult {
    const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo | null>(null);

    useEffect(() => {
        // Get initial device info
        setDeviceInfo(mobileDeviceDetector.getDeviceInfo());

        // Subscribe to changes
        const unsubscribe = mobileDeviceDetector.subscribe((info) => {
            setDeviceInfo(info);
        });

        return () => unsubscribe();
    }, []);

    return {
        deviceInfo,
        isMobile: deviceInfo?.isMobileDevice ?? false,
        isTablet: deviceInfo?.isTablet ?? false,
        isSlowNetwork: deviceInfo?.isSlowNetwork ?? false,
        orientation: deviceInfo?.orientation ?? 'portrait',
        contentStrategy: mobileDeviceDetector.getContentStrategy(),
        thumbZone: mobileDeviceDetector.getThumbZone(),
    };
}

/**
 * useNetworkStatus Hook
 * Tracks network connection status
 */
export function useNetworkStatus(): {
    isOnline: boolean;
    connectionType: string;
    isSlowNetwork: boolean;
    dataSaverEnabled: boolean;
} {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [deviceInfo, setDeviceInfo] = useState(mobileDeviceDetector.getDeviceInfo());

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const unsubscribe = mobileDeviceDetector.subscribe((info) => {
            setDeviceInfo(info);
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubscribe();
        };
    }, []);

    return {
        isOnline,
        connectionType: deviceInfo?.connectionType ?? 'unknown',
        isSlowNetwork: deviceInfo?.isSlowNetwork ?? false,
        dataSaverEnabled: deviceInfo?.dataSaverEnabled ?? false,
    };
}

/**
 * useOrientation Hook
 * Tracks device orientation changes
 */
export function useOrientation(): 'portrait' | 'landscape' {
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    );

    useEffect(() => {
        const handleResize = () => {
            setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return orientation;
}

export default useMobileDevice;
