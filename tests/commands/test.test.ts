import { describe, it, expect } from 'vitest';
import { parseAuthResult } from '../../src/commands/test.js';

describe('parseAuthResult', () => {
  describe('GitHub', () => {
    it('detects successful GitHub auth', () => {
      const result = parseAuthResult('Hi Jamkris! You\'ve successfully authenticated, but GitHub does not provide shell access.', 1);
      expect(result.success).toBe(true);
      expect(result.username).toBe('Jamkris');
    });

    it('falls back to broad match when exit code differs from GitHub pattern', () => {
      const result = parseAuthResult('Hi Jamkris! You\'ve successfully authenticated.', 0);
      // exit code 0 is not GitHub's pattern, but falls through to broad fallback
      expect(result.success).toBe(true);
    });

    it('rejects on permission denied', () => {
      const result = parseAuthResult('Permission denied (publickey).', 255);
      expect(result.success).toBe(false);
    });
  });

  describe('GitLab', () => {
    it('detects successful GitLab auth', () => {
      const result = parseAuthResult('Welcome to GitLab, @Jamkris!', 0);
      expect(result.success).toBe(true);
      expect(result.username).toBe('Jamkris');
    });

    it('rejects GitLab message with wrong exit code', () => {
      const result = parseAuthResult('Welcome to GitLab, @Jamkris!', 255);
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns failure for empty stderr', () => {
      const result = parseAuthResult('', -1);
      expect(result.success).toBe(false);
    });

    it('returns failure for unrecognized output', () => {
      const result = parseAuthResult('Connection timed out', 255);
      expect(result.success).toBe(false);
    });

    it('handles username with hyphens', () => {
      const result = parseAuthResult('Hi my-user-name! You\'ve successfully authenticated.', 1);
      expect(result.success).toBe(true);
      expect(result.username).toBe('my-user-name');
    });

    it('handles GitLab username with dots', () => {
      const result = parseAuthResult('Welcome to GitLab, @user.name!', 0);
      expect(result.success).toBe(true);
      expect(result.username).toBe('user.name');
    });
  });
});
