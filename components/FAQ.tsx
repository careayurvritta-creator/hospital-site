/**
 * FAQ Component with Schema.org markup
 * Expandable FAQ section for common patient questions
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "What is Panchakarma and how does it work?",
        answer: "Panchakarma is a set of five Ayurvedic purification therapies (Vamana, Virechana, Basti, Nasya, Raktamokshana) that eliminate deep-rooted toxins from the body. It works by first preparing the body with oil therapies and steam, then applying specific cleansing procedures based on your constitution and condition."
    },
    {
        question: "Can Ayurveda help manage Diabetes?",
        answer: "Yes, Ayurveda offers effective management for Type 2 Diabetes (Prameha) through diet modification, lifestyle changes, herbal medications, and Panchakarma therapies. Our Diabetes Rebalance Program has helped many patients reduce their medication dependency and improve their blood sugar control."
    },
    {
        question: "How long does Panchakarma treatment take?",
        answer: "A complete Panchakarma treatment typically takes 7-21 days depending on the condition and therapy type. It includes preparation (Purvakarma), main procedure, and post-therapy care (Paschatkarma). We offer both IPD and OPD packages."
    },
    {
        question: "Is Ayurveda treatment covered by insurance?",
        answer: "Yes, Ayurvritta offers cashless treatment with 50+ insurance partners including Star Health, HDFC ERGO, ICICI Lombard, New India Assurance, and more. Contact us for specific policy coverage details."
    },
    {
        question: "What conditions does Ayurvritta specialize in?",
        answer: "We specialize in lifestyle disorders including Thyroid conditions, Diabetes, Chronic Kidney Disease (CKD), Obesity, PCOD/PCOS, and stress-related disorders. We also offer general wellness and rejuvenation programs."
    },
    {
        question: "How do I book an appointment?",
        answer: "You can book an appointment by calling +91 94266 84047, sending a WhatsApp message, or using our online booking form. We're open 24/7, all days of the week."
    },
    {
        question: "What is Prakriti and why is it important?",
        answer: "Prakriti is your unique Ayurvedic constitution determined by the balance of Vata, Pitta, and Kapha doshas at birth. Understanding your Prakriti helps customize treatments, diet, and lifestyle recommendations for optimal health outcomes."
    },
    {
        question: "Are there any side effects of Ayurvedic treatment?",
        answer: "When administered by qualified practitioners, Ayurvedic treatments are generally safe with minimal side effects. Some detox procedures may cause temporary discomfort as toxins are released. Dr. Sharma ensures all treatments are personalized for your safety."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-green-light rounded-full mb-4">
                        <HelpCircle className="w-5 h-5 text-ayur-green" />
                        <span className="text-sm font-medium text-ayur-green">Common Questions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-ayur-green mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-ayur-gray">
                        Find answers to common questions about Ayurveda and our treatments
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className="border border-ayur-subtle rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-ayur-cream/50 transition-colors"
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-medium text-ayur-green pr-8">{item.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-ayur-green flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="p-5 pt-0 text-ayur-gray leading-relaxed border-t border-ayur-subtle">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <p className="text-ayur-gray mb-4">Still have questions?</p>
                    <a
                        href="tel:+919426684047"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-ayur-green text-white font-semibold rounded-full hover:bg-ayur-green-dark transition-colors"
                    >
                        Call Us: +91 94266 84047
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
