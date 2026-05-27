import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Leaf, Download, Share2, BookOpen, Utensils, AlertTriangle, Calendar, Sparkles, ChevronRight, Printer, Heart, Sun, Sunrise, Sunset, Moon, Shield, Activity, Droplet, Brain, Star, ArrowRight, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dietCharts } from '../data/dietCharts';
import { getDietChartsFromKnowledgeBySlug, getAllParsedDietCharts } from '../lib/diet-charts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'consume', label: 'Foods to Eat', icon: Check },
  { id: 'avoid', label: 'Foods to Avoid', icon: X },
  { id: 'schedule', label: 'Meal Plan', icon: Calendar },
  { id: 'tips', label: 'Lifestyle Tips', icon: Heart },
];

const MEAL_ICONS: Record<string, React.ComponentType<any>> = {
  'early-morning': Sunrise,
  'early morning': Sunrise,
  'breakfast': Sun,
  'morning': Sun,
  'mid-morning': Sun,
  'mid morning': Sun,
  'lunch': Utensils,
  'afternoon': Sun,
  'evening': Sunset,
  'snack': Sunset,
  'snacks': Sunset,
  'dinner': Moon,
  'night': Moon,
  'bedtime': Moon,
  'before breakfast': Sunrise,
  'before lunch': Sun,
  'before dinner': Moon,
  'important': Star,
};

