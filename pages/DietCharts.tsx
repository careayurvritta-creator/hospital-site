import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, X, Leaf, Heart, Sparkles, ChevronDown, ChevronRight, Star, TrendingUp, BookOpen, ArrowRight, Utensils } from 'lucide-react';
import DietChartCard from '../components/DietChartCard';
import { getAllParsedDietCharts, getDietChartCategories, getFeaturedDietCharts } from '../lib/diet-charts';
import { useLanguage } from '../components/LanguageContext';

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
  'General Health': '🌱',
};

const DietChartsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPrakriti, setSelectedPrakriti] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'category'>('category');
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const allCharts = useMemo(() => getAllParsedDietCharts(), []);
  const categories = useMemo(() => ['All', ...getDietChartCategories()], []);
  const featuredCharts = useMemo(() => getFeaturedDietCharts(), []);

  const filteredCharts = useMemo(() => {
    let filtered = allCharts.filter(chart => {
      const matchesSearch = chart.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chart.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || chart.category === selectedCategory;

      // Prakriti filter
      let matchesPrakriti = true;
      if (selectedPrakriti !== 'All') {
        const prakriti = getPrakritiFromTitle(chart.title);
        matchesPrakriti = prakriti === selectedPrakriti;
      }

      return matchesSearch && matchesCategory && matchesPrakriti;
    });

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedPrakriti, allCharts, sortBy]);

  // IntersectionObserver for card reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    const cards = gridRef.current?.querySelectorAll('.diet-chart-card');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredCharts]);

  // Parallax hero effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const overlay = heroRef.current.querySelector('.hero-overlay') as HTMLElement;
        if (overlay) {
          overlay.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allCharts.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [allCharts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-r from-ayur-green via-teal-700 to-ayur-accent overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Elements */}
        <div className="hero-overlay absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-[10%] w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
          <div className="absolute top-32 right-[15%] w-48 h-48 bg-ayur-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-16 left-[40%] w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-[5%] w-20 h-20 bg-teal-300/10 rounded-full blur-xl animate-float" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6 animate-fadeIn">
              <Leaf className="w-4 h-4" />
              Authentic Ayurvedic Nutrition
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 animate-fadeInUp">
              Diet <span className="italic text-ayur-accent">Charts</span>
            </h1>

            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2.5 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <span className="text-white font-bold text-lg">{allCharts.length}</span>
              <span className="text-white/80 font-medium">Comprehensive Plans</span>
              <span className="w-1 h-1 bg-white/40 rounded-full" />
              <span className="text-white/80 font-medium">{categories.length - 1} Categories</span>
            </div>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Personalized Ayurvedic diet plans for {allCharts.length} conditions, rooted in classical wisdom
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <input
                type="text"
                placeholder="Search diet charts by condition, category, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 pl-14 pr-14 rounded-2xl text-ayur-text text-lg focus:outline-none focus:ring-4 focus:ring-ayur-accent/40 shadow-2xl bg-white/95 backdrop-blur-md transition-all duration-300 hover:shadow-3xl"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-ayur-gray" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ayur-subtle flex items-center justify-center hover:bg-ayur-green/20 transition-colors"
                >
                  <X className="w-4 h-4 text-ayur-gray" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Access */}
      <div className="bg-white border-b border-ayur-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
            <span className="text-sm font-semibold text-ayur-gray whitespace-nowrap flex-shrink-0">Quick Access:</span>
            {categories.filter(c => c !== 'All').slice(0, 10).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category === selectedCategory ? 'All' : category);
                  setSelectedPrakriti('All');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-ayur-green text-white shadow-md'
                    : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle'
                }`}
              >
                <span>{CATEGORY_EMOJIS[category] || '🌿'}</span>
                <span>{category}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${
                  selectedCategory === category ? 'bg-white/20' : 'bg-ayur-subtle'
                }`}>
                  {categoryCount[category] || 0}
                </span>
              </button>
            ))}
            {categories.length > 11 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-ayur-green hover:text-ayur-accent transition-colors whitespace-nowrap flex-shrink-0"
              >
                +{categories.length - 11} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-ayur-gray font-semibold text-sm">
              {filteredCharts.length} {filteredCharts.length === 1 ? 'Chart' : 'Charts'}
              {selectedCategory !== 'All' && <span className="text-ayur-green"> in {selectedCategory}</span>}
              {selectedPrakriti !== 'All' && <span className="text-ayur-accent"> for {selectedPrakriti}</span>}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-ayur-subtle p-1">
              <button
                onClick={() => setSortBy('category')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  sortBy === 'category' ? 'bg-ayur-green text-white shadow-sm' : 'text-ayur-gray hover:text-ayur-text'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  sortBy === 'name' ? 'bg-ayur-green text-white shadow-sm' : 'text-ayur-gray hover:text-ayur-text'
                }`}
              >
                A-Z
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-all duration-300 font-semibold text-sm min-h-[44px] ${
                showFilters || selectedPrakriti !== 'All'
                  ? 'bg-ayur-green text-white'
                  : 'bg-white text-ayur-gray border border-ayur-subtle hover:border-ayur-green/30'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {(selectedPrakriti !== 'All' || selectedCategory !== 'All') && (
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                  {(selectedPrakriti !== 'All' ? 1 : 0) + (selectedCategory !== 'All' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl shadow-soft p-6 border border-ayur-subtle animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-bold text-ayur-text mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-ayur-green" />
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-ayur-green text-white shadow-md'
                          : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle'
                      }`}
                    >
                      {category !== 'All' && <span className="mr-1">{CATEGORY_EMOJIS[category] || '🌿'}</span>}
                      {category}
                      {category !== 'All' && categoryCount[category] && (
                        <span className="ml-1 text-xs opacity-70">({categoryCount[category]})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prakriti Filter */}
              <div>
                <h4 className="text-sm font-bold text-ayur-text mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-ayur-accent" />
                  Prakriti (Constitution)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PRAKRITI_OPTIONS.map((prakriti) => (
                    <button
                      key={prakriti}
                      onClick={() => setSelectedPrakriti(prakriti)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedPrakriti === prakriti
                          ? 'bg-ayur-accent text-white shadow-md'
                          : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle'
                      }`}
                    >
                      {prakriti}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'All' || selectedPrakriti !== 'All' || searchTerm) && (
              <div className="mt-4 pt-4 border-t border-ayur-subtle flex items-center justify-between">
                <span className="text-sm text-ayur-gray">
                  Showing {filteredCharts.length} of {allCharts.length} charts
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedPrakriti('All');
                  }}
                  className="text-sm font-semibold text-ayur-green hover:text-ayur-accent transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Featured Section (only when no filters) */}
      {selectedCategory === 'All' && selectedPrakriti === 'All' && !searchTerm && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-ayur-accent/10 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-ayur-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ayur-text">Featured Diet Plans</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCharts.slice(0, 4).map((chart, idx) => (
              <DietChartCard
                key={chart.id}
                title={chart.title}
                slug={chart.slug}
                category={chart.category}
                description={chart.description}
                image={chart.image}
                foodGroups={chart.foodGroups}
                featured
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Diet Charts Grid */}
      <div ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {selectedCategory === 'All' && selectedPrakriti === 'All' && !searchTerm && (
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-ayur-green/10 rounded-full flex items-center justify-center">
              <Utensils className="w-5 h-5 text-ayur-green" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ayur-text">All Diet Charts</h2>
            <span className="text-sm text-ayur-gray font-medium ml-2">({allCharts.length} plans)</span>
          </div>
        )}

        {filteredCharts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharts.map((chart, idx) => (
              <div
                key={chart.id}
                id={`chart-${chart.id}`}
                className={`diet-chart-card transition-all duration-700 ${
                  visibleCards.has(`chart-${chart.id}`)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${(idx % 8) * 75}ms` }}
              >
                <DietChartCard
                  title={chart.title}
                  slug={chart.slug}
                  category={chart.category}
                  description={chart.description}
                  image={chart.image}
                  foodGroups={chart.foodGroups}
                  index={idx}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-28 h-28 bg-ayur-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-14 h-14 text-ayur-gray/50" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-ayur-text mb-3">
              No diet charts found
            </h3>
            <p className="text-ayur-gray mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filter criteria to discover the right plan for you
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPrakriti('All');
              }}
              className="px-6 py-3 bg-ayur-green text-white rounded-full font-semibold hover:bg-ayur-green-dark transition-all shadow-lg hover:shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-ayur-subtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: allCharts.length, label: 'Diet Charts', color: 'text-ayur-green', icon: '📊' },
              { value: categories.length - 1, label: 'Categories', color: 'text-ayur-accent', icon: '📂' },
              { value: '100%', label: 'Ayurvedic', color: 'text-teal-600', icon: '🌿' },
              { value: 'Free', label: 'Access', color: 'text-purple-600', icon: '🎁' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-ayur-gray font-semibold text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietChartsPage;
