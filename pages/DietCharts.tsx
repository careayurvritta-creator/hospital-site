import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import DietChartCard from '../components/DietChartCard';
import { getAllParsedDietCharts, getDietChartCategories } from '../lib/diet-charts';
import { useLanguage } from '../components/LanguageContext';

const DietChartsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const allCharts = useMemo(() => getAllParsedDietCharts(), []);
  const categories = useMemo(() => ['All', ...getDietChartCategories()], []);

  const filteredCharts = useMemo(() => {
    return allCharts.filter(chart => {
      const matchesSearch = chart.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chart.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || chart.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allCharts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4">
              Diet Charts
            </h1>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-white font-bold text-lg">{allCharts.length} Comprehensive Plans</span>
            </div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover personalized Ayurvedic diet plans for optimal health and wellness
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search diet charts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 pl-14 rounded-full text-ayur-text text-lg focus:outline-none focus:ring-4 focus:ring-ayur-accent/50 shadow-2xl bg-white/95 backdrop-blur-md"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-ayur-gray" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-ayur-gray font-semibold">
              {filteredCharts.length} {filteredCharts.length === 1 ? 'Chart' : 'Charts'}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft hover:shadow-card transition-all duration-300"
          >
            <Filter className="w-5 h-5 text-ayur-gray" />
            <span className="font-semibold text-ayur-gray">
              {selectedCategory !== 'All' ? selectedCategory : 'All Categories'}
            </span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-ayur-gray sm:hidden">
            {filteredCharts.length} of {allCharts.length} charts
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft hover:shadow-card transition-all duration-300 sm:hidden min-h-[48px]"
          >
            <Filter className="w-5 h-5 text-ayur-gray" />
            <span className="font-semibold text-ayur-gray text-sm">
              {showFilters ? 'Hide' : 'Show'} Filters
            </span>
          </button>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-ayur-green text-white shadow-lg transform scale-105'
                  : 'bg-white text-ayur-gray hover:bg-ayur-subtle border border-ayur-subtle'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {showFilters && (
          <div className="flex sm:hidden flex-wrap gap-2 mt-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-ayur-green text-white shadow-lg transform scale-105'
                    : 'bg-white text-ayur-gray hover:bg-ayur-subtle border border-ayur-subtle'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diet Charts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredCharts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCharts.map((chart) => (
              <DietChartCard
                key={chart.id}
                title={chart.title}
                slug={chart.slug}
                category={chart.category}
                description={chart.description}
                image={chart.image}
                foodGroups={chart.foodGroups}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-ayur-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-ayur-gray" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-ayur-text mb-2">
              No diet charts found
            </h3>
            <p className="text-ayur-gray mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-ayur-subtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-ayur-green mb-2">
                {allCharts.length}+
              </div>
              <div className="text-ayur-gray font-semibold">Diet Charts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-ayur-accent mb-2">
                {categories.length - 1}
              </div>
              <div className="text-ayur-gray font-semibold">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">100%</div>
              <div className="text-ayur-gray font-semibold">Ayurvedic</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-ayur-gray font-semibold">Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietChartsPage;
