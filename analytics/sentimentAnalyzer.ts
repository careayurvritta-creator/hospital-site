/**
 * Sentiment Analyzer
 * Analyzes text sentiment from user feedback and chat messages
 */

// Sentiment keywords with weights
const POSITIVE_WORDS: Record<string, number> = {
    'great': 3, 'excellent': 4, 'amazing': 4, 'wonderful': 4, 'fantastic': 4,
    'good': 2, 'nice': 2, 'helpful': 3, 'thanks': 2, 'thank': 2,
    'love': 4, 'perfect': 4, 'best': 3, 'awesome': 4, 'brilliant': 4,
    'satisfied': 3, 'happy': 3, 'pleased': 3, 'impressed': 3,
    'recommend': 3, 'professional': 2, 'friendly': 2, 'caring': 3,
    'clean': 2, 'comfortable': 2, 'relaxing': 3, 'effective': 3,
    'healed': 4, 'cured': 4, 'better': 3, 'improved': 3, 'relief': 3,
};

const NEGATIVE_WORDS: Record<string, number> = {
    'bad': 3, 'terrible': 4, 'awful': 4, 'horrible': 4, 'worst': 4,
    'poor': 3, 'disappointing': 3, 'disappointed': 3, 'frustrated': 3,
    'hate': 4, 'useless': 4, 'waste': 3, 'expensive': 2, 'overpriced': 3,
    'rude': 3, 'unprofessional': 3, 'dirty': 3, 'uncomfortable': 2,
    'pain': 2, 'hurt': 2, 'waiting': 2, 'slow': 2, 'delayed': 2,
    'confused': 2, 'unclear': 2, 'unhelpful': 3, 'problem': 2, 'issue': 2,
    'refund': 3, 'cancel': 2, 'cancelled': 2, 'avoid': 3, 'never': 2,
};

const INTENSIFIERS: Record<string, number> = {
    'very': 1.5, 'really': 1.5, 'extremely': 2, 'absolutely': 2,
    'totally': 1.5, 'completely': 1.5, 'incredibly': 2, 'super': 1.5,
    'somewhat': 0.5, 'slightly': 0.5, 'a bit': 0.5, 'kind of': 0.5,
};

const NEGATORS = ['not', 'no', "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't", 'never'];

export interface SentimentResult {
    score: number; // -1 to 1
    label: 'positive' | 'neutral' | 'negative';
    confidence: number; // 0 to 1
    positiveWords: string[];
    negativeWords: string[];
    suggestions?: string[];
}

/**
 * SentimentAnalyzer Class
 */
class SentimentAnalyzer {
    /**
     * Analyze sentiment of text
     */
    analyze(text: string): SentimentResult {
        const words = this.tokenize(text);
        const positiveFound: string[] = [];
        const negativeFound: string[] = [];

        let positiveScore = 0;
        let negativeScore = 0;
        let currentIntensifier = 1;
        let isNegated = false;

        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            const prevWord = i > 0 ? words[i - 1].toLowerCase() : '';

            // Check for intensifiers
            if (INTENSIFIERS[word]) {
                currentIntensifier = INTENSIFIERS[word];
                continue;
            }

            // Check for negators
            if (NEGATORS.includes(word)) {
                isNegated = true;
                continue;
            }

            // Check positive words
            if (POSITIVE_WORDS[word]) {
                const weight = POSITIVE_WORDS[word] * currentIntensifier;
                if (isNegated) {
                    negativeScore += weight;
                    negativeFound.push(word);
                } else {
                    positiveScore += weight;
                    positiveFound.push(word);
                }
            }

            // Check negative words
            if (NEGATIVE_WORDS[word]) {
                const weight = NEGATIVE_WORDS[word] * currentIntensifier;
                if (isNegated) {
                    positiveScore += weight * 0.5; // Negating negative is weak positive
                    positiveFound.push(`not ${word}`);
                } else {
                    negativeScore += weight;
                    negativeFound.push(word);
                }
            }

            // Reset modifiers after processing
            currentIntensifier = 1;
            isNegated = false;
        }

        // Calculate final score (-1 to 1)
        const totalScore = positiveScore + negativeScore;
        let normalizedScore = 0;

        if (totalScore > 0) {
            normalizedScore = (positiveScore - negativeScore) / totalScore;
        }

        // Clamp to range
        normalizedScore = Math.max(-1, Math.min(1, normalizedScore));

