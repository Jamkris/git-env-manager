import { describe, it, expect, beforeEach } from 'vitest';
import { setLocale, getLocale, t, isValidLocale } from '../../src/i18n/index.js';
import { en } from '../../src/i18n/locales/en.js';
import { ko } from '../../src/i18n/locales/ko.js';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('en');
  });

  describe('locale state', () => {
    it('defaults to English', () => {
      expect(getLocale()).toBe('en');
    });

    it('switches to Korean', () => {
      setLocale('ko');
      expect(getLocale()).toBe('ko');
    });

    it('switches back to English', () => {
      setLocale('ko');
      setLocale('en');
      expect(getLocale()).toBe('en');
    });
  });

  describe('t()', () => {
    it('returns English messages by default', () => {
      expect(t().initSuccess).toBe(en.initSuccess);
    });

    it('returns Korean messages after setLocale("ko")', () => {
      setLocale('ko');
      expect(t().initSuccess).toBe(ko.initSuccess);
    });

    it('returns different strings for en vs ko', () => {
      expect(en.initSuccess).not.toBe(ko.initSuccess);
    });
  });

  describe('parameterized messages', () => {
    it('profileAdded includes the name', () => {
      expect(t().profileAdded('test')).toContain('test');
    });

    it('sshKeyNotFound includes the path', () => {
      expect(t().sshKeyNotFound('/some/path')).toContain('/some/path');
    });

    it('langUpdated includes the locale', () => {
      expect(t().langUpdated('ko')).toContain('ko');
    });

    it('langInvalid includes the locale', () => {
      expect(t().langInvalid('fr')).toContain('fr');
    });

    it('Korean parameterized messages work too', () => {
      setLocale('ko');
      expect(t().profileAdded('work')).toContain('work');
      expect(t().sshKeyNotFound('~/.ssh/key')).toContain('~/.ssh/key');
    });
  });

  describe('isValidLocale', () => {
    it('returns true for "en"', () => {
      expect(isValidLocale('en')).toBe(true);
    });

    it('returns true for "ko"', () => {
      expect(isValidLocale('ko')).toBe(true);
    });

    it('returns false for "fr"', () => {
      expect(isValidLocale('fr')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('locale key completeness', () => {
    it('en and ko have the same keys', () => {
      const enKeys = Object.keys(en).sort();
      const koKeys = Object.keys(ko).sort();
      expect(enKeys).toEqual(koKeys);
    });

    it('all string values are non-empty', () => {
      for (const [key, value] of Object.entries(en)) {
        if (typeof value === 'string') {
          expect(value.length, `en.${key} is empty`).toBeGreaterThan(0);
        }
      }
      for (const [key, value] of Object.entries(ko)) {
        if (typeof value === 'string') {
          expect(value.length, `ko.${key} is empty`).toBeGreaterThan(0);
        }
      }
    });

    it('all function values return non-empty strings', () => {
      for (const [key, value] of Object.entries(en)) {
        if (typeof value === 'function') {
          const result = (value as (arg: string) => string)('test');
          expect(typeof result, `en.${key}() should return string`).toBe('string');
          expect(result.length, `en.${key}() returned empty`).toBeGreaterThan(0);
        }
      }
      for (const [key, value] of Object.entries(ko)) {
        if (typeof value === 'function') {
          const result = (value as (arg: string) => string)('test');
          expect(typeof result, `ko.${key}() should return string`).toBe('string');
          expect(result.length, `ko.${key}() returned empty`).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('edge cases', () => {
    it('t() reflects locale set immediately before call', () => {
      setLocale('ko');
      const koMsg = t().initSuccess;
      setLocale('en');
      const enMsg = t().initSuccess;
      expect(koMsg).toBe(ko.initSuccess);
      expect(enMsg).toBe(en.initSuccess);
    });

    it('all parameterized en messages include their argument', () => {
      const testArg = 'test-value-123';
      const fnKeys = Object.entries(en).filter(([, v]) => typeof v === 'function');
      for (const [key, fn] of fnKeys) {
        const result = (fn as (arg: string) => string)(testArg);
        expect(result, `en.${key}() should contain argument`).toContain(testArg);
      }
    });

    it('all parameterized ko messages include their argument', () => {
      setLocale('ko');
      const testArg = 'test-value-123';
      const fnKeys = Object.entries(ko).filter(([, v]) => typeof v === 'function');
      for (const [key, fn] of fnKeys) {
        const result = (fn as (arg: string) => string)(testArg);
        expect(result, `ko.${key}() should contain argument`).toContain(testArg);
      }
    });
  });
});
