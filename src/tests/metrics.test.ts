// src/tests/metrics.test.ts
import { describe, test, expect } from 'vitest';
import { calculateMetrics } from '../utils/metrics';
import type { Answer, Stimulus } from '../types';

describe('calculateMetrics', () => {
  test('точность 100% при всех правильных ответах', () => {
    const answers: Answer[] = [
      { stimulusId: '1', selectedColor: 'red', reactionTime: 100, isCorrect: true, timestamp: 1 },
    ];
    const stimuli: Stimulus[] = [
      { id: '1', word: 'red', color: 'red', congruent: true, timestamp: 0 },
    ];
    const metrics = calculateMetrics(answers, stimuli);
    expect(metrics.accuracy).toBe(100);
  });

  test('среднее время реакции только для правильных ответов', () => {
    const answers: Answer[] = [
      { stimulusId: '1', selectedColor: 'red', reactionTime: 100, isCorrect: true, timestamp: 1 },
      { stimulusId: '2', selectedColor: 'blue', reactionTime: 200, isCorrect: false, timestamp: 2 },
    ];
    const stimuli: Stimulus[] = [
      { id: '1', word: 'red', color: 'red', congruent: true, timestamp: 0 },
      { id: '2', word: 'blue', color: 'blue', congruent: true, timestamp: 0 },
    ];
    const metrics = calculateMetrics(answers, stimuli);
    expect(metrics.averageReactionTime).toBe(100);
  });

  test('пустые ответы возвращают нулевые метрики', () => {
    const metrics = calculateMetrics([], []);
    expect(metrics.accuracy).toBe(0);
    expect(metrics.averageReactionTime).toBe(0);
  });
});