import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, Language } from '../translations';

describe('translations', () => {
  const languages: Language[] = ['en', 'hi', 'gu'];

  languages.forEach(lang => {
    describe(`Language: ${lang}`, () => {
      it('should have nav section', () => {
        expect(TRANSLATIONS[lang].nav).toBeDefined();
        expect(TRANSLATIONS[lang].nav.home).toBeDefined();
        expect(TRANSLATIONS[lang].nav.about).toBeDefined();
        expect(TRANSLATIONS[lang].nav.services).toBeDefined();
        expect(TRANSLATIONS[lang].nav.programs).toBeDefined();
        expect(TRANSLATIONS[lang].nav.tools).toBeDefined();
        expect(TRANSLATIONS[lang].nav.book).toBeDefined();
      });

      it('should have hero section', () => {
        expect(TRANSLATIONS[lang].hero).toBeDefined();
        expect(TRANSLATIONS[lang].hero.tagline).toBeDefined();
      });

      it('should have footer section', () => {
        expect(TRANSLATIONS[lang].footer).toBeDefined();
        expect(TRANSLATIONS[lang].footer.explore).toBeDefined();
      });

      it('should have common section', () => {
        expect(TRANSLATIONS[lang].common).toBeDefined();
        expect(TRANSLATIONS[lang].common.book_consultation).toBeDefined();
      });
    });
  });
});