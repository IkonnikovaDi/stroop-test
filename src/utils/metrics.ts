/**
 * Расчёт метрик для Stroop-теста
 */

import type { Answer, Stimulus, Metrics } from '../types';
import { MAX_REACTION_TIME, MIN_REACTION_TIME } from './constants';

/**
 * Рассчитывает метрики на основе ответов и стимулов
 * @param answers Массив ответов
 * @param stimuli Массив стимулов (для получения конгруэнтности)
 * @returns Рассчитанные метрики
 */
export function calculateMetrics(answers: Answer[], stimuli: Stimulus[]): Metrics {
  if (answers.length === 0) {
    return getEmptyMetrics();
  }

  // Сопоставляем ответы со стимулами для получения конгруэнтности
  const stimulusMap = new Map(stimuli.map(s => [s.id, s]));

  const validAnswers = answers.filter(a => {
    const stimulus = stimulusMap.get(a.stimulusId);
    if (!stimulus) return false;
    // Фильтруем ответы с некорректным временем реакции
    return a.reactionTime >= MIN_REACTION_TIME && a.reactionTime <= MAX_REACTION_TIME;
  });

  if (validAnswers.length === 0) {
    return getEmptyMetrics();
  }

  const totalStimuli = validAnswers.length;
  const correctAnswers = validAnswers.filter(a => a.isCorrect).length;
  const incorrectAnswers = totalStimuli - correctAnswers;
  const accuracy = (correctAnswers / totalStimuli) * 100;

  // Среднее время реакции для правильных ответов
  const correctReactionTimes = validAnswers
    .filter(a => a.isCorrect)
    .map(a => a.reactionTime);
  const averageReactionTime = correctReactionTimes.length > 0
    ? correctReactionTimes.reduce((sum, rt) => sum + rt, 0) / correctReactionTimes.length
    : 0;

  // Разделение на конгруэнтные и неконгруэнтные
  const congruentAnswers: Answer[] = [];
  const incongruentAnswers: Answer[] = [];

  validAnswers.forEach(answer => {
    const stimulus = stimulusMap.get(answer.stimulusId);
    if (stimulus) {
      if (stimulus.congruent) {
        congruentAnswers.push(answer);
      } else {
        incongruentAnswers.push(answer);
      }
    }
  });

  // Среднее время реакции для конгруэнтных (правильные)
  const congruentCorrectTimes = congruentAnswers
    .filter(a => a.isCorrect)
    .map(a => a.reactionTime);
  const congruentAvgTime = congruentCorrectTimes.length > 0
    ? congruentCorrectTimes.reduce((sum, rt) => sum + rt, 0) / congruentCorrectTimes.length
    : 0;

  // Среднее время реакции для неконгруэнтных (правильные)
  const incongruentCorrectTimes = incongruentAnswers
    .filter(a => a.isCorrect)
    .map(a => a.reactionTime);
  const incongruentAvgTime = incongruentCorrectTimes.length > 0
    ? incongruentCorrectTimes.reduce((sum, rt) => sum + rt, 0) / incongruentCorrectTimes.length
    : 0;

  // Индекс интерференции
  const interferenceIndex = incongruentAvgTime - congruentAvgTime;

  // Скорость ответов (стимулов в минуту)
  // Для вычисления нужна длительность сессии, но её нет в ответах.
  // Вместо этого используем среднее время реакции и общее время.
  // Приблизительно: скорость = (общее количество стимулов) / (общее время в минутах)
  // Общее время = сумма времен реакции + паузы между стимулами (неизвестно).
  // Упростим: скорость = 60 / (среднее время реакции в секундах)
  const avgReactionTimeSeconds = averageReactionTime / 1000;
  const speed = avgReactionTimeSeconds > 0 ? 60 / avgReactionTimeSeconds : 0;

  return {
    totalStimuli,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    averageReactionTime,
    interferenceIndex,
    speed,
    congruentAvgTime,
    incongruentAvgTime,
  };
}

/**
 * Возвращает пустые метрики (для начального состояния)
 */
export function getEmptyMetrics(): Metrics {
  return {
    totalStimuli: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    averageReactionTime: 0,
    interferenceIndex: 0,
    speed: 0,
    congruentAvgTime: 0,
    incongruentAvgTime: 0,
  };
}

/**
 * Рассчитывает метрики для сессии с учётом времени сессии
 * @param answers Ответы
 * @param stimuli Стимулы
 * @param sessionDuration Длительность сессии в секундах
 * @returns Метрики с уточнённой скоростью
 */
export function calculateMetricsWithDuration(
  answers: Answer[],
  stimuli: Stimulus[],
  sessionDuration: number
): Metrics {
  const baseMetrics = calculateMetrics(answers, stimuli);

  // Пересчитываем скорость на основе реальной длительности сессии
  if (sessionDuration > 0) {
    baseMetrics.speed = (baseMetrics.totalStimuli / sessionDuration) * 60; // стимулов в минуту
  }

  return baseMetrics;
}

/**
 * Рассчитывает прогресс выполнения теста
 * @param currentIndex Текущий индекс стимула
 * @param totalStimuli Общее количество стимулов
 * @returns Процент выполнения (0-100)
 */
export function calculateProgress(currentIndex: number, totalStimuli: number): number {
  if (totalStimuli === 0) return 0;
  return Math.min(100, (currentIndex / totalStimuli) * 100);
}