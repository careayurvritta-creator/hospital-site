/**
 * FAQ Component with enhanced animations
 * Expandable FAQ section for common patient questions
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';

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
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

  // Handle deep linking from URL hash
  useEffect(() => {
  const handleHashChange = () => {
  const hash = window.location.hash;
  if (hash.startsWith('#faq-')) {
  const index = parseInt(hash.replace('#faq-', ''), 10);
  if (!isNaN(index) && index >= 0 && index < FAQ_ITEMS.length) {
  setTimeout(() => setOpenIndex(index), 100);
  }
  }
  };

  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Smooth scroll to opened FAQ item
  useEffect(() => {
  if (openIndex !== null && itemRefs.current[openIndex]) {
  itemRefs.current[openIndex]?.scrollIntoView({
  behavior: 'smooth',
  block: 'center'
  });
  }
  }, [openIndex]);

  const toggleItem = (index: number) => {
  setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionObserver.ref} className="py-20 md:py-28 bg-gradient-to-b from-white to-ayur-cream/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-ayur-green text-white rounded-full mb-5 shadow-lg">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Common Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-ayur-green mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-ayur-gray text-base md:text-lg max-w-xl mx-auto">
            Find answers to common questions about Ayurveda and our treatments
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              id={`faq-${index}`}
              className={`
                border-2 border-ayur-subtle rounded-2xl overflow-hidden 
                transition-all duration-300 hover:border-ayur-green/50 hover:shadow-xl
                ${sectionObserver.isVisible ? 'animate-fadeInUp' : ''}
              `}
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: sectionObserver.isVisible ? 1 : 0
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                className={`
                  w-full flex items-center justify-between p-5 md:p-6 text-left 
                  bg-white transition-all duration-300 hover:bg-ayur-cream/30
                  ${openIndex === index ? 'bg-ayur-green/5' : ''}
                `}
                aria-expanded={openIndex === index}
              >
                <span className={`font-semibold text-lg text-ayur-green-text pr-4 transition-colors ${openIndex === index ? 'text-ayur-green' : ''}`}>
                  {item.question}
                </span>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  transition-all duration-300 transform
                  ${openIndex === index 
                    ? 'bg-ayur-green text-white rotate-180 scale-110' 
                    : 'bg-ayur-green/10 text-ayur-green group-hover:bg-ayur-green/20'
                  }
                `}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
             
              <div className={`
                overflow-hidden transition-all duration-500 ease-out
                ${openIndex === index ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className="p-5 md:p-6 pt-0 text-ayur-gray leading-relaxed border-t border-ayur-subtle/50">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-ayur-accent rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                    <div className="text-base">{item.answer}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-ayur-gray mb-5 text-lg">Still have questions?</p>
          <a
            href="tel:+919426684047"
            className="inline-flex items-center gap-3 px-8 py-4 bg-ayur-green text-white font-bold rounded-full hover:bg-ayur-green-dark hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <Phone className="w-5 h-5 group-hover:animate-bounce-short" />
            Call Us: +91 94266 84047
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;