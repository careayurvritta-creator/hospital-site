/**
 * Chat Tool Registry
 * Defines tools that can be triggered and displayed inline in chat
 */

import React from 'react';
import { Leaf, Activity, Utensils, Heart, Droplet, Scale } from 'lucide-react';

export interface ChatTool {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{ className?: string; size?: number }>;
    triggers: string[];  // Keywords that trigger this tool
    route: string;       // Route to full tool page
    inlineCapable: boolean; // Can be used inline in chat
}

export const CHAT_TOOLS: ChatTool[] = [
    {
        id: 'prakriti',
        name: 'Prakriti Assessment',
        description: 'Discover your Ayurvedic constitution (Vata, Pitta, Kapha)',
        icon: Leaf,
        triggers: ['prakriti', 'dosha', 'constitution', 'body type', 'what is my dosha', 'vata pitta kapha'],
        route: '/tools',
        inlineCapable: true
    },
    {
        id: 'lifestyle-risk',
        name: 'Lifestyle Risk Calculator',
        description: 'Check your metabolic health and lifestyle disease risk',
        icon: Activity,
        triggers: ['risk', 'lifestyle', 'health check', 'am i at risk', 'diabetes risk', 'metabolic'],
        route: '/tools',
        inlineCapable: true
    },
    {
        id: 'diet-planner',
        name: 'Ayurvedic Diet Planner',
        description: 'Get personalized diet recommendations based on your dosha',
        icon: Utensils,
        triggers: ['diet', 'food', 'what should i eat', 'meal plan', 'nutrition', 'pathya'],
        route: '/tools',
        inlineCapable: true
    },
    {
        id: 'panchakarma',
        name: 'Panchakarma Finder',
        description: 'Find the right detox therapy for your condition',
        icon: Droplet,
        triggers: ['panchakarma', 'detox', 'cleanse', 'vamana', 'virechana', 'basti'],
        route: '/tools',
        inlineCapable: true
    },
    {
        id: 'meda',
        name: 'Body Composition (Meda)',
        description: 'Assess your body fat and tissue health',
        icon: Scale,
        triggers: ['weight', 'bmi', 'body fat', 'obesity', 'meda', 'overweight'],
        route: '/tools',
        inlineCapable: true
    },
    {
        id: 'saara',
        name: 'Tissue Excellence (Saara)',
        description: 'Evaluate the quality of your dhatus (tissues)',
        icon: Heart,
        triggers: ['saara', 'tissue', 'dhatu', 'strength', 'vitality'],
        route: '/tools',
        inlineCapable: true
    }
];

/**
 * Detect if a message contains tool-related intent
 */
export function detectToolIntent(message: string): ChatTool | null {
    const msgLower = message.toLowerCase();

    for (const tool of CHAT_TOOLS) {
        for (const trigger of tool.triggers) {
            if (msgLower.includes(trigger.toLowerCase())) {
                return tool;
            }
        }
    }

    return null;
}

/**
 * Get tool suggestion message
 */
export function getToolSuggestion(tool: ChatTool): string {
    const suggestions: Record<string, string> = {
        'prakriti': "I can help you understand your Ayurvedic constitution! Would you like to take our quick Prakriti Assessment? It takes just 2-3 minutes.",
        'lifestyle-risk': "I can assess your lifestyle disease risk. Want me to run a quick health risk calculator for you?",
        'diet-planner': "I can generate a personalized Ayurvedic diet plan for you! Shall I create one based on your dosha?",
        'panchakarma': "Based on our conversation, I can help you find the right Panchakarma therapy. Want me to check which detox treatment suits you?",
        'meda': "I can assess your body composition using Ayurvedic principles. Would you like me to calculate your Meda (fat tissue) status?",
        'saara': "I can evaluate your tissue quality (Saara Pariksha). This helps understand your core strength. Shall we proceed?"
    };

    return suggestions[tool.id] || `Would you like to try our ${tool.name}?`;
}

export default CHAT_TOOLS;
