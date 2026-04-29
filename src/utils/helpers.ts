/**
 * Вспомогательные функции для Stroop-теста
 */

import type { Color } from '../types';
import { COLOR_NAMES, COLOR_HEX } from './constants';

/**
 * Форматирует время в миллисекундах в строку MM:SS
 * @param ms Время в миллисекундах
 * @returns Строка формата "MM:SS"
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Форматирует время в миллисекундах в строку с миллисекундами (например, "1.23s")
 * @param ms Время в миллисекундах
 * @returns Строка формата "X.XXs"
 */
export function formatReactionTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  return `${seconds.toFixed(2)}s`;
}

/**
 * Возвращает русское название цвета
 * @param color Цвет
 * @returns Название цвета на русском
 */
export function getColorName(color: Color): string {
  return COLOR_NAMES[color] || color;
}

/**
 * Возвращает HEX-код цвета
 * @param color Цвет
 * @returns HEX-строка
 */
export function getColorHex(color: Color): string {
  return COLOR_HEX[color] || '#000000';
}

/**
 * Генерирует уникальный ID
 * @param prefix Префикс для ID
 * @returns Уникальный строковый ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Задержка на указанное количество миллисекунд
 * @param ms Миллисекунды
 * @returns Promise, который разрешается после задержки
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ограничивает значение в заданном диапазоне
 * @param value Исходное значение
 * @param min Минимальное значение
 * @param max Максимальное значение
 * @returns Ограниченное значение
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Вычисляет процентное соотношение
 * @param part Часть
 * @param total Целое
 * @returns Процент (0-100)
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Форматирует число с разделителями тысяч
 * @param num Число
 * @returns Отформатированная строка
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/**
 * Проверяет, является ли значение допустимым числом
 * @param value Любое значение
 * @returns true, если значение - число и не NaN
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Случайное целое число в диапазоне [min, max]
 * @param min Минимум (включительно)
 * @param max Максимум (включительно)
 * @returns Случайное целое число
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перемешивает массив (алгоритм Фишера-Йетса)
 * @param array Исходный массив
 * @returns Новый перемешанный массив
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}