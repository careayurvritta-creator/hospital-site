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
        },
        {
            "@type": "Question",
            "name": "What is Prakriti analysis?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Prakriti analysis determines your unique body constitution (Vata, Pitta, or Kapha dominant) based on physical traits, behavior patterns, and metabolic tendencies. This helps personalize diet, lifestyle, and treatment plans for optimal health."
            }
        },
        {
            "@type": "Question",
            "name": "Can Ayurveda help with Thyroid disorders?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Ayurveda manages Thyroid disorders (Hypothyroidism, Hyperthyroidism) through diet regulation, herbs like Kanchanar Guggulu, Shirodhara, and Panchakarma. Our Thyroid Reset Program aims to improve thyroid function and reduce medication dependence under medical supervision."
            }
        },
        {
            "@type": "Question",
            "name": "What is the difference between Shirodhara and Abhyanga?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Abhyanga is a full-body oil massage for rejuvenation and dosha pacification. Shirodhara involves rhythmic oil streaming on the forehead (third eye) to calm the mind, reduce stress, and treat neurological conditions. Both are Panchakarma preparatory therapies."
            }
        },
        {
            "@type": "Question",
            "name": "How does Ayurveda treat Chronic Kidney Disease (CKD)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ayurvedic management of CKD focuses on mutravirechana (diuresis), diet modification to reduce kidney load, herbs like Punarnava and Gokshura, and gentle Panchakarma therapies. Our CKD Support Program works alongside nephrologist care to slow progression."
            }
        },
        {
            "@type": "Question",
            "name": "What should I expect during my first consultation?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your first consultation (approx. 45-60 minutes) includes detailed history, Prakriti assessment, Nadi (pulse) diagnosis, and personalized treatment plan. The doctor will review your medical reports and recommend appropriate therapies and lifestyle modifications."
            }
        },
        {
            "@type": "Question",
            "name": "Are there any side effects of Ayurvedic treatments?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "When administered by qualified practitioners, Ayurvedic treatments are generally safe. However, improper dosage or unsupervised use of herbs may cause issues. At Ayurvritta, all treatments are prescribed and monitored by experienced Ayurvedic physicians."
            }
        },
        {
            "@type": "Question",
            "name": "How does Ayurveda approach weight loss?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ayurvedic weight management addresses the root cause - often Kapha imbalance or Ama (toxin) accumulation. Treatment includes diet customization, Udvartana (herbal powder massage), Panchakarma, and lifestyle changes. Our Weight Management Program is customized to your body type."
            }
        },
        {
            "@type": "Question",
            "name": "What is Basti (Medicated Enema) therapy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Basti is one of the most important Panchakarma therapies where medicated decoctions or oils are administered rectally. It effectively pacifies Vata dosha, treats neurological issues, and helps in various chronic conditions. There are two types: Asthapana (herbal decoction) and Anuvasana (oil-based)."
            }
        },
        {
            "@type": "Question",
            "name": "Can Ayurveda help with PCOD/PCOS?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Ayurveda effectively manages PCOD/PCOS through hormonal balance (using herbs like Shatavari, Lodhra), diet modifications, Panchakarma for detoxification, and lifestyle changes. Our PCOD Reversal Program addresses irregular periods, weight gain, and fertility concerns."
            }
        },
        {
            "@type": "Question",
            "name": "What is the cost of Panchakarma treatment?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Panchakarma costs vary based on therapy type, duration, and individual requirements. Basic treatments start from ₹500/day, while comprehensive programs (7-21 days) range from ₹15,000-₹75,000. We offer flexible packages and insurance coverage."
            }
        },
        {
            "@type": "Question",
            "name": "Is Ayurvritta hospital open 24/7?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Ayurvritta Ayurveda Hospital operates 24/7 for emergency admissions and Panchakarma treatments. Our outpatient department is open from 9 AM to 7 PM, and we have round-the-clock nursing staff for inpatient care."
            }
        },
        {
            "@type": "Question",
            "name": "How do I book an appointment at Ayurvritta?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can book an appointment by calling +91 94266 84047, using our online booking form, or visiting our hospital in Vadodara. We offer both in-person and teleconsultation options. For Panchakarma, advance booking is recommended."
            }
        },
        {
            "@type": "Question",
            "name": "What dietary guidelines should I follow during Panchakarma?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "During Panchakarma, follow a light, warm, easily digestible diet (Kitchari diet). Avoid cold foods, heavy meals, processed foods, and raw vegetables. Your doctor will provide specific guidelines based on your Prakriti and the therapy being performed."
            }
        },
        {
            "@type": "Question",
            "name": "How long do the effects of Panchakarma last?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "With proper post-treatment care and lifestyle maintenance, the benefits of Panchakarma can last 6-12 months. Annual maintenance Panchakarma is recommended for chronic conditions. Diet and lifestyle adherence significantly impacts long-term results."
            }
        },
        {
            "@type": "Question",
            "name": "What makes Ayurvritta different from other Ayurveda hospitals?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ayurvritta combines classical Ayurvedic traditions with modern diagnostic facilities. Our hospital has 70+ therapy rooms, 24/7 medical care, experienced physicians, and evidence-based treatment protocols. We specialize in lifestyle disorders and offer integrated care under one roof."
            }
        }
    ]
};

