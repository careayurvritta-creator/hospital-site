/**
 * Ayurveda Knowledge Base
 * RAG-enabled knowledge retrieval for AI Physician
 */

import tridosha from './siddhanta/tridosha.json';
import dhatu from './siddhanta/dhatu.json';
import prakriti from './siddhanta/prakriti.json';
import panchakarma from './chikitsa/panchakarma.json';
import pathya from './chikitsa/pathya.json';
import hospitalServices from './hospital/services.json';

// Knowledge chunk for RAG retrieval
export interface KnowledgeChunk {
    id: string;
    topic: string;
    content: string;
    category: 'siddhanta' | 'chikitsa' | 'hospital';
    keywords: string[];
}

// Build searchable knowledge chunks
function buildKnowledgeChunks(): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];

    // Tridosha chunks
    tridosha.doshas.forEach((dosha: any) => {
        chunks.push({
            id: `dosha-${dosha.name.toLowerCase()}`,
            topic: `${dosha.name} Dosha`,
            content: `${dosha.name} (${dosha.sanskrit}) is composed of ${dosha.elements.join(' and ')}. 
Qualities: ${dosha.qualities.join(', ')}. 
Seat: ${dosha.seat}. 
Functions: ${dosha.functions.join('; ')}. 
Imbalance signs: ${dosha.imbalance_signs.join(', ')}. 
Balancing: ${dosha.balancing.join(', ')}.`,
            category: 'siddhanta',
            keywords: [dosha.name.toLowerCase(), 'dosha', ...dosha.qualities.map((q: string) => q.toLowerCase())]
        });
    });

    // Dhatu chunks
    dhatu.dhatus.forEach((d: any) => {
        chunks.push({
            id: `dhatu-${d.name.toLowerCase()}`,
            topic: `${d.name} Dhatu (${d.english})`,
            content: `${d.name} (${d.sanskrit}) = ${d.english}. 
Function: ${d.function}. 
Upadhatu: ${d.upadhatu}. 
Mala: ${d.mala}. 
Sara signs (excellence): ${d.sara_signs.join(', ')}.`,
            category: 'siddhanta',
            keywords: [d.name.toLowerCase(), d.english.toLowerCase(), 'dhatu', 'tissue']
        });
    });

    // Prakriti chunks
    prakriti.types.forEach((p: any) => {
        chunks.push({
            id: `prakriti-${p.type.toLowerCase().replace(' ', '-')}`,
            topic: p.type,
            content: `${p.type}: 
Physical traits: ${p.physical_traits.join('; ')}. 
Mental traits: ${p.mental_traits.join('; ')}. 
Diet: ${p.dietary_recommendations.join('; ')}. 
Lifestyle: ${p.lifestyle_recommendations.join('; ')}.`,
            category: 'siddhanta',
            keywords: ['prakriti', 'constitution', p.type.split(' ')[0].toLowerCase()]
        });
    });

    // Panchakarma chunks
    panchakarma.therapies.forEach((t: any) => {
        chunks.push({
            id: `panchakarma-${t.name.toLowerCase()}`,
            topic: `${t.name} (${t.english})`,
            content: `${t.name} (${t.sanskrit}) = ${t.english}. 
Indication: ${t.indication}. 
Conditions: ${t.conditions.join(', ')}. 
Procedure: ${t.procedure}. 
Duration: ${t.duration}. 
Benefits: ${t.benefits.join(', ')}. 
Contraindications: ${t.contraindications.join(', ')}.`,
            category: 'chikitsa',
            keywords: [t.name.toLowerCase(), t.english.toLowerCase(), 'panchakarma', 'detox']
        });
    });

    // Pathya chunks by condition
    Object.entries(pathya.by_condition).forEach(([condition, data]: [string, any]) => {
        chunks.push({
            id: `pathya-${condition}`,
            topic: `Diet for ${condition.replace('_', ' ')}`,
            content: `Pathya (beneficial) for ${condition}: ${data.pathya.join(', ')}. 
Apathya (avoid): ${data.apathya.join(', ')}.`,
            category: 'chikitsa',
            keywords: [condition.replace('_', ' '), 'diet', 'pathya', 'food']
        });
    });

    // Hospital services chunks
    hospitalServices.service_categories.forEach((cat: any) => {
        chunks.push({
            id: `service-${cat.category.toLowerCase().replace(/\s+/g, '-')}`,
            topic: `${cat.category} at Ayurvritta`,
            content: `${cat.category}: ${cat.description}. 
Price range: ${cat.price_range}. 
Popular treatments: ${cat.popular.join(', ')}.`,
            category: 'hospital',
            keywords: [cat.category.toLowerCase(), 'treatment', 'service', 'price']
        });
    });

    // Hospital programs chunks
    hospitalServices.programs.forEach((prog: any) => {
        chunks.push({
            id: `program-${prog.name.toLowerCase().replace(/\s+/g, '-')}`,
            topic: `${prog.name}`,
            content: `${prog.name} (${prog.duration}): 
Focus: ${prog.focus}. 
Includes: ${prog.includes.join(', ')}.`,
            category: 'hospital',
            keywords: [prog.name.toLowerCase(), prog.focus.toLowerCase(), 'program']
        });
    });

    return chunks;
}

// Knowledge retrieval function
export function retrieveKnowledge(query: string, maxChunks: number = 3): KnowledgeChunk[] {
    const chunks = buildKnowledgeChunks();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // Score each chunk based on keyword matches
    const scored = chunks.map(chunk => {
        let score = 0;

        // Direct topic match
        if (chunk.topic.toLowerCase().includes(queryLower)) {
            score += 10;
        }

        // Keyword matches
        queryWords.forEach(word => {
            if (word.length > 2) {
                if (chunk.keywords.some(kw => kw.includes(word) || word.includes(kw))) {
                    score += 3;
                }
                if (chunk.content.toLowerCase().includes(word)) {
                    score += 1;
                }
            }
        });

        return { chunk, score };
    });

    // Return top matches
    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxChunks)
        .map(s => s.chunk);
}

// Get context string for AI
export function getKnowledgeContext(query: string): string {
    const relevantChunks = retrieveKnowledge(query);

    if (relevantChunks.length === 0) {
        return '';
    }

    const contextParts = relevantChunks.map(chunk =>
        `**${chunk.topic}**:\n${chunk.content}`
    );

    return `\n\n--- AYURVEDA KNOWLEDGE ---\n${contextParts.join('\n\n')}\n--- END KNOWLEDGE ---\n`;
}

// Hospital info constant
export const HOSPITAL_INFO = {
    name: 'Ayurvritta Ayurveda Hospital & Panchakarma Center',
    doctor: 'Dr. Jinendradutt Sharma',
    phone: '+91 94266 84047',
    address: 'FF 104–113, Lotus Enora Complex, Opp. Rutu Villa, New Alkapuri, Gotri, Vadodara – 390021',
    hours: 'Open 24 Hours, All Days',
    specialty: 'Lifestyle disorders (Thyroid, Diabetes, CKD, Obesity, PCOD) and classical Panchakarma'
};

export default {
    retrieveKnowledge,
    getKnowledgeContext,
    HOSPITAL_INFO
};
