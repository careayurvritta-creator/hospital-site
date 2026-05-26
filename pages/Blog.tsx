import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag, ArrowLeft, BookOpen, Share2, Heart, Eye, TrendingUp, ChevronDown, Filter, X, Sparkles } from 'lucide-react';
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
    featured: true,
    content: `Ayurveda, the ancient science of life, is a holistic healing system that originated in India over 5,000 years ago.

## The Five Elements

According to Ayurveda, everything in the universe is composed of five basic elements: Ether, Air, Fire, Water, and Earth.

## The Three Doshas

These five elements combine to form three fundamental energies or doshas:

### Vata (Air + Ether)
Vata governs movement in the body and mind. When balanced, it promotes creativity and vitality.

### Pitta (Fire + Water)
Pitta controls digestion and metabolism. Balanced pitta brings intelligence and contentment.

### Kapha (Earth + Water)
Kapha provides structure and stability. When balanced, it manifests as love and forgiveness.

## Daily Practices for Balance

1. Wake up early before sunrise
2. Practice tongue scraping
3. Do oil pulling
4. Meditate for 10-20 minutes
5. Practice yoga stretches
6. Eat balanced meals according to your dosha`,
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
    content: `Good digestion is the cornerstone of health in Ayurveda.

## 1. Start Your Day Warm
Begin with a glass of warm water with lemon to stimulate digestion.

## 2. Eat at Regular Times
Your digestive fire (Agni) works best when you eat at consistent times.

## 3. Make Lunch Your Largest Meal
Digestive fire is strongest between 10 AM and 2 PM.

## 4. Chew Thoroughly
Proper chewing begins the digestive process in the mouth.

## 5. Avoid Cold Drinks
Cold beverages extinguish digestive fire.

## 6. Include All Six Tastes
Incorporate sweet, sour, salty, pungent, bitter, and astringent tastes.

## 7. Don't Overeat
Fill your stomach one-third with food, one-third with liquid.

## 8. Walk After Meals
A gentle 10-minute walk after eating aids digestion.

## 9. Eat in a Calm Environment
Stress impairs digestion. Eat in a peaceful setting.

## 10. Finish Dinner Early
Eat dinner at least 3 hours before bedtime.`,
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
    excerpt: 'Calming yoga poses to reduce stress and promote mental clarity.',
    content: `Stress is a common challenge in modern life. These five yoga poses can help calm your mind:

## 1. Child's Pose (Balasana)
Kneel on the floor and fold forward. This pose calms the nervous system.

## 2. Standing Forward Fold (Uttanasana)
Stand and fold forward, letting your head hang heavy. Releases tension.

## 3. Legs-Up-The-Wall (Viparita Karani)
Lie on your back with legs up a wall. This restorative pose reduces anxiety.

## 4. Corpse Pose (Savasana)
Lie flat on your back. Focus on deep breathing and complete relaxation.

## 5. Cat-Cow Stretch (Marjaryasana-Bitilasana)
Alternate between arching and rounding your back. Releases spinal tension.

Practice these poses daily for 10-15 minutes.`,
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
    excerpt: 'Learn how to align your diet with seasons for optimal health.',
    content: `Spring is nature's time for renewal, making it the perfect season for detoxification.

## Why Spring Detox?
Winter's heavy foods can lead to accumulated toxins (Ama). Spring supports cleansing.

## Foods to Emphasize
- Bitter greens: Dandelion, arugula, kale
- Sprouts: Mung bean, alfalfa
- Fresh herbs: Cilantro, parsley, mint
- Light grains: Quinoa, barley, millet
- Berries: Blueberries, strawberries

## Foods to Avoid
- Heavy, greasy foods
- Excessive dairy
- Processed sugars
- Red meat
- Alcohol

## Simple Spring Detox Plan

### Morning: Warm water with lemon and honey
### Lunch: Large salad with bitter greens
### Dinner: Vegetable soup

Follow this plan for 3-7 days.`,
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
    excerpt: 'Start your meditation journey with this comprehensive guide.',
    content: `Meditation is a powerful tool for calming the mind and achieving inner peace.

## Benefits of Meditation
- Reduces stress and anxiety
- Improves concentration
- Enhances emotional health
- Promotes better sleep

## Getting Started

### 1. Choose a Quiet Space
Find a peaceful spot where you won't be disturbed.

### 2. Set a Time
Morning is ideal, but choose a time that works for you.

### 3. Get Comfortable
Sit on a cushion with your spine straight.

### 4. Focus on Breath
Close your eyes and follow your natural breath.

### 5. Start Small
Begin with 5 minutes daily and gradually increase.

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
    excerpt: 'Natural herbal solutions for everyday health issues.',
    content: `Nature provides powerful remedies for common health concerns.

