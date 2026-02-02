/**
 * Analytics Dashboard Component
 * Admin view for analytics data (development only)
 */

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Users,
    Eye,
    Clock,
    MousePointer,
    TrendingUp,
    MessageCircle,
    Activity,
    Target,
} from 'lucide-react';
import {
    eventTracker,
    userSegmentation,
    chatBotAnalytics,
    performanceMonitor,
} from '../analytics';

// Colors for charts
const COLORS = ['#0F3D3E', '#C27A12', '#1a5a5c', '#d4922e', '#2a7a7c'];

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, change, changeType }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-[#0F3D3E]">{value}</p>
                {change && (
                    <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-600' :
                            changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {change}
                    </p>
                )}
            </div>
            <div className="p-2 bg-[#0F3D3E]/10 rounded-lg text-[#0F3D3E]">
                {icon}
            </div>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC = () => {
    const [sessionData, setSessionData] = useState(eventTracker.getSessionData());
    const [segments, setSegments] = useState(userSegmentation.getSegments());
    const [leadScore, setLeadScore] = useState(eventTracker.getLeadScore());
    const [leadStatus, setLeadStatus] = useState(userSegmentation.getLeadStatus());
    const [chatAnalytics, setChatAnalytics] = useState<any>({});
    const [performanceMetrics, setPerformanceMetrics] = useState<any>({});

    useEffect(() => {
        // Update data periodically
        const interval = setInterval(() => {
            setSessionData(eventTracker.getSessionData());
            setSegments(userSegmentation.getSegments());
            setLeadScore(eventTracker.getLeadScore());
            setLeadStatus(userSegmentation.getLeadStatus());
            setChatAnalytics(chatBotAnalytics.getAggregateAnalytics());
            setPerformanceMetrics(performanceMonitor.getMetricsSummary());
        }, 2000);

        // Initial load
        setChatAnalytics(chatBotAnalytics.getAggregateAnalytics());
        setPerformanceMetrics(performanceMonitor.getMetricsSummary());

        return () => clearInterval(interval);
    }, []);

    // Segment data for pie chart
    const segmentData = segments.map(segment => ({
        name: segment.replace(/_/g, ' '),
        value: 1,
    }));

    // Performance data for bar chart
    const perfData = Object.entries(performanceMetrics).map(([key, data]: [string, any]) => ({
        name: key,
        value: data?.value || 0,
        rating: data?.rating || 'unknown',
    }));

    // Lead score gauge
    const getLeadScoreColor = () => {
        if (leadScore >= 81) return '#22c55e'; // green
        if (leadScore >= 51) return '#f59e0b'; // amber
        if (leadScore >= 21) return '#3b82f6'; // blue
        return '#6b7280'; // gray
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 w-96 bg-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1a5a5c] px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5" />
                    <h2 className="font-bold">Analytics Dashboard</h2>
                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">DEV</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <MetricCard
                        title="Page Views"
                        value={sessionData.pageViews}
                        icon={<Eye className="w-4 h-4" />}
                    />
                    <MetricCard
                        title="Engagement"
                        value={`${Math.floor(sessionData.engagementTime / 1000)}s`}
                        icon={<Clock className="w-4 h-4" />}
                    />
                    <MetricCard
                        title="Lead Score"
                        value={leadScore}
                        icon={<Target className="w-4 h-4" />}
                        change={leadStatus.toUpperCase()}
                        changeType={leadScore >= 51 ? 'positive' : 'neutral'}
                    />
                    <MetricCard
                        title="Events"
                        value={sessionData.events}
                        icon={<MousePointer className="w-4 h-4" />}
                    />
                </div>

                {/* Segments */}
                {segments.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            User Segments
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {segments.map(segment => (
                                <span
                                    key={segment}
                                    className="px-2 py-1 bg-[#0F3D3E]/10 text-[#0F3D3E] rounded-full text-xs font-medium"
                                >
                                    {segment.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lead Score Gauge */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Lead Score Progress
                    </h3>
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full transition-all duration-500 rounded-full"
                            style={{
                                width: `${Math.min(leadScore, 100)}%`,
                                backgroundColor: getLeadScoreColor(),
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Cold</span>
                        <span>Warm</span>
                        <span>Hot</span>
                        <span>Ready</span>
                    </div>
                </div>

                {/* Performance Metrics */}
                {Object.keys(performanceMetrics).length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Core Web Vitals</h3>
                        <div className="space-y-2">
                            {perfData.map(metric => (
                                <div key={metric.name} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{metric.name}</span>
                                    <span className={`text-sm font-medium ${metric.rating === 'good' ? 'text-green-600' :
                                            metric.rating === 'needs-improvement' ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {metric.value.toFixed(0)}ms
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ChatBot Analytics */}
                {chatAnalytics.totalConversations > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            ChatBot Insights
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Conversations</span>
                                <p className="font-medium text-[#0F3D3E]">{chatAnalytics.totalConversations}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Avg Duration</span>
                                <p className="font-medium text-[#0F3D3E]">{chatAnalytics.avgDuration}s</p>
                            </div>
                        </div>
                        {chatAnalytics.topIntents?.length > 0 && (
                            <div className="mt-3">
                                <span className="text-xs text-gray-500">Top Intents:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {chatAnalytics.topIntents.slice(0, 3).map((intent: any) => (
                                        <span
                                            key={intent.intent}
                                            className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                                        >
                                            {intent.intent}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Session Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>Session: {sessionData.sessionId.slice(0, 20)}...</p>
                        <p>Device: {sessionData.deviceType} • {sessionData.browser}</p>
                        <p>Referrer: {sessionData.referrer || 'Direct'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
