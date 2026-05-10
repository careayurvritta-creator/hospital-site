import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, Language } from '../../translations';

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
        expect(TRANSLATIONS[lang].nav.booking).toBeDefined();
      });

      it('should have home section', () => {
        expect(TRANSLATIONS[lang].home).toBeDefined();
        expect(TRANSLATIONS[lang].home.hero).toBeDefined();
      });

      it('should have footer section', () => {
        expect(TRANSLATIONS[lang].footer).toBeDefined();
        expect(TRANSLATIONS[lang].footer.contact).toBeDefined();
      });

      it('should have booking section', () => {
        expect(TRANSLATIONS[lang].booking).toBeDefined();
        expect(TRANSLATIONS[lang].booking.form).toBeDefined();
      });
    });
  });
});