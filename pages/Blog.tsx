import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ArrowRight, Tag, User, Sparkles, Heart, Leaf, Droplet, Sun } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: 'Ayurveda' | 'Yoga' | 'Nutrition' | 'Lifestyle' | 'Wellness';
  image: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Ayurveda: The Science of Life',
    excerpt: 'Discover the ancient wisdom of Ayurveda and how it can transform your health through balanced living.',
    content: 'Full content here...',
    author: 'Dr. Jitendra Sharma',
    date: 'May 15, 2026',
    readTime: '5 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800&auto=format&fit=crop',
    featured: true
  },
  {
    id: '2',
    title: '10 Daily Habits for Better Digestion',
    excerpt: 'Simple Ayurvedic practices to improve your digestive health and boost overall wellness.',
    content: 'Full content here...',
    author: 'Dr. Priya Patel',
    date: 'May 12, 2026',
    readTime: '4 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Yoga for Stress Relief: 5 Essential Poses',
    excerpt: 'Calming yoga poses to reduce stress and promote mental clarity in your daily routine.',
    content: 'Full content here...',
    author: 'Yoga Master Rajesh',
    date: 'May 10, 2026',
    readTime: '6 min read',
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Seasonal Eating: Spring Detox Guide',
    excerpt: 'Learn how to align your diet with the seasons for optimal health and vitality.',
    content: 'Full content here...',
    author: 'Dr. Meera Singh',
    date: 'May 8, 2026',
    readTime: '5 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Meditation for Beginners: A Complete Guide',
    excerpt: 'Start your meditation journey with this comprehensive guide for beginners.',
    content: 'Full content here...',
    author: 'Swami Anand',
    date: 'May 5, 2026',
    readTime: '7 min read',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop'
  },
  {
    id: '6',
    title: 'Herbal Remedies for Common Ailments',
    excerpt: 'Natural herbal solutions for everyday health issues using Ayurvedic wisdom.',
    content: 'Full content here...',
    author: 'Dr. Jitendra Sharma',
    date: 'May 2, 2026',
    readTime: '6 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop'
  }
];

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Ayurveda', 'Yoga', 'Nutrition', 'Lifestyle', 'Wellness'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPost = BLOG_POSTS.find(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent overflow-hidden">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6">
              Ayurveda Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover ancient wisdom for modern living
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Search & Filter */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-ayur-subtle">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-ayur-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-ayur-green focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 min-h-[44px] ${
                    selectedCategory === category
                      ? 'bg-ayur-green text-white shadow-lg'
                      : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-ayur-green/15 transition-all duration-500 flex flex-col h-full border border-ayur-subtle/30 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
                </div>

                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg md:text-xl font-bold text-ayur-green mb-3 group-hover:text-ayur-accent transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-ayur-gray text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm min-h-[44px] px-3 group-hover:gap-3 transition-all duration-300">
                      Read Article
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-ayur-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-ayur-gray" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-ayur-text mb-2">
                No articles found
              </h3>
              <p className="text-ayur-gray mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Blog;
