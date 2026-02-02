/**
 * SEO Configuration
 * Meta tags, schemas, and SEO settings for all pages
 */

export interface PageSEO {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
}

// Page-specific SEO settings
export const PAGE_SEO: Record<string, PageSEO> = {
    home: {
        title: 'Ayurvritta Ayurveda Hospital & Panchakarma Center | Vadodara',
        description: 'Classical Ayurveda for modern lifestyle disorders. Expert Panchakarma treatment in Vadodara for Thyroid, Diabetes, CKD, Obesity & PCOD. 24/7 Hospital.',
        keywords: 'ayurveda hospital vadodara, panchakarma center vadodara, thyroid treatment ayurveda, diabetes ayurveda treatment, ayurvedic hospital gujarat',
        ogImage: '/images/og-home.jpg'
    },
    about: {
        title: 'About Us | Dr. Jinendradutt Sharma | Ayurvritta Hospital',
        description: 'Meet Dr. Jinendradutt Sharma, Chief Physician at Ayurvritta. 15+ years of experience in classical Ayurveda and Panchakarma for lifestyle disorders.',
        keywords: 'ayurveda doctor vadodara, panchakarma specialist, ayurveda physician gujarat',
        ogImage: '/images/og-about.jpg'
    },
    services: {
        title: 'Ayurveda Treatments & Therapies | Panchakarma | Ayurvritta',
        description: 'Explore our 70+ Ayurvedic treatments including Abhyanga, Shirodhara, Basti, Nasya, and more. Evidence-based Panchakarma in Vadodara.',
        keywords: 'panchakarma treatment vadodara, shirodhara therapy, abhyanga massage, ayurveda therapy vadodara',
        ogImage: '/images/og-services.jpg'
    },
    programs: {
        title: 'Wellness Programs | Thyroid, Diabetes, Weight Loss | Ayurvritta',
        description: 'Specialized Ayurveda programs for Thyroid Reset, Diabetes Reversal, CKD Support, Stress Relief & Weight Loss. Personalized treatment protocols.',
        keywords: 'thyroid treatment ayurveda, diabetes reversal program, weight loss ayurveda, ckd treatment ayurveda',
        ogImage: '/images/og-programs.jpg'
    },
    booking: {
        title: 'Book Consultation | Ayurvritta Ayurveda Hospital',
        description: 'Book your consultation with Dr. Jinendradutt Sharma. Online and in-person appointments available. Call +91 94266 84047.',
        keywords: 'book ayurveda consultation, ayurveda appointment vadodara',
        ogImage: '/images/og-booking.jpg'
    },
    tools: {
        title: 'Ayurveda Health Tools | Prakriti Quiz | Ayurvritta',
        description: 'Discover your Ayurvedic constitution with our Prakriti Assessment, Lifestyle Risk Calculator, and personalized Diet Planner.',
        keywords: 'prakriti quiz, dosha test, ayurveda body type, vata pitta kapha test',
        ogImage: '/images/og-tools.jpg'
    },
    insurance: {
        title: 'Cashless Treatment & Insurance | Ayurvritta Hospital',
        description: 'Cashless Ayurveda treatment with 50+ insurance partners. HDFC ERGO, Star Health, ICICI Lombard & more accepted.',
        keywords: 'ayurveda insurance, cashless ayurveda treatment, health insurance ayurveda',
        ogImage: '/images/og-insurance.jpg'
    }
};

// Hospital structured data
export const HOSPITAL_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://ayurvritta.com/#hospital",
    "name": "Ayurvritta Ayurveda Hospital & Panchakarma Center",
    "alternateName": "Ayurvritta Hospital",
    "description": "Classical Ayurveda hospital specializing in lifestyle disorders - Thyroid, Diabetes, CKD, Obesity, PCOD. Expert Panchakarma treatments.",
    "url": "https://ayurvritta.com",
    "telephone": "+919426684047",
    "email": "care.ayurvritta@gmail.com",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "FF 104–113, Lotus Enora Complex, Opp. Rutu Villa, New Alkapuri, Gotri",
        "addressLocality": "Vadodara",
        "addressRegion": "Gujarat",
        "postalCode": "390021",
        "addressCountry": "IN"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": "22.3119",
        "longitude": "73.1723"
    },
    "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
    },
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, UPI, Insurance",
    "image": "https://ayurvritta.com/images/hospital-exterior.jpg",
    "logo": "https://ayurvritta.com/images/logo-nobg.png",
    "sameAs": [
        "https://www.facebook.com/profile.php?id=61560024669845",
        "https://www.instagram.com/ayurvritta/"
    ],
    "founder": {
        "@type": "Person",
        "name": "Dr. Jinendradutt Sharma",
        "jobTitle": "Chief Physician",
        "description": "Ayurveda physician specializing in Panchakarma and lifestyle disorder management"
    },
    "medicalSpecialty": [
        "Ayurveda",
        "Panchakarma",
        "Lifestyle Medicine"
    ],
    "availableService": [
        {
            "@type": "MedicalProcedure",
            "name": "Panchakarma",
            "description": "Five purification therapies for deep detoxification"
        },
        {
            "@type": "MedicalProcedure",
            "name": "Shirodhara",
            "description": "Rhythmic oil pouring on forehead for stress and neurological conditions"
        },
        {
            "@type": "MedicalProcedure",
            "name": "Abhyanga",
            "description": "Full body oil massage for rejuvenation"
        }
    ],
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "247",
        "bestRating": "5"
    }
};

// FAQ Schema for common questions
export const FAQ_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is Panchakarma?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Panchakarma is a set of five Ayurvedic purification therapies (Vamana, Virechana, Basti, Nasya, Raktamokshana) that eliminate deep-rooted toxins from the body and restore balance to the doshas."
            }
        },
        {
            "@type": "Question",
            "name": "Can Ayurveda treat Diabetes?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Ayurveda offers effective management for Type 2 Diabetes (Prameha) through diet modification, lifestyle changes, herbal medications, and Panchakarma therapies. Our Diabetes Rebalance Program has helped many patients reduce their medication dependency."
            }
        },
        {
            "@type": "Question",
            "name": "How long does Panchakarma treatment take?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A complete Panchakarma treatment typically takes 7-21 days depending on the condition and therapy type. It includes preparation (Purvakarma), main procedure, and post-therapy care (Paschatkarma)."
            }
        },
        {
            "@type": "Question",
            "name": "Is Ayurveda treatment covered by insurance?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Ayurvritta offers cashless treatment with 50+ insurance partners including Star Health, HDFC ERGO, ICICI Lombard, and more. Contact us for specific policy coverage details."
            }
        },
        {
            "@type": "Question",
            "name": "What conditions does Ayurvritta specialize in?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We specialize in lifestyle disorders including Thyroid conditions, Diabetes, Chronic Kidney Disease (CKD), Obesity, PCOD/PCOS, and stress-related disorders. We also offer general wellness and rejuvenation programs."
            }
        }
    ]
};

export default { PAGE_SEO, HOSPITAL_SCHEMA, FAQ_SCHEMA };