## 1. Digestive Issues
**Ginger**: Fresh ginger tea aids digestion.
**Fennel**: Chew fennel seeds after meals.

## 2. Cold and Flu
**Tulsi**: Boosts immunity.
**Turmeric**: Anti-inflammatory properties.

## 3. Stress and Anxiety
**Ashwagandha**: Adaptogen that helps cope with stress.
**Brahmi**: Calms the mind.

## 4. Headaches
**Feverfew**: Prevents migraine headaches.
**Peppermint oil**: Relieves tension headaches.

## 5. Skin Problems
**Aloe Vera**: Soothes burns and irritation.
**Neem**: Antibacterial for acne.

Always consult with a healthcare provider before starting herbal remedies.`,
    author: 'Dr. Jitendra Sharma',
    authorImage: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=100&h=100&auto=format&fit=crop',
    date: 'May 2, 2026',
    readTime: '6 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=1200&auto=format&fit=crop'
  },
  {
    id: '7',
    slug: 'understanding-doshas-vata-pitta-kapha',
    title: 'Understanding the Three Doshas: Vata, Pitta, Kapha',
    excerpt: 'A comprehensive guide to the three fundamental energies that govern your body and mind in Ayurveda.',
    content: `In Ayurveda, every person is born with a unique constitution called Prakriti, determined by three doshas.

## Vata — The Energy of Movement

Vata is composed of Air and Ether elements. It governs all movement in the body including breathing, blood circulation, and nerve impulses.

**Characteristics:** Creative, quick-thinking, slender build, dry skin

**When Imbalanced:** Anxiety, insomnia, constipation, dry skin, joint pain

**Balance Tips:** Regular routine, warm foods, oil massage, adequate rest

## Pitta — The Energy of Transformation

Pitta combines Fire and Water elements. It controls digestion, metabolism, and body temperature.

**Characteristics:** Intelligent, focused, medium build, warm body

**When Imbalanced:** Anger, acid reflux, skin rashes, inflammation

**Balance Tips:** Cooling foods, avoid spicy food, spend time in nature

## Kapha — The Energy of Structure

Kapha is made of Earth and Water. It provides physical structure, lubrication, and immunity.

**Characteristics:** Calm, loving, strong build, smooth skin

**When Imbalanced:** Weight gain, lethargy, depression, congestion

**Balance Tips:** Regular exercise, light foods, stay active and motivated

## Finding Your Dosha

Understanding your dosha helps you make better choices in diet, exercise, and lifestyle for optimal health and balance.`,
    author: 'Dr. Jinendradutt Sharma',
    authorImage: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=100&h=100&auto=format&fit=crop',
    date: 'Apr 28, 2026',
    readTime: '8 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1612835781068-42b5e8a0cbd7?w=1200&auto=format&fit=crop',
    featured: true
  },
  {
    id: '8',
    slug: 'panchakarma-detox-five-actions',
    title: 'Panchakarma: The Five Purification Actions',
    excerpt: 'Discover the ancient Ayurvedic detoxification system that cleanses the body at the deepest level.',
    content: `Panchakarma is the cornerstone of Ayurvedic treatment — a five-fold purification therapy that eliminates toxins and restores balance.

## The Five Actions

### 1. Vamana (Therapeutic Emesis)
Controlled vomiting to eliminate excess Kapha from the stomach and respiratory tract. Best for asthma, allergies, and skin disorders.

### 2. Virechana (Therapeutic Purgation)
Medicated purgation to cleanse Pitta from the liver and intestines. Effective for jaundice, skin diseases, and digestive disorders.

