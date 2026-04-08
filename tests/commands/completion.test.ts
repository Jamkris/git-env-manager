import { describe, it, expect } from 'vitest';
import { generateCompletionScript } from '../../src/commands/completion.js';

describe('completion', () => {
  describe('bash script', () => {
    const script = generateCompletionScript('bash');

    it('contains complete -F registration', () => {
      expect(script).toContain('complete -F _ghem_completions ghem');
    });

    it('includes all command names', () => {
      expect(script).toContain('init');
      expect(script).toContain('add');
      expect(script).toContain('switch');
      expect(script).toContain('delete');
      expect(script).toContain('list');
      expect(script).toContain('config');
      expect(script).toContain('completion');
    });

    it('handles switch/delete profile completion', () => {
      expect(script).toContain('switch|delete)');
      expect(script).toContain('.git-env-manager');
      expect(script).toContain('config.json');
    });

    it('handles config set-lang completion', () => {
      expect(script).toContain('set-lang');
      expect(script).toContain('en ko');
    });
  });

  describe('zsh script', () => {
    const script = generateCompletionScript('zsh');

    it('contains compdef registration', () => {
      expect(script).toContain('compdef _ghem_completions ghem');
    });

    it('includes all command descriptions', () => {
      expect(script).toContain('init:');
      expect(script).toContain('add:');
      expect(script).toContain('switch:');
      expect(script).toContain('delete:');
      expect(script).toContain('list:');
      expect(script).toContain('config:');
      expect(script).toContain('completion:');
    });

    it('handles switch/delete profile completion', () => {
      expect(script).toContain('switch|delete)');
      expect(script).toContain('.git-env-manager');
    });
  });

  describe('shell detection fallback', () => {
    it('defaults to bash for unknown shell', () => {
      const script = generateCompletionScript('fish');
      expect(script).toContain('complete -F _ghem_completions ghem');
    });
  });
});
