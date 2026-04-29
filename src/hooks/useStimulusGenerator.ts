/**
 * Хук для генерации и управления очередью стимулов
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Difficulty, Stimulus } from '../types';
import { generateStimuli, generateSingleStimulus } from '../utils/stimulus';

interface UseStimulusGeneratorOptions {
  /** Количество стимулов для предварительной генерации (по умолчанию 0 - генерировать по одному) */
  pregenerateCount?: number;
  /** Автоматически генерировать следующий стимул после ответа? */
  autoAdvance?: boolean;
}

/**
 * Хук, предоставляющий функции для работы со стимулами
 * @param difficulty Уровень сложности
 * @param options Дополнительные настройки
 * @returns Объект с функциями и состоянием
 */
export function useStimulusGenerator(
  difficulty: Difficulty,
  options: UseStimulusGeneratorOptions = {}
) {
  const { pregenerateCount = 0, autoAdvance = true } = options;

  // Очередь стимулов
  const [stimuliQueue, setStimuliQueue] = useState<Stimulus[]>(() => {
    if (pregenerateCount > 0) {
      return generateStimuli(difficulty, pregenerateCount);
    }
    return [];
  });

  // Текущий стимул
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);

  // Счётчик показанных стимулов
  const [shownCount, setShownCount] = useState(0);

  // Ref для хранения difficulty, чтобы избежать замыканий
  const difficultyRef = useRef(difficulty);

  // Обновляем ref при изменении difficulty
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  /**
   * Инициализирует очередь стимулов
   * @param count Количество стимулов (если не указано, используется значение из конфига)
   */
  const initializeQueue = useCallback((count?: number) => {
    const newStimuli = generateStimuli(difficultyRef.current, count);
    setStimuliQueue(newStimuli);
    setShownCount(0);
    setCurrentStimulus(null);
  }, []);

  /**
   * Получает следующий стимул из очереди
   * Если очередь пуста, генерирует новый стимул
   */
  const getNextStimulus = useCallback((): Stimulus => {
    let nextStimulus: Stimulus;

    if (stimuliQueue.length > 0) {
      // Берём из очереди
      nextStimulus = stimuliQueue[0];
      setStimuliQueue(prev => prev.slice(1));
    } else {
      // Генерируем новый
      nextStimulus = generateSingleStimulus(difficultyRef.current);
    }

    // Обновляем текущий стимул
    setCurrentStimulus(nextStimulus);
    setShownCount(prev => prev + 1);

    return nextStimulus;
  }, [stimuliQueue]);

  /**
   * Пропускает текущий стимул (не записывая ответ)
   */
  const skipCurrentStimulus = useCallback(() => {
    if (currentStimulus) {
      // Просто удаляем текущий и получаем следующий
      setCurrentStimulus(null);
      if (autoAdvance) {
        getNextStimulus();
      }
    }
  }, [currentStimulus, autoAdvance, getNextStimulus]);

  /**
   * Добавляет дополнительные стимулы в очередь
   * @param count Количество добавляемых стимулов
   */
  const addToQueue = useCallback((count: number) => {
    const newStimuli = generateStimuli(difficultyRef.current, count);
    setStimuliQueue(prev => [...prev, ...newStimuli]);
  }, []);

  /**
   * Очищает очередь и сбрасывает состояние
   */
  const reset = useCallback(() => {
    setStimuliQueue([]);
    setCurrentStimulus(null);
    setShownCount(0);
  }, []);

  /**
   * Заменяет текущий стимул новым (например, при ошибке)
   */
  const replaceCurrentStimulus = useCallback(() => {
    const newStimulus = generateSingleStimulus(difficultyRef.current);
    setCurrentStimulus(newStimulus);
    return newStimulus;
  }, []);

  return {
    // Состояние
    currentStimulus,
    stimuliQueue,
    shownCount,
    queueLength: stimuliQueue.length,

    // Функции
    initializeQueue,
    getNextStimulus,
    skipCurrentStimulus,
    addToQueue,
    reset,
    replaceCurrentStimulus,
  };
}

export type UseStimulusGeneratorReturn = ReturnType<typeof useStimulusGenerator>;