### 3. Basti (Medicated Enema)
Herbal decoctions and oils administered through the rectum. The most powerful of all five actions, especially for Vata disorders like arthritis and constipation.

### 4. Nasya (Nasal Administration)
Medicated oils or powders administered through the nose. Treats sinusitis, migraine, hair loss, and neurological conditions.

### 5. Raktamokshana (Bloodletting)
Purification of blood using leeches or other methods. Effective for skin diseases, gout, and localized inflammation.

## Who Should Consider Panchakarma?

- Chronic digestive issues
- Joint and muscle pain
- Skin conditions
- Stress and anxiety
- Recurring allergies
- Metabolic disorders

## Pre and Post Care

Panchakarma requires careful preparation (Purvakarma) and follow-up care (Paschatkarma) including specific diet and lifestyle modifications for best results.

Consult an experienced Ayurvedic physician to determine which Panchakarma therapy is right for you.`,
    author: 'Dr. Sharlin Patel',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&auto=format&fit=crop',
    date: 'Apr 20, 2026',
    readTime: '7 min read',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop'
  },
  {
    id: '9',
    slug: 'ayurvedic-cooking-six-tastes',
    title: 'The Six Tastes: A Guide to Ayurvedic Cooking',
    excerpt: 'Learn how to incorporate all six Ayurvedic tastes (Rasas) into every meal for optimal nutrition and satisfaction.',
    content: `Ayurveda recognizes six tastes (Rasas) that should be present in every meal for complete nourishment and satisfaction.

## The Six Tastes

### 1. Sweet (Madhura)
**Sources:** Rice, milk, ghee, fruits, wheat, sugar
**Effect:** Nourishing, grounding, builds tissues
**Best for:** Vata constitution

### 2. Sour (Amla)
**Sources:** Lemon, yogurt, tamarind, tomato, fermented foods
**Effect:** Stimulates digestion, improves appetite
**Best for:** Kapha constitution

### 3. Salty (Lavana)
**Sources:** Salt, seaweed, celery, rock salt
**Effect:** Retains moisture, improves taste, softens tissues
**Best for:** Vata constitution

### 4. Pungent (Katu)
**Sources:** Ginger, black pepper, chili, garlic, onion
**Effect:** Stimulates metabolism, clears sinuses, improves circulation
**Best for:** Kapha constitution

### 5. Bitter (Tikta)
**Sources:** Turmeric, neem, bitter gourd, leafy greens
**Effect:** Detoxifies, reduces inflammation, improves skin
**Best for:** Pitta constitution

### 6. Astringent (Kashaya)
**Sources:** Green tea, pomegranate, lentils, turmeric
**Effect:** Dries excess moisture, tightens tissues
**Best for:** Pitta constitution

## Balancing Tastes in Your Plate

A simple rule: include at least 3-4 tastes in every meal. For example:
- **Rice** (sweet) + **Dal** (astringent) + **Pickles** (sour/salty) + **Salad** (bitter)

This ensures complete nutrition and natural satisfaction, reducing cravings and overeating.`,
    author: 'Dr. Meera Singh',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&auto=format&fit=crop',
    date: 'Apr 15, 2026',
    readTime: '5 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop'
  },
  {
    id: '10',
    slug: 'dinacharya-daily-routine-ayurveda',
    title: 'Dinacharya: The Perfect Ayurvedic Daily Routine',
    excerpt: 'Transform your health with this ancient daily routine prescribed by Ayurvedic sages for optimal wellness.',
    content: `Dinacharya is the Ayurvedic concept of a daily routine that aligns your body with natural rhythms.

## Early Morning (5:00 - 7:00 AM)

### Wake Up Before Sunrise
The Brahma Muhurta (4:30-6:00 AM) is the most auspicious time for waking. The atmosphere is calm and full of prana.

### Oral Care
- Scrape your tongue with a copper scraper
- Oil pulling with sesame or coconut oil for 10-15 minutes
- Brush teeth with herbal tooth powder

### Self-Massage (Abhyanga)
Warm sesame oil and massage your entire body before bathing. This nourishes the skin, calms the nervous system, and improves circulation.

