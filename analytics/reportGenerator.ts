/**
 * Automated Reporting
 * Generates analytics reports and insights
 */

import { eventTracker, userSegmentation, performanceMonitor, chatBotAnalytics, consentManager } from './index';
import { contentPerformanceTracker } from './contentPerformanceTracker';
import { sentimentAnalyzer } from './sentimentAnalyzer';

// Report types
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';
export type ReportType = 'overview' | 'engagement' | 'conversion' | 'performance' | 'chatbot';

export interface ReportSection {
    title: string;
    metrics: { label: string; value: string | number; change?: string; changeType?: 'positive' | 'negative' | 'neutral' }[];
    insights?: string[];
    recommendations?: string[];
}

export interface AnalyticsReport {
    type: ReportType;
    period: ReportPeriod;
    generatedAt: string;
    dateRange: { start: string; end: string };
    sections: ReportSection[];
    summary: string;
}

/**
 * ReportGenerator Class
 */
class ReportGenerator {
    /**
     * Generate overview report
     */
    generateOverviewReport(): AnalyticsReport {
        const sessionData = eventTracker.getSessionData();
        const leadScore = eventTracker.getLeadScore();
        const segments = userSegmentation.getSegments();
        const perfMetrics = performanceMonitor.getMetricsSummary();
        const contentSummary = contentPerformanceTracker.getSummary() as any;

        const sections: ReportSection[] = [
            {
                title: 'Session Overview',
                metrics: [
                    { label: 'Page Views', value: sessionData.pageViews },
                    { label: 'Events Tracked', value: sessionData.events },
                    { label: 'Engagement Time', value: `${Math.floor(sessionData.engagementTime / 1000)}s` },
                    { label: 'Device', value: sessionData.deviceType },
                ],
            },
            {
                title: 'User Profile',
                metrics: [
                    { label: 'Lead Score', value: leadScore, changeType: leadScore >= 50 ? 'positive' : 'neutral' },
                    { label: 'Lead Status', value: userSegmentation.getLeadStatus().toUpperCase() },
                    { label: 'Segments', value: segments.length > 0 ? segments.join(', ') : 'None yet' },
                    { label: 'Is New User', value: sessionData.isNewUser ? 'Yes' : 'No' },
                ],
                insights: this.generateUserInsights(leadScore, segments),
            },
            {
                title: 'Content Performance',
                metrics: [
                    { label: 'Pages Tracked', value: contentSummary.totalPages || 0 },
                    { label: 'Avg Content Score', value: contentSummary.avgContentScore || 'N/A' },
                    { label: 'Top Performer', value: contentSummary.topPerformer || 'N/A' },
                ],
            },
        ];

        // Add performance section if available
        if (Object.keys(perfMetrics).length > 0) {
            sections.push({
                title: 'Performance Metrics',
                metrics: Object.entries(perfMetrics).map(([key, data]: [string, any]) => ({
                    label: key,
                    value: `${data?.value || 0}ms`,
                    changeType: data?.rating === 'good' ? 'positive' : data?.rating === 'poor' ? 'negative' : 'neutral',
                })),
            });
        }

        return {
            type: 'overview',
            period: 'daily',
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: new Date(sessionData.startTime).toISOString(),
                end: new Date().toISOString(),
            },
            sections,
            summary: this.generateSummary(sessionData, leadScore),
        };
    }

    /**
     * Generate engagement report
     */
    generateEngagementReport(): AnalyticsReport {
        const sessionData = eventTracker.getSessionData();
        const topPages = contentPerformanceTracker.getTopPages(5);
        const underperforming = contentPerformanceTracker.getUnderperformingPages(30);

        const sections: ReportSection[] = [
            {
                title: 'Engagement Summary',
                metrics: [
                    { label: 'Total Engagement Time', value: `${Math.floor(sessionData.engagementTime / 1000)}s` },
                    { label: 'Pages per Session', value: sessionData.pageViews },
                    { label: 'Events per Session', value: sessionData.events },
                ],
            },
            {
                title: 'Top Performing Content',
                metrics: topPages.map((p, i) => ({
                    label: `#${i + 1} ${p.path}`,
                    value: `Score: ${p.score}`,
                })),
                insights: topPages.length > 0
                    ? [`Best performing content: ${topPages[0].path} with score of ${topPages[0].score}`]
                    : ['Not enough data to determine top content'],
            },
        ];

        if (underperforming.length > 0) {
            sections.push({
                title: 'Needs Improvement',
                metrics: underperforming.slice(0, 3).map(p => ({
                    label: p.path,
                    value: `Score: ${p.score}`,
                    changeType: 'negative' as const,
                })),
                recommendations: [
                    'Review content quality and relevance',
                    'Improve page load speed',
                    'Add more engaging elements',
                ],
            });
        }

        return {
            type: 'engagement',
            period: 'daily',
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: new Date(sessionData.startTime).toISOString(),
                end: new Date().toISOString(),
            },
            sections,
            summary: `Engagement report with ${topPages.length} top pages and ${underperforming.length} pages needing improvement.`,
        };
    }

    /**
     * Generate chatbot report
     */
    generateChatbotReport(): AnalyticsReport {
        const chatAnalytics = chatBotAnalytics.getAggregateAnalytics() as any;
        const conversationSummary = chatBotAnalytics.getConversationSummary() as any;

        const sections: ReportSection[] = [
            {
                title: 'ChatBot Overview',
                metrics: [
                    { label: 'Total Conversations', value: chatAnalytics.totalConversations || 0 },
                    { label: 'Total Messages', value: chatAnalytics.totalMessages || 0 },
                    { label: 'Avg Messages/Conversation', value: chatAnalytics.avgMessagesPerConversation || 0 },
                    { label: 'Avg Duration', value: `${chatAnalytics.avgDuration || 0}s` },
                ],
            },
        ];

        if (chatAnalytics.topIntents?.length > 0) {
            sections.push({
                title: 'Top User Intents',
                metrics: chatAnalytics.topIntents.map((intent: any) => ({
                    label: intent.intent.charAt(0).toUpperCase() + intent.intent.slice(1),
                    value: `${intent.count} times`,
                })),
                insights: this.generateIntentInsights(chatAnalytics.topIntents),
            });
        }

        if (conversationSummary.intents?.length > 0) {
            sections.push({
                title: 'Current Session',
                metrics: [
                    { label: 'Messages', value: conversationSummary.totalMessages },
                    { label: 'Detected Intents', value: conversationSummary.intents.join(', ') || 'None' },
                ],
            });
        }

        return {
            type: 'chatbot',
            period: 'daily',
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: new Date().toISOString(),
                end: new Date().toISOString(),
            },
            sections,
            summary: `ChatBot handled ${chatAnalytics.totalConversations || 0} conversations with avg ${chatAnalytics.avgMessagesPerConversation || 0} messages each.`,
        };
    }

    /**
     * Generate intent-based insights
     */
    private generateIntentInsights(intents: any[]): string[] {
        const insights: string[] = [];

        intents.forEach(intent => {
            switch (intent.intent) {
                case 'booking':
                    insights.push('High booking intent detected - ensure booking flow is optimized');
                    break;
                case 'pricing':
                    insights.push('Users asking about pricing - consider adding pricing page or transparency');
                    break;
                case 'services':
                    insights.push('Service inquiries common - service pages are important');
                    break;
                case 'support':
                    insights.push('Support queries detected - review FAQ coverage');
                    break;
            }
        });

        return insights;
    }

    /**
     * Generate user insights based on score and segments
     */
    private generateUserInsights(leadScore: number, segments: string[]): string[] {
        const insights: string[] = [];

        if (leadScore >= 80) {
            insights.push('High-value lead ready for conversion - prioritize engagement');
        } else if (leadScore >= 50) {
            insights.push('Warm lead with good engagement - nurture with relevant content');
        } else {
            insights.push('New or exploring user - focus on education and value proposition');
        }

        if (segments.includes('service_explorer')) {
            insights.push('User is actively comparing services - offer comparison tools');
        }

        if (segments.includes('tool_user')) {
            insights.push('Engaged with health tools - personalize based on dosha');
        }

        return insights;
    }

    /**
     * Generate summary text
     */
    private generateSummary(sessionData: any, leadScore: number): string {
        const status = userSegmentation.getLeadStatus();
        const engagementMins = Math.floor(sessionData.engagementTime / 60000);

        return `Session with ${sessionData.pageViews} page views and ${engagementMins} minutes engagement. Lead score: ${leadScore} (${status}). Device: ${sessionData.deviceType}.`;
    }

    /**
     * Export report as JSON
     */
    exportReportJSON(report: AnalyticsReport): string {
        return JSON.stringify(report, null, 2);
    }

    /**
     * Export report as formatted text
     */
    exportReportText(report: AnalyticsReport): string {
        let text = `# ${report.type.toUpperCase()} REPORT\n`;
        text += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n`;
        text += `Period: ${report.dateRange.start} to ${report.dateRange.end}\n\n`;
        text += `## Summary\n${report.summary}\n\n`;

        report.sections.forEach(section => {
            text += `## ${section.title}\n`;
            section.metrics.forEach(m => {
                text += `- ${m.label}: ${m.value}`;
                if (m.change) text += ` (${m.change})`;
                text += '\n';
            });
            if (section.insights) {
                text += '\n### Insights\n';
                section.insights.forEach(i => text += `- ${i}\n`);
            }
            if (section.recommendations) {
                text += '\n### Recommendations\n';
                section.recommendations.forEach(r => text += `- ${r}\n`);
            }
            text += '\n';
        });

        return text;
    }
}

// Singleton instance
export const reportGenerator = new ReportGenerator();

// Export class for testing
export { ReportGenerator };
