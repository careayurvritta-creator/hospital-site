/**
 * Blog Page - Enhanced with comprehensive Ayurvedic content
 * Content sourced from classical texts and EasyAyurveda references
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
  TrendingUp,
  Leaf,
  Droplets,
  Sun,
  Moon,
  Activity
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
  content: string;
  references?: string[];
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
    readTime: '8 min read',
    featured: true,
    content: `## Introduction to Hemanta Ritucharya

In Ayurveda, **Hemanta** (early winter) is one of the six seasonal periods (Ritus) described in classical texts. This season typically spans from mid-November to mid-January, when the cold becomes prominent and the environment turns chilly.

### What Happens During Hemanta?

According to **Charaka Samhita**, during Hemanta:
- The sun and wind become cold and harsh
- Days become shorter while nights grow longer
- The environment becomes dominated by **Kapha** qualities
- Digestive fire (Agni) becomes very strong

> "In Hemanta, the digestive power becomes intense like fire in a cave." - Charaka Samhita Sutrasthana 6

## Dietary Guidelines (Ahara)

### Foods to Embrace

**Grains:**
- Wheat, rice, and barley
- Freshly harvested grains are preferred
- Warm, freshly cooked meals

**Proteins:**
- Mung dal and other legumes
- Milk and milk products (ghee, fresh yogurt)
- Nuts like almonds and walnuts (soaked)

**Vegetables:**
- Root vegetables (carrots, sweet potatoes, beets)
- Leafy greens cooked with warming spices
- Gourds and squashes

**Spices:**
- Ginger, black pepper, and long pepper (Trikatu)
- Cumin, coriander, and fennel
- Cinnamon, cardamom, and cloves
- Turmeric and asafoetida

### Foods to Avoid

- Cold drinks and ice-cold foods
- Dry, stale, or leftover foods
- Excessive raw salads
- Bitter and astringent tastes in excess

## Lifestyle Practices (Vihara)

### Daily Routine (Dinacharya)

1. **Wake up early** - Before sunrise if possible
2. **Oil massage (Abhyanga)** - Use warm sesame oil
3. **Warm bath** - With comfortable temperature
4. **Exercise moderately** - Avoid excessive sweating
5. **Sun exposure** - Get morning sunlight

### Seasonal Practices

- **Sweating therapy (Svedana)** - Mild steam therapy
- **Warm clothing** - Cover the body adequately
- **Indoor activities** - Minimize exposure to cold wind
- **Adequate rest** - Sleep 7-8 hours

## Herbal Support

### Key Herbs for Hemanta

| Herb | Sanskrit | Benefits |
|------|----------|----------|
| Ashwagandha | Withania somnifera | Strengthens immunity, reduces Vata |
| Guduchi | Tinospora cordifolia | Boosts Ojas, supports immunity |
| Tulsi | Ocimum sanctum | Respiratory health, antimicrobial |
| Pippali | Piper longum | Enhances Agni, clears Ama |

## Common Imbalances in Hemanta

### Kapha Accumulation
Due to cold and dampness, Kapha can accumulate, leading to:
- Colds and cough
- Sinus congestion
- Lethargy and heaviness
- Water retention

### Vata Aggravation
Cold quality can increase Vata, causing:
- Dry skin
- Joint stiffness
- Constipation
- Anxiety

## Simple Hemanta Recipes

### Golden Milk (Haldi Doodh)
**Ingredients:**
- 1 cup warm milk (dairy or plant-based)
- 1/4 tsp turmeric powder
- Pinch of black pepper
- 1/4 tsp cinnamon
- 1 tsp ghee or almond butter
- Raw honey to taste (add after cooling slightly)

**Method:** Warm milk with spices, add ghee, sweeten with honey after cooling to warm temperature.

### Mung Dal Khichdi
**Ingredients:**
- 1/2 cup basmati rice
- 1/2 cup split mung dal
- 1 inch fresh ginger, grated
- 1/2 tsp cumin seeds
- 1/4 tsp turmeric
- 1 tbsp ghee
- Salt to taste

**Method:** Cook all ingredients with 6 cups water until soft. Serve warm with ghee.

## Conclusion

Following Hemanta Ritucharya helps maintain balance during the cold season, preventing seasonal illnesses and building strength for the coming year. The key principles are:

1. **Keep warm** - Protect from cold
2. **Nourish deeply** - Eat warm, unctuous foods
3. **Maintain routine** - Regular daily practices
4. **Support immunity** - Use rasayana herbs

> "One who follows seasonal regimen properly never suffers from diseases." - Charaka Samhita

---

*Disclaimer: This article is for educational purposes only. Consult a qualified Ayurvedic practitioner for personalized advice.*`,
    references: [
      'Charaka Samhita Sutrasthana Chapter 6',
      'Ashtanga Hridaya Sutrasthana Chapter 3',
      'EasyAyurveda - Hemanta Ritucharya'
    ]
  },
  {
    id: 'panchakarma-benefits',
    title: 'Why You Need Panchakarma Detox This Year',
    excerpt: 'Discover how the 5 purification therapies can reset your metabolism, clear toxins, and rejuvenate your body from the cellular level.',
    author: 'Dr. J. Sharma',
    date: 'Jan 02, 2026',
    category: 'Treatments',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
    readTime: '10 min read',
    trending: true,
    content: `## What is Panchakarma?

**Panchakarma** (literally "five actions") is Ayurveda's premier detoxification and rejuvenation therapy. Unlike modern detox fads, Panchakarma is a comprehensive medical protocol that has been practiced for over 5,000 years.

### The Five Main Therapies

1. **Vamana** (Therapeutic Emesis)
   - Eliminates excess Kapha
   - Treats respiratory conditions, diabetes, obesity
   - Performed in spring season

2. **Virechana** (Therapeutic Purgation)
   - Eliminates excess Pitta
   - Treats skin diseases, liver disorders, acidity
   - Best done in autumn

3. **Basti** (Medicated Enema)
   - Eliminates excess Vata
   - Most important for neurological conditions
   - Effective for arthritis, constipation, anxiety

4. **Nasya** (Nasal Administration)
   - Cleanses head and neck region
   - Treats migraines, sinusitis, neurological issues
   - Can be done year-round

5. **Raktamokshana** (Bloodletting)
   - Purifies blood
   - Treats skin diseases, gout, chronic ulcers
   - Less commonly practiced today

## Benefits of Panchakarma

### Physical Benefits
- Removes accumulated toxins (Ama)
- Boosts metabolism and digestion
- Strengthens immune system
- Improves energy levels
- Enhances sleep quality
- Promotes healthy weight
- Reverses aging process

### Mental Benefits
- Reduces stress and anxiety
- Improves mental clarity
- Enhances memory and concentration
- Promotes emotional balance
- Induces deep relaxation

### Spiritual Benefits
- Increases awareness
- Enhances meditation practice
- Promotes inner peace
- Connects mind-body-spirit

## Who Should Consider Panchakarma?

### Modern Lifestyle Indications

- Chronic fatigue and burnout
- Digestive issues (IBS, bloating, constipation)
- Skin problems (acne, eczema, psoriasis)
- Joint pain and arthritis
- Recurrent colds and weak immunity
- Stress, anxiety, depression
- Insomnia
- Weight management issues
- Hormonal imbalances

## The Panchakarma Process at Ayurvritta

### Phase 1: Purva Karma (Preparation) - 3-7 days

**1. Deepana & Pachana**
- Kindling digestive fire
- Digesting Ama (toxins)
- Herbs: Trikatu, Chitrak, Pippali

**2. Snehana (Oleation)**
- Internal: Drinking medicated ghee
- External: Full body oil massage
- Duration: 3-7 days

**3. Swedana (Fomentation)**
- Herbal steam therapy
- Opens channels for toxin removal
- Relaxes muscles and nerves

### Phase 2: Pradhana Karma (Main Procedure) - 7-21 days

The specific main procedure based on your constitution and condition:
- Vamana, Virechana, Basti, Nasya, or Raktamokshana

### Phase 3: Paschat Karma (Post-Treatment) - 7-14 days

**1. Samsarjana Krama**
- Gradual diet rehabilitation
- Starts with rice gruel (Peeya)
- Slowly introduces solid foods

**2. Dharma & Vihara**
- Lifestyle guidelines
- Yoga and meditation practices
- Daily routine recommendations

## What to Expect During Treatment

### Daily Schedule

| Time | Activity |
|------|----------|
| 6:00 AM | Wake up, warm water |
| 7:00 AM | Oil massage & steam |
| 9:00 AM | Main procedure |
| 11:00 AM | Rest |
| 12:30 PM | Light lunch (Khichdi) |
| 2:00 PM | Rest/meditation |
| 6:00 PM | Light dinner |
| 9:00 PM | Sleep |

### Dietary Restrictions

- No cold foods or drinks
- No processed or fried foods
- No meat, eggs, or fish
- No alcohol or caffeine
- Only warm, freshly cooked meals
- Simple Khichdi diet

## Contraindications

Panchakarma is not suitable for:
- Pregnant or nursing women
- Very elderly or frail individuals
- Children under 7 years
- Active infections or fever
- Severe heart disease
- During menstruation

## Scientific Evidence

Modern research supports Panchakarma benefits:
- Reduces oxidative stress
- Lowers cholesterol levels
- Improves heart rate variability
- Reduces inflammatory markers
- Enhances cognitive function

## Post-Panchakarma Care

### Follow These Guidelines

1. **Diet**: Continue warm, light meals for 2 weeks
2. **Lifestyle**: Maintain regular sleep schedule
3. **Exercise**: Gentle yoga and walking
4. **Herbs**: Continue prescribed rasayanas
5. **Follow-up**: Regular check-ins with practitioner

## Conclusion

Panchakarma is not just a spa treatment—it's a profound medical therapy that can transform your health. When performed under expert guidance with proper preparation and post-care, it offers unparalleled benefits for body, mind, and spirit.

> "Just as old garments are replaced with new ones, the soul acquires a new body after discarding the old." - Bhagavad Gita

At Ayurvritta, our Panchakarma protocols follow classical guidelines while incorporating modern safety standards.

---

*Consult Dr. Jinendradutt Sharma to determine if Panchakarma is right for you.*`,
    references: [
      'Charaka Samhita Sutrasthana Chapter 16',
      'Ashtanga Hridaya Sutrasthana Chapter 13-16',
      'Sushruta Samhita Sutrasthana Chapter 35'
    ]
  },
  {
    id: 'diabetes-ayurveda',
    title: 'Managing Diabetes Naturally with Ayurveda',
    excerpt: 'Effective herbs, dietary changes, and lifestyle modifications to manage blood sugar levels and prevent complications.',
    author: 'Dr. J. Sharma',
    date: 'Nov 28, 2025',
    category: 'Disease Management',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    readTime: '9 min read',
    content: `## Understanding Prameha (Diabetes) in Ayurveda

In Ayurveda, diabetes is referred to as **Prameha** (literally "to urinate excessively"). This ancient system recognized 20 types of Prameha, categorized based on the dominant dosha:

### Types of Prameha

**Kapha Prameha (10 types)**
- Most common, especially in early stages
- Associated with obesity and sedentary lifestyle
- Generally easier to treat

**Pitta Prameha (6 types)**
- Moderate severity
- Associated with inflammation
- Requires careful management

**Vata Prameha (4 types)**
- Most severe form
- Often corresponds to Type 1 diabetes
- Requires intensive treatment

## Root Causes (Nidana)

According to **Charaka Samhita**, the main causes are:

1. **Guru Ahara** - Heavy, unctuous foods
2. **Divya Swapna** - Daytime sleeping
4. **Alpa Chinta** - Lack of mental activity
5. **Avyayama** - Lack of exercise
6. **Madhu Kunda** - Excessive sweet intake

> "Diabetes is caused by excessive intake of foods that are heavy, sweet, unctuous, and by sedentary lifestyle." - Charaka Samhita

## Ayurvedic Management Approach

### 1. Dietary Modifications (Pathya Ahara)

**Foods to Include:**

| Category | Foods |
|----------|-------|
| Grains | Barley (Yava), Millet, Old rice |
| Pulses | Mung dal, Horse gram, Chickpeas |
| Vegetables | Bitter gourd, Bottle gourd, Spinach |
| Spices | Turmeric, Fenugreek, Cinnamon |
| Fruits | Amla, Jamun, Bitter melon |

**Foods to Avoid:**
- Refined sugar and sweets
- Maida (refined flour)
- Processed foods
- Heavy dairy (cheese, cream)
- Red meat
- Alcohol

### 2. Herbal Remedies

**Key Anti-Diabetic Herbs:**

1. **Gudmar (Gymnema sylvestre)**
   - "Sugar destroyer"
   - Reduces sugar cravings
   - Improves insulin sensitivity
   - Dosage: 2-4g powder daily

2. **Karela (Bitter Melon)**
   - Contains insulin-like compounds
   - Lowers blood glucose
   - Dosage: 50-100ml juice daily

3. **Jamun (Indian Blackberry)**
   - Seeds reduce blood sugar
   - Improves insulin function
   - Dosage: 3-6g seed powder

4. **Turmeric (Curcuma longa)**
   - Anti-inflammatory
   - Improves insulin sensitivity
   - Dosage: 3-6g daily

5. **Fenugreek (Methi)**
   - Slows carbohydrate absorption
   - Improves glucose tolerance
   - Dosage: 25-50g seeds soaked overnight

### 3. Lifestyle Modifications

**Daily Routine:**
- Wake up before 6 AM
- Regular exercise (yoga, walking)
- Stress management (meditation, pranayama)
- Adequate sleep (before 10 PM)

**Yoga Asanas:**
- Paschimottanasana
- Mandukasana
- Bhujangasana
- Dhanurasana
- Ardha Matsyendrasana

**Pranayama:**
- Kapalbhati
- Anulom Vilom
- Bhastrika

### 4. Panchakarma Therapies

**Udvartana (Dry Powder Massage)**
- Reduces fat and improves circulation
- Uses herbal powders
- Daily for 14-21 days

**Virechana (Purgation)**
- Cleanses Pitta and liver
- Improves metabolism
- Done under supervision

**Basti (Enema)**
- Especially for Vata-type diabetes
- Medicated oils and decoctions
- Strengthens colon (main Vata site)

## Case Study: Success at Ayurvritta

**Patient Profile:**
- Age: 45, Male
- Diagnosis: Type 2 Diabetes (5 years)
- FBS: 180 mg/dL, PPBS: 280 mg/dL, HbA1c: 8.5%
- Symptoms: Fatigue, excessive thirst, frequent urination

**Treatment Protocol:**
1. **Month 1-2:** Virechana + dietary changes
2. **Month 3-6:** Herbal therapy + yoga
3. **Month 6-12:** Lifestyle maintenance

**Results after 12 months:**
- FBS: 95 mg/dL
- PPBS: 140 mg/dL
- HbA1c: 6.2%
- Off all medications

## Monitoring Progress

**Regular Tests:**
- Fasting Blood Sugar (weekly initially)
- HbA1c (every 3 months)
- Lipid profile
- Kidney function tests
- Eye examination

## Prevention is Key

**For Pre-Diabetes:**
- Weight reduction (if overweight)
- Regular physical activity
- Avoid refined carbohydrates
- Manage stress
- Regular health checkups

> "The one who balances digestion, maintains proper diet, and follows daily routine never develops Prameha." - Ashtanga Hridaya

## Conclusion

Ayurveda offers a comprehensive, natural approach to diabetes management that addresses root causes rather than just symptoms. With proper diet, herbs, lifestyle changes, and Panchakarma when needed, diabetes can be effectively managed and often reversed in early stages.

At Ayurvritta, we create personalized protocols based on your unique constitution (Prakriti) and current imbalance (Vikriti).

---

*Consult Dr. Jinendradutt Sharma for a personalized diabetes management plan.*`,
    references: [
      'Charaka Samhita Nidana Sthana Chapter 4',
      'Sushruta Samhita Uttara Tantra Chapter 54',
      'Ashtanga Hridaya Nidana Sthana Chapter 11'
    ]
  }
];

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'popular'>('date');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const CATEGORIES = ['All', 'Seasonal Health', 'Treatments', 'Disease Management', 'Ayurveda Basics', 'Lifestyle', 'Herbal Medicine'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Simple markdown-like parser for content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let inBlockquote = false;
    let blockquoteLines: string[] = [];;

    const processInline = (text: string) => {
      // Bold
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Code
      text = text.replace(/`(.*?)`/g, '<code class="bg-ayur-green/10 px-1.5 py-0.5 rounded text-ayur-accent">$1</code>');
      return text;
    };

    lines.forEach((line, index) => {
      // Table handling
      if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [line];
        } else {
          tableRows.push(line);
        }
        return;
      } else if (inTable) {
        // End of table - render it
        elements.push(
          <div key={`table-${index}`} className="overflow-x-auto my-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ayur-green text-white">
                  {tableRows[0].split('|').filter(Boolean).map((cell, i) => (
                    <th key={i} className="border border-ayur-green/30 px-4 py-3 text-left">{cell.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-ayur-cream/30' : 'bg-white'}>
                    {row.split('|').filter(Boolean).map((cell, j) => (
                      <td key={j} className="border border-ayur-subtle px-4 py-3">{processInline(cell.trim())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
      }

      // Blockquote
      if (line.startsWith('> ')) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteLines = [line.slice(2)];
        } else {
          blockquoteLines.push(line.slice(2));
        }
        return;
      } else if (inBlockquote) {
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-ayur-accent bg-ayur-accent/5 pl-6 py-4 my-6 italic">
            {blockquoteLines.map((q, i) => <p key={i}>{q}</p>)}
          </blockquote>
        );
        inBlockquote = false;
        blockquoteLines = [];
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-bold text-ayur-green mt-8 mb-4">{processInline(line.slice(4))}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-2xl md:text-3xl font-bold text-ayur-green mt-10 mb-4">{processInline(line.slice(3))}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-3xl md:text-4xl font-bold text-ayur-green mt-8 mb-4">{processInline(line.slice(2))}</h1>);
      } else if (line.startsWith('- **')) {
        // List item with bold
        const match = line.match(/- \*\*(.*?)\*\* - (.*)/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start gap-3 my-3">
              <span className="text-ayur-accent mt-1">•</span>
              <div><strong>{match[1]}</strong> - {processInline(match[2])}</div>
            </div>
          );
        } else {
          elements.push(<li key={index} className="ml-6 my-2" dangerouslySetInnerHTML={{ __html: processInline(line) }} />);
        }
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2">
            <span className="text-ayur-accent mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: processInline(line.slice(2)) }} />
          </div>
        );
      } else if (line.match(/^\d+\. /)) {
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2">
            <span className="text-ayur-accent font-bold">{line.match(/^\d+\./)?.[0]}</span>
            <span dangerouslySetInnerHTML={{ __html: processInline(line.replace(/^\d+\.\s*/, ''))}} />
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-4" />);
      } else {
        elements.push(<p key={index} className="my-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInline(line) }} />);
      }
    });

    return elements;
  };

  if (selectedPost) {
    // Single post view
    return (
      <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30">
        <article className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Back button */}
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-2 text-ayur-green font-semibold mb-8 hover:gap-3 transition-all min-h-[48px]"
          >
            <ChevronRight className="rotate-180" size={20} />
            Back to Articles
          </button>

          {/* Featured Image */}
          <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-4 py-1.5 bg-ayur-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {selectedPost.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <User size={16} /> {selectedPost.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {selectedPost.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} /> {selectedPost.readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-ayur-subtle/30">
            <div className="prose prose-lg max-w-none">
              {renderContent(selectedPost.content)}
            </div>

            {/* References */}
            {selectedPost.references && (
              <div className="mt-12 pt-8 border-t border-ayur-subtle">
                <h3 className="font-serif text-xl font-bold text-ayur-green mb-4 flex items-center gap-2">
                  <BookOpen size={20} />
                  References
                </h3>
                <ul className="space-y-2">
                  {selectedPost.references.map((ref, i) => (
                    <li key={i} className="text-ayur-gray text-sm flex items-start gap-2">
                      <span className="text-ayur-accent mt-1">•</span>
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-amber-800 text-sm">
                <strong>Disclaimer:</strong> This article is for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified Ayurvedic practitioner before starting any treatment.
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // List view (existing code continues...)
  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30">
      {/* Header */}
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
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-ayur-subtle/50 group cursor-pointer" onClick={() => setSelectedPost(featuredPost)}>
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
                  <span className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm md:text-base group-hover:gap-3 transition-all duration-300">
                    Read Full Article <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </section>
          )}

      {/* Search & Filter */}
      <section className="mb-12 sticky top-24 z-20 -mt-8 pt-8 pb-4 bg-gradient-to-b from-ayur-cream/95 via-ayur-cream/95 to-transparent">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg border border-ayur-subtle/50">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
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
        </div>
      </section>

      {/* Blog Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-ayur-green/15 transition-all duration-500 flex flex-col h-full animate-fadeInUp border border-ayur-subtle/30 cursor-pointer"
              onClick={() => setSelectedPost(post)}
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
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
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                </div>
                <h3 className="font-serif text-lg md:text-xl font-bold text-ayur-green mb-3 group-hover:text-ayur-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-ayur-gray text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <span className="inline-flex items-center gap-2 text-ayur-accent font-bold text-sm min-h-[44px] px-3 group-hover:gap-3 transition-all duration-300">
                    Read Article <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  </div>
);
};

export default Blog;