### Exercise & Yoga
Practice yoga asanas or gentle exercise for 20-30 minutes. Follow with Pranayama (breathing exercises).

## Morning (7:00 - 10:00 AM)

### Breakfast
Eat a warm, nourishing breakfast appropriate for your dosha. Avoid cold or heavy foods.

### Work & Activity
This is the Kapha time — ideal for focused, productive work.

## Midday (10:00 AM - 2:00 PM)

### Lunch — The Main Meal
Digestive fire (Agni) is strongest at noon. Eat your largest meal now.

## Evening (2:00 - 6:00 PM)

### Light Snack
A cup of herbal tea or light snack if needed.

### Gentle Walk
A 15-20 minute walk after work aids digestion.

## Night (6:00 - 10:00 PM)

### Light Dinner
Eat at least 3 hours before bedtime. Keep it light and easy to digest.

### Wind Down
Avoid screens, practice gentle stretching, read, or meditate.

### Sleep
Be in bed by 10:00 PM during the Kapha time for deep, restful sleep.

Following Dinacharya consistently is one of the most powerful things you can do for your health.`,
    author: 'Yoga Master Rajesh',
    authorImage: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=100&h=100&auto=format&fit=crop',
    date: 'Apr 10, 2026',
    readTime: '6 min read',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop'
  },
  {
    id: '11',
    slug: 'turmeric-golden-medicine',
    title: 'Turmeric: The Golden Medicine of Ayurveda',
    excerpt: 'Why turmeric has been the most revered healing spice in Ayurveda for over 4,000 years.',
    content: `Turmeric (Curcuma longa) is perhaps the most important herb in Ayurveda, known as "the golden spice of life."

## Properties in Ayurveda

- **Rasa (Taste):** Bitter, Pungent, Astringent
- **Virya (Potency):** Heating
- **Vipaka (Post-digestive effect):** Pungent
- **Dosha Effect:** Balances all three doshas (Tridoshahara)

## Health Benefits

### Anti-Inflammatory
Curcumin, the active compound, is one of nature's most powerful anti-inflammatory agents. It works at the molecular level to fight inflammation.

### Antioxidant
Neutralizes free radicals and stimulates the body's own antioxidant mechanisms.

### Digestive Support
Stimulates bile production, improves gut health, and reduces bloating.

### Immune Booster
Modulates the immune system and has antimicrobial properties.

### Joint Health
Reduces joint pain and stiffness in arthritis.

## How to Use Turmeric

### Golden Milk (Haldi Doodh)
Boil 1 tsp turmeric + pinch of black pepper + 1 cup milk. Drink warm before bed.

### Turmeric Tea
Add ½ tsp turmeric to boiling water with ginger and honey.

### In Cooking
Add to curries, soups, rice, and dal daily.

### Topical Paste
Mix with aloe vera for skin conditions and wounds.

## Important Note
Always combine turmeric with black pepper (increases absorption by 2000%) and a fat source for best results.`,
    author: 'Dr. Jinendradutt Sharma',
    authorImage: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=100&h=100&auto=format&fit=crop',
    date: 'Apr 5, 2026',
    readTime: '5 min read',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1615486262315-4f0deed53924?w=1200&auto=format&fit=crop'
  },
  {
    id: '12',
    slug: 'ayurveda-weight-management-natural',
    title: 'Ayurvedic Weight Management: A Natural Approach',
    excerpt: 'Sustainable weight management through Ayurvedic principles that address root causes, not just symptoms.',
    content: `Ayurveda approaches weight management by understanding your body type and addressing the root cause of weight gain.

## Understanding Weight Gain in Ayurveda

Weight gain is primarily a Kapha disorder caused by:
- Weak digestive fire (Mandagni)
- Excess Kapha accumulation
- Improper diet and lifestyle
- Emotional eating
- Sedentary habits

## The Ayurvedic Approach

### 1. Strengthen Agni (Digestive Fire)
- Drink warm water throughout the day
- Include ginger, black pepper, and cumin in meals
- Avoid cold drinks and ice water
- Eat only when hungry

### 2. Follow Your Prakriti Diet
- **Vata:** Warm, nourishing foods with healthy fats
- **Pitta:** Cooling, moderate foods with bitter taste
- **Kapha:** Light, warm, spicy foods

