/**
 * Хук для вычисления и управления метриками Stroop-теста
 */

import { useMemo, useCallback } from 'react';
import type { Answer, Stimulus, Metrics, Session, Difficulty } from '../types';
import {
  calculateMetrics,
  calculateMetricsWithDuration,
  getEmptyMetrics,
  calculateProgress,
} from '../utils/metrics';

interface UseMetricsOptions {
  /** Включить вычисление метрик в реальном времени */
  liveCalculation?: boolean;
  /** Длительность сессии в секундах (для расчёта скорости) */
  sessionDuration?: number;
}

/**
 * Хук для работы с метриками теста
 * @param answers Массив ответов
 * @param stimuli Массив стимулов
 * @param options Дополнительные настройки
 * @returns Объект с метриками и вспомогательными функциями
 */
export function useMetrics(
  answers: Answer[],
  stimuli: Stimulus[],
  options: UseMetricsOptions = {}
) {
  const { liveCalculation = true, sessionDuration } = options;

  // Вычисление метрик
  const metrics = useMemo(() => {
    if (!liveCalculation || answers.length === 0) {
      return getEmptyMetrics();
    }

    if (sessionDuration !== undefined) {
      return calculateMetricsWithDuration(answers, stimuli, sessionDuration);
    }

    return calculateMetrics(answers, stimuli);
  }, [answers, stimuli, liveCalculation, sessionDuration]);

  /**
   * Рассчитывает метрики для части ответов (например, за последние N стимулов)
   */
  const getMetricsForSubset = useCallback(
    (startIndex: number, endIndex: number): Metrics => {
      const subsetAnswers = answers.slice(startIndex, endIndex);
      const subsetStimuli = stimuli.slice(startIndex, endIndex);

      if (subsetAnswers.length === 0) {
        return getEmptyMetrics();
      }

      return calculateMetrics(subsetAnswers, subsetStimuli);
    },
    [answers, stimuli]
  );

  /**
   * Рассчитывает метрики для конгруэнтных и неконгруэнтных стимулов отдельно
   */
  const getCongruencyMetrics = useCallback(() => {
    const congruentAnswers: Answer[] = [];
    const incongruentAnswers: Answer[] = [];

    const stimulusMap = new Map(stimuli.map(s => [s.id, s]));

    answers.forEach(answer => {
      const stimulus = stimulusMap.get(answer.stimulusId);
      if (stimulus) {
        if (stimulus.congruent) {
          congruentAnswers.push(answer);
        } else {
          incongruentAnswers.push(answer);
        }
      }
    });

    const congruentMetrics = calculateMetrics(congruentAnswers, stimuli);
    const incongruentMetrics = calculateMetrics(incongruentAnswers, stimuli);

    return {
      congruent: congruentMetrics,
      incongruent: incongruentMetrics,
      difference: {
        accuracy: congruentMetrics.accuracy - incongruentMetrics.accuracy,
        reactionTime: congruentMetrics.averageReactionTime - incongruentMetrics.averageReactionTime,
      },
    };
  }, [answers, stimuli]);

  /**
   * Рассчитывает прогресс выполнения теста
   */
  const progress = useMemo(() => {
    return calculateProgress(answers.length, stimuli.length);
  }, [answers.length, stimuli.length]);

  /**
   * Создаёт объект сессии для сохранения в историю
   */
  const createSession = useCallback(
    (difficulty: string, duration: number): Session => {
      // Приведение типа, так как difficulty приходит как строка
      const difficultyTyped = difficulty as Difficulty;
      return {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString(),
        difficulty: difficultyTyped,
        metrics,
        duration,
        stimuliCount: answers.length,
      };
    },
    [metrics, answers.length]
  );

  /**
   * Форматирует метрики для отображения
   */
  const formatMetrics = useCallback(
    (format: 'short' | 'detailed' = 'short') => {
      if (format === 'short') {
        return {
          accuracy: `${metrics.accuracy.toFixed(1)}%`,
          avgReactionTime: `${metrics.averageReactionTime.toFixed(0)} мс`,
          interference: `${metrics.interferenceIndex.toFixed(1)} мс`,
          speed: `${metrics.speed.toFixed(1)} стим/мин`,
        };
      }

      return {
        totalStimuli: metrics.totalStimuli,
        correctAnswers: metrics.correctAnswers,
        incorrectAnswers: metrics.incorrectAnswers,
        accuracy: `${metrics.accuracy.toFixed(2)}%`,
        averageReactionTime: `${metrics.averageReactionTime.toFixed(0)} мс`,
        interferenceIndex: `${metrics.interferenceIndex.toFixed(1)} мс`,
        speed: `${metrics.speed.toFixed(1)} стимулов в минуту`,
        congruentAvgTime: `${metrics.congruentAvgTime.toFixed(0)} мс`,
        incongruentAvgTime: `${metrics.incongruentAvgTime.toFixed(0)} мс`,
      };
    },
    [metrics]
  );

  /**
   * Проверяет, улучшились ли метрики по сравнению с предыдущими
   */
  const compareWithPrevious = useCallback(
    (previousMetrics: Metrics) => {
      const current = metrics;
      const previous = previousMetrics;

      return {
        accuracyImproved: current.accuracy > previous.accuracy,
        reactionTimeImproved: current.averageReactionTime < previous.averageReactionTime,
        interferenceImproved: Math.abs(current.interferenceIndex) < Math.abs(previous.interferenceIndex),
        speedImproved: current.speed > previous.speed,
        differences: {
          accuracy: current.accuracy - previous.accuracy,
          reactionTime: current.averageReactionTime - previous.averageReactionTime,
          interference: current.interferenceIndex - previous.interferenceIndex,
          speed: current.speed - previous.speed,
        },
      };
    },
    [metrics]
  );

  return {
    // Основные метрики
    metrics,
    isEmpty: answers.length === 0,

    // Дополнительные вычисления
    progress,
    getMetricsForSubset,
    getCongruencyMetrics,
    createSession,
    formatMetrics,
    compareWithPrevious,

    // Вспомогательные значения
    accuracy: metrics.accuracy,
    averageReactionTime: metrics.averageReactionTime,
    interferenceIndex: metrics.interferenceIndex,
    speed: metrics.speed,
    correctCount: metrics.correctAnswers,
    incorrectCount: metrics.incorrectAnswers,
  };
}

export type UseMetricsReturn = ReturnType<typeof useMetrics>;