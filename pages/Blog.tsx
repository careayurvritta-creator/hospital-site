/**
 * Blog Page - Enhanced with modern UI/UX
 * Features: Search, Filter by Category, Featured Post, Improved Cards
 */

import React, { useState, useMemo } from 'react';
import { NavLink } from '../components/Layout';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Tag, 
  Search, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  featured?: boolean;
  trending?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'hemanta-ritucharya',
    title: 'Hemanta Ritucharya: Ayurveda Guide for Early Winter',
    excerpt: 'As the cold sets in, optimize your diet and lifestyle according to Ayurveda to boost immunity and maintain energy levels during the winter season.',
    author: 'Dr. Jinendradutt Sharma',
    date: 'Dec 15, 2025',
    category: 'Seasonal Health',
    image: 'https://images.unsplash.com/photo-1544367563-12123d895e29?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 'panchakarma-benefits',
    title: 'Why You Need Panchakarma Detox This Year',
    excerpt: 'Discover how the 5 purification therapies can reset your metabolism, clear toxins, and rejuvenate your body from the cellular level.',
    author: 'Dr. J. Sharma',
    date: 'Jan 02, 2026',
    category: 'Treatments',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
    readTime: '7 min read',
    trending: true
  },
  {
    id: 'diabetes-ayurveda',
    title: 'Managing Diabetes Naturally with Ayurveda',
    excerpt: 'Effective herbs, dietary changes, and lifestyle modifications to manage blood sugar levels and prevent complications.',
    author: 'Dr. J. Sharma',
    date: 'Nov 28, 2025',
    category: 'Disease Management',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read'
  },
  {
    id: 'dosha-balance',
    title: 'Understanding Your Dosha: Complete Guide',
    excerpt: 'Learn about Vata, Pitta, and Kapha - the three doshas that govern your physical and mental constitution.',
    author: 'Dr. J. Sharma',
    date: 'Jan 10, 2026',
    category: 'Ayurveda Basics',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    readTime: '8 min read'
  },
  {
    id: 'morning-routine',
    title: 'Dinacharya: The Ayurvedic Morning Routine',
    excerpt: 'Start your day right with this ancient morning ritual that balances doshas and boosts vitality throughout the day.',
    author: 'Dr. Jinendradutt Sharma',
    date: 'Dec 20, 2025',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read'
  },
  {
    id: 'herbal-teas',
    title: 'Top 10 Ayurvedic Herbs for Immunity',
    excerpt: 'Boost your immune system naturally with these powerful Ayurvedic herbs backed by classical texts and modern science.',
    author: 'Dr. J. Sharma',
    date: 'Nov 15, 2025',
    category: 'Herbal Medicine',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    readTime: '7 min read',
    trending: true
  }
];