        // Determine label
        let label: 'positive' | 'neutral' | 'negative';
        if (normalizedScore > 0.2) {
            label = 'positive';
        } else if (normalizedScore < -0.2) {
            label = 'negative';
        } else {
            label = 'neutral';
        }

        // Calculate confidence
        const wordCount = words.length;
        const sentimentWordCount = positiveFound.length + negativeFound.length;
        const confidence = Math.min(sentimentWordCount / Math.max(wordCount * 0.3, 1), 1);

        // Generate suggestions for negative feedback
        const suggestions = label === 'negative' ? this.generateSuggestions(negativeFound) : undefined;

        return {
            score: Math.round(normalizedScore * 100) / 100,
            label,
            confidence: Math.round(confidence * 100) / 100,
            positiveWords: positiveFound,
            negativeWords: negativeFound,
            suggestions,
        };
    }

    /**
     * Tokenize text into words
     */
    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s']/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }

    /**
     * Generate improvement suggestions based on negative feedback
     */
    private generateSuggestions(negativeWords: string[]): string[] {
        const suggestions: string[] = [];

        if (negativeWords.some(w => ['waiting', 'slow', 'delayed'].includes(w))) {
            suggestions.push('Consider improving appointment scheduling and wait times');
        }

        if (negativeWords.some(w => ['expensive', 'overpriced', 'cost'].includes(w))) {
            suggestions.push('Review pricing communication and value proposition');
        }

        if (negativeWords.some(w => ['rude', 'unprofessional', 'unfriendly'].includes(w))) {
            suggestions.push('Staff training on customer service may be beneficial');
        }

        if (negativeWords.some(w => ['confused', 'unclear', 'understand'].includes(w))) {
            suggestions.push('Improve communication clarity about treatments and procedures');
        }

        if (negativeWords.some(w => ['dirty', 'unclean', 'hygiene'].includes(w))) {
            suggestions.push('Review and enhance cleanliness protocols');
        }

        return suggestions;
    }

    /**
     * Analyze multiple texts and return aggregate sentiment
     */
    analyzeMultiple(texts: string[]): {
        overall: SentimentResult;
        breakdown: { positive: number; neutral: number; negative: number };
        averageScore: number;
    } {
        const results = texts.map(t => this.analyze(t));

        const breakdown = {
            positive: results.filter(r => r.label === 'positive').length,
            neutral: results.filter(r => r.label === 'neutral').length,
            negative: results.filter(r => r.label === 'negative').length,
        };

        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

        // Combine all words
        const allPositive = results.flatMap(r => r.positiveWords);
        const allNegative = results.flatMap(r => r.negativeWords);

        return {
            overall: {
                score: Math.round(averageScore * 100) / 100,
                label: averageScore > 0.2 ? 'positive' : averageScore < -0.2 ? 'negative' : 'neutral',
                confidence: Math.round((results.reduce((sum, r) => sum + r.confidence, 0) / results.length) * 100) / 100,
                positiveWords: [...new Set(allPositive)],
                negativeWords: [...new Set(allNegative)],
                suggestions: this.generateSuggestions([...new Set(allNegative)]),
            },
            breakdown,
            averageScore: Math.round(averageScore * 100) / 100,
        };
    }

    /**
     * Get sentiment trend over time
     */
    analyzeTrend(dataPoints: { text: string; timestamp: number }[]): {
        trend: 'improving' | 'declining' | 'stable';
        trendScore: number;
        dataPoints: { score: number; timestamp: number }[];
    } {
        const analyzed = dataPoints
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(dp => ({
                score: this.analyze(dp.text).score,
                timestamp: dp.timestamp,
            }));

        if (analyzed.length < 2) {
            return { trend: 'stable', trendScore: 0, dataPoints: analyzed };
        }

        // Calculate trend using simple linear regression
        const n = analyzed.length;
        const sumX = analyzed.reduce((sum, _, i) => sum + i, 0);
        const sumY = analyzed.reduce((sum, dp) => sum + dp.score, 0);
        const sumXY = analyzed.reduce((sum, dp, i) => sum + i * dp.score, 0);
        const sumXX = analyzed.reduce((sum, _, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        let trend: 'improving' | 'declining' | 'stable';
        if (slope > 0.05) {
            trend = 'improving';
        } else if (slope < -0.05) {
            trend = 'declining';
        } else {
            trend = 'stable';
        }

        return {
            trend,
            trendScore: Math.round(slope * 100) / 100,
            dataPoints: analyzed,
        };
    }
}

// Singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();

// Export class for testing
export { SentimentAnalyzer };
