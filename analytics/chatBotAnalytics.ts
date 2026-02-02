/**
 * ChatBot Analytics Tracker
 * Enhanced tracking for ChatBot conversations
 */

import { eventTracker, userSegmentation } from '../analytics';
import { sanitizePII, generateId } from './utils';
import type { ChatBotEvent } from './types';

// Storage keys
const CONVERSATION_KEY = 'ayurvritta_chat_conversation';
const CHAT_ANALYTICS_KEY = 'ayurvritta_chat_analytics';

// Intent patterns for classification
const INTENT_PATTERNS = {
    booking: /book|appointment|schedule|visit|consult/i,
    pricing: /price|cost|fee|charge|payment|expensive/i,
    services: /service|treatment|therapy|panchakarma|massage/i,
    information: /what|how|when|where|why|tell|explain/i,
    support: /help|problem|issue|complaint|refund/i,
    greeting: /hello|hi|hey|namaste|good morning|good evening/i,
    dosha: /dosha|vata|pitta|kapha|prakriti|constitution/i,
    location: /location|address|direction|near|where are you/i,
};

// Sentiment keywords
const SENTIMENT_KEYWORDS = {
    positive: ['great', 'good', 'thanks', 'thank you', 'helpful', 'excellent', 'amazing', 'love', 'perfect'],
    negative: ['bad', 'poor', 'terrible', 'hate', 'worst', 'unhelpful', 'confused', 'frustrated', 'disappointed'],
};

/**
 * ChatBotAnalytics Class
 */
class ChatBotAnalytics {
    private conversationId: string;
    private messageIndex: number = 0;
    private conversationStart: number;
    private messages: Array<{ role: 'user' | 'model'; text: string; timestamp: number }> = [];
    private detectedIntents: Set<string> = new Set();

    constructor() {
        this.conversationId = this.loadOrCreateConversation();
        this.conversationStart = Date.now();
    }

