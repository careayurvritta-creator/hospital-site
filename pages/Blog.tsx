import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, ArrowLeft, BookOpen, Share2, Heart, Filter, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import SEOHead from '../components/SEOHead';
import { BLOG_POSTS, BLOG_CATEGORIES, getPostBySlug } from '../data/blog/loadPosts';
import { BlogCategory, BlogPostWithAuthor } from '../data/blog/types';

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  Ayurveda: 'from-green-500 to-emerald-600',
  Yoga: 'from-purple-500 to-violet-600',
  Nutrition: 'from-amber-500 to-orange-600',
  Lifestyle: 'from-pink-500 to-rose-600',
  Wellness: 'from-blue-500 to-cyan-600'
};

const SAVED_KEY = 'ayurvritta-blog-saved';
const SUBSCRIBE_EMAIL = 'care.ayurvritta@gmail.com';

/** Render **bold** markdown text as <strong> JSX */
function renderBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-ayur-text">{part}</strong> : part
  );
}

/** Render markdown content block-by-block (##, ###, lists, numbered lists, paragraphs) */
function renderContent(content: string): React.ReactNode[] {
  return content.split('\n\n').map((block, idx) => {
    const lines = block.split('\n');

    if (block.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-2xl md:text-3xl font-serif font-bold text-ayur-green mt-12 mb-6 leading-snug">
          {renderBoldText(block.replace(/^##\s*/, ''))}
        </h2>
      );
    }

    if (block.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl md:text-2xl font-serif font-bold text-ayur-text mt-8 mb-4 leading-snug">
          {renderBoldText(block.replace(/^###\s*/, ''))}
        </h3>
      );
    }

    const nonEmpty = lines.filter(l => l.trim() !== '');
    const allBullets = nonEmpty.length > 0 && nonEmpty.every(l => l.trim().startsWith('- '));
    const allNumbered = nonEmpty.length > 0 && nonEmpty.every(l => /^\d+\.\s/.test(l.trim()));

    if (allBullets) {
      return (
        <ul key={idx} className="list-none space-y-3 my-6">
          {nonEmpty.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-ayur-green mt-2.5 flex-shrink-0" />
              <span className="text-ayur-text">{renderBoldText(item.trim().replace(/^-\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (allNumbered) {
      return (
        <ol key={idx} className="list-none space-y-3 my-6">
          {nonEmpty.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-ayur-green/10 text-ayur-green font-bold flex items-center justify-center text-sm">
                {itemIdx + 1}
              </span>
              <span className="text-ayur-text pt-1">{renderBoldText(item.trim().replace(/^\d+\.\s*/, ''))}</span>
            </li>
          ))}
        </ol>
      );
    }

    return <p key={idx} className="text-ayur-text leading-relaxed">{renderBoldText(block)}</p>;
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

const Blog: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });
  const [shareCopied, setShareCopied] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');

  const post = slug ? getPostBySlug(slug) : undefined;

  // Initialize author filter from "View All Articles" navigation state
  useEffect(() => {
    const author = (location.state as { author?: string } | null)?.author;
    if (author) setSelectedAuthor(author);
    setSelectedCategory('All');
    setSearchQuery('');
  }, [location.state]);

  // Reading progress for the article page
  useEffect(() => {
    if (!post) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setReadProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const toggleSave = (postSlug: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postSlug)) {
        next.delete(postSlug);
      } else {
        next.add(postSlug);
      }
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      } catch {
        // storage may be unavailable; state still updates for the session
      }
      return next;
    });
  };

  const shareArticle = async (sharePost: BlogPostWithAuthor) => {
    const url = `${window.location.origin}${window.location.pathname}#/blog/${sharePost.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: sharePost.title, text: sharePost.excerpt, url });
        return;
      } catch {
        // user cancelled or share unsupported; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Subscribe to Ayurvritta Health Tips');
    const body = encodeURIComponent('Please subscribe me to the weekly Ayurveda newsletter.\n\nEmail: ' + subscribeEmail);
    window.location.href = `mailto:${SUBSCRIBE_EMAIL}?subject=${subject}&body=${body}`;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const filteredPosts = useMemo(() => {
    const posts = slug ? BLOG_POSTS.filter(p => p.slug !== slug) : BLOG_POSTS;
    const q = searchQuery.trim().toLowerCase();
    return posts.filter(p => {
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesAuthor = selectedAuthor === 'All' || p.authorId === selectedAuthor;
      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [searchQuery, selectedCategory, selectedAuthor, slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS
      .filter(p => p.slug !== post.slug && (p.category === post.category || p.authorId === post.authorId))
      .slice(0, 3);
  }, [post]);

  const authors = useMemo(() => {
    const map = new Map<string, string>();
    BLOG_POSTS.forEach(p => map.set(p.authorId, p.author.name));
    return Array.from(map.entries());
  }, []);

  // ======================== ARTICLE VIEW ========================
  if (post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
        <SEOHead
          title={`${post.title} | Ayurvritta Blog`}
          description={post.excerpt}
          image={post.image}
          type="article"
        />

        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-ayur-subtle z-50">
          <div
            className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* Hero */}
        <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[350px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <button
            onClick={() => navigate('/blog')}
            aria-label="Back to blog"
            className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-2.5 sm:px-5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-105 min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold hidden sm:inline">{t.nav.blog}</span>
          </button>

          <button
            onClick={() => toggleSave(post.slug)}
            aria-label={savedPosts.has(post.slug) ? 'Remove from saved' : 'Save article'}
            className={`absolute top-6 right-6 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center ${
              savedPosts.has(post.slug) ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-6 h-6 ${savedPosts.has(post.slug) ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="max-w-4xl mx-auto animate-fadeInUp">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 bg-gradient-to-r ${CATEGORY_COLORS[post.category]} text-white text-sm font-semibold rounded-full shadow-lg`}>
                  {post.category}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Clock size={16} /> {post.readTime}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Calendar size={16} /> {formatDate(post.date)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4">
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-14 h-14 rounded-full border-2 border-white/50 shadow-xl object-cover"
                />
                <div className="text-white">
                  <div className="font-bold text-lg">{post.author.name}</div>
                  <div className="text-white/80 text-sm">{post.author.credentials}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 py-12 relative">
          <div className="bg-white rounded-3xl shadow-2xl shadow-ayur-green/10 p-8 md:p-12 lg:p-16 -mt-20 relative z-10">
            <div className="text-ayur-gray leading-relaxed space-y-6">
              {renderContent(post.content)}
            </div>

            {/* Share & Actions */}
            <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-ayur-subtle">
              <button
                onClick={() => shareArticle(post)}
                className="flex items-center gap-2 px-6 py-3 bg-ayur-green text-white rounded-full font-semibold hover:bg-ayur-green-dark transition-all shadow-lg hover:shadow-xl min-h-[48px]"
              >
                {shareCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                {shareCopied ? 'Link Copied' : 'Share Article'}
              </button>
              <button
                onClick={() => toggleSave(post.slug)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all min-h-[48px] border-2 ${
                  savedPosts.has(post.slug)
                    ? 'bg-ayur-green/10 text-ayur-green border-ayur-green'
                    : 'bg-white text-ayur-green border-ayur-green hover:bg-ayur-green/5'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                {savedPosts.has(post.slug) ? 'Saved' : 'Save for Later'}
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-6">
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-24 h-24 rounded-full border-4 border-ayur-green/20 object-cover"
              />
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-bold text-ayur-text mb-1">{post.author.name}</h3>
                <p className="text-sm text-ayur-green font-semibold mb-1">{post.author.credentials}</p>
                <p className="text-ayur-gray mb-3">{post.author.role} ΓÇó Ayurvritta Ayurveda Hospital ΓÇó Reg. {post.author.regNumber}</p>
                <p className="text-ayur-gray text-sm mb-4">{post.author.bio}</p>
                <button
                  onClick={() => navigate('/blog', { state: { author: post.authorId } })}
                  className="text-ayur-green font-semibold hover:text-ayur-accent transition-colors"
                >
                  View All Articles ΓåÆ
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-serif font-bold text-ayur-text mb-8 text-center">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.length > 0 ? relatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.slug}
                onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-ayur-text mb-2 line-clamp-2 group-hover:text-ayur-green transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-ayur-gray line-clamp-2">{relatedPost.excerpt}</p>
                </div>
              </div>
            )) : (
              <div className="md:col-span-3 text-center text-ayur-gray py-8">
                No other articles yet ΓÇö check back soon.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ======================== LIST VIEW ========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      <SEOHead />

      {/* Animated Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-ayur-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6 animate-fadeIn">
              <Sparkles className="w-4 h-4" />
              Wisdom for Modern Living
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 animate-fadeInUp">
              Ayurveda <span className="italic text-ayur-accent">{t.nav.blog}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-12 animate-fadeInUp animation-delay-100">
              Discover ancient wisdom for modern health, wellness, and balanced living
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto animate-fadeInUp animation-delay-200">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/95 backdrop-blur-md text-ayur-text text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {BLOG_POSTS.filter(p => p.featured).length > 0 && selectedCategory === 'All' && selectedAuthor === 'All' && !searchQuery && (
          <div className="mb-12 animate-fadeIn">
            {BLOG_POSTS.filter(p => p.featured).slice(0, 1).map(featured => (
              <div
                key={featured.slug}
                onClick={() => navigate(`/blog/${featured.slug}`)}
                className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500"
                style={{ minHeight: 'clamp(280px, 50vw, 400px)' }}
              >
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="relative flex flex-col justify-end h-full p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-ayur-accent text-white text-sm font-bold rounded-full flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Featured
                    </span>
                    <span className={`px-4 py-1.5 bg-gradient-to-r ${CATEGORY_COLORS[featured.category]} text-white text-sm font-semibold rounded-full`}>
                      {featured.category}
                    </span>
                    <span className="text-white/70 text-sm flex items-center gap-1">
                      <Clock size={14} /> {featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 group-hover:text-ayur-accent transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-white/80 text-lg max-w-2xl mb-6 line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <img src={featured.author.image} alt={featured.author.name} className="w-12 h-12 rounded-full border-2 border-white/30 object-cover" />
                    <div className="text-white">
                      <div className="font-bold">{featured.author.name}</div>
                      <div className="text-white/70 text-sm">{formatDate(featured.date)}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-ayur-accent font-bold text-lg group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 min-h-[48px] ${
                    selectedCategory === category
                      ? 'bg-ayur-green text-white shadow-lg transform scale-105'
                      : 'bg-white text-ayur-gray hover:bg-ayur-surface border border-ayur-subtle hover:border-ayur-green/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {authors.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAuthor('All')}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 min-h-[44px] ${
                    selectedAuthor === 'All'
                      ? 'bg-ayur-accent text-white shadow-lg'
                      : 'bg-white text-ayur-gray hover:bg-ayur-surface border border-ayur-subtle'
                  }`}
                >
                  All Doctors
                </button>
                {authors.map(([authorId, authorName]) => (
                  <button
                    key={authorId}
                    onClick={() => setSelectedAuthor(selectedAuthor === authorId ? 'All' : authorId)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 min-h-[44px] ${
                      selectedAuthor === authorId
                        ? 'bg-ayur-accent text-white shadow-lg'
                        : 'bg-white text-ayur-gray hover:bg-ayur-surface border border-ayur-subtle'
                    }`}
                  >
                    {authorName.replace('Dr. ', 'Dr. ').split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-ayur-subtle min-h-[48px]"
          >
            <Filter className="w-5 h-5" />
            <span className="font-semibold text-ayur-gray">Filters</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-ayur-green">{filteredPosts.length}</div>
              <div className="text-sm text-ayur-gray">Articles</div>
            </div>
            <div className="h-12 w-px bg-ayur-subtle" />
            <div className="text-center">
              <div className="text-2xl font-bold text-ayur-accent">{BLOG_CATEGORIES.length - 1}</div>
              <div className="text-sm text-ayur-gray">Categories</div>
            </div>
          </div>
          {savedPosts.size > 0 && (
            <div className="hidden md:flex items-center gap-2 text-ayur-gray">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm">{savedPosts.size} saved</span>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((postCard) => (
            <article
              key={postCard.slug}
              onClick={() => navigate(`/blog/${postCard.slug}`)}
              className="blog-card group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 cursor-pointer border border-ayur-subtle/30"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={postCard.image}
                  alt={postCard.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 bg-gradient-to-r ${CATEGORY_COLORS[postCard.category]} text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm`}>
                    {postCard.category}
                  </span>
                </div>

                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(postCard.slug);
                  }}
                  aria-label="Save article"
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    savedPosts.has(postCard.slug)
                      ? 'bg-red-500/90 text-white'
                      : 'bg-white/80 text-ayur-gray hover:bg-white hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${savedPosts.has(postCard.slug) ? 'fill-current' : ''}`} />
                </button>

                {/* Featured Badge */}
                {postCard.featured && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-ayur-accent/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-ayur-green" />
                    {formatDate(postCard.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-ayur-accent" />
                    {postCard.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-serif font-bold text-ayur-text mb-3 line-clamp-2 group-hover:text-ayur-green transition-colors duration-300">
                  {postCard.title}
                </h2>

                <p className="text-ayur-gray text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  {postCard.excerpt}
                </p>

                {/* Author & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={postCard.author.image}
                      alt={postCard.author.name}
                      className="w-10 h-10 rounded-full border-2 border-ayur-green/20 object-cover"
                    />
                    <span className="text-sm font-semibold text-ayur-text">{postCard.author.name.split(' ')[1] || postCard.author.name}</span>
                  </div>
                  <span className="flex items-center gap-2 text-ayur-accent font-bold text-sm group-hover:gap-3 transition-all duration-300">
                    Read
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        {filteredPosts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="relative bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent rounded-3xl overflow-hidden p-8 md:p-12">
              <div className="relative text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                  <Heart className="w-4 h-4" />
                  Stay Connected
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                  Get Ayurvedic Health Tips
                </h3>
                <p className="text-white/90 text-lg mb-8">
                  Join our community and receive weekly insights on Ayurveda, nutrition, and holistic wellness from our doctors.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-full text-ayur-text text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-ayur-accent text-white rounded-full font-bold hover:bg-ayur-accent-hover transition-all shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap min-h-[48px]"
                  >
                    {subscribed ? <Check className="w-5 h-5 inline-block" /> : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-ayur-surface rounded-full flex items-center justify-center mx-auto mb-6">
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
                setSelectedAuthor('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
