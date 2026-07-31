/**
 * SEO Head Component
 * Manages meta tags, Open Graph, Twitter Cards, and structured data
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_SEO, HOSPITAL_SCHEMA, FAQ_SCHEMA, ORGANIZATION_SCHEMA, PHYSICIAN_SCHEMA, BREADCRUMB_SCHEMA, HOWTO_PANCHAKARMA_SCHEMA, HOWTO_PRAKRITI_SCHEMA, HOWTO_DIET_SCHEMA, MEDICAL_WEBPAGE_SCHEMA } from '../seo';
import { BLOG_POSTS } from '../pages/Blog';

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    image,
    type = 'website',
    noIndex = false
}) => {
    const location = useLocation();
    const baseUrl = 'https://ayurvritta.com';

    // Determine page key from route
    const getPageKey = (): string => {
        const path = location.pathname.replace('/', '') || 'home';
        if (path.startsWith('services/')) return 'services';
        if (path.startsWith('blog/')) return 'blog';
        return path;
    };

    const pageKey = getPageKey();
    const seoData = PAGE_SEO[pageKey] || PAGE_SEO.home;

    // Resolve blog post detail metadata (single /blog/:slug detail pages)
    const postMatch = location.pathname.match(/^\/blog\/([^/]+)\/?$/);
    const activePost = postMatch ? BLOG_POSTS.find(p => p.slug === postMatch[1]) : null;

    let finalTitle = title || seoData.title;
    let finalDescription = description || seoData.description;
    let finalImage = image || seoData.ogImage || '/images/og-default.svg';
    let finalType = type;

    if (activePost) {
        finalTitle = `${activePost.title} | Ayurvritta Ayurveda Blog`;
        finalDescription = activePost.excerpt;
        finalImage = activePost.image;
        finalType = 'article';
    }

    const canonicalUrl = `${baseUrl}${location.pathname}`;

    // Update document head
    React.useEffect(() => {
        // Title
        document.title = finalTitle;

        // Meta description
        updateMeta('description', finalDescription);
        updateMeta('keywords', seoData.keywords || '');

        // Open Graph
        updateMeta('og:title', finalTitle, 'property');
        updateMeta('og:description', finalDescription, 'property');
        updateMeta('og:image', `${baseUrl}${finalImage}`, 'property');
        updateMeta('og:url', canonicalUrl, 'property');
        updateMeta('og:type', finalType, 'property');
        updateMeta('og:site_name', 'Ayurvritta Ayurveda Hospital', 'property');
        updateMeta('og:locale', 'en_IN', 'property');

        // Twitter Card
        updateMeta('twitter:card', 'summary_large_image', 'name');
        updateMeta('twitter:title', finalTitle, 'name');
        updateMeta('twitter:description', finalDescription, 'name');
        updateMeta('twitter:image', `${baseUrl}${finalImage}`, 'name');

        // Canonical
        updateCanonical(canonicalUrl);

        // Robots
        if (noIndex) {
            updateMeta('robots', 'noindex,nofollow');
        } else {
            updateMeta('robots', 'index,follow');
        }

        // Structured data
        updateStructuredData(location.pathname, activePost);

    }, [location.pathname, finalTitle, finalDescription, finalType, finalImage, activePost]);

    return null; // This component only manages head tags
};

// Helper: Update or create meta tag
function updateMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
    if (!content) return;

    let element = document.querySelector(`meta[${attr}="${name}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

// Helper: Update canonical link
function updateCanonical(url: string) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = url;
}

// Helper: Add structured data schemas
function updateStructuredData(pathname: string, activePost?: { title: string; excerpt: string; image: string; author: string; date: string } | null) {
    // Remove existing
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add Hospital/MedicalBusiness schema
    const hospitalScript = document.createElement('script');
    hospitalScript.type = 'application/ld+json';
    hospitalScript.textContent = JSON.stringify(HOSPITAL_SCHEMA);
    document.head.appendChild(hospitalScript);

    // Add Organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(ORGANIZATION_SCHEMA);
    document.head.appendChild(orgScript);

    // Add MedicalWebPage schema (on all pages for AI visibility)
    const medicalWebpageScript = document.createElement('script');
    medicalWebpageScript.type = 'application/ld+json';
    medicalWebpageScript.textContent = JSON.stringify(MEDICAL_WEBPAGE_SCHEMA);
    document.head.appendChild(medicalWebpageScript);

    // Add Physician schema (on about, booking and home pages)
    if (pathname === '/about' || pathname === '/booking' || pathname === '/') {
        const physicianScript = document.createElement('script');
        physicianScript.type = 'application/ld+json';
        physicianScript.textContent = JSON.stringify(PHYSICIAN_SCHEMA);
        document.head.appendChild(physicianScript);
    }

    // Add Breadcrumb schema (on all pages except home)
    if (pathname !== '/') {
        const breadcrumbScript = document.createElement('script');
        breadcrumbScript.type = 'application/ld+json';
        breadcrumbScript.textContent = JSON.stringify(BREADCRUMB_SCHEMA(pathname));
        document.head.appendChild(breadcrumbScript);
    }

    // Add HowTo schemas on appropriate pages
    if (pathname === '/services/panchakarma' || pathname === '/services') {
        const howtoPkScript = document.createElement('script');
        howtoPkScript.type = 'application/ld+json';
        howtoPkScript.textContent = JSON.stringify(HOWTO_PANCHAKARMA_SCHEMA);
        document.head.appendChild(howtoPkScript);
    }

    if (pathname === '/tools') {
        const howtoPrakritiScript = document.createElement('script');
        howtoPrakritiScript.type = 'application/ld+json';
        howtoPrakritiScript.textContent = JSON.stringify(HOWTO_PRAKRITI_SCHEMA);
        document.head.appendChild(howtoPrakritiScript);

        const howtoDietScript = document.createElement('script');
        howtoDietScript.type = 'application/ld+json';
        howtoDietScript.textContent = JSON.stringify(HOWTO_DIET_SCHEMA);
        document.head.appendChild(howtoDietScript);
    }

    // Add FAQ schema (on home and booking pages for AI search)
    if (pathname === '/' || pathname === '/booking') {
        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.textContent = JSON.stringify(FAQ_SCHEMA);
        document.head.appendChild(faqScript);
    }

    // Add BlogPosting schema on individual blog post pages
    if (activePost) {
        const blogPostingScript = document.createElement('script');
        blogPostingScript.type = 'application/ld+json';
        blogPostingScript.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": activePost.title,
            "description": activePost.excerpt,
            "image": activePost.image,
            "author": {
                "@type": "Person",
                "name": activePost.author
            },
            "publisher": {
                "@type": "Organization",
                "name": "Ayurvritta Ayurveda Hospital",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://ayurvritta.com/images/logo-nobg.png"
                }
            },
            "datePublished": activePost.date,
            "mainEntityOfPage": `https://ayurvritta.com${pathname}`
        });
        document.head.appendChild(blogPostingScript);
    }
}

export default SEOHead;