export const ORGANIZATION_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ayurvritta.com/#organization",
    "name": "Ayurvritta Ayurveda Hospital",
    "url": "https://ayurvritta.com",
    "logo": "https://ayurvritta.com/images/logo-nobg.png",
    "description": "Premier Ayurvedic hospital in Vadodara specializing in classical Panchakarma treatments for lifestyle disorders.",
    "sameAs": [
        "https://www.facebook.com/profile.php?id=61560024669845",
        "https://www.instagram.com/ayurvritta/"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+919426684047",
        "contactType": "customer service",
        "availableHours": "24/7",
        "areaServed": "IN",
        "availableLanguage": ["en", "hi", "gu"]
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "FF 104–113, Lotus Enora Complex, Opp. Rutu Villa, New Alkapuri, Gotri",
        "addressLocality": "Vadodara",
        "addressRegion": "Gujarat",
        "postalCode": "390021",
        "addressCountry": "IN"
    }
};

export const PHYSICIAN_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": "https://ayurvritta.com/#doctor",
    "name": "Dr. Jinendradutt Sharma",
    "jobTitle": "Chief Physician & Medical Director",
    "image": "https://ayurvritta.com/images/doctor-profile.jpg",
    "url": "https://ayurvritta.com/about",
    "description": "Experienced Ayurvedic physician specializing in Panchakarma therapy, lifestyle disorder management, and classical Ayurveda treatments.",
    "email": "care.ayurvritta@gmail.com",
    "telephone": "+919426684047",
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
    "organization": {
        "@type": "Organization",
        "name": "Ayurvritta Ayurveda Hospital"
    },
    "medicalSpecialty": [
        "Ayurveda",
        "Panchakarma",
        "Lifestyle Medicine"
    ],
    "awards": [
        "15+ Years Experience in Classical Ayurveda",
        "Certified Panchakarma Specialist"
    ],
    "memberOf": [
        {
            "@type": "Organization",
            "name": "Ayurveda Practitioners Association"
        }
    ]
};

export const BREADCRUMB_SCHEMA = (pathname: string): object => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://ayurvritta.com/"
        }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const position = index + 2;
        let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        
        if (segment === '') name = 'Home';
        
        items.push({
            "@type": "ListItem",
            "position": position,
            "name": name,
            "item": `https://ayurvritta.com${currentPath}`
        });
    });

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items
    };
};