    /**
     * Load or create conversation ID
     */
    private loadOrCreateConversation(): string {
        const saved = sessionStorage.getItem(CONVERSATION_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.messageIndex = data.messageIndex || 0;
                this.messages = data.messages || [];
                this.detectedIntents = new Set(data.intents || []);
                return data.id;
            } catch (e) {
                // Invalid data
            }
        }
        return `conv_${generateId()}`;
    }

    /**
     * Save conversation state
     */
    private saveConversation(): void {
        try {
            sessionStorage.setItem(CONVERSATION_KEY, JSON.stringify({
                id: this.conversationId,
                messageIndex: this.messageIndex,
                messages: this.messages.slice(-50), // Keep last 50 messages
                intents: [...this.detectedIntents],
            }));
        } catch (e) {
            console.error('Error saving conversation:', e);
        }
    }

    /**
     * Track chat open
     */
    trackOpen(): void {
        eventTracker.trackChatBotEvent({
            action: 'open',
            conversationId: this.conversationId,
            messageIndex: this.messageIndex,
            language: navigator.language,
            timestamp: Date.now(),
        });

        // Track interest in chatbot
        userSegmentation.trackInterest('chatbot');
    }

    /**
     * Track chat close
     */
    trackClose(): void {
        eventTracker.trackChatBotEvent({
            action: 'close',
            conversationId: this.conversationId,
            messageIndex: this.messageIndex,
            language: navigator.language,
            timestamp: Date.now(),
        });

        // Save conversation analytics
        this.saveConversationAnalytics();
    }

    /**
     * Track user message
     */
    trackUserMessage(message: string): void {
        const sanitized = sanitizePII(message);
        const intent = this.classifyIntent(message);
        const sentiment = this.analyzeSentiment(message);

        // Store message
        this.messages.push({
            role: 'user',
            text: sanitized.slice(0, 200), // Limit stored length
            timestamp: Date.now(),
        });

        // Track intent
        if (intent) {
            this.detectedIntents.add(intent);
            userSegmentation.trackInterest(intent);
        }

        // Track event
        eventTracker.trackChatBotEvent({
            action: 'message_sent',
            messageContent: sanitized.slice(0, 100), // Limit for analytics
            messageLength: message.length,
            conversationId: this.conversationId,
            messageIndex: this.messageIndex++,
            language: navigator.language,
            timestamp: Date.now(),
            sentiment,
            intent: intent || undefined,
        });

        this.saveConversation();
    }

    /**
     * Track bot response
     */
    trackBotResponse(message: string, responseTime?: number): void {
        const sanitized = sanitizePII(message);

        // Store message
        this.messages.push({
            role: 'model',
            text: sanitized.slice(0, 500),
            timestamp: Date.now(),
        });

        // Track event
        eventTracker.trackChatBotEvent({
            action: 'message_received',
            messageContent: sanitized.slice(0, 100),
            messageLength: message.length,
            conversationId: this.conversationId,
            messageIndex: this.messageIndex++,
            language: navigator.language,
            timestamp: Date.now(),
            responseTime,
        });

        this.saveConversation();
    }

    /**
     * Track error
     */
    trackError(errorMessage: string): void {
        eventTracker.trackChatBotEvent({
            action: 'error',
            messageContent: errorMessage,
            conversationId: this.conversationId,
            messageIndex: this.messageIndex,
            language: navigator.language,
            timestamp: Date.now(),
        });
    }

    /**
     * Classify user intent
     */
    private classifyIntent(message: string): string | null {
        for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
            if (pattern.test(message)) {
                return intent;
            }
        }
        return null;
    }

    /**
     * Analyze sentiment
     */
    private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
        const lower = message.toLowerCase();

        const positiveCount = SENTIMENT_KEYWORDS.positive.filter(w => lower.includes(w)).length;
        const negativeCount = SENTIMENT_KEYWORDS.negative.filter(w => lower.includes(w)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * Get conversation summary
     */
    getConversationSummary(): object {
        const duration = Date.now() - this.conversationStart;
        const userMessages = this.messages.filter(m => m.role === 'user');
        const botMessages = this.messages.filter(m => m.role === 'model');

        return {
            conversationId: this.conversationId,
            totalMessages: this.messages.length,
            userMessages: userMessages.length,
            botMessages: botMessages.length,
            duration,
            intents: [...this.detectedIntents],
            avgResponseLength: botMessages.length > 0
                ? Math.round(botMessages.reduce((sum, m) => sum + m.text.length, 0) / botMessages.length)
                : 0,
        };
    }

    /**
     * Save conversation analytics for aggregate analysis
     */
    private saveConversationAnalytics(): void {
        const summary = this.getConversationSummary();

        try {
            const saved = localStorage.getItem(CHAT_ANALYTICS_KEY);
            const analytics = saved ? JSON.parse(saved) : [];

            analytics.push({
                ...summary,
                timestamp: Date.now(),
            });

            // Keep last 100 conversations
            if (analytics.length > 100) {
                analytics.shift();
            }

            localStorage.setItem(CHAT_ANALYTICS_KEY, JSON.stringify(analytics));
        } catch (e) {
            console.error('Error saving chat analytics:', e);
        }
    }

    /**
     * Get aggregate analytics
     */
    getAggregateAnalytics(): object {
        try {
            const saved = localStorage.getItem(CHAT_ANALYTICS_KEY);
            if (!saved) return { conversations: 0 };

            const analytics = JSON.parse(saved) as any[];

            // Calculate aggregates
            const totalConversations = analytics.length;
            const totalMessages = analytics.reduce((sum, c) => sum + c.totalMessages, 0);
            const avgDuration = analytics.reduce((sum, c) => sum + c.duration, 0) / totalConversations;

            // Most common intents
            const intentCounts: Record<string, number> = {};
            analytics.forEach(c => {
                (c.intents || []).forEach((intent: string) => {
                    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
                });
            });

            const topIntents = Object.entries(intentCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([intent, count]) => ({ intent, count }));

            return {
                totalConversations,
                totalMessages,
                avgMessagesPerConversation: Math.round(totalMessages / totalConversations),
                avgDuration: Math.round(avgDuration / 1000), // in seconds
                topIntents,
            };
        } catch (e) {
            return { conversations: 0, error: 'Failed to load analytics' };
        }
    }

    /**
     * Start new conversation
     */
    startNewConversation(): void {
        this.saveConversationAnalytics();
        this.conversationId = `conv_${generateId()}`;
        this.messageIndex = 0;
        this.messages = [];
        this.detectedIntents.clear();
        this.conversationStart = Date.now();
        sessionStorage.removeItem(CONVERSATION_KEY);
    }

    /**
     * Get current conversation ID
     */
    getConversationId(): string {
        return this.conversationId;
    }
}

// Singleton instance
export const chatBotAnalytics = new ChatBotAnalytics();

// Export class for testing
export { ChatBotAnalytics };