const MEAL_COLORS: Record<string, string> = {
  'early-morning': '#f59e0b',
  'early morning': '#f59e0b',
  'breakfast': '#10b981',
  'morning': '#10b981',
  'mid-morning': '#06b6d4',
  'mid morning': '#06b6d4',
  'lunch': '#3b82f6',
  'afternoon': '#8b5cf6',
  'evening': '#f97316',
  'snack': '#f97316',
  'snacks': '#f97316',
  'dinner': '#6366f1',
  'night': '#6366f1',
  'bedtime': '#6366f1',
  'important': '#ef4444',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Digestive Health': 'from-amber-500 to-orange-600',
  'Weight Management': 'from-green-500 to-emerald-600',
  'Pregnancy': 'from-pink-500 to-rose-600',
  'Metabolic Health': 'from-red-500 to-rose-600',
  'Kidney Health': 'from-blue-500 to-indigo-600',
  'Liver Health': 'from-amber-600 to-yellow-700',
  'Heart Health': 'from-red-500 to-pink-600',
  'Thyroid Health': 'from-purple-500 to-violet-600',
  'Skin Health': 'from-pink-400 to-fuchsia-600',
  'Bone & Joint Health': 'from-stone-500 to-stone-700',
  'Respiratory Health': 'from-sky-500 to-cyan-600',
  'Reproductive Health': 'from-fuchsia-500 to-purple-600',
  'default': 'from-teal-500 to-emerald-600',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function getMealIcon(key: string): React.ComponentType<any> {
  const lower = key.toLowerCase().trim();
  for (const [pattern, Icon] of Object.entries(MEAL_ICONS)) {
    if (lower.includes(pattern)) return Icon;
  }
  return Utensils;
}

function getMealColor(key: string): string {
  const lower = key.toLowerCase().trim();
  for (const [pattern, color] of Object.entries(MEAL_COLORS)) {
    if (lower.includes(pattern)) return color;
  }
  return '#0d8770';
}

const DietChartViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const dietChart = getDietChartsFromKnowledgeBySlug(slug || '') || dietCharts.find(chart => chart.slug === slug);

  // Related charts (same category)
  const relatedCharts = useMemo(() => {
    if (!dietChart) return [];
    return getAllParsedDietCharts()
      .filter(c => c.category === dietChart.category && c.slug !== dietChart.slug)
      .slice(0, 3);
  }, [dietChart]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (dietChart) {
      setTimeout(() => setIsVisible(true), 100);

      const stats = {
        foods: Object.keys(dietChart.foodsToConsume).reduce((acc, key) => acc + dietChart.foodsToConsume[key].length, 0),
        avoid: Object.keys(dietChart.foodsToAvoid).reduce((acc, key) => acc + dietChart.foodsToAvoid[key].length, 0),
        meals: Object.keys(dietChart.dietSchedule).length,
        tips: dietChart.lifestyleTips.length
      };

      const duration = 1200;
      const steps = 30;
      const interval = duration / steps;

      Object.keys(stats).forEach(key => {
        let current = 0;
        const target = stats[key as keyof typeof stats];
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedStats(prev => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
          }
        }, interval);
      });
    }
  }, [dietChart]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!dietChart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ayur-cream to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ayur-text mb-3">Diet Chart Not Found</h2>
          <p className="text-ayur-gray mb-6">The diet chart you're looking for doesn't exist or has been moved.</p>
          <button
            onClick={() => navigate('/diet-charts')}
            className="px-6 py-3 bg-ayur-green text-white rounded-2xl font-semibold hover:bg-ayur-green-dark transition-colors"
          >
            Browse All Diet Charts
          </button>
        </div>
      </div>
    );
  }

  const gradient = CATEGORY_GRADIENTS[dietChart.category] || CATEGORY_GRADIENTS.default;

  const pieData = [
    { name: 'To Consume', value: Object.values(dietChart.foodsToConsume).reduce((a, b) => a + b.length, 0) },
    { name: 'To Avoid', value: Object.values(dietChart.foodsToAvoid).reduce((a, b) => a + b.length, 0) },
  ];

  const categoryData = Object.entries(dietChart.foodsToConsume).map(([name, items], i) => ({
    name,
    value: items.length,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: dietChart.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-ayur-green-light/50 to-emerald-50 rounded-2xl p-6 border border-ayur-green/10">
              <h3 className="font-serif text-lg font-bold text-ayur-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ayur-accent" />
                Quick Summary
              </h3>
              <p className="text-ayur-gray leading-relaxed">{dietChart.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Utensils, label: 'Foods to Eat', value: animatedStats.foods || 0, color: 'from-emerald-400 to-green-500', bgColor: 'bg-emerald-50' },
                { icon: Shield, label: 'Foods to Avoid', value: animatedStats.avoid || 0, color: 'from-red-400 to-rose-500', bgColor: 'bg-red-50' },
                { icon: Calendar, label: 'Meals/Day', value: animatedStats.meals || 0, color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-50' },
                { icon: Heart, label: 'Lifestyle Tips', value: animatedStats.tips || 0, color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bgColor} rounded-2xl p-5 text-center border border-gray-100 transition-all hover:shadow-md`}>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-ayur-text">{stat.value}</div>
                  <div className="text-xs text-ayur-gray mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-ayur-text mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-ayur-green" />
                Food Distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" paddingAngle={3}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-ayur-text font-medium flex-1">{item.name}</span>
                      <span className="text-sm font-bold text-ayur-text">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ayurvedic Wisdom */}
            <div className="bg-gradient-to-br from-ayur-accent/10 via-amber-50 to-ayur-accent/5 rounded-2xl p-6 border border-ayur-accent/20 relative overflow-hidden">
              <div className="absolute top-2 right-4 text-5xl opacity-10 font-serif">"</div>
              <p className="font-serif text-lg text-ayur-text italic leading-relaxed relative z-10">
                "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need."
              </p>
              <p className="text-ayur-accent font-semibold text-sm mt-3 relative z-10">— Ayurvedic Proverb</p>
            </div>
          </div>
        );

      case 'consume':
        return (
          <div className="space-y-6 animate-fadeIn">
            {Object.entries(dietChart.foodsToConsume).map(([category, foods], catIdx) => (
              <div
                key={category}
                className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ animationDelay: `${catIdx * 100}ms` }}
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-serif font-bold text-ayur-text">{category}</h3>
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">{foods.length} items</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {foods.map((food, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'avoid':
        return (
          <div className="space-y-6 animate-fadeIn">
            {Object.entries(dietChart.foodsToAvoid).map(([category, foods], catIdx) => (
              <div
                key={category}
                className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ animationDelay: `${catIdx * 100}ms` }}
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
                  <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-serif font-bold text-ayur-text">{category}</h3>
                  <span className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">{foods.length} items</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {foods.map((food, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-800 rounded-xl text-sm font-medium border border-red-100 hover:bg-red-100 transition-colors"
                      >
                        <X className="w-3 h-3 text-red-500" />
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-0 animate-fadeIn">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ayur-accent via-ayur-green to-ayur-accent/20 hidden md:block" />

              {Object.entries(dietChart.dietSchedule).map(([time, meal], idx) => {
                const MealIcon = getMealIcon(time);
                const mealColor = getMealColor(time);
                const isLast = idx === Object.entries(dietChart.dietSchedule).length - 1;

                return (
                  <div key={time} className="relative flex gap-4 md:gap-6 mb-4 last:mb-0">
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full items-center justify-center shadow-lg z-10 border-4 border-white" style={{ backgroundColor: mealColor }}>
                      <MealIcon className="w-5 h-5 text-white" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
                        <div className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: mealColor }}>
                          <MealIcon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-serif font-bold text-ayur-text capitalize">{time.replace(/-/g, ' ')}</h3>
                        <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: mealColor }} />
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-ayur-gray text-sm leading-relaxed">{meal}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Print CTA */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-ayur-text hover:border-ayur-green hover:text-ayur-green transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Diet Plan
              </button>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-4 animate-fadeIn">
            {dietChart.lifestyleTips.map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-ayur-green to-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-ayur-text text-sm leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}

            {/* Book Consultation CTA */}
            <div className="bg-gradient-to-br from-ayur-green-light to-emerald-50 rounded-2xl p-6 border border-ayur-green/10 text-center mt-6">
              <h3 className="font-serif font-bold text-ayur-text mb-2">Need Personalized Guidance?</h3>
              <p className="text-ayur-gray text-sm mb-4">Our Ayurvedic doctors can customize this diet plan for your specific constitution.</p>
              <a
                href="#/booking"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ayur-green text-white rounded-2xl font-semibold hover:bg-ayur-green-dark transition-colors shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark py-16 md:py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zM22.344%200L13.858%208.485%2015.272%209.9l9.9-9.9h-2.828zM32%200L22.343%209.657%2023.757%2011.07%2034.83%200H32zm5.656%200L28%209.657%2029.414%2011.07%2040.485%200h-2.83z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%20fill-rule%3D%22evenodd%22/%3E%3C/svg%3E')] opacity-50" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl animate-breathe" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/diet-charts')}
            className={`flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Diet Charts</span>
          </button>

          {/* Category Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Leaf className="w-4 h-4 text-ayur-accent" />
            <span className="text-sm font-semibold text-white/90">{dietChart.category}</span>
          </div>

          <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {dietChart.title}
          </h1>

          <p className={`text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {dietChart.description.slice(0, 150)}...
          </p>

          {/* Quick Actions */}
          <div className={`flex flex-wrap gap-3 mt-6 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-colors border border-white/10">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-colors border border-white/10">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="flex overflow-x-auto hide-scrollbar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${
                    isActive
                      ? 'text-ayur-green border-ayur-green bg-ayur-green-light/30'
                      : 'text-ayur-gray border-transparent hover:text-ayur-green hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {renderTabContent()}
        </div>

        {/* Related Diet Charts */}
        {relatedCharts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-serif text-2xl font-bold text-ayur-text">Related Diet Charts</h2>
              <span className="text-xs bg-gray-100 text-ayur-gray px-2.5 py-1 rounded-full">{dietChart.category}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCharts.map(chart => (
                <Link
                  key={chart.id}
                  to={`/diet-charts/${chart.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="h-32 bg-gradient-to-br from-ayur-green-light to-emerald-50 flex items-center justify-center relative overflow-hidden">
                    <Leaf className="w-12 h-12 text-ayur-green/20 group-hover:scale-110 transition-transform" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-[10px] font-bold text-ayur-text">{chart.category}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-ayur-text text-sm line-clamp-2 group-hover:text-ayur-green transition-colors">{chart.title}</h3>
                    <div className="flex items-center gap-1 mt-2 text-ayur-green text-xs font-semibold">
                      View Plan <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back to Diet Charts CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center">
          <button
            onClick={() => navigate('/diet-charts')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-ayur-text hover:border-ayur-green hover:text-ayur-green transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Diet Charts
          </button>
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 bg-ayur-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-ayur-green-dark transition-all z-50 animate-fadeIn"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DietChartViewer;
