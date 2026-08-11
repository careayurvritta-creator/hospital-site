import { AUTHORS } from './authors';
import { BlogCategory, BlogPost, BlogPostWithAuthor } from './types';

const modules = import.meta.glob('./posts/*.md', { eager: true }) as Record<string, { default: string }>;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const lines = raw.split('\n');
  const meta: Record<string, string> = {};
  let bodyStart = 0;

  if (lines[0]?.trim() === '---') {
    let i = 1;
    while (i < lines.length && lines[i].trim() !== '---') {
      const line = lines[i];
      const sep = line.indexOf(':');
      if (sep > 0) {
        const key = line.slice(0, sep).trim();
        const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
        meta[key] = value;
      }
      i++;
    }
    bodyStart = i + 1;
  }

  return { meta, body: lines.slice(bodyStart).join('\n').trim() };
}

const CATEGORY_VALID: Record<string, BlogCategory> = {
  Ayurveda: 'Ayurveda',
  Yoga: 'Yoga',
  Nutrition: 'Nutrition',
  Lifestyle: 'Lifestyle',
  Wellness: 'Wellness',
};

export const ALL_POSTS: BlogPost[] = Object.values(modules)
  .map(({ default: raw }) => {
    const { meta, body } = parseFrontmatter(raw);
    const category = CATEGORY_VALID[meta.category] ?? 'Ayurveda';
    return {
      slug: meta.slug,
      title: meta.title,
      excerpt: meta.excerpt,
      category,
      authorId: meta.authorId || 'dr-sharma',
      date: meta.date || '2026-01-01',
      readTime: meta.readTime || '5 min read',
      image: meta.image || '/images/blog/ayurveda.svg',
      content: body,
      featured: meta.featured === 'true',
    } as BlogPost;
  })
  .filter((p) => p.slug)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const BLOG_POSTS: BlogPostWithAuthor[] = ALL_POSTS.map((post) => ({
  ...post,
  author: AUTHORS[post.authorId] || AUTHORS['dr-sharma'],
}));

export function getPostBySlug(slug: string): BlogPostWithAuthor | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_CATEGORIES: ('All' | BlogCategory)[] = ['All', 'Ayurveda', 'Yoga', 'Nutrition', 'Lifestyle', 'Wellness'];