const CATEGORIES = ['All', 'Seasonal Health', 'Treatments', 'Disease Management', 'Ayurveda Basics', 'Lifestyle', 'Herbal Medicine'];

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'popular'>('date');

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredPost = BLOG_POSTS.find(post => post.featured);
  const trendingPosts = BLOG_POSTS.filter(post => post.trending);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30">
      {/* Enhanced Header with Gradient & Pattern */}
      <header className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark text-white pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 animate-fadeInUp">
              <Sparkles className="w-4 h-4 text-ayur-accent" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Knowledge Center</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight animate-fadeInUp animation-delay-100">
              Ayurveda <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Health Insights</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto animate-fadeInUp animation-delay-200">
              Expert articles on seasonal regimens, disease management, and holistic wellness from classical Ayurveda texts.
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 animate-fadeInUp animation-delay-300">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <BookOpen size={18} className="text-ayur-accent" />
                <span className="text-sm font-semibold">{BLOG_POSTS.length} Articles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Tag size={18} className="text-ayur-accent" />
                <span className="text-sm font-semibold">{CATEGORIES.length - 1} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16 animate-fadeInUp">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-ayur-subtle/50 group">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ayur-accent text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                      <Sparkles size={12} />
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-ayur-accent" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-ayur-accent" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-ayur-green mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-ayur-gray text-base md:text-lg leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-ayur-green/10 flex items-center justify-center">
                      <User size={18} className="text-ayur-green" />
                    </div>
                    <span className="text-sm font-semibold text-ayur-green">{featuredPost.author}</span>
                  </div>
                  <NavLink
                    to={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm md:text-base hover:gap-3 transition-all duration-300 active:scale-95 min-h-[48px] items-center"
                  >
                    Read Full Article <ArrowRight size={18} />
                  </NavLink>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search & Filter Section */}
        <section className="mb-12 sticky top-24 z-20 -mt-8 pt-8 pb-4 bg-gradient-to-b from-ayur-cream/95 via-ayur-cream/95 to-transparent">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg border border-ayur-subtle/50">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles by title, topic, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border-2 border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-4 focus:ring-ayur-green/10 transition-all text-ayur-green placeholder-gray-400 min-h-[56px] md:min-h-[64px]"
              />
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 min-h-[44px] active:scale-95 ${
                    selectedCategory === category
                      ? 'bg-ayur-green text-white shadow-lg shadow-ayur-green/30'
                      : 'bg-ayur-cream text-ayur-gray hover:bg-ayur-green/10 hover:text-ayur-green'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gray-500">Sort by:</span>
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[40px] ${
                  sortBy === 'date'
                    ? 'bg-ayur-accent text-white font-semibold'
                    : 'text-ayur-gray hover:bg-ayur-cream'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 min-h-[40px] ${
                  sortBy === 'popular'
                    ? 'bg-ayur-accent text-white font-semibold'
                    : 'text-ayur-gray hover:bg-ayur-cream'
                }`}
              >
                <TrendingUp size={14} />
                Trending
              </button>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        {trendingPosts.length > 0 && selectedCategory === 'All' && !searchQuery && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-ayur-accent" size={24} />
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendingPosts.slice(0, 2).map((post) => (
                <article
                  key={post.id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200 hover:border-ayur-accent transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                        <TrendingUp size={12} />
                        <span className="font-semibold">Trending</span>
                      </div>
                      <h3 className="font-serif text-base md:text-lg font-bold text-ayur-green mb-2 line-clamp-2 group-hover:text-ayur-accent transition-colors">
                        {post.title}
                      </h3>
                      <NavLink
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1.5 text-amber-700 font-semibold text-sm hover:gap-2 transition-all"
                      >
                        Read <ChevronRight size={14} />
                      </NavLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green">
              {selectedCategory === 'All' ? 'All Articles' : selectedCategory}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredPosts.filter(p => !p.featured).length} {filteredPosts.filter(p => !p.featured).length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {filteredPosts.filter(p => !p.featured).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-ayur-subtle">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-serif text-xl font-bold text-ayur-gray mb-2">No articles found</h3>
              <p className="text-ayur-gray/70 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-6 py-3 bg-ayur-green text-white rounded-full font-semibold hover:bg-ayur-green-dark transition-colors min-h-[48px]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.filter(post => !post.featured).map((post, index) => (
                <article
                  key={post.id}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-ayur-green/15 transition-all duration-500 flex flex-col h-full animate-fadeInUp border border-ayur-subtle/30"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-ayur-green/5 via-transparent to-ayur-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                  
                  <div className="relative h-56 overflow-hidden rounded-2xl m-3 md:m-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-ayur-green text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                        <Tag size={12} className="text-ayur-accent" />
                        {post.category}
                      </span>
                    </div>

                    {post.trending && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ayur-accent text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                          <TrendingUp size={12} />
                          Hot
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 md:p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg md:text-xl font-bold text-ayur-green mb-3 group-hover:text-ayur-accent transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-ayur-gray text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-ayur-green/10 flex items-center justify-center">
                        <User size={14} className="text-ayur-green" />
                      </div>
                      <span className="text-xs font-semibold text-ayur-green">{post.author}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <NavLink
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm min-h-[44px] px-3 hover:gap-3 transition-all duration-300 active:scale-95"
                      >
                        Read Article <ArrowRight size={16} />
                      </NavLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
          <div className="relative z-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Stay Updated with Ayurveda</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Get the latest health insights, seasonal tips, and wellness guides delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 min-h-[48px]"
              />
              <button className="px-8 py-3 bg-ayur-accent hover:bg-ayur-accent-hover text-white rounded-full font-bold transition-all min-h-[48px] active:scale-95">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Blog;
