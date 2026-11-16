# EGM-09: Blog & Content Management System

## Overview
The blog system manages 78 posts (18 drafts + 60 published) through a file-based CMS with frontmatter metadata. Posts are loaded at build time via `loadPosts.ts` and rendered with full SEO optimization, related post recommendations, and category-based filtering.

## Architecture

### File-Based CMS
```
content/blog/
  ├─ posts/
  │   ├─ published/          # 60 published posts
  │   │   ├─ 2024/
  │   │   │   ├─ post-slug-1.md
  │   │   │   └─ post-slug-2.md
  │   │   └─ 2025/
  │   │       └─ ...
  │   └─ drafts/             # 18 draft posts
  │       └─ ...
  └─ config/
      └─ autopost-log.json   # Auto-posting schedule
```

### Post Structure
Each post is a Markdown file with YAML frontmatter:
```yaml
---
title: "Post Title"
description: "Meta description (150-160 chars)"
author: "author-name"
publishedAt: "2024-03-15"
category: "ayurveda-basics"
tags: ["dosha", "ayurveda", "health"]
image: "/images/blog/post-slug.jpg"
---
# Post Content

Markdown with headings, lists, bold, links...
```

### Loading Pipeline
```
File System → loadPosts.ts → parseFrontmatter() → filterPublished() → sort() → Blog.tsx
                                                                          │
                                              ┌───────────────────────────┤
                                              │                           │
                                        CategoryFilter              SearchFilter
                                              │                           │
                                              └───────────┬───────────────┘
                                                          │
                                                    BlogPost.tsx
                                                          │
                                                  RelatedPosts.tsx
```

## Content Types

### Categories (6)
1. **Ayurveda Basics** — Introduction to Ayurvedic principles
2. **Panchakarma** — Treatment guides and benefits
3. **Diet & Nutrition** — Food recommendations, diet charts
4. **Herbs & Remedies** — Natural remedies, herbal treatments
5. **Lifestyle** — Daily routines, wellness practices
6. **Skin & Hair** — Dermatological Ayurveda

### Author System
- 6 authors with bios, credentials, and social links
- Each author has: name, title, image, bio, expertise areas
- Author archive pages (implicit — filtered by author name)

### Related Posts Algorithm
- **Primary signal**: Category match (same category = high relevance)
- **Secondary signal**: Tag overlap (shared tags increase score)
- **Tertiary signal**: Publication date proximity (recent posts prioritized)
- **Result**: 3-4 related posts displayed at bottom of article

## SEO Integration

### Post-Level SEO
- Dynamic `<title>` from frontmatter
- Meta description from frontmatter (150-160 chars)
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Breadcrumb schema (Home > Blog > Category > Post)
- Article schema with `dateModified`, `author`, `articleSection`

### Structured Data
- `Article` schema with full metadata
- `author` links to physician schema (if applicable)
- `datePublished` from frontmatter
- `mainEntityOfPage` for canonical URL

## Auto-Post System
- `autopost-log.json` tracks scheduled posts
- Posts can be scheduled for future publication
- Draft posts auto-publish on scheduled date
- Integration with external content sources (RSS, API)

## Content Governance

### Editorial Workflow
1. Author writes draft → saved to `drafts/` folder
2. Review process (internal)
3. Published to `published/YYYY-MM/` folder
4. Auto-updated in blog listing on next build
5. Draft posts hidden from public view

### Quality Standards
- All posts include: title, description, author, date, category, tags, image
- Medical claims must be: non-promissory, evidence-based, disclaimer included
- Ayurvedic terminology: explained in context, not assumed
- External links: nofollow attribute, verified sources
- Internal links: at least 2 per post (related content)

## Performance
- Posts loaded at build time (not runtime API calls)
- Image optimization: all blog images use Next.js Image or optimized URLs
- Lazy loading: images below fold use `loading="lazy"`
- Code splitting: BlogPost component is route-level split