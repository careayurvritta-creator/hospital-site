import { Activity, Droplet, Sun, HeartPulse, Stethoscope, Scale, Moon, ShieldCheck, Thermometer, Eye, Wind, Smile, PlusCircle } from "lucide-react";
import { NavItem, Service, Program, Testimonial, Advice, InsurancePartner } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Programs', path: '/programs' },
  { label: 'Cashless / Insurance', path: '/insurance' },
  { label: 'Ayurveda Tools', path: '/tools' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/booking' },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Programs', path: '/programs' },
    { label: 'Insurance', path: '/insurance' },
    { label: 'Tools', path: '/tools' },
    { label: 'Blog', path: '/blog' },
  ],
  legalLinks: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ],
};

export const INSURANCE_PARTNERS: InsurancePartner[] = [
  // --- Public Sector Insurers (PSUs) ---
  { name: "The New India Assurance Co. Ltd.", logo: "/images/partners/new-india.png", type: 'Insurer' },
  { name: "United India Insurance Co. Ltd.", logo: "/images/partners/united-india.png", type: 'Insurer' },
  { name: "The Oriental Insurance Co. Ltd.", logo: "/images/partners/oriental-insurance.png", type: 'Insurer' },
  { name: "National Insurance Company Limited", logo: "/images/partners/national-insurance.jpg", type: 'Insurer' },

  // --- Private Sector Insurers ---
  { name: "HDFC ERGO General Insurance Company", logo: "/images/partners/hdfc-ergo.jpg", type: 'Insurer' },
  { name: "ICICI Lombard General Insurance Co. Ltd.", logo: "/images/partners/icici-lombard.jpg", type: 'Insurer' },
  { name: "Bajaj Allianz General Insurance Co. Ltd.", logo: "/images/partners/bajaj-allianz.jpg", type: 'Insurer' },
  { name: "Tata AIG General Insurance Co. Ltd.", logo: "/images/partners/tata-aig.png", type: 'Insurer' },
  { name: "Star Health and Allied Insurance Co. Ltd.", logo: "/images/partners/star-health.png", type: 'Insurer' },
  { name: "Niva Bupa Health Insurance Co. Ltd.", logo: "/images/partners/niva-bupa.png", type: 'Insurer' },
  { name: "Care Health Insurance Ltd", logo: "/images/partners/care-health.png", type: 'Insurer' },
  { name: "ManipalCigna Health Insurance Company", logo: "/images/partners/manipal-cigna.png", type: 'Insurer' },
  { name: "Aditya Birla Health Insurance Co. Ltd.", logo: "/images/partners/aditya-birla.webp", type: 'Insurer' },
  { name: "Digit General Insurance", logo: "/images/partners/digit-general.png", type: 'Insurer' },
  { name: "ACKO General Insurance", logo: "/images/partners/acko-general.png", type: 'Insurer' },
  { name: "SBI General Insurance", logo: "/images/partners/sbi-general.png", type: 'Insurer' },
  { name: "Reliance General Insurance", logo: "/images/partners/reliance-general.png", type: 'Insurer' },
  { name: "Royal Sundaram General Insurance", logo: "/images/partners/royal-sundaram.webp", type: 'Insurer' },
  { name: "Cholamandalam MS General Insurance", logo: "https://www.google.com/s2/favicons?domain=cholamandalam.com&sz=128", type: 'Insurer' },
  { name: "IFFCO Tokio General Insurance", logo: "/images/partners/iffco-tokio.png", type: 'Insurer' },
  { name: "Future Generali India Insurance", logo: "/images/partners/future-generali.png", type: 'Insurer' },
  { name: "Magma HDI General Insurance", logo: "/images/partners/magma-hdi.png", type: 'Insurer' },
  { name: "Liberty General Insurance", logo: "/images/partners/liberty-general.avif", type: 'Insurer' },
  { name: "Kotak Mahindra General Insurance", logo: "https://www.google.com/s2/favicons?domain=kotak.com&sz=128", type: 'Insurer' },
  { name: "Raheja QBE General Insurance", logo: "/images/partners/raheja-qbe.png", type: 'Insurer' },
  { name: "Shriram General Insurance", logo: "/images/partners/shriram-general.png", type: 'Insurer' },
  { name: "Universal Sompo General Insurance", logo: "/images/partners/universal-sompo.jpg", type: 'Insurer' },
  { name: "Navi General Insurance", logo: "/images/partners/navi-general.jpg", type: 'Insurer' },
  { name: "Zuno General Insurance", logo: "/images/partners/zuno-general.png", type: 'Insurer' },
  { name: "Galaxy Health Insurance", logo: "/images/partners/galaxy-health.webp", type: 'Insurer' },
  { name: "Narayana Health Insurance", logo: "/images/partners/narayana-health.png", type: 'Insurer' },

  // --- Major TPAs (Third Party Administrators) ---
  { name: "Medi Assist Insurance TPA Pvt. Ltd.", logo: "/images/partners/medi-assist-tpa.png", type: 'TPA' },
  { name: "Raksha Health Insurance TPA Pvt. Ltd. (Merged with Medi Assist)", logo: "/images/partners/raksha-tpa.avif", type: 'TPA' },
  { name: "Paramount Health Services & Insurance TPA Pvt. Ltd.", logo: "/images/partners/paramount-tpa.jpg", type: 'TPA' },
  { name: "MDIndia Health Insurance TPA Pvt. Ltd.", logo: "https://mdindiaonline.com/images/logo.png", type: 'TPA' },
  { name: "Vidal Health Insurance TPA Pvt. Ltd.", logo: "/images/partners/vidal-health-tpa.png", type: 'TPA' },
  { name: "Family Health Plan Insurance TPA Ltd. (FHPL)", logo: "/images/partners/family-health-tpa.png", type: 'TPA' },
  { name: "Heritage Health Insurance TPA Pvt. Ltd.", logo: "/images/partners/heritage-health-tpa.png", type: 'TPA' },
  { name: "Medsave Health Insurance TPA Ltd.", logo: "/images/partners/medsave-tpa.png", type: 'TPA' },
  { name: "Volo Health Insurance TPA Pvt. Ltd. (Formerly East West Assist)", logo: "/images/partners/volo-health-tpa.png", type: 'TPA' },
  { name: "Genins India Insurance TPA Ltd.", logo: "/images/partners/genins-tpa.jpg", type: 'TPA' },
  { name: "Ericson Insurance TPA Pvt. Ltd.", logo: "https://ericsontpa.com/images/logo.png", type: 'TPA' },
  { name: "Health India Insurance TPA Services Pvt. Ltd.", logo: "https://www.google.com/s2/favicons?domain=healthindiatpa.com&sz=128", type: 'TPA' },
  { name: "Safeway Insurance TPA Pvt. Ltd.", logo: "https://safewaytpa.in/images/logo.png", type: 'TPA' },
  { name: "Vipul MedCorp Insurance TPA Pvt. Ltd.", logo: "https://www.google.com/s2/favicons?domain=vipulmedcorp.com&sz=128", type: 'TPA' } // merged with vidal? keeping for legacy if relevant
];

