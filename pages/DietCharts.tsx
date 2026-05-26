import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, X, Leaf, Heart, Sparkles, ChevronDown, ChevronRight, Star, TrendingUp, BookOpen, ArrowRight, Utensils, Activity, Droplet, Shield, Brain, Eye, Baby, Bone, Wind, Flower2, Sun, Stethoscope, Pill, Clock, ChefHat } from 'lucide-react';
import DietChartCard from '../components/DietChartCard';
import { getAllParsedDietCharts, getDietChartCategories, getFeaturedDietCharts } from '../lib/diet-charts';
import { useLanguage } from '../components/LanguageContext';
import { useIntersectionObserver } from '../hooks';

const PRAKRITI_OPTIONS = ['All', 'Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha'];

function getPrakritiFromTitle(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes('vata-pitta') || t.includes('pitta-vata')) return 'Vata-Pitta';
  if (t.includes('pitta-kapha') || t.includes('kapha-pitta')) return 'Pitta-Kapha';
  if (t.includes('vata-kapha') || t.includes('kapha-vata')) return 'Vata-Kapha';
  if (t.includes('vata prakriti') || t.includes('for vata')) return 'Vata';
  if (t.includes('pitta prakriti') || t.includes('for pitta')) return 'Pitta';
  if (t.includes('kapha prakriti') || t.includes('for kapha')) return 'Kapha';
  return null;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Digestive Health': '🫁',
  'Weight Management': '⚖️',
  'Pregnancy': '🤰',
  'Metabolic Health': '🩸',
  'Kidney Health': '🫘',
  'Liver Health': '🫀',
  'Heart Health': '❤️',
  'Thyroid Health': '🦋',
  'Skin Health': '✨',
  'Bone & Joint Health': '🦴',
  'Respiratory Health': '🫁',
  'Reproductive Health': '🌸',
  'Blood Health': '🩸',
  'Cancer Support': '🎗️',
  'Child Health': '👶',
  'Seasonal Diet': '🌿',
  'Ayurvedic Constitution': '🕉️',
  'Mental Health': '🧠',
  'Eye Health': '👁️',
  'GI Disorders': '🔥',
  'Allergy Care': '🤧',
  'Complex Conditions': '💊',
  'Neurological & Surgical': '🧬',
  'Immune & Chronic': '🛡️',
  'Specific Conditions': '🎯',
  'General Health': '🌿',
};

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  'Digestive Health': Activity,
  'Weight Management': Activity,
  'Pregnancy': Heart,
  'Metabolic Health': Droplet,
  'Kidney Health': Droplet,
  'Liver Health': Shield,
  'Heart Health': Heart,
  'Thyroid Health': Activity,
  'Skin Health': Sparkles,
  'Bone & Joint Health': Bone,
  'Respiratory Health': Wind,
  'Reproductive Health': Flower2,
  'Blood Health': Droplet,
  'Cancer Support': Shield,
  'Child Health': Baby,
  'Seasonal Diet': Sun,
  'Ayurvedic Constitution': Leaf,
  'Mental Health': Brain,
  'Eye Health': Eye,
  'GI Disorders': Activity,
  'Allergy Care': Shield,
  'Complex Conditions': Pill,
  'Neurological & Surgical': Brain,
  'Immune & Chronic': Shield,
  'Specific Conditions': Stethoscope,
  'General Health': Leaf,
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
  'Blood Health': 'from-red-600 to-red-800',
  'Cancer Support': 'from-violet-500 to-purple-700',
  'Child Health': 'from-yellow-400 to-amber-500',
  'Seasonal Diet': 'from-lime-500 to-green-600',
  'Ayurvedic Constitution': 'from-teal-500 to-emerald-600',
  'Mental Health': 'from-indigo-500 to-blue-600',
  'Eye Health': 'from-sky-400 to-blue-500',
  'GI Disorders': 'from-orange-500 to-red-500',
  'Allergy Care': 'from-cyan-500 to-teal-600',
  'Complex Conditions': 'from-slate-500 to-zinc-700',
  'Neurological & Surgical': 'from-violet-600 to-indigo-700',
  'Immune & Chronic': 'from-emerald-600 to-green-700',
  'Specific Conditions': 'from-rose-500 to-red-600',
  'General Health': 'from-teal-500 to-emerald-600',
};

