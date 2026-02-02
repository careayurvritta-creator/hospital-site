import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import VoiceInput from './VoiceInput';
import { chatBotAnalytics } from '../analytics';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  // Dynamic Welcome Message based on language
  const getWelcomeMessage = () => {
    if (language === 'hi') return 'नमस्ते! मैं आयुर्वृत्त एआई सहायक हूं। आज मैं आपकी स्वास्थ्य यात्रा में कैसे मदद कर सकता हूं?';
    if (language === 'gu') return 'નમસ્તે! હું આયુર્વૃત્ત AI સહાયક છું. આજે હું તમારી સ્વાસ્થ્ય યાત્રામાં કેવી રીતે મદદ કરી શકું?';
    return 'Namaste! I am the Ayurvritta AI assistant. How can I help you with your health journey today?';
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: getWelcomeMessage() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Track chat open/close
  useEffect(() => {
    if (isOpen) {
      chatBotAnalytics.trackOpen();
    } else if (!isOpen && messages.length > 1) {
      // Only track close if there was a conversation
      chatBotAnalytics.trackClose();
    }
  }, [isOpen]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      // Keep conversation but maybe add a system note? 
      // For now, let's just update the initial welcome if it's the only message
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', text: getWelcomeMessage() }];
      }
      return prev;
    });
  }, [language]);

  // Prevent background scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Initialize Chat Session (Re-init on language change to prompt correct context)
  useEffect(() => {
    if (isOpen) {
      try {
        const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
        if (!apiKey) {
          console.error("API Key missing");
          return;
        }

        const langInstruction = language === 'hi' ? "Reply in Hindi (हिंदी में उत्तर दें)." : language === 'gu' ? "Reply in Gujarati (ગુજરાતીમાં જવાબ આપો)." : "Reply in English.";

        const ai = new GoogleGenAI({ apiKey });
        const newChat = ai.chats.create({
          model: 'gemini-2.0-flash',
          config: {
            systemInstruction: `You are "Vaidya AI", an expert Ayurveda physician assistant for Ayurvritta Ayurveda Hospital & Panchakarma Center in Vadodara, Gujarat, India.

LANGUAGE: ${langInstruction}

## YOUR IDENTITY & EXPERTISE
You are trained in classical Ayurveda texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam) and modern clinical applications.
You understand:
- **Tridosha Theory**: Vata (Air+Space), Pitta (Fire+Water), Kapha (Earth+Water)
- **Sapta Dhatu**: Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra
- **Prakriti & Vikriti**: Constitution and current imbalance
- **Panchakarma**: Vamana, Virechana, Basti, Nasya, Raktamokshana
- **Pathya-Apathya**: Diet and lifestyle for each condition

## AYURVRITTA HOSPITAL DETAILS
- **Chief Physician**: Dr. Jinendradutt Sharma
- **Specialty**: Lifestyle disorders - Thyroid, Diabetes (Prameha), CKD, Obesity (Sthaulya), PCOD
- **Approach**: Evidence-based Ayurveda, Nidan Parivarjan (root cause removal)
- **Location**: FF 104–113, Lotus Enora Complex, Opp. Rutu Villa, New Alkapuri, Gotri, Vadodara – 390021
- **Phone**: +91 94266 84047
- **Hours**: Open 24 Hours, All Days

## CLINICAL GUIDELINES
1. **DO NOT DIAGNOSE**: You may explain concepts but always recommend consultation for specific medical advice
2. **Use Classical Terms**: Use Sanskrit terms with explanations (e.g., "Agni (digestive fire)")
3. **Be Empathetic**: Address concerns warmly using "Namaste" and respectful language
4. **Recommend Tools**: Suggest our Prakriti Assessment, Lifestyle Risk Calculator, or Diet Planner when relevant
5. **Encourage Consultation**: For chronic issues, recommend booking with Dr. Sharma

## AVAILABLE WEBSITE TOOLS (Recommend when appropriate)
- **Prakriti Assessment**: "Would you like to discover your Ayurvedic constitution? Try our Prakriti Quiz."
- **Lifestyle Risk Calculator**: "Check your metabolic health risk with our assessment tool."
- **Diet Planner**: "I can help you get a personalized diet plan based on your dosha."
- **Panchakarma Finder**: "Find the right detox therapy for your condition."

## TREATMENT PRICING (Key therapies)
- Abhyanga (Full Body): ₹1,300
- Shirodhara: ₹1,500
- Virechana: ₹3,000
- Vamana: ₹5,000
- Basti: ₹500-₹2,000

## RESPONSE STYLE
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Include relevant Sanskrit terms with meanings
- End with a helpful suggestion or call-to-action`,
          },
        });
        setChatSession(newChat);
      } catch (e) {
        console.error("Failed to initialize chat session:", e);
        chatBotAnalytics.trackError('Failed to initialize chat session');
      }
    }
  }, [isOpen, language]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Track user message with analytics
    chatBotAnalytics.trackUserMessage(userMessage);
    const sendStartTime = Date.now();

    try {
      // We append a hidden instruction to ensure language consistency in ongoing chats
      const prompt = `${userMessage} (Please reply in ${language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English'})`;
      const result = await chatSession.sendMessageStream({ message: prompt });

      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const newMessages = [...prev];
            // Ensure we update the last message which is the placeholder
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
          });
        }
      }

      // Track bot response with response time
      const responseTime = Date.now() - sendStartTime;
      chatBotAnalytics.trackBotResponse(fullText, responseTime);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage = "I apologize, but I am having trouble connecting right now. Please check your connection and try again.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
      chatBotAnalytics.trackError('Chat API error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setInput(text);
    // Optional: Auto-send? No, let user confirm text.
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-ayur-green hover:scale-110 text-white'
          }`}
        aria-label="Toggle Chat"
        title="Chat with AI Assistant"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window Container */}
      <div
        className={`fixed z-[70] bg-white border border-ayur-subtle shadow-2xl overflow-hidden transition-all duration-300 flex flex-col 
          ${isOpen
            ? 'inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[550px] md:rounded-2xl opacity-100 scale-100'
            : 'bottom-6 right-6 w-0 h-0 opacity-0 scale-50 rounded-[100%]'
          }
        `}
      >
        {/* Header */}
        <div className="bg-ayur-green p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none mb-1">Ayurvritta AI</h3>
              <span className="text-[10px] text-green-300 flex items-center bg-black/20 px-2 py-0.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                Assistant Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            {window.innerWidth < 768 ? <ChevronDown size={24} /> : <X size={24} />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ayur-cream/30 scroll-smooth">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-ayur-gold text-white' : 'bg-ayur-green text-white'
                  }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-ayur-green text-white rounded-tr-none'
                  : 'bg-white border border-ayur-subtle text-ayur-gray rounded-tl-none'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-ayur-green text-white flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-ayur-subtle p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                <Loader2 size={16} className="animate-spin text-ayur-green" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 bg-white border-t border-ayur-subtle pb-safe">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-ayur-subtle focus-within:border-ayur-green focus-within:ring-1 focus-within:ring-ayur-green transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'hi' ? "अपना प्रश्न यहाँ लिखें..." : "Type your health question..."}
              className="flex-1 px-4 py-2 bg-transparent text-ayur-green placeholder-gray-400 focus:outline-none text-base md:text-sm"
              autoFocus={isOpen && window.innerWidth > 768}
            />
            {/* Voice Input Integration */}
            <VoiceInput onTranscript={handleVoiceInput} isCompact={true} className="mr-1" />

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-ayur-green text-white rounded-full hover:bg-ayur-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              aria-label="Send message"
              title="Send"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-400 mt-2">
            AI advice is not a medical diagnosis.
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;