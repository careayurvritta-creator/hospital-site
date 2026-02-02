/**
 * SEO Head Component
 * Manages meta tags, Open Graph, Twitter Cards, and structured data
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_SEO, HOSPITAL_SCHEMA, FAQ_SCHEMA } from '../seo';

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
        return path;
    };

    const pageKey = getPageKey();
    const seoData = PAGE_SEO[pageKey] || PAGE_SEO.home;

    const finalTitle = title || seoData.title;
    const finalDescription = description || seoData.description;
    const finalImage = image || seoData.ogImage || '/images/og-default.jpg';
    const canonicalUrl = `${baseUrl}/#${location.pathname}`;

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
        updateMeta('og:type', type, 'property');
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
        updateStructuredData();

    }, [location.pathname, finalTitle, finalDescription]);

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
function updateStructuredData() {
    // Remove existing
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add Hospital schema
    const hospitalScript = document.createElement('script');
    hospitalScript.type = 'application/ld+json';
    hospitalScript.textContent = JSON.stringify(HOSPITAL_SCHEMA);
    document.head.appendChild(hospitalScript);

    // Add FAQ schema (on home and booking pages)
    if (location.pathname === '/' || location.pathname === '/booking') {
        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.textContent = JSON.stringify(FAQ_SCHEMA);
        document.head.appendChild(faqScript);
    }
}

export default SEOHead;