const DietCharts: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrakriti, setSelectedPrakriti] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'a-z' | 'category'>('default');
  const [animatedCounters, setAnimatedCounters] = useState({ charts: 0, categories: 0, foods: 0 });
  const [countersAnimated, setCountersAnimated] = useState(false);

  const heroObserver = useIntersectionObserver({ threshold: 0.2 });
  const statsObserver = useIntersectionObserver({ threshold: 0.3 });
  const gridObserver = useIntersectionObserver({ threshold: 0.05 });

  const allCharts = useMemo(() => getAllParsedDietCharts(), []);
  const categories = useMemo(() => getDietChartCategories(), []);
  const featuredCharts = useMemo(() => getFeaturedDietCharts(), []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCharts.forEach(chart => {
      counts[chart.category] = (counts[chart.category] || 0) + 1;
    });
    return counts;
  }, [allCharts]);

  // Animated counters
  useEffect(() => {
    if (statsObserver.hasBeenVisible && !countersAnimated) {
      setCountersAnimated(true);
      const targets = { charts: allCharts.length, categories: categories.length, foods: allCharts.length * 12 };
      const duration = 1500;
      const steps = 40;
      const interval = duration / steps;

      Object.keys(targets).forEach(key => {
        let current = 0;
        const target = targets[key as keyof typeof targets];
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedCounters(prev => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setAnimatedCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
          }
        }, interval);
      });
    }
  }, [statsObserver.hasBeenVisible, countersAnimated, allCharts.length, categories.length]);

  // Filter charts
  const filteredCharts = useMemo(() => {
    let charts = allCharts;

    if (selectedCategory !== 'All') {
      charts = charts.filter(c => c.category === selectedCategory);
    }

    if (selectedPrakriti !== 'All') {
      charts = charts.filter(c => {
        const prakriti = getPrakritiFromTitle(c.title);
        return prakriti === selectedPrakriti;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      charts = charts.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'a-z') {
      charts = [...charts].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'category') {
      charts = [...charts].sort((a, b) => a.category.localeCompare(b.category));
    }

    return charts;
  }, [allCharts, selectedCategory, selectedPrakriti, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPrakriti('All');
    setSortBy('default');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedPrakriti !== 'All' || sortBy !== 'default';

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30">

      {/* HERO SECTION */}
      <section ref={heroObserver.ref} className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark py-20 md:py-32 text-white overflow-hidden">
        {/* Decorative Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl animate-floatSlow" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-teal-300/10 rounded-full blur-2xl animate-breathe" />

        {/* Food pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Animated badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 transition-all duration-700 ${heroObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Utensils className="w-4 h-4 text-ayur-accent" />
            <span className="text-sm font-semibold text-white/90">{allCharts.length} Ayurvedic Diet Plans</span>
          </div>

          <h1 className={`font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${heroObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-white">Nourish Your Body,</span>
            <br />
            <span className="bg-gradient-to-r from-ayur-accent via-yellow-300 to-ayur-accent bg-clip-text text-transparent">Balance Your Dosha</span>
          </h1>

          <p className={`text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200 ${heroObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Discover personalized Ayurvedic diet charts crafted for your unique constitution.
            From diabetes management to pregnancy care — find the perfect nutrition plan.
          </p>

          {/* Quick Stats */}
          <div className={`flex flex-wrap justify-center gap-6 mb-8 transition-all duration-700 delay-300 ${heroObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {[
              { icon: BookOpen, label: 'Diet Plans', value: allCharts.length },
              { icon: Leaf, label: 'Categories', value: categories.length },
              { icon: Star, label: 'Expert Curated', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                <stat.icon className="w-5 h-5 text-ayur-accent" />
                <div className="text-left">
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className={`max-w-2xl mx-auto transition-all duration-700 delay-400 ${heroObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search diet charts (e.g., diabetes, thyroid, pregnancy...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-ayur-text placeholder-gray-400 text-base shadow-xl border-2 border-transparent focus:border-ayur-accent focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ayur-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY QUICK ACCESS */}
      <section className="relative -mt-8 z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 border-2 ${
              selectedCategory === 'All'
                ? 'bg-ayur-green text-white border-ayur-green shadow-lg shadow-ayur-green/20'
                : 'bg-white text-ayur-text border-gray-200 hover:border-ayur-green/30 hover:shadow-md'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            All Plans
            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {allCharts.length}
            </span>
          </button>
          {categories.slice(0, 10).map(cat => {
            const IconComp = CATEGORY_ICONS[cat] || Leaf;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 border-2 ${
                  isSelected
                    ? `bg-gradient-to-r ${CATEGORY_GRADIENTS[cat] || 'from-teal-500 to-emerald-600'} text-white border-transparent shadow-lg`
                    : 'bg-white text-ayur-text border-gray-200 hover:border-ayur-green/30 hover:shadow-md'
                }`}
              >
                <span className="text-base">{CATEGORY_EMOJIS[cat] || '🌿'}</span>
                <span className="max-w-[100px] truncate">{cat}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FILTERS + SORT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2 ${
                showFilters ? 'bg-ayur-green text-white border-ayur-green' : 'bg-white text-ayur-text border-gray-200 hover:border-ayur-green/30'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-ayur-gray">{filteredCharts.length} results</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-ayur-text bg-white focus:border-ayur-green focus:outline-none transition-colors"
            >
              <option value="default">Default</option>
              <option value="a-z">A-Z</option>
              <option value="category">By Category</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm animate-fadeIn">
            <h3 className="text-sm font-bold text-ayur-text mb-3">Filter by Prakriti (Constitution)</h3>
            <div className="flex flex-wrap gap-2">
              {PRAKRITI_OPTIONS.map(prakriti => (
                <button
                  key={prakriti}
                  onClick={() => setSelectedPrakriti(prakriti)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedPrakriti === prakriti
                      ? 'bg-ayur-green text-white shadow-md'
                      : 'bg-gray-50 text-ayur-gray hover:bg-ayur-green-light hover:text-ayur-green'
                  }`}
                >
                  {prakriti}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FEATURED SECTION */}
      {featuredCharts.length > 0 && selectedCategory === 'All' && !searchQuery && selectedPrakriti === 'All' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-ayur-accent/10 rounded-full">
              <Star className="w-4 h-4 text-ayur-accent fill-ayur-accent" />
              <span className="text-sm font-bold text-ayur-accent">Featured</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-text">Recommended Diet Plans</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCharts.slice(0, 3).map((chart, idx) => (
              <DietChartCard
                key={chart.id}
                title={chart.title}
                slug={chart.slug}
                category={chart.category}
                description={chart.description}
                image={chart.image}
                foodGroups={chart.foodGroups}
                foodsToConsume={chart.foodsToConsume}
                foodsToAvoid={chart.foodsToAvoid}
                lifestyleTips={chart.lifestyleTips}
                featured={true}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* ALL CHARTS GRID */}
      <section ref={gridObserver.ref} className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 mb-12">
        {selectedCategory !== 'All' || searchQuery || selectedPrakriti !== 'All' ? (
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-text">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : `${selectedPrakriti} Diet Charts`}
            </h2>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-text">All Diet Charts</h2>
          </div>
        )}

        {filteredCharts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharts.map((chart, idx) => (
              <div
                key={chart.id}
                className={`transition-all duration-500 ${gridObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${Math.min(idx * 50, 400)}ms` }}
              >
                <DietChartCard
                  title={chart.title}
                  slug={chart.slug}
                  category={chart.category}
                  description={chart.description}
                  image={chart.image}
                  foodGroups={chart.foodGroups}
                  foodsToConsume={chart.foodsToConsume}
                  foodsToAvoid={chart.foodsToAvoid}
                  lifestyleTips={chart.lifestyleTips}
                  featured={false}
                  index={idx}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-ayur-text mb-2">No diet charts found</h3>
            <p className="text-ayur-gray mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find the perfect diet plan for your needs.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-ayur-green text-white rounded-2xl font-semibold hover:bg-ayur-green-dark transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* STATS SECTION */}
      <section ref={statsObserver.ref} className="bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">Why Ayurvedic Diet?</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Food is medicine in Ayurveda. The right diet for your constitution can prevent and manage chronic conditions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, value: animatedCounters.charts, suffix: '+', label: 'Diet Plans', color: 'from-emerald-400 to-teal-500' },
              { icon: Leaf, value: animatedCounters.categories, suffix: '', label: 'Categories', color: 'from-amber-400 to-orange-500' },
              { icon: Utensils, value: animatedCounters.foods, suffix: '+', label: 'Food Items', color: 'from-pink-400 to-rose-500' },
              { icon: Heart, value: 100, suffix: '%', label: 'Natural', color: 'from-purple-400 to-violet-500' },
            ].map((stat, i) => (
              <div key={i} className={`text-center transition-all duration-700 ${statsObserver.hasBeenVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/60 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AYURVEDIC WISDOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="bg-gradient-to-br from-ayur-accent/10 via-amber-50 to-ayur-accent/5 rounded-3xl p-8 md:p-12 border border-ayur-accent/20 text-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-10 font-serif">"</div>
          <div className="relative z-10">
            <p className="font-serif text-xl md:text-2xl text-ayur-text italic mb-4 max-w-3xl mx-auto leading-relaxed">
              "When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need."
            </p>
            <p className="text-ayur-accent font-semibold text-sm mb-6">— Ayurvedic Proverb</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#/booking" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ayur-green text-white rounded-2xl font-bold hover:bg-ayur-green-dark transition-all shadow-lg hover:shadow-xl">
                <ChefHat className="w-5 h-5" />
                Consult a Dietician
              </a>
              <a href="#/tools" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ayur-green border-2 border-ayur-green/20 rounded-2xl font-bold hover:border-ayur-green transition-all">
                <Activity className="w-5 h-5" />
                Know Your Prakriti
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DietCharts;
