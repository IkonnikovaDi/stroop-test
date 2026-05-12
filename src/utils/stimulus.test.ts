// src/utils/stimulus.test.ts
import { describe, test, expect } from 'vitest';
import { generateStimuli } from './stimulus';
import type { Color } from '../types';

describe('generateStimuli', () => {
  test('создаёт 30 стимулов для уровня medium', () => {
    const stimuli = generateStimuli('medium');
    expect(stimuli).toHaveLength(30);
  });

  test('создаёт конгруэнтные и неконгруэнтные стимулы для medium', () => {
    const stimuli = generateStimuli('medium');
    const hasCongruent = stimuli.some(s => s.congruent);
    const hasIncongruent = stimuli.some(s => !s.congruent);
    expect(hasCongruent && hasIncongruent).toBe(true);
  });

  test('все цвета являются английскими названиями', () => {
    const stimuli = generateStimuli('easy');
    const englishColors: Color[] = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'black', 'white'];
    stimuli.forEach(stimulus => {
      expect(englishColors).toContain(stimulus.word);
      expect(englishColors).toContain(stimulus.color);
    });
  });

  test('для уровня hard нет конгруэнтных стимулов', () => {
    const stimuli = generateStimuli('hard');
    const hasCongruent = stimuli.some(s => s.congruent);
    expect(hasCongruent).toBe(false);
  });

  test('каждый стимул имеет уникальный id', () => {
    const stimuli = generateStimuli('medium');
    const ids = stimuli.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(stimuli.length);
  });
});