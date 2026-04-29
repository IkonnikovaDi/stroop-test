/**
 * Константы для Stroop-теста
 */

import type{ Color, DifficultyConfigs } from '../types';

/** Все доступные цвета (6 цветов согласно спецификации) */
export const ALL_COLORS: Color[] = [
  'red',
  'green',
  'blue',
  'yellow',
  'purple',
  'orange',
];

/** Все доступные слова (те же что и цвета) */
export const ALL_WORDS = ALL_COLORS;

/** Названия цветов на русском для отображения */
export const COLOR_NAMES: Record<Color, string> = {
  red: 'Красный',
  green: 'Зелёный',
  blue: 'Синий',
  yellow: 'Жёлтый',
  purple: 'Фиолетовый',
  orange: 'Оранжевый',
  black: 'Чёрный',  
  white: 'Белый', 
};

/** HEX-коды цветов для CSS (соответствуют спецификации) */
export const COLOR_HEX: Record<Color, string> = {
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  purple: '#800080',
  orange: '#FFA500',
  black: '#000000',   
  white: '#FFFFFF',
};

/** Конфигурации уровней сложности */
export const DIFFICULTY_CONFIGS: DifficultyConfigs = {
  easy: {
    name: 'Лёгкий',
    description: '4 цвета, случайное соотношение конгруэнтных/неконгруэнтных',
    colors: ['red', 'green', 'blue', 'yellow'] as Color[],
    congruentRatio: 0.5, // случайное соотношение
    stimulusCount: 30,
    timeLimit: undefined, // без ограничения по времени
  },
  medium: {
    name: 'Средний',
    description: '5 цветов, случайное соотношение, ограничение 3 секунды',
    colors: ['red', 'green', 'blue', 'yellow', 'purple'] as Color[],
    congruentRatio: 0.5,
    stimulusCount: 30,
    timeLimit: 3, // 3 секунды на ответ
  },
  hard: {
    name: 'Сложный',
    description: '6 цветов, только неконгруэнтные, ограничение 3 секунды',
    colors: ALL_COLORS,
    congruentRatio: 0, // 0% конгруэнтных
    stimulusCount: 30,
    timeLimit: 3,
  },
};

/** Количество стимулов по умолчанию для каждого уровня */
export const DEFAULT_STIMULUS_COUNT: Record<string, number> = {
  easy: 30,
  medium: 30,
  hard: 30,
};

/** Максимальное время реакции (мс) для учёта в статистике */
export const MAX_REACTION_TIME = 5000;

/** Минимальное время реакции (мс) для учёта в статистике */
export const MIN_REACTION_TIME = 100;

/** Целевое время показа стимула (мс) */
export const STIMULUS_DISPLAY_TIME = 1500;

/** Время задержки перед следующим стимулом (мс) */
export const INTER_STIMULUS_INTERVAL = 500;

/** Лимит времени на ответ для среднего и сложного уровней (мс) */
export const TIME_LIMIT_MS = 3000;