/**
 * Генерация стимулов для Stroop-теста
 */

import type { Color, Difficulty, Stimulus } from '../types';
import { DIFFICULTY_CONFIGS } from './constants';

/**
 * Генерирует массив стимулов для заданного уровня сложности
 * @param difficulty Уровень сложности
 * @param count Количество стимулов (если не указано, используется значение по умолчанию из конфига)
 * @returns Массив стимулов
 */
export function generateStimuli(
  difficulty: Difficulty,
  count?: number
): Stimulus[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const targetCount = count ?? config.stimulusCount;
  const colors = config.colors;
  const congruentRatio = config.congruentRatio;

  const stimuli: Stimulus[] = [];

  for (let i = 0; i < targetCount; i++) {
    const word = getRandomElement(colors);
    let color: Color;

    // Определяем, должен ли стимул быть конгруэнтным
    const shouldBeCongruent = Math.random() < congruentRatio;

    if (shouldBeCongruent) {
      color = word; // слово и цвет совпадают
    } else {
      // Выбираем случайный цвет, отличный от слова
      const otherColors = colors.filter(c => c !== word);
      color = getRandomElement(otherColors);
    }

    const congruent = word === color;

    stimuli.push({
      id: generateId(),
      word,
      color,
      congruent,
      timestamp: Date.now() + i * 100, // имитация временных меток
    });
  }

  return stimuli;
}

/**
 * Генерирует один случайный стимул для заданного уровня сложности
 * @param difficulty Уровень сложности
 * @returns Стимул
 */
export function generateSingleStimulus(difficulty: Difficulty): Stimulus {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const colors = config.colors;
  const congruentRatio = config.congruentRatio;

  const word = getRandomElement(colors);
  let color: Color;

  const shouldBeCongruent = Math.random() < congruentRatio;

  if (shouldBeCongruent) {
    color = word;
  } else {
    const otherColors = colors.filter(c => c !== word);
    color = getRandomElement(otherColors);
  }

  return {
    id: generateId(),
    word,
    color,
    congruent: word === color,
    timestamp: Date.now(),
  };
}

/**
 * Возвращает случайный элемент массива
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Генерирует уникальный ID для стимула
 */
function generateId(): string {
  return `stim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}