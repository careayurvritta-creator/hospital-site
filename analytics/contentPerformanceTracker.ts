/**
 * Content Performance Tracker
 * Tracks and scores content performance across pages
 */

import { eventTracker, consentManager } from './index';
import { CONTENT_SCORING_WEIGHTS } from './config';
import type { ContentPerformance } from './types';

// Storage key
const CONTENT_PERF_KEY = 'ayurvritta_content_perf';

/**
 * ContentPerformanceTracker Class
 */
class ContentPerformanceTracker {
    private pageData: Map<string, ContentPerformance> = new Map();
    private currentPageStart: number = 0;
    private currentPath: string = '';

    constructor() {
        this.loadData();
    }

    /**
     * Load saved data from localStorage
     */
    private loadData(): void {
        try {
            const saved = localStorage.getItem(CONTENT_PERF_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Record<string, ContentPerformance>;
                Object.entries(parsed).forEach(([path, data]) => {
                    this.pageData.set(path, data);
                });
            }
        } catch (e) {
            console.error('[ContentPerf] Error loading data:', e);
        }
    }

    /**
     * Save data to localStorage
     */
    private saveData(): void {
        try {
            const obj: Record<string, ContentPerformance> = {};
            this.pageData.forEach((data, path) => {
                obj[path] = data;
            });
            localStorage.setItem(CONTENT_PERF_KEY, JSON.stringify(obj));
        } catch (e) {
            console.error('[ContentPerf] Error saving data:', e);
        }
    }

    /**
     * Start tracking a page
     */
    startTracking(path: string): void {
        this.currentPath = path;
        this.currentPageStart = Date.now();

        // Initialize page data if not exists
        if (!this.pageData.has(path)) {
            this.pageData.set(path, {
                path,
                pageViews: 0,
                uniqueVisitors: 0,
                avgTimeOnPage: 0,
                avgScrollDepth: 0,
                bounceRate: 0,
                exitRate: 0,
                engagementRate: 0,
                conversionRate: 0,
                score: 0,
            });
        }

        // Increment page views
        const data = this.pageData.get(path)!;
        data.pageViews++;
        this.saveData();
    }

    /**
     * End tracking for current page
     */
    endTracking(scrollDepth: number, hadEngagement: boolean, converted: boolean): void {
        if (!this.currentPath || !this.currentPageStart) return;

        const timeOnPage = Date.now() - this.currentPageStart;
        const data = this.pageData.get(this.currentPath);

        if (!data) return;

        // Update metrics with running averages
        const n = data.pageViews;
        data.avgTimeOnPage = ((data.avgTimeOnPage * (n - 1)) + timeOnPage) / n;
        data.avgScrollDepth = ((data.avgScrollDepth * (n - 1)) + scrollDepth) / n;

        // Update engagement rate
        const engagedCount = Math.round(data.engagementRate * (n - 1) / 100) + (hadEngagement ? 1 : 0);
        data.engagementRate = (engagedCount / n) * 100;

        // Update conversion rate
        const convertedCount = Math.round(data.conversionRate * (n - 1) / 100) + (converted ? 1 : 0);
        data.conversionRate = (convertedCount / n) * 100;

        // Calculate score
        data.score = this.calculateScore(data);

        this.saveData();
        this.currentPath = '';
        this.currentPageStart = 0;
    }

    /**
     * Calculate content performance score
     */
    private calculateScore(data: ContentPerformance): number {
        // Normalize metrics (0-100 scale)
        const timeScore = Math.min(data.avgTimeOnPage / 180000 * 100, 100); // 3 min = 100
        const scrollScore = data.avgScrollDepth;
        const engagementScore = data.engagementRate;
        const conversionScore = Math.min(data.conversionRate * 10, 100); // 10% = 100

        // Weighted score
        const score =
            timeScore * CONTENT_SCORING_WEIGHTS.timeOnPage +
            scrollScore * CONTENT_SCORING_WEIGHTS.scrollDepth +
            engagementScore * CONTENT_SCORING_WEIGHTS.engagementActions +
            conversionScore * CONTENT_SCORING_WEIGHTS.conversionRate;

        return Math.round(score);
    }

    /**
     * Get performance data for a page
     */
    getPagePerformance(path: string): ContentPerformance | undefined {
        return this.pageData.get(path);
    }

    /**
     * Get all page performances
     */
    getAllPerformances(): ContentPerformance[] {
        return Array.from(this.pageData.values());
    }

    /**
     * Get top performing pages
     */
    getTopPages(limit: number = 5): ContentPerformance[] {
        return this.getAllPerformances()
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Get underperforming pages
     */
    getUnderperformingPages(threshold: number = 30): ContentPerformance[] {
        return this.getAllPerformances()
            .filter(p => p.score < threshold && p.pageViews >= 5)
            .sort((a, b) => a.score - b.score);
    }

    /**
     * Get performance summary
     */
    getSummary(): object {
        const all = this.getAllPerformances();
        if (all.length === 0) return { pages: 0 };

        const totalViews = all.reduce((sum, p) => sum + p.pageViews, 0);
        const avgScore = all.reduce((sum, p) => sum + p.score, 0) / all.length;
        const avgEngagement = all.reduce((sum, p) => sum + p.engagementRate, 0) / all.length;

        return {
            totalPages: all.length,
            totalPageViews: totalViews,
            avgContentScore: Math.round(avgScore),
            avgEngagementRate: Math.round(avgEngagement),
            topPerformer: this.getTopPages(1)[0]?.path || 'N/A',
            needsImprovement: this.getUnderperformingPages()[0]?.path || 'None',
        };
    }

    /**
     * Clear all data
     */
    clearData(): void {
        this.pageData.clear();
        localStorage.removeItem(CONTENT_PERF_KEY);
    }
}

// Singleton instance
export const contentPerformanceTracker = new ContentPerformanceTracker();

// Export class for testing
export { ContentPerformanceTracker };