// HowTo Schema: Preparing for Panchakarma
export const HOWTO_PANCHAKARMA_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Prepare for Panchakarma Treatment",
    "description": "A comprehensive guide to preparing your body and mind for Ayurvedic Panchakarma detoxification therapy.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Consultation & Assessment",
            "text": "Schedule a detailed consultation with our Ayurvedic physician. They will assess your Prakriti (body constitution), current health condition, and determine if Panchakarma is suitable for you.",
            "url": "https://ayurvritta.com/#/booking"
        },
        {
            "@type": "HowToStep",
            "name": "Pre-Treatment Preparation (Purvakarma)",
            "text": "Follow the prescribed diet and lifestyle modifications 5-7 days before treatment. This includes eating light, warm, easily digestible foods, avoiding cold drinks and raw foods, and maintaining regular sleep patterns.",
            "url": "https://ayurvritta.com/#/services/panchakarma"
        },
        {
            "@type": "HowToStep",
            "name": "Oleation (Snehana)",
            "text": "Internal and external oleation is performed using medicated ghee and oils. This helps loosen toxins (Ama) from tissues and prepares them for elimination.",
            "url": "https://ayurvritta.com/#/services"
        },
        {
            "@type": "HowToStep",
            "name": "Fomentation (Swedana)",
            "text": "Herbal steam therapy is administered to open channels (Srotas) and further loosen toxins. This is typically done for 3-7 days before main therapy.",
            "url": "https://ayurvritta.com/#/services/swedana"
        },
        {
            "@type": "HowToStep",
            "name": "Main Panchakarma Therapy",
            "text": "Depending on your condition, the main therapy may include Vamana (therapeutic emesis), Virechana (purgation), Basti (medicated enema), Nasya (nasal therapy), or Raktamokshana (bloodletting).",
            "url": "https://ayurvritta.com/#/services/panchakarma"
        },
        {
            "@type": "HowToStep",
            "name": "Post-Treatment Care (Paschatkarma)",
            "text": "Follow the prescribed diet and lifestyle regimen for 7-14 days after therapy. Gradually reintroduce regular foods, avoid heavy exercise, and maintain proper hydration.",
            "url": "https://ayurvritta.com/#/services"
        }
    ],
    "totalTime": "P7D",
    "supply": [
        {
            "@type": "HowToSupply",
            "name": "Medicated Ghee (Snehana)"
        },
        {
            "@type": "HowToSupply",
            "name": "Herbal Decoctions (Kwatha)"
        },
        {
            "@type": "HowToSupply",
            "name": "Medicated Oil (Taila)"
        }
    ],
    "image": "https://ayurvritta.com/images/og-default.svg"
};

// HowTo Schema: Maintaining Prakriti Balance
export const HOWTO_PRAKRITI_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Maintain Your Prakriti Balance",
    "description": "Learn how to maintain optimal balance of your body constitution (Vata, Pitta, Kapha) through diet, lifestyle, and seasonal routines.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Know Your Prakriti",
            "text": "Take our Prakriti assessment tool to understand your dominant dosha. This helps customize diet and lifestyle recommendations specific to your body type.",
            "url": "https://ayurvritta.com/#/tools"
        },
        {
            "@type": "HowToStep",
            "name": "Follow Dosha-Specific Diet",
            "text": "Vata types should favor warm, moist, oily foods. Pitta types should choose cooling, less spicy foods. Kapha types should opt for light, dry, less oily options.",
            "url": "https://ayurvritta.com/#/tools"
        },
        {
            "@type": "HowToStep",
            "name": "Maintain Daily Routine (Dinacharya)",
            "text": "Wake up before sunrise (Brahma Muhurta), practice meditation and yoga, eat meals at consistent times, and sleep by 10 PM for optimal dosha balance.",
            "url": "https://ayurvritta.com/#/programs"
        },
        {
            "@type": "HowToStep",
            "name": "Follow Seasonal Routine (Ritucharya)",
            "text": "Adjust your diet and lifestyle according to seasons. In summer, favor cooling foods; in monsoon, eat warm easy-to-digest foods; in winter, favor warm and oily foods.",
            "url": "https://ayurvritta.com/#/tools"
        },
        {
            "@type": "HowToStep",
            "name": "Practice Regular Exercise",
            "text": "Engage in appropriate physical activity based on your body type: gentle yoga and walking for Vata, moderate exercise for Pitta, and stimulating exercises for Kapha.",
            "url": "https://ayurvritta.com/#/programs"
        },
        {
            "@type": "HowToStep",
            "name": "Regular Detoxification",
            "text": "Consider annual Panchakarma or seasonal detoxification to prevent toxin accumulation (Ama) and maintain optimal health and immunity (Ojas).",
            "url": "https://ayurvritta.com/#/services/panchakarma"
        }
    ],
    "image": "https://ayurvritta.com/images/og-default.svg"
};