### 3. Exercise Regularly
- Kapha types need vigorous exercise daily
- Yoga Surya Namaskar (Sun Salutations) is excellent
- Walking, swimming, cycling are all beneficial

### 4. Lifestyle Modifications
- Wake up before 6 AM
- Avoid daytime sleeping
- Eat dinner before 7 PM
- Practice Abhyanga (oil massage)
- Stay warm and active

### 5. Herbal Support
- **Triphala:** Gentle detoxification and digestion
- **Guggulu:** Supports fat metabolism
- **Garcinia:** Suppresses appetite naturally
- **Trikatu:** Stimulates digestion

## Avoid These

- Crash diets (they weaken Agni)
- Cold, heavy, oily foods
- Excessive sweets and dairy
- Late-night eating
- Sedentary lifestyle

The key is consistency and patience — Ayurveda promotes gradual, sustainable weight loss.`,
    author: 'Dr. Priya Patel',
    authorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&auto=format&fit=crop',
    date: 'Mar 30, 2026',
    readTime: '7 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop'
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  Ayurveda: 'from-green-500 to-emerald-600',
  Yoga: 'from-purple-500 to-violet-600',
  Nutrition: 'from-amber-500 to-orange-600',
  Lifestyle: 'from-pink-500 to-rose-600',
  Wellness: 'from-blue-500 to-cyan-600'
};

const Blog: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [readProgress, setReadProgress] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      if (post && contentRef.current) {
        const element = contentRef.current;
        const scrollTop = window.scrollY;
        const scrollHeight = element.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setReadProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.blog-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [filteredPosts]);

  const toggleFavorite = (postId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(postId)) {
        newFavorites.delete(postId);
      } else {
        newFavorites.add(postId);
      }
      return newFavorites;
    });
  };

  if (post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-ayur-subtle z-60">
          <div 
            className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* Hero */}
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <button
            onClick={() => navigate('/blog')}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-105 min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>

          <button
            onClick={() => toggleFavorite(post.id)}
            className={`absolute top-6 right-6 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center ${
              favorites.has(post.id) ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorites.has(post.id) ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="max-w-4xl mx-auto animate-fadeInUp">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 bg-gradient-to-r ${CATEGORY_COLORS[post.category]} text-white text-sm font-semibold rounded-full shadow-lg`}>
                  {post.category}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <Clock size={16} /> {post.readTime}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <img 
                  src={post.authorImage} 
                  alt={post.author}
                  className="w-14 h-14 rounded-full border-3 border-white/50 shadow-xl"
                />
                <div className="text-white">
                  <div className="font-bold text-lg">{post.author}</div>
                  <div className="text-white/80 text-sm">{post.date}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article ref={contentRef} className="max-w-4xl mx-auto px-4 py-12 relative">
          <div className="bg-white rounded-3xl shadow-2xl shadow-ayur-green/10 p-8 md:p-12 lg:p-16 -mt-20 relative z-10">
            <div className="prose prose-lg max-w-none">
              <div className="text-ayur-gray leading-relaxed space-y-6">
                {post.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-2xl md:text-3xl font-serif font-bold text-ayur-green mt-12 mb-6">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-xl md:text-2xl font-serif font-bold text-ayur-text mt-8 mb-4">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                    return (
                      <ul key={idx} className="list-none space-y-3 my-6">
                        {items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-ayur-green mt-2.5 flex-shrink-0" />
                            <span className="text-ayur-text">{item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.match(/^\d+\./)) {
                    const items = paragraph.split('\n').filter(line => line.match(/^\d+\./));
                    return (
                      <ol key={idx} className="list-none space-y-3 my-6 counter-reset-none">
                        {items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-ayur-green/10 text-ayur-green font-bold flex items-center justify-center text-sm">
                              {itemIdx + 1}
                            </span>
                            <span className="text-ayur-text pt-1">{item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                          </li>
                        ))}
                      </ol>
                    );
                  }
                  return <p key={idx} className="text-ayur-text leading-relaxed">{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Share & Actions */}
            <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-ayur-subtle">
              <button className="flex items-center gap-2 px-6 py-3 bg-ayur-green text-white rounded-full font-semibold hover:bg-ayur-green-dark transition-all shadow-lg hover:shadow-xl">
                <Share2 className="w-5 h-5" /> Share Article
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-ayur-green border-2 border-ayur-green rounded-full font-semibold hover:bg-ayur-green/5 transition-all">
                <BookOpen className="w-5 h-5" /> Save for Later
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-6">
              <img 
                src={post.authorImage} 
                alt={post.author}
                className="w-24 h-24 rounded-full border-4 border-ayur-green/20"
              />
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-ayur-text mb-2">{post.author}</h3>
                <p className="text-ayur-gray mb-4">Ayurvedic Specialist at Ayurvritta Hospital</p>
                <button className="text-ayur-green font-semibold hover:text-ayur-accent transition-colors">
                  View All Articles →
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-serif font-bold text-ayur-text mb-8 text-center">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.slice(0, 3).map((relatedPost, idx) => (
              <div 
                key={relatedPost.id}
                onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={relatedPost.image} 
                    alt={relatedPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 animate-fadeInUp">
              Ayurveda <span className="italic text-ayur-accent">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 animate-fadeInUp animation-delay-100">
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
        {BLOG_POSTS.filter(p => p.featured).length > 0 && selectedCategory === 'All' && !searchQuery && (
          <div className="mb-12 animate-fadeIn">
            {BLOG_POSTS.filter(p => p.featured).slice(0, 1).map(featured => (
              <div
                key={featured.id}
                onClick={() => navigate(`/blog/${featured.slug}`)}
                className="group cursor-pointer relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500"
                style={{ minHeight: '400px' }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${featured.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="relative flex flex-col justify-end h-full p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-4">
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
                  <div className="flex items-center gap-4">
                    <img src={featured.authorImage} alt={featured.author} className="w-12 h-12 rounded-full border-2 border-white/30" />
                    <div className="text-white">
                      <div className="font-bold">{featured.author}</div>
                      <div className="text-white/70 text-sm">{featured.date}</div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
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
              <div className="text-2xl font-bold text-ayur-accent">{categories.length - 1}</div>
              <div className="text-sm text-ayur-gray">Categories</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-ayur-gray">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Trending: Ayurveda</span>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <article
              key={post.id}
              id={`post-${post.id}`}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className={`blog-card group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 cursor-pointer border border-ayur-subtle/30 ${
                visibleCards.has(`post-${post.id}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 bg-gradient-to-r ${CATEGORY_COLORS[post.category]} text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm`}>
                    {post.category}
                  </span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(post.id);
                  }}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    favorites.has(post.id) 
                      ? 'bg-red-500/90 text-white' 
                      : 'bg-white/80 text-ayur-gray hover:bg-white hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(post.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Featured Badge */}
                {post.featured && (
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
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-ayur-accent" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-serif font-bold text-ayur-text mb-3 line-clamp-2 group-hover:text-ayur-green transition-colors duration-300">
                  {post.title}
                </h2>

                <p className="text-ayur-gray text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Author & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorImage} 
                      alt={post.author}
                      className="w-10 h-10 rounded-full border-2 border-ayur-green/20"
                    />
                    <span className="text-sm font-semibold text-ayur-text">{post.author.split(' ')[0]}</span>
                  </div>
                  <span className="flex items-center gap-2 text-ayur-accent font-bold text-sm group-hover:gap-3 transition-all duration-300">
                    Read
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ayur-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        {filteredPosts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="relative bg-gradient-to-r from-ayur-green via-teal-600 to-ayur-accent rounded-3xl overflow-hidden p-8 md:p-12">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              <div className="relative text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                  <Heart className="w-4 h-4" />
                  Stay Connected
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                  Get Ayurvedic Health Tips
                </h3>
                <p className="text-white/90 text-lg mb-8">
                  Join our community and receive weekly insights on Ayurveda, nutrition, and holistic wellness from Dr. Sharma.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-full text-ayur-text text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                  />
                  <button className="px-8 py-4 bg-ayur-accent text-white rounded-full font-bold hover:bg-ayur-accent-hover transition-all shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
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