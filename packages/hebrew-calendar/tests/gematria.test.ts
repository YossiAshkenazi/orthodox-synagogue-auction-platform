/**
 * Tests for Hebrew Gematria Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGematria,
  getSuggestedMultipliers,
  findWordsByValue,
  calculateAllMethods,
  isValidHebrewText,
  COMMON_MULTIPLIERS
} from '../src/utils/gematria';
import { GematriaMethod } from '../src/types';

describe('Gematria Calculations', () => {
  describe('calculateGematria - Standard Method', () => {
    it('should calculate gematria for simple Hebrew words', () => {
      // חי (Chai) = 8 + 10 = 18
      const chai = calculateGematria('חי');
      expect(chai.value).toBe(18);
      expect(chai.method).toBe(GematriaMethod.STANDARD);
      expect(chai.originalText).toBe('חי');
    });

    it('should calculate gematria for words with final letters', () => {
      // שלום = 300 + 30 + 6 + 40 = 376
      const shalom = calculateGematria('שלום');
      expect(shalom.value).toBe(376);
    });

    it('should handle text with nikud by removing it', () => {
      // Same as חי but with nikud
      const chaiWithNikud = calculateGematria('חַי');
      expect(chaiWithNikud.value).toBe(18);
    });

    it('should find matching common multipliers', () => {
      const chai = calculateGematria('חי');
      expect(chai.commonMultipliers).toHaveLength(1);
      expect(chai.commonMultipliers[0].nameEnglish).toBe('Chai');
    });

    it('should calculate complex Hebrew phrases', () => {
      // ברוך = 2 + 200 + 6 + 20 = 228
      const baruch = calculateGematria('ברוך');
      expect(baruch.value).toBe(228);
    });

    it('should throw error for non-Hebrew text', () => {
      expect(() => calculateGematria('hello')).toThrow();
      expect(() => calculateGematria('123')).toThrow();
      expect(() => calculateGematria('')).toThrow();
    });
  });

  describe('calculateGematria - Alternative Methods', () => {
    it('should calculate small gematria correctly', () => {
      // חי = 8 + 10 = 18 -> 1 + 8 = 9
      const chai = calculateGematria('חי', GematriaMethod.SMALL);
      expect(chai.value).toBe(9);
    });

    it('should calculate ordinal gematria correctly', () => {
      // א is 1st letter, ב is 2nd, etc.
      const alefBet = calculateGematria('אב', GematriaMethod.ORDINAL);
      expect(alefBet.value).toBe(3); // 1 + 2
    });

    it('should calculate reduced gematria correctly', () => {
      // Large number reduced to single digit
      const result = calculateGematria('תורה', GematriaMethod.REDUCED);
      // תורה = 400 + 6 + 200 + 5 = 611 -> 6 + 1 + 1 = 8
      expect(result.value).toBe(8);
    });

    it('should handle final letters differently in large gematria', () => {
      // Testing with final mem at end of word
      const standard = calculateGematria('אם', GematriaMethod.STANDARD);
      const large = calculateGematria('אם', GematriaMethod.LARGE);
      
      // In standard: א (1) + ם (40) = 41
      expect(standard.value).toBe(41);
      // In large: א (1) + ם (600) = 601
      expect(large.value).toBe(601);
    });
  });

  describe('Common Multipliers', () => {
    it('should have all expected common multipliers', () => {
      const expectedMultipliers = ['Chai', 'Double Chai', 'Ahavah', 'Tzedakah', 'Mitzvah', 'Bracha'];
      const actualNames = COMMON_MULTIPLIERS.map(m => m.nameEnglish);
      
      expectedMultipliers.forEach(name => {
        expect(actualNames).toContain(name);
      });
    });

    it('should have correct values for known multipliers', () => {
      const chai = COMMON_MULTIPLIERS.find(m => m.nameEnglish === 'Chai');
      expect(chai?.value).toBe(18);
      
      const doubleChai = COMMON_MULTIPLIERS.find(m => m.nameEnglish === 'Double Chai');
      expect(doubleChai?.value).toBe(36);
      
      const ahavah = COMMON_MULTIPLIERS.find(m => m.nameEnglish === 'Ahavah');
      expect(ahavah?.value).toBe(13);
    });

    it('should have Hebrew names for all multipliers', () => {
      COMMON_MULTIPLIERS.forEach(multiplier => {
        expect(multiplier.nameHebrew).toBeTruthy();
        expect(isValidHebrewText(multiplier.nameHebrew)).toBe(true);
      });
    });
  });

  describe('Auction Multiplier Suggestions', () => {
    it('should suggest common multipliers for auction amounts', () => {
      const baseAmount = 100;
      const suggestions = getSuggestedMultipliers(baseAmount);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].value).toBe(baseAmount * suggestions[0].value);
      
      // Should be sorted by value
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].value).toBeGreaterThanOrEqual(suggestions[i-1].value);
      }
    });

    it('should only suggest commonly used multipliers', () => {
      const suggestions = getSuggestedMultipliers(100);
      suggestions.forEach(suggestion => {
        const original = COMMON_MULTIPLIERS.find(m => m.nameEnglish === suggestion.nameEnglish);
        expect(original?.commonUse).toBe(true);
      });
    });
  });

  describe('Helper Functions', () => {
    it('should find words by gematria value', () => {
      const wordsFor18 = findWordsByValue(18);
      expect(wordsFor18).toHaveLength(1);
      expect(wordsFor18[0].nameEnglish).toBe('Chai');
    });

    it('should calculate all methods for a word', () => {
      const allMethods = calculateAllMethods('חי');
      
      expect(allMethods[GematriaMethod.STANDARD]).toBe(18);
      expect(allMethods[GematriaMethod.SMALL]).toBe(9);
      expect(allMethods[GematriaMethod.ORDINAL]).toBeDefined();
      expect(allMethods[GematriaMethod.REDUCED]).toBeDefined();
    });

    it('should validate Hebrew text correctly', () => {
      expect(isValidHebrewText('שלום')).toBe(true);
      expect(isValidHebrewText('חַיִּים')).toBe(true); // With nikud
      expect(isValidHebrewText('hello')).toBe(false);
      expect(isValidHebrewText('123')).toBe(false);
      expect(isValidHebrewText('')).toBe(false);
      expect(isValidHebrewText('שלום world')).toBe(true); // Mixed text
    });
  });

  describe('Gematria Significance', () => {
    it('should provide significance for special numbers', () => {
      const chai = calculateGematria('חי');
      expect(chai.significance).toContain('Life');
      
      const echad = calculateGematria('אחד'); // 13
      expect(echad.significance).toContain('Love');
    });
  });

  describe('Error Handling', () => {
    it('should handle Hebrew text with spaces', () => {
      const result = calculateGematria('אני אוהב');
      expect(result.value).toBeGreaterThan(0);
    });

    it('should handle Hebrew text with punctuation', () => {
      const result = calculateGematria('שלום!');
      expect(result.value).toBe(376); // Same as שלום
    });

    it('should throw specific error for invalid input', () => {
      expect(() => calculateGematria('', GematriaMethod.STANDARD))
        .toThrow('No Hebrew letters found');
    });
  });
});