/**
 * useAvailability Hook
 * Manages appointment slot availability
 * Currently mocks data, but structured for API integration
 */

import { useState, useCallback } from 'react';

export interface TimeSlot {
    time: string;
    available: boolean;
}

export const useAvailability = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mock function to check availability for a date
    const checkAvailability = useCallback(async (date: Date): Promise<TimeSlot[]> => {
        setLoading(true);
        setError(null);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 600));

            // Mock logic: Weekends have fewer slots
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            // Generate slots
            const slots = [
                "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                "11:00 AM", "11:30 AM", "04:00 PM", "04:30 PM",
                "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                "07:00 PM", "07:30 PM"
            ].map(time => ({
                time,
                // Randomly mark some as unavailable for realism
                available: isWeekend ? Math.random() > 0.4 : Math.random() > 0.2
            }));

            setLoading(false);
            return slots;
        } catch (err) {
            setError('Failed to fetch availability');
            setLoading(false);
            return [];
        }
    }, []);

    return {
        checkAvailability,
        loading,
        error
    };
};
