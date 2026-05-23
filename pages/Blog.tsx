import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag, User, ArrowLeft, Heart, Leaf, Droplet, Sun, BookOpen } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  category: 'Ayurveda' | 'Yoga' | 'Nutrition' | 'Lifestyle' | 'Wellness';
  image: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'understanding-ayurveda-science-of-life',
    title: 'Understanding Ayurveda: The Science of Life',
    excerpt: 'Discover the ancient wisdom of Ayurveda and how it can transform your health through balanced living.',
    content: `Ayurveda, the ancient science of life, is a holistic healing system that originated in India over 5,000 years ago. The word "Ayurveda" is derived from two Sanskrit words: "Ayus" meaning life and "Veda" meaning knowledge or science.

## The Five Elements

According to Ayurveda, everything in the universe is composed of five basic elements:
- **Ether (Space)**: The space in which we live
- **Air**: The air we breathe
- **Fire**: The sun's heat and light
- **Water**: The rain and oceans
- **Earth**: The solid matter around us

## The Three Doshas

These five elements combine to form three fundamental energies or doshas:

### Vata (Air + Ether)
Vata governs movement in the body and mind. When balanced, it promotes creativity and vitality. When imbalanced, it can lead to anxiety and digestive issues.

### Pitta (Fire + Water)
Pitta controls digestion and metabolism. Balanced pitta brings intelligence and contentment, while imbalance can cause anger and inflammation.

### Kapha (Earth + Water)
Kapha provides structure and stability. When balanced, it manifests as love and forgiveness. Imbalance can lead to attachment and greed.

## Daily Practices for Balance

1. **Wake up early**: Rise before sunrise during the Vata time
2. **Tongue scraping**: Remove toxins accumulated overnight
3. **Oil pulling**: Swish coconut or sesame oil in mouth
4. **Meditation**: Practice 10-20 minutes daily
5. **Yoga**: Gentle stretches to awaken the body
6. **Balanced meals**: Eat according to your dosha

## Conclusion

Ayurveda offers a comprehensive approach to health that addresses body, mind, and spirit. By understanding your unique constitution and making appropriate lifestyle choices, you can achieve optimal health and well-being.`,
    author: 'Dr. Jitendra Sharma',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&auto=format&fit=crop',
    date: 'May 15, 2026',
    readTime: '5 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=1200&auto=format&fit=crop',
    featured: true
  },
  {
    id: '2',
    slug: 'daily-habits-better-digestion',
    title: '10 Daily Habits for Better Digestion',
    excerpt: 'Simple Ayurvedic practices to improve your digestive health and boost overall wellness.',
    content: `Good digestion is the cornerstone of health in Ayurveda. Here are ten simple habits you can incorporate into your daily routine:

## 1. Start Your Day Warm
Begin with a glass of warm water with lemon to stimulate digestion and flush out toxins.

## 2. Eat at Regular Times
Your digestive fire (Agni) works best when you eat at consistent times each day.

## 3. Make Lunch Your Largest Meal
Digestive fire is strongest between 10 AM and 2 PM, making this the ideal time for your main meal.

## 4. Chew Thoroughly
Proper chewing begins the digestive process in the mouth and reduces the burden on your stomach.

## 5. Avoid Cold Drinks
Cold beverages extinguish digestive fire. Opt for warm or room-temperature drinks instead.

## 6. Include All Six Tastes
Incorporate sweet, sour, salty, pungent, bitter, and astringent tastes in each meal.

## 7. Don't Overeat
Fill your stomach one-third with food, one-third with liquid, and leave one-third empty.

## 8. Walk After Meals
A gentle 10-minute walk after eating aids digestion and blood sugar control.

## 9. Eat in a Calm Environment
Stress impairs digestion. Eat in a peaceful setting without distractions.

## 10. Finish Dinner Early
Eat dinner at least 3 hours before bedtime to allow proper digestion.

Implement these habits gradually for lasting digestive health.`,
    author: 'Dr. Priya Patel',
    authorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&auto=format&fit=crop',
    date: 'May 12, 2026',
    readTime: '4 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=1200&auto=format&fit=crop'
  },
  {
    id: '3',
    slug: 'yoga-stress-relief-poses',
    title: 'Yoga for Stress Relief: 5 Essential Poses',
    excerpt: 'Calming yoga poses to reduce stress and promote mental clarity in your daily routine.',
    content: `Stress is a common challenge in modern life. These five yoga poses can help calm your mind and restore balance:

## 1. Child's Pose (Balasana)
Kneel on the floor, sit back on your heels, and fold forward with your forehead touching the ground. This pose calms the nervous system.

## 2. Standing Forward Fold (Uttanasana)
Stand with feet hip-width apart and fold forward, letting your head hang heavy. This releases tension in the back and neck.

## 3. Legs-Up-The-Wall (Viparita Karani)
Lie on your back with legs extended up a wall. This restorative pose calms the mind and reduces anxiety.

## 4. Corpse Pose (Savasana)
Lie flat on your back with arms at your sides. Focus on deep breathing and complete relaxation.

## 5. Cat-Cow Stretch (Marjaryasana-Bitilasana)
On hands and knees, alternate between arching and rounding your back. This gentle movement releases spinal tension.

Practice these poses daily for 10-15 minutes to experience reduced stress and improved mental clarity.`,
    author: 'Yoga Master Rajesh',
    authorImage: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=100&h=100&auto=format&fit=crop',
    date: 'May 10, 2026',
    readTime: '6 min read',
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=1200&auto=format&fit=crop'
  },
  {
    id: '4',
    slug: 'seasonal-eating-spring-detox',
    title: 'Seasonal Eating: Spring Detox Guide',
    excerpt: 'Learn how to align your diet with the seasons for optimal health and vitality.',
    content: `Spring is nature's time for renewal, making it the perfect season for detoxification.

## Why Spring Detox?
Winter's heavy foods and reduced activity can lead to accumulated toxins (Ama). Spring's lighter energy supports cleansing.

## Foods to Emphasize
- **Bitter greens**: Dandelion, arugula, kale
- **Sprouts**: Mung bean, alfalfa, broccoli
- **Fresh herbs**: Cilantro, parsley, mint
- **Light grains**: Quinoa, barley, millet
- **Berries**: Blueberries, strawberries, raspberries

## Foods to Avoid
- Heavy, greasy foods
- Excessive dairy
- Processed sugars
- Red meat
- Alcohol

## Simple Spring Detox Plan

### Morning
- Warm water with lemon and honey
- Fresh fruit or smoothie

### Lunch
- Large salad with bitter greens
- Steamed vegetables
- Light grain like quinoa

### Dinner
- Vegetable soup or steamed vegetables
- Small portion of lentils or mung beans

### Throughout the Day
- Warm water with ginger
- Herbal teas (dandelion, nettle)

Follow this plan for 3-7 days to refresh your body and mind for spring.`,
    author: 'Dr. Meera Singh',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&auto=format&fit=crop',
    date: 'May 8, 2026',
    readTime: '5 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop'
  },
  {
    id: '5',
    slug: 'meditation-beginners-guide',
    title: 'Meditation for Beginners: A Complete Guide',
    excerpt: 'Start your meditation journey with this comprehensive guide for beginners.',
    content: `Meditation is a powerful tool for calming the mind and achieving inner peace. Here's everything you need to know to begin:

## What is Meditation?
Meditation is the practice of focusing the mind to achieve a state of awareness and tranquility.

## Benefits of Meditation
- Reduces stress and anxiety
- Improves concentration
- Enhances emotional health
- Promotes better sleep
- Increases self-awareness

## Getting Started

### 1. Choose a Quiet Space
Find a peaceful spot where you won't be disturbed.

### 2. Set a Time
Morning is ideal, but choose a time that works for you.

### 3. Get Comfortable
Sit on a cushion or chair with your spine straight.

### 4. Focus on Breath
Close your eyes and follow your natural breath.

### 5. Start Small
Begin with 5 minutes daily and gradually increase.

## Common Challenges

### Restless Mind
It's normal for thoughts to arise. Gently return focus to breath.

### Physical Discomfort
Use cushions or a chair for support.

### Falling Asleep
Try meditating with eyes slightly open or standing.

## Types of Meditation
- **Mindfulness**: Focus on present moment
- **Loving-kindness**: Cultivate compassion
- **Body scan**: Systematic relaxation
- **Mantra**: Repeat a sacred sound

Start with just 5 minutes daily. Consistency is more important than duration.`,
    author: 'Swami Anand',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop',
    date: 'May 5, 2026',
    readTime: '7 min read',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop'
  },
  {
    id: '6',
    slug: 'herbal-remedies-common-ailments',
    title: 'Herbal Remedies for Common Ailments',
    excerpt: 'Natural herbal solutions for everyday health issues using Ayurvedic wisdom.',
    content: `Nature provides powerful remedies for common health concerns. Here are effective herbal solutions:

## 1. Digestive Issues
**Ginger**: Fresh ginger tea aids digestion and reduces nausea.
**Fennel**: Chew fennel seeds after meals to prevent bloating.
**Peppermint**: Soothes stomach cramps and indigestion.

## 2. Cold and Flu
**Tulsi (Holy Basil)**: Boosts immunity and fights infection.
**Turmeric**: Anti-inflammatory and antimicrobial properties.
**Echinacea**: Reduces duration of cold symptoms.

## 3. Stress and Anxiety
**Ashwagandha**: Adaptogen that helps body cope with stress.
**Brahmi**: Calms the mind and improves cognitive function.
**Chamomile**: Gentle relaxant for better sleep.

## 4. Headaches
**Feverfew**: Prevents migraine headaches.
**Peppermint oil**: Topical application relieves tension headaches.
**Ginger**: Reduces inflammation causing headaches.

## 5. Skin Problems
**Aloe Vera**: Soothes burns and skin irritation.
**Neem**: Antibacterial properties help with acne.
**Turmeric paste**: Reduces inflammation and promotes healing.

## 6. Poor Sleep
**Valerian root**: Natural sedative for better sleep.
**Passionflower**: Calms nervous system.
**Lavender**: Promotes relaxation when used as essential oil.

## Preparing Herbal Remedies

### Tea
Steep 1-2 teaspoons of dried herb in hot water for 10 minutes.

### Tincture
Soak herbs in alcohol or glycerin for 4-6 weeks.

### Poultice
Crush fresh herbs and apply directly to affected area.

Always consult with a healthcare provider before starting new herbal remedies, especially if you're pregnant or taking medications.`,
    author: 'Dr. Jitendra Sharma',
    authorImage: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=100&h=100&auto=format&fit=crop',
    date: 'May 2, 2026',
    readTime: '6 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=1200&auto=format&fit=crop'
  }
];

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const post = slug ? BLOG_POSTS.find(p => p.slug === slug) : null;
  const categories = ['All', 'Ayurveda', 'Yoga', 'Nutrition', 'Lifestyle', 'Wellness'];

  const filteredPosts = useMemo(() => {
    const posts = slug ? BLOG_POSTS.filter(p => p.slug !== slug) : BLOG_POSTS;
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, slug]);

  if (post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
        {/* Header */}
        <div className="relative h-[60vh] bg-gradient-to-r from-ayur-green to-ayur-accent">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <button
            onClick={() => navigate('/blog')}
            className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Blog</span>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-ayur-accent text-white text-sm font-semibold rounded-full">
                  {post.category}
                </span>
                <span className="text-white/90 text-sm">{post.readTime}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
                {post.title}
              </h1>
              <div className="flex items-center gap-4">
                <img 
                  src={post.authorImage} 
                  alt={post.author}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="text-white">
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-white/80 text-sm">{post.date}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-ayur-gray leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent overflow-hidden">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                className="w-full pl-12 pr-4 py-3 border border-ayur-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-ayur-green"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all min-h-[44px] ${
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
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-ayur-subtle/30 cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden rounded-2xl m-3 md:m-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-ayur-green text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
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

                  <span className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm group-hover:gap-3 transition-all">
                    Read Article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-serif font-bold text-ayur-text mb-2">No articles found</h3>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="btn-primary">
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