// HowTo Schema: Following Ayurvedic Diet
export const HOWTO_DIET_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Follow an Ayurvedic Diet",
    "description": "A beginner's guide to eating according to Ayurvedic principles for better digestion, energy, and overall wellness.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Eat According to Your Digestive Fire (Agni)",
            "text": "Choose foods that match your digestive capacity. Eat your largest meal when Agni is strongest (usually midday), and have light meals in the morning and evening.",
            "url": "https://ayurvritta.com/#/tools"
        },
        {
            "@type": "HowToStep",
            "name": "Prefer Warm, Cooked Foods",
            "text": "Favor freshly cooked, warm meals over cold, raw foods. Warm foods are easier to digest and don't extinguish Agni. Avoid leftovers and processed foods.",
            "url": "https://ayurvritta.com/#/programs"
        },
        {
            "@type": "HowToStep",
            "name": "Eat in a Calm Environment",
            "text": "Eat mindfully without distractions. Sit down, chew thoroughly, and avoid eating when upset or rushed. This ensures proper digestion and nutrient absorption.",
            "url": "https://ayurvritta.com/#/about"
        },
        {
            "@type": "HowToStep",
            "name": "Avoid Incompatible Food Combinations",
            "text": "Don't combine milk with sour fruits, fish with dairy, or cold foods with hot foods. Proper food combining prevents Ama formation and digestive issues.",
            "url": "https://ayurvritta.com/#/tools"
        },
        {
            "@type": "HowToStep",
            "name": "Stay Hydrated with Warm Water",
            "text": "Drink warm or room temperature water throughout the day. Avoid cold drinks with meals as they extinguish digestive fire. Sip warm water between meals.",
            "url": "https://ayurvritta.com/#/services"
        },
        {
            "@type": "HowToStep",
            "name": "Eat According to Seasons",
            "text": "Choose fresh, locally grown, seasonal produce. Favor cooling foods in summer, warming foods in winter, and light foods during monsoon.",
            "url": "https://ayurvritta.com/#/tools"
        }
    ],
    "image": "https://ayurvritta.com/images/og-default.svg"
};

// MedicalWebPage Schema for AI visibility
export const MEDICAL_WEBPAGE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": "https://ayurvritta.com/#webpage",
    "name": "Ayurvritta Ayurveda Hospital - Ayurvedic Treatments & Panchakarma",
    "description": "Expert Ayurvedic hospital offering classical Panchakarma treatments, lifestyle disorder management, and personalized wellness programs in Vadodara, Gujarat.",
    "url": "https://ayurvritta.com",
    "image": "https://ayurvritta.com/images/og-default.svg",
    "author": {
        "@type": "Organization",
        "name": "Ayurvritta Ayurveda Hospital"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Ayurvritta Ayurveda Hospital",
        "logo": {
            "@type": "ImageObject",
            "url": "https://ayurvritta.com/images/logo-nobg.png"
        }
    },
    "datePublished": "2024-01-01",
    "dateModified": "2026-05-10",
    "inLanguage": "en",
    "audience": {
        "@type": "Audience",
        "audienceType": "Patients seeking Ayurvedic treatment, Individuals with lifestyle disorders, People interested in wellness and detoxification"
    },
    "about": {
        "@type": "Thing",
        "name": "Ayurvedic Medicine",
        "description": "Traditional Indian system of medicine focusing on balance of body, mind, and spirit through diet, herbal treatments, and lifestyle modifications"
    },
    "specialty": [
        {
            "@type": "MedicalSpecialty",
            "name": "Ayurveda"
        },
        {
            "@type": "MedicalSpecialty",
            "name": "Panchakarma"
        },
        {
            "@type": "MedicalSpecialty",
            "name": "Lifestyle Medicine"
        }
    ],
    "medicalAudience": {
        "@type": "Audience",
        "audienceType": "Healthcare providers, Ayurvedic practitioners, Medical researchers"
    },
    "physician": {
        "@type": "Physician",
        "name": "Dr. Jinendradutt Sharma",
        "jobTitle": "Chief Physician"
    },
    "talkAbout": [
        "Ayurveda",
        "Panchakarma",
        "Thyroid Treatment",
        "Diabetes Management",
        "CKD Support",
        "Weight Loss",
        "PCOD Treatment",
        "Prakriti Analysis",
        "Abhyanga",
        "Shirodhara",
        "Basti Therapy"
    ],
    "primaryImageOfPage": "https://ayurvritta.com/images/og-default.svg"
};

export default { PAGE_SEO, HOSPITAL_SCHEMA, FAQ_SCHEMA, ORGANIZATION_SCHEMA, PHYSICIAN_SCHEMA, BREADCRUMB_SCHEMA, HOWTO_PANCHAKARMA_SCHEMA, HOWTO_PRAKRITI_SCHEMA, HOWTO_DIET_SCHEMA, MEDICAL_WEBPAGE_SCHEMA };
