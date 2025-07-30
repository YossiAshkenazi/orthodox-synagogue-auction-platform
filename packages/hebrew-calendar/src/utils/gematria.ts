/**
 * Hebrew Gematria (Numerology) Utilities
 * Supports auction multipliers and Hebrew numerical significance
 */

import { GematriaCalculation, GematriaMethod, GematriaMultiplier, HebrewCalendarError, ErrorCode } from '../types/index.js';

/**
 * Hebrew letter to numerical value mapping (standard gematria)
 */
const GEMATRIA_VALUES: Record<string, number> = {
  // Units (1-9)
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  // Tens (10-90)
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  // Hundreds (100-900)
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
  // Final letters (when at end of word)
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

/**
 * Alternative values for final letters in "large" gematria
 */
const LARGE_GEMATRIA_FINALS: Record<string, number> = {
  'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900
};

/**
 * Common Hebrew words and their gematria values for auction multipliers
 */
export const COMMON_MULTIPLIERS: GematriaMultiplier[] = [
  {
    nameEnglish: 'Chai',
    nameHebrew: 'חי',
    value: 18,
    significance: 'Life - most popular multiplier in Jewish giving',
    commonUse: true
  },
  {
    nameEnglish: 'Double Chai',
    nameHebrew: 'חי כפול',
    value: 36,
    significance: 'Double life - double blessing',
    commonUse: true
  },
  {
    nameEnglish: 'Shalom',
    nameHebrew: 'שלום',
    value: 376,
    significance: 'Peace - wholeness and completion',
    commonUse: false
  },
  {
    nameEnglish: 'Tzedakah',
    nameHebrew: 'צדקה',
    value: 199,
    significance: 'Charity/righteousness - core Jewish value',
    commonUse: true
  },
  {
    nameEnglish: 'Mitzvah',
    nameHebrew: 'מצוה',
    value: 141,
    significance: 'Commandment - good deed',
    commonUse: true
  },
  {
    nameEnglish: 'Yeshuah',
    nameHebrew: 'ישועה',
    value: 391,
    significance: 'Salvation - divine rescue',
    commonUse: false
  },
  {
    nameEnglish: 'Bracha',
    nameHebrew: 'ברכה',
    value: 227,
    significance: 'Blessing - divine favor',
    commonUse: true
  },
  {
    nameEnglish: 'Kedushah',
    nameHebrew: 'קדושה',
    value: 415,
    significance: 'Holiness - sanctity',
    commonUse: false
  },
  {
    nameEnglish: 'Ahavah',
    nameHebrew: 'אהבה',
    value: 13,
    significance: 'Love - divine and human connection',
    commonUse: true
  },
  {
    nameEnglish: 'Emunah',
    nameHebrew: 'אמונה',
    value: 102,
    significance: 'Faith - trust in divine providence',
    commonUse: true
  }
];

/**
 * Calculate gematria value of Hebrew text
 */
export function calculateGematria(
  text: string, 
  method: GematriaMethod = GematriaMethod.STANDARD
): GematriaCalculation {
  try {
    // Clean the text - remove nikud, spaces, and non-Hebrew characters
    const cleanText = text
      .replace(/[\u0590-\u05BD\u05BF-\u05C7\u05F3\u05F4]/g, '') // Remove nikud and punctuation
      .replace(/[^\u05D0-\u05EA]/g, ''); // Keep only Hebrew letters

    if (!cleanText) {
      throw new HebrewCalendarError(
        'No Hebrew letters found in input text',
        ErrorCode.CALCULATION_ERROR
      );
    }

    let value = 0;
    const letters = cleanText.split('');

    switch (method) {
      case GematriaMethod.STANDARD:
        value = calculateStandardGematria(letters);
        break;
      case GematriaMethod.LARGE:
        value = calculateLargeGematria(letters);
        break;
      case GematriaMethod.SMALL:
        value = calculateSmallGematria(letters);
        break;
      case GematriaMethod.ORDINAL:
        value = calculateOrdinalGematria(letters);
        break;
      case GematriaMethod.REDUCED:
        value = calculateReducedGematria(letters);
        break;
      default:
        throw new HebrewCalendarError(
          `Unsupported gematria method: ${method}`,
          ErrorCode.CALCULATION_ERROR
        );
    }

    // Find common multipliers that match this value
    const matchingMultipliers = COMMON_MULTIPLIERS.filter(m => m.value === value);

    return {
      originalText: text,
      value,
      method,
      significance: getGematriaSignificance(value),
      commonMultipliers: matchingMultipliers
    };

  } catch (error) {
    throw new HebrewCalendarError(
      `Gematria calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCode.CALCULATION_ERROR,
      { text, method }
    );
  }
}

/**
 * Standard gematria calculation
 */
function calculateStandardGematria(letters: string[]): number {
  return letters.reduce((sum, letter, index) => {
    const value = GEMATRIA_VALUES[letter];
    if (value === undefined) {
      throw new HebrewCalendarError(
        `Unknown Hebrew letter: ${letter}`,
        ErrorCode.CALCULATION_ERROR
      );
    }
    return sum + value;
  }, 0);
}

/**
 * Large gematria (final letters get higher values)
 */
function calculateLargeGematria(letters: string[]): number {
  return letters.reduce((sum, letter, index) => {
    // Check if this is a final letter at the end of the word
    const isFinalLetter = LARGE_GEMATRIA_FINALS[letter];
    const isAtEnd = index === letters.length - 1;
    
    if (isFinalLetter && isAtEnd) {
      return sum + LARGE_GEMATRIA_FINALS[letter];
    }
    
    const value = GEMATRIA_VALUES[letter];
    if (value === undefined) {
      throw new HebrewCalendarError(
        `Unknown Hebrew letter: ${letter}`,
        ErrorCode.CALCULATION_ERROR
      );
    }
    return sum + value;
  }, 0);
}

/**
 * Small gematria (reduce each letter to single digit)
 */
function calculateSmallGematria(letters: string[]): number {
  return letters.reduce((sum, letter) => {
    const value = GEMATRIA_VALUES[letter];
    if (value === undefined) {
      throw new HebrewCalendarError(
        `Unknown Hebrew letter: ${letter}`,
        ErrorCode.CALCULATION_ERROR
      );
    }
    // Reduce to single digit
    const reduced = value > 9 ? reduceToSingleDigit(value) : value;
    return sum + reduced;
  }, 0);
}

/**
 * Ordinal gematria (א=1, ב=2, ..., ת=22)
 */
function calculateOrdinalGematria(letters: string[]): number {
  const hebrewAlphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
  
  return letters.reduce((sum, letter) => {
    const position = hebrewAlphabet.indexOf(letter);
    if (position === -1) {
      // Handle final letters
      const finalMap: Record<string, number> = {
        'ך': hebrewAlphabet.indexOf('כ'),
        'ם': hebrewAlphabet.indexOf('מ'),
        'ן': hebrewAlphabet.indexOf('נ'),
        'ף': hebrewAlphabet.indexOf('פ'),
        'ץ': hebrewAlphabet.indexOf('צ')
      };
      const finalPosition = finalMap[letter];
      if (finalPosition === -1) {
        throw new HebrewCalendarError(
          `Unknown Hebrew letter: ${letter}`,
          ErrorCode.CALCULATION_ERROR
        );
      }
      return sum + (finalPosition + 1);
    }
    return sum + (position + 1);
  }, 0);
}

/**
 * Reduced gematria (sum until single digit)
 */
function calculateReducedGematria(letters: string[]): number {
  const standardValue = calculateStandardGematria(letters);
  return reduceToSingleDigit(standardValue);
}

/**
 * Reduce a number to single digit by summing its digits
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

/**
 * Get significance explanation for a gematria value
 */
function getGematriaSignificance(value: number): string {
  const significanceMap: Record<number, string> = {
    1: 'Unity, God\'s oneness (Echad)',
    7: 'Completion, perfection (Shabbat)',
    8: 'Renewal, circumcision (Brit Milah)',
    10: 'Completion of digits, minyan',
    13: 'Love (Ahavah), unity with God (Echad)',
    18: 'Life (Chai) - most blessed number',
    26: 'God\'s name (YHVH)',
    36: 'Double Chai, double life',
    40: 'Transformation, testing period',
    50: 'Jubilee, freedom',
    72: 'Mystical name of God',
    100: 'Completeness, perfection',
    120: 'Full life span (Moses\' age)',
    180: 'Ten times Chai',
    248: 'Positive commandments',
    365: 'Negative commandments',
    613: 'Total commandments (Taryag Mitzvot)'
  };

  return significanceMap[value] || `Numerical value: ${value}`;
}

/**
 * Get suggested auction multipliers based on a base amount
 */
export function getSuggestedMultipliers(baseAmount: number): GematriaMultiplier[] {
  return COMMON_MULTIPLIERS
    .filter(m => m.commonUse)
    .map(m => ({
      ...m,
      value: baseAmount * m.value
    }))
    .sort((a, b) => a.value - b.value);
}

/**
 * Find Hebrew words that equal a specific gematria value
 */
export function findWordsByValue(targetValue: number): GematriaMultiplier[] {
  return COMMON_MULTIPLIERS.filter(m => m.value === targetValue);
}

/**
 * Calculate multiple gematria methods for a Hebrew word
 */
export function calculateAllMethods(text: string): Record<GematriaMethod, number> {
  const results: Record<GematriaMethod, number> = {} as any;
  
  for (const method of Object.values(GematriaMethod)) {
    try {
      const calculation = calculateGematria(text, method);
      results[method] = calculation.value;
    } catch (error) {
      // Skip methods that fail
      continue;
    }
  }
  
  return results;
}

/**
 * Validate Hebrew text for gematria calculation
 */
export function isValidHebrewText(text: string): boolean {
  // Remove nikud and check if any Hebrew letters remain
  const cleanText = text
    .replace(/[\u0590-\u05BD\u05BF-\u05C7\u05F3\u05F4]/g, '')
    .replace(/[^\u05D0-\u05EA]/g, '');
  
  return cleanText.length > 0;
}