export const SERVICES: Service[] = [
  {
    id: 'abhyanga',
    title: 'Abhyanga & Massage',
    description: 'Specialized oil application therapies for musculoskeletal strengthening and Vata pacification.',
    fullDescription: 'Abhyanga is not just a massage; it is the transdermal absorption of medicated oils. It improves circulation, tones muscles, calms the nervous system, and lubricates the joints. Our therapies range from full-body rejuvenation to localized treatments for pain.',
    icon: Droplet,
    tags: ['Pain Relief', 'Rejuvenation', 'Vata Care'],
    image: '/images/services/service-abhyanga.jpg',
    subServices: [
      {
        name: 'Abhyanga (Full body)',
        price: 1300,
        description: 'Synchronized full-body massage using warm medicated oils. Improves circulation, relieves fatigue, and promotes sound sleep.',
        image: '/images/services/abhyanga-full.jpg'
      },
      {
        name: 'Sthanik Abhyanga (Local)',
        price: 600,
        description: 'Localized oil application for specific pain points like shoulders or legs. Reduces localized stiffness and inflammation.',
        image: '/images/services/abhyanga-local.jpg'
      },
      {
        name: 'Moordha Taila',
        price: 500,
        description: 'Oil application on the head. Calms the mind, improves vision, and strengthens hair roots.',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Greeva Vasti (Neck)',
        price: 1000,
        description: 'Pooling warm oil on the back of the neck. Specific therapy for Cervical Spondylosis, neck pain, and stiffness.',
        image: '/images/services/abhyanga-neck.webp'
      },
      {
        name: 'Janu Vasti (Single Knee)',
        price: 1000,
        description: 'Pooling warm oil over the knee joint. Highly effective for Osteoarthritis, ligament injuries, and knee pain.',
        image: '/images/services/abhyanga-knee.png'
      },
      {
        name: 'Kati Vasti (Lower Back)',
        price: 1000,
        description: 'Oil retention therapy on the lower back. Best for Lumbar Spondylosis, Sciatica, and chronic backache.',
        image: '/images/services/abhyanga-back.webp'
      },
      {
        name: 'Uro Vasti (Chest/Heart)',
        price: 1000,
        description: 'Pooling warm oil over the chest region. strengthens heart muscles and helps in respiratory conditions.',
        image: '/images/services/abhyanga-chest.jpg'
      },
      {
        name: 'Shiro / Yoni Pichu',
        price: 600,
        description: 'Cotton pad soaked in oil placed on the head or vaginal area. Treats hair fall, stress, or gynecological dryness.',
        image: '/images/services/abhyanga-pichu.jpg'
      },
      {
        name: 'Siro Vasti',
        price: 1200,
        description: 'Retaining oil on the head using a cap. Intense therapy for facial paralysis, migraines, and neurological disorders.',
        image: '/images/services/abhyanga-shirobasti.webp'
      },
      {
        name: 'Shirolepa / Thalapothichil',
        price: 1500,
        description: 'Herbal paste application on the head. Excellent for insomnia, hypertension, stress, and cooling the head.',
        image: '/images/services/abhyanga-lepa.webp'
      }
    ],
    benefits: [
      "Relieves muscle stiffness and joint pain",
      "Improves skin texture and circulation",
      "Reduces physical and mental fatigue",
      "Increases longevity and sleep quality"
    ]
  },
  {
    id: 'swedana',
    title: 'Swedana (Fomentation)',
    description: 'Therapeutic sweating using herbal steam or poultices to relieve stiffness and toxins.',
    fullDescription: 'Swedana is a sudation therapy used to induce sweating with the help of steam or heated boluses (potlis). It helps in liquefying toxins (Ama) and expelling them. It is highly effective for stiffness, heaviness, and coldness in the body.',
    icon: Thermometer,
    tags: ['Stiffness', 'Detox', 'Pain'],
    image: '/images/services/service-swedana.webp',
    subServices: [
      {
        name: 'Nadi Sweda',
        price: 1000,
        description: 'Directed steam via a tube to specific body parts. targets localized pain, stiffness, and frozen shoulder.',
        image: '/images/services/swedana-nadi.webp'
      },
      {
        name: 'Sthanika Nadi Sweda (Local)',
        price: 600,
        description: 'Localized steam therapy for small areas. Ideal for joint stiffness or muscle cramps.',
        image: '/images/services/swedana-nadi-local.webp'
      },
      {
        name: 'Patra Pinda Sweda / Podikkizhi',
        price: 1500,
        description: 'Massage with heated herbal leaf bundles. Best for Rheumatoid Arthritis, sciatica, and Vata disorders.',
        image: '/images/services/swedana-leaf.webp'
      },
      {
        name: 'Sthanika Patra Pinda Sweda',
        price: 700,
        description: 'Localized leaf bundle massage. Relieves pain in specific joints or muscular regions.',
        image: '/images/services/swedana-leaf-local.webp'
      },
      {
        name: 'Dhanya Pinda Sweda',
        price: 1800,
        description: 'Fomentation using warm grain bundles. Reduces inflammation and heaviness in joints.',
        image: '/images/services/swedana-dhanya.webp'
      },
      {
        name: 'Sthanika Dhanyamla Pinda Sweda',
        price: 900,
        description: 'Localized grain bundle therapy. Focused relief for swollen or painful joints.',
        image: '/images/services/swedana-dhanya-local.webp'
      },
      {
        name: 'Dhanyamla Pinda Sweda (Full)',
        price: 1800,
        description: 'Full body grain bundle massage. Effective for widespread inflammation and Ama conditions.',
        image: '/images/services/swedana-dhanyaamla.png'
      },
      {
        name: 'Jambeera Pinda Sweda',
        price: 1500,
        description: 'Bolus massage using lemons and herbs. Helps in frozen shoulder and traumatic injuries.',
        image: '/images/services/swedana-lemon.webp'
      },
      {
        name: 'Sthanika Jambeera Pinda Sweda',
        price: 900,
        description: 'Localized lemon bolus therapy. Rapid relief for acute stiffness and muscle catches.',
        image: '/images/services/swedana-lemon-local.webp'
      },
      {
        name: 'Shashtika Pinda Sweda',
        price: 2000,
        description: 'Rice cooked in medicated milk massage. Nourishing therapy for muscle wasting and weakness.',
        image: '/images/services/swedana-rice.jpg'
      },
      {
        name: 'Sthanika Shashtika Pinda Sweda',
        price: 1250,
        description: 'Localized nourishing rice massage. Strengthens weak limbs or joints post-injury.',
        image: '/images/services/swedana-rice-local.jpg'
      },
      {
        name: 'Valuka Sweda / Manal Kizhi',
        price: 1200,
        description: 'Hot sand bag therapy. Excellent for reducing swelling and stiffness in Rheumatoid Arthritis.',
        image: '/images/services/swedana-sand.webp'
      },
      {
        name: 'Sthanika Valuka Sweda',
        price: 800,
        description: 'Localized sand bag fomentation. Targets specific swollen joints to reduce fluid accumulation.',
        image: '/images/services/swedana-sand-local.webp'
      },
      {
        name: 'Upanaha / Upanaha Sweda',
        price: 700,
        description: 'Warm herbal poultice bandaging. Relieves chronic joint pain and swelling overnight.',
        image: '/images/services/swedana-poultice.jpg'
      }
    ],
    benefits: [
      "Relieves joint stiffness and swelling",
      "Opens blocked channels (Srotas)",
      "Reduces heaviness in the body",
      "Improves mobility"
    ]
  },
  {
    id: 'dhara',
    title: 'Dhara Therapies',
    description: 'Rhythmic pouring of medicated liquids (oil, buttermilk) for neurological & stress disorders.',
    fullDescription: 'Dhara involves the continuous, rhythmic pouring of warm herbal liquid over the forehead or body. It induces a deep state of relaxation, balances brain wave activity, and is profound for stress, insomnia, and psychosomatic disorders.',
    icon: Moon,
    tags: ['Stress', 'Insomnia', 'Neurology'],
    image: '/images/services/dhara-shiro.png',
    subServices: [
      {
        name: 'Shirodhara (Oil)',
        price: 1500,
        description: 'Rhythmic pouring of warm oil on the forehead. The ultimate therapy for stress, anxiety, and sleep disorders.',
        image: '/images/services/dhara-shiro.png'
      },
      {
        name: 'Kashaya Dhara (Whole Body)',
        price: 1800,
        description: 'Pouring of herbal decoctions over the body. Treats skin diseases, eczema, and psoriasis.',
        image: '/images/services/dhara-kashaya.png'
      },
      {
        name: 'Sthanika Kashaya Dhara',
        price: 1000,
        description: 'Localized decoction pouring. Heals wounds, skin rashes, and localized inflammation.',
        image: '/images/services/dhara-local.png'
      },
      {
        name: 'Ksheera Dhara',
        price: 1500,
        description: 'Pouring of medicated milk. Cooling therapy for anxiety, headaches, and Pitta imbalance.',
        image: '/images/services/dhara-milk.png'
      },
      {
        name: 'Sthanika Dhanyamla Dhara',
        price: 1000,
        description: 'Pouring of fermented liquid on specific parts. Reduces inflammation and nerve pain.',
        image: '/images/services/dhara-fermented.png'
      },
      {
        name: 'Takradhara',
        price: 1500,
        description: 'Pouring of medicated buttermilk on forehead. Excellent for psoriasis, insomnia, and greying hair.',
        image: '/images/services/dhara-buttermilk.png'
      }
    ],
    benefits: [
      "Deeply relaxes the nervous system",
      "Treats insomnia and anxiety",
      "Improves memory and focus",
      "Specific dharas help in skin diseases (Takradhara)"
    ]
  },
  {
    id: 'panchakarma',
    title: 'Vamana & Virechana',
    description: 'Deep cellular detoxification procedures to expel chronic toxins (Shodhan).',
    fullDescription: 'The core of Panchakarma. These are intense bio-purification procedures. Vamana (Emesis) expels Kapha toxins, while Virechana (Purgation) expels Pitta toxins. These require strict preparation (Snehapana) and post-care (Samsarjana).',
    icon: ShieldCheck,
    tags: ['Deep Detox', 'Chronic Disease', 'Shodhan'],
    image: '/images/services/service-panchkarma.png',
    subServices: [
      {
        name: 'Snehapana (Ghee Days)',
        price: 700,
        description: 'Oral consumption of medicated ghee. Lubricates channels and loosens deep-seated toxins.',
        image: '/images/services/pk-ghee.png'
      },
      {
        name: 'Vamana (Emesis)',
        price: 5000,
        description: 'Therapeutic vomiting. Clears Kapha toxins; treats asthma, allergies, and skin disorders.',
        image: '/images/services/pk-vamana.png'
      },
      {
        name: 'Virechana (Purgation)',
        price: 3000,
        description: 'Therapeutic purgation. Expels Pitta toxins; best for liver, skin, and digestion issues.',
        image: '/images/services/pk-virechan.png'
      },
      {
        name: 'Samsarjana Krama (7d)',
        price: 5000,
        description: 'Post-detox graduated diet plan. Restores digestive fire (Agni) safely after purification.',
        image: '/images/services/pk-diet.png'
      }
    ],
    benefits: [
      "Eliminates root cause of chronic diseases",
      "Resets metabolism and digestion",
      "Clears skin disorders and allergies",
      "Reverses metabolic syndrome"
    ]
  },
  {
    id: 'basti',
    title: 'Basti Therapies',
    description: 'Medicated enema therapies considered half of all Ayurvedic treatments (Ardha Chikitsa).',
    fullDescription: 'Basti is the most effective treatment for Vata disorders. It involves introducing medicated oils or decoctions into the colon. Since the colon is the seat of Vata, this therapy balances the biological air element, governing nervous and motor functions.',
    icon: Activity,
    tags: ['Vata Control', 'Arthritis', 'Neurology'],
    image: '/images/services/service-bsati.png',
    subServices: [
      {
        name: 'Nirooha Basti',
        price: 1200,
        description: 'Decoction enema. Cleanses the colon, eliminates toxins, and treats arthritis/neuropathy.',
        image: '/images/services/basti-nirooh.png'
      },
      {
        name: 'Matra Basti',
        price: 500,
        description: 'Small oil enema. Nourishes the body, improves strength, and can be taken daily.',
        image: '/images/services/basti-matra.png'
      },
      {
        name: 'Taila Basti',
        price: 1000,
        description: 'Oil enema. Lubricates the colon, relieves constipation, and pacifies Vata dosha.',
        image: '/images/services/basti-taila.png'
      },
      {
        name: 'Uttara Basti',
        price: 2000,
        description: 'Administration of medicine through urethra/vagina. Specialized for infertility and urinary disorders.',
        image: '/images/services/bsati-uttar.png'
      }
    ],
    benefits: [
      "Treats arthritis, sciatica, and back pain",
      "Corrects constipation and gut issues",
      "Highly effective for neurological conditions",
      "Uttara Basti helps in infertility"
    ]
  },
  {
    id: 'netra',
    title: 'Netra (Eye) Therapies',
    description: 'Specialized treatments for vision protection, dry eyes, and strengthening ocular nerves.',
    fullDescription: 'Ayurveda offers unique procedures like Netra Tarpana (retaining medicated ghee over eyes) to nourish the eyes, improve vision, and treat conditions like Dry Eye Syndrome, refractive errors, and optic nerve weakness.',
    icon: Eye,
    tags: ['Vision', 'Screen Strain', 'Eye Care'],
    image: '/images/services/service-netra.png',
    subServices: [
      {
        name: 'Netradhara / Akshiseka',
        price: 900,
        description: 'Washing eyes with herbal liquids. Cleanses eyes and relieves strain/infection.',
        image: '/images/services/netra-wash.png'
      },
      {
        name: 'Tarpana (Per Eye)',
        price: 700,
        description: 'Retaining ghee around eyes. Deeply nourishing for dry eyes, myopia, and digital strain.',
        image: '/images/services/netra-tarpana.png'
      },
      {
        name: 'Putapaka',
        price: 1000,
        description: 'Application of herbal juice to eyes. Similar to Tarpana but restores strength to eyes.',
        image: '/images/services/netra-putapaka.png'
      },
      {
        name: 'Anjana',
        price: 500,
        description: 'Application of collyrium. Cleanses eyes and improves vision clarity.',
        image: '/images/services/netra-anjana.png'
      },
      {
        name: 'Bidalaka (Both Eyes)',
        price: 600,
        description: 'Herbal paste on eyelids. Reduces burning sensation and eye inflammation.',
        image: '/images/services/netra-bidalak.png'
      }
    ],
    benefits: [
      "Relieves Digital Eye Strain",
      "Strengthens optic nerves",
      "Reduces dryness and irritation",
      "Prevents early cataract"
    ]
  },
  {
    id: 'nasya',
    title: 'Nasal & Head Therapies',
    description: 'Administration of medicine through nasal route for ENT and Brain health.',
    fullDescription: 'The nose is the doorway to the brain. Nasya involves instilling medicated drops into the nostrils. It is the treatment of choice for sinusitis, migraines, hair fall, and hormonal issues governed by the pituitary gland.',
    icon: Wind,
    tags: ['Migraine', 'Sinus', 'Hormones'],
    image: '/images/services/services-nasya.png',
    subServices: [
      {
        name: 'Nasya',
        price: 700,
        description: 'Nasal drops administration. Clears sinuses, treats migraines, and improves brain function.',
        image: '/images/services/nasya-drops.png'
      },
      {
        name: 'Dhoomapana',
        price: 700,
        description: 'Medicinal herbal smoke inhalation. Removes excess mucus and clears the throat/nose.',
        image: '/images/services/nasya-smoke.png'
      },
      {
        name: 'Ksheera Dhooma',
        price: 1000,
        description: 'Steam with herbal milk. Specific for facial paralysis and nervous disorders of the face.',
        image: '/images/services/nasya-steam.png'
      },
      {
        name: 'Thalam',
        price: 600,
        description: 'Retention of medicated oil on the crown. Calms the mind and treats insomnia.',
        image: '/images/services/nasya-thalam.png'
      },
      {
        name: 'Eshana',
        price: 700,
        description: 'Probing therapy for sinus. Specialized technique for chronic sinusitis drainage.',
        image: '/images/services/nasya-eshana.png'
      }
    ],
    benefits: [
      "Clears sinus congestion",
      "Relieves migraine and tension headaches",
      "Prevents premature graying of hair",
      "Improves clarity of senses"
    ]
  },
  {
    id: 'oral',
    title: 'Oral Therapies',
    description: 'Procedures for oral hygiene, gums, and throat health.',
    fullDescription: 'Specialized gargling (Kabala/Gandoosha) procedures using medicated oils or decoctions.',
    icon: Smile,
    tags: ['Dental', 'Throat', 'Detox'],
    image: '/images/services/services-oral.png',
    subServices: [
      {
        name: 'Kabala',
        price: 390,
        description: 'Gargling with medicated liquids. Strengthens gums and relieves throat pain.',
        image: '/images/services/oral-gargle.png'
      },
      {
        name: 'Gandoosha (Oil Pulling)',
        price: 450,
        description: 'Holding liquid in the mouth. Improves taste perception and strengthens teeth.',
        image: '/images/services/oral-holding.png'
      },
      {
        name: 'Takra Pana',
        price: 400,
        description: 'Medicated buttermilk intake. Excellent for gut health and oral ulcers.',
        image: '/images/services/oral-takra.png'
      }
    ],
    benefits: [
      "Strengthens gums and teeth",
      "Improves voice quality",
      "Enhances sense of taste"
    ]
  },
  {
    id: 'rakta',
    title: 'Bloodletting & Invasive',
    description: 'Para-surgical procedures to release toxic blood for skin and vascular disorders.',
    fullDescription: 'Raktamokshana is a procedure to remove vitiated blood. We use safe methods like Jalouka (Leech Therapy) for localized toxicity (like eczema, varicose veins) or Siravyadha (Venesection) for systemic issues.',
    icon: HeartPulse,
    tags: ['Skin', 'Varicose Veins', 'Pain'],
    image: '/images/services/service-rakta.png',
    subServices: [
      {
        name: 'Siravyadha / Rakta Moksha',
        price: 1000,
        description: 'Therapeutic venesection. Rapidly reduces high blood pressure and blood impurities.',
        image: '/images/services/rakta-siravyadhh.png'
      },
      {
        name: 'Prachanna',
        price: 700,
        description: 'Superficial skin pricking. Drains localized blood congestion in eczema/alopecia.',
        image: '/images/services/rakta-prick.png'
      },
      {
        name: 'Jaloukavacharana (Leech)',
        price: 1000,
        description: 'Leech therapy. Enzymatic blood purification for non-healing ulcers and varicose veins.',
        image: '/images/services/rakta-leech.png'
      },
      {
        name: 'Agnikarma (Thermal)',
        price: 1200,
        description: 'Thermal cautery. Instant relief for heel pain, tendonitis, and corns.',
        image: '/images/services/rakta-agni.png'
      }
    ],
    benefits: [
      "Immediate relief in acute pain (Agnikarma)",
      "Treats non-healing ulcers and acne",
      "Relieves deep seated inflammation",
      "Effective for varicose veins"
    ]
  },
  {
    id: 'women',
    title: 'Women\'s Health',
    description: 'Gynecological procedures for reproductive health and hygiene.',
    fullDescription: 'Specific localized therapies for maintaining vaginal health and treating infections.',
    icon: PlusCircle,
    tags: ['Gynecology', 'Hygiene'],
    image: '/images/services/service-women.png',
    subServices: [
      {
        name: 'Yoni Prakshalana',
        price: 500,
        description: 'Vaginal douche with herbal decoctions. Treats infections, white discharge, and odors.',
        image: '/images/services/women-wash.png'
      },
      {
        name: 'Yoni Dhoopana',
        price: 500,
        description: 'Vaginal fumigation with herbs. Disinfects the area and aids postpartum recovery.',
        image: '/images/services/women-smoke.png'
      }
    ],
    benefits: [
      "Treats vaginal infections",
      "Promotes reproductive hygiene",
      "Balances local pH"
    ]
  },
  {
    id: 'others',
    title: 'Others & Wellness',
    description: 'Miscellaneous therapeutic and rehabilitation procedures.',
    fullDescription: 'Additional therapies for pain management, rehabilitation, and general wellness including Yoga.',
    icon: Sun,
    tags: ['Rehab', 'Wellness', 'Yoga'],
    image: '/images/services/services-others.png',
    subServices: [
      {
        name: 'Anchana (Traction)',
        price: 500,
        description: 'Manual or mechanical traction. Relieves spinal compression and muscle spasm.',
        image: '/images/services/others-traction.png'
      },
      {
        name: 'Aschothana',
        price: 500,
        description: 'Eye drops therapy. Simple effective treatment for minor eye infections.',
        image: '/images/services/netra-aschyotana.png'
      },
      {
        name: 'Karnapoorana (Ear)',
        price: 700,
        description: 'Filling ears with oil. Prevents earwax, improves hearing, and treats tinnitus.',
        image: '/images/services/nasya-ear.png'
      },
      {
        name: 'Lekhana',
        price: 700,
        description: 'Scraping therapy. Removes excess tissue or fat from specific areas.',
        image: '/images/services/rakta-scrapping.png'
      },
      {
        name: 'Pindi',
        price: 600,
        description: 'Bolus application on eyes. Cools the eyes and relieves pain.',
        image: '/images/services/netra-pindi.png'
      },
      {
        name: 'Yoga Session',
        price: 500,
        description: 'Therapeutic Yoga. Asanas and Pranayama tailored to your disease condition.',
        image: '/images/services/others-yoga.png'
      }
    ],
    benefits: [
      "Improve flexibility",
      "Specific organ care (Ears)",
      "Holistic well-being"
    ]
  }
];

