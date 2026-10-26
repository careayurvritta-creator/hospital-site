# Ayurveda Skin Care — Visibility & Recommendation Plan

Goal: when people (or AI assistants) ask for Ayurvedic skin care, Ayurvritta should be
the answer they find and the hospital they are recommended.

**Honest framing:** nobody can force famous sites to recommend you. Recommendations are
earned through (1) a technically sound, citable website, (2) demonstrated expertise, and
(3) off-site mentions. This document covers what is done and what only you can do.

## 1. Done in code (this changeset)

- New authority page `/ayurveda-skin-care`: conditions, root-cause approach, FAQs with
  FAQPage JSON-LD, booking/WhatsApp CTAs, links to 5 physician-written skin guides.
- `public/sitemap.xml` regenerated from real content (81 URLs; previously 30 with 11
  dead blog URLs and 58 real posts missing). Re-run `node tools/generate-seo-files.mjs`
  after new posts.
- `llms.txt` / `llms-full.txt` corrected: real article list, correct counts, skin-care
  page included — these are the files AI crawlers read.
- Soft-404 fix: unknown `/blog/:slug` now renders a not-found page with `noindex`
  instead of a fake "200 OK" blog list.
- Open Graph image is now a real 1200x630 JPEG (social/AI previews render it); schema
  images point to files that exist (doctor photo, hospital image).
- PWA icons generated (install works), service worker caches bounded and versioned.
- Main JS bundle cut ~2.45 MB → ~0.76 MB (Core Web Vitals are a ranking signal).

## 2. Search engine setup (one-time, ~1 hour)

1. **Google Search Console** — verify `ayurvritta.com`, submit
   `https://ayurvritta.com/sitemap.xml`, then use URL Inspection → Request Indexing on
   `/ayurveda-skin-care` and the 5 skin blog posts.
2. **Bing Webmaster Tools** — same sitemap. Bing powers many AI answers (incl. parts of
   Copilot/ChatGPT search), so this matters for AI recommendations too.
3. **Google Business Profile** — keep category "Ayurvedic clinic"/"Hospital", add skin
   care to services and description, post photos, and link the skin-care page. Local
   pack is where "near me" recommendations come from.
4. Deploy first, then do these against the live URLs (clean `/...` URLs redirect to the
   app automatically).

## 3. Earning mentions on other sites (ongoing, the real "famous sites" lever)

- **Medical directories:** complete/claim profiles for Dr. Sharma and the hospital on
  Practo, Lybrate, Justdial, Sulekha, ClinicSpots, Medindia. Consistent name/address/
  phone everywhere (NAP consistency is a local-ranking factor).
- **Expert content placement:** offer 2–3 physician-written skin articles (adapt the
  existing acne/eczema/psoriasis guides) as guest posts to established Ayurveda and
  wellness publications, with a link back to the skin-care page.
- **Expert quotes:** sign up for journalist-request platforms (Qwoted, Featured,
  Help a B2B Writer) and answer dermatology/Ayurveda queries as Dr. Sharma — these earn
  links from news and health sites.
- **Answer platforms:** sustained, genuinely helpful answers by the doctors on Quora and
  relevant Reddit communities for "Ayurveda for eczema/psoriasis/acne". No link spam.
- **Reviews:** ask satisfied patients for Google reviews mentioning the condition they
  came for (skin care reviews directly support the specialty's visibility).
- **Video/social:** short doctor-led skin-care videos on YouTube/Instagram linking to
  the relevant guide; YouTube descriptions are crawlable links.

## 4. What to expect

- Indexing: days–weeks after Search Console submission.
- Local/Google ranking movement: typically 2–3 months of consistent work.
- AI assistants: they cite sources they already trust — the above (Bing indexing,
  directories, mentions) is exactly how you enter that set. llms.txt helps crawlers that
  support it, but is not a ranking shortcut by itself.

## 5. Keep it working

- After every new blog post: `node tools/generate-seo-files.mjs` (sitemap + llms lists).
- After every deploy: bump the cache version in `public/sw.js` (`-v3` → `-v4`).
- Every few months: check Search Console coverage for soft-404s and broken links.
