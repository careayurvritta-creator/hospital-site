/**
 * AI-Powered Skin Care Analysis Page (Redesigned)
 * Modern, polished, mobile-first, accessible UI/UX
 */

import React, { useState } from 'react';
import { Camera, Stethoscope, ShieldCheck, Sparkles, Heart, Brain, Sun, Moon, Clock, Check, RefreshCw, BookOpen, Calendar } from 'lucide-react';
import { ImageBasedSkinAnalyzer } from '../components/tools/ImageBasedSkinAnalyzer';
import SkinSecondOpinion from '../components/tools/SkinSecondOpinion';

const SkinCare: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'second-opinion'>('image');

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/50 py-12 md:py-20 lg:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-ayur-green/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ayur-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-ayur-cream/50 backdrop-blur-sm rounded-full border border-ayur-subtle mb-6">
              <ShieldCheck size={20} className="text-ayur-accent" />
              <span className="font-semibold text-sm text-ayur-gray/70">AI-Powered Ayurvedic Diagnosis</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-ayur-green mb-6 leading-none">
              AI-Powered Skin Care Analysis
            </h1>
            
            <p className="text-lg md:text-xl text-ayur-gray max-w-3xl mx-auto leading-relaxed">
              Experience the fusion of modern AI technology and ancient Ayurvedic wisdom. 
              Get instant skin condition recognition from images or a detailed second opinion 
              based on your health history.
            </p>
          </div>

          {/* Tool Selector */}
          <div className="max-w-4xl mx-auto mb-12 md:mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-ayur-subtle">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTool === 'image' ? 'bg-ayur-green text-white shadow-lg' : 'bg-ayur-cream/50 text-ayur-green border-2 border-dashed border-ayur-subtle'}`}>
                  <Camera className="w-6 h-6" />
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTool === 'second-opinion' ? 'bg-ayur-green text-white shadow-lg' : 'bg-ayur-cream/50 text-ayur-green border-2 border-dashed border-ayur-subtle'}`}>
                  <Stethoscope className="w-6 h-6" />
                </div>
              </div>
              
              <div className="grid xs:grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTool('image')}
                  className={`py-4 px-6 rounded-xl font-semibold transition-all ${activeTool === 'image' ? 'bg-ayur-green text-white shadow-lg ring-2 ring-ayur-green/20' : 'bg-white text-ayur-green hover:bg-ayur-cream/80 border border-ayur-subtle'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Camera size={18} />
                    Image Analysis
                  </div>
                </button>
                <button
                  onClick={() => setActiveTool('second-opinion')}
                  className={`py-4 px-6 rounded-xl font-semibold transition-all ${activeTool === 'second-opinion' ? 'bg-ayur-green text-white shadow-lg ring-2 ring-ayur-green/20' : 'bg-white text-ayur-green hover:bg-ayur-cream/80 border border-ayur-subtle'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Stethoscope size={18} />
                    Second Opinion
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Active Tool */}
          <div className="max-w-4xl mx-auto">
            {activeTool === 'image' && <ImageBasedSkinAnalyzer />}
            {activeTool === 'second-opinion' && <SkinSecondOpinion />}
          </div>

          {/* Educational Content Section */}
          <div className="mt-20 md:mt-24">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green text-center mb-12">
              Why Ayurvedic Skin Care?
            </h2>
            
            <div className="grid xs:grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-ayur-subtle hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-ayur-green/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-ayur-green" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ayur-green mb-2">Root Cause Analysis</h3>
                <p className="text-sm text-ayur-gray">We identify the underlying dosha imbalance (Vata, Pitta, Kapha) causing your skin issue, not just treat symptoms.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-ayur-subtle hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-ayur-green/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-ayur-green" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ayur-green mb-2">Personalized Diet & Lifestyle</h3>
                <p className="text-sm text-ayur-gray">Receive tailored Ayurvedic diet (Ahara), routine (Vihara), and seasonal (Ritucharya) recommendations.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-ayur-subtle hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-ayur-cream/50 text-ayur-accent rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ayur-green mb-2">Holistic Healing</h3>
                <p className="text-sm text-ayur-gray">Combine modern AI analysis with Panchakarma, herbal formulations, and stress management for lasting results.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <a 
              href="/booking"
              className="inline-flex items-center gap-3 px-10 py-4 min-h-[48px] bg-ayur-accent text-white font-bold rounded-full hover:bg-ayur-accent/90 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ayur-accent/20"
            >
              Book Consultation
              <Sparkles size={20} />
            </a>
          </div>
        </div>
      </div>
  );
};

export default SkinCare;