export const PROGRAMS: Program[] = [
  {
    id: 'thyroid',
    title: 'Thyroid Reset Program',
    subtitle: 'Manage Hypothyroidism Naturally',
    duration: '3 Months',
    description: 'A comprehensive protocol focusing on Agni (metabolism) correction and hormonal balance through diet and Udvartana therapy.',
    idealFor: ['Hypothyroidism', 'Hashimoto’s', 'Weight gain due to thyroid'],
    includes: ['Nadi Pariksha (Pulse Diagnosis)', 'Udhvartana (Dry Powder Massage)', 'Nasya (Nasal Administration)', 'Virechana (Therapeutic Purgation)'],
    icon: Activity
  },
  {
    id: 'diabetes',
    title: 'Diabetes & Metabolic Rebalance',
    subtitle: 'Reversing Insulin Resistance',
    duration: '6 Months',
    description: 'Targeting the root cause (Meda-dhatu dushti) to improve insulin sensitivity and reduce dependency on medicines.',
    idealFor: ['Type 2 Diabetes', 'Prediabetes', 'Metabolic Syndrome'],
    includes: ['Takradhara (Buttermilk Pouring)', 'Abhyanga (Herbal Oil Massage)', 'Virechana Karma', 'Specific Prameha Diet Chart'],
    icon: Droplet
  },
  {
    id: 'ckd',
    title: 'CKD Integrative Support',
    subtitle: 'Protecting Kidney Function',
    duration: 'Ongoing',
    description: 'Specialized care for CKD Stage 2-3 to stabilize creatinine levels and improve quality of life using Rasayana therapy.',
    idealFor: ['CKD Stage 2-3', 'Diabetic Nephropathy', 'High Creatinine'],
    includes: ['Punarnavadi Basti (Medicated Enema)', 'Nabhi Basti (Navel Therapy)', 'Renal-safe Rasayana Herbs', 'Gokshura-Siddha Protocol'],
    icon: Stethoscope
  },
  {
    id: 'stress',
    title: 'Stress Relief Panchakarma',
    subtitle: 'Mental & Physical Reset',
    duration: '7 or 14 Days',
    description: 'An immersive in-clinic program using Shirodhara and Abhyanga to calm the Vata dosha and reset the nervous system.',
    idealFor: ['Insomnia', 'High Anxiety', 'Burnout', 'Chronic Fatigue'],
    includes: ['Daily Shirodhara (Oil Flow Therapy)', 'Shiro-Abhyanga (Head Massage)', 'Nasya Karma', 'Pranayama & Meditation'],
    icon: Moon
  },
  {
    id: 'weight',
    title: 'Weight Loss & Metabolic Fatigue',
    subtitle: 'Sustainable Fat Loss',
    duration: '3 Months',
    description: 'Focuses on Lekhana (scraping) therapies and correcting metabolic fire to reduce visceral fat.',
    idealFor: ['Obesity (BMI > 30)', 'Post-partum Weight', 'Sluggish Metabolism'],
    includes: ['Triphala Udhvartana (Scrub)', 'Lekhana Basti (Scraping Enema)', 'Swedana (Herbal Steam)', 'Langhana (Fasting Protocol)'],
    icon: Scale
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Nandini Sharma',
    condition: 'General Wellness',
    text: 'Had a great experience here. The doctor is super patient, friendly, and well behaved. I feel so much better now and would definitely recommend!! Great support and care throughout.',
    rating: 5
  },
  {
    id: '2',
    name: 'Krishna Dhobi',
    condition: 'Hair Loss & Weight Loss',
    text: 'I have dandruff and hair loss problems. After Dr. Jitendra\'s treatment, in just one week my hair problems reduced and weight loss also happened. Highly effective.',
    rating: 5
  },
  {
    id: '3',
    name: 'Ranjana Guha',
    condition: 'Skin Disease',
    text: 'I was suffering from a skin disease. Dr. Jitendra gave me a unique therapy, and within a week I am totally okay. He is a superb, humble, and sweet-natured person. Thank god I found a doctor like him.',
    rating: 5
  },
  {
    id: '4',
    name: 'Shaikh Amrin',
    condition: 'Authentic Care',
    text: 'Dr. Jinendra is one of the kindest and most humble doctors I\'ve known. He offers brilliant knowledge in Ayurvedic medicine. The key point is his follow-up care.',
    rating: 5
  },
  {
    id: '5',
    name: 'Aashima Singh',
    condition: 'Expert Consultation',
    text: 'Very good experience with Jinendra Sir, he is an expert in his own field. The approach is very professional yet traditional.',
    rating: 5
  }
];

