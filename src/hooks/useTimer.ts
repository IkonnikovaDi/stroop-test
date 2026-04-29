/**
 * Хук для управления таймерами (сессия, реакция)
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTimerOptions {
  /** Начальное время в секундах (по умолчанию 0) */
  initialTime?: number;
  /** Автоматически запускать таймер при создании? */
  autoStart?: boolean;
  /** Интервал обновления в миллисекундах (по умолчанию 1000 мс) */
  interval?: number;
  /** Ограничение по времени в секундах (таймер остановится по достижении) */
  timeLimit?: number;
  /** Колбэк при достижении лимита времени */
  onTimeLimit?: () => void;
}

/**
 * Хук для управления таймером сессии
 * @param options Настройки таймера
 * @returns Объект с состоянием и функциями управления
 */
export function useTimer(options: UseTimerOptions = {}) {
  const {
    initialTime = 0,
    autoStart = false,
    interval = 1000,
    timeLimit,
    onTimeLimit,
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef(0);

  // Инициализация lastUpdateRef после монтирования
  useEffect(() => {
    lastUpdateRef.current = Date.now();
  }, []);

  /**
   * Запускает таймер
   */
  const start = useCallback(() => {
    if (isRunning) return;

    const now = Date.now();
    setStartTimestamp(now);
    setIsRunning(true);
    lastUpdateRef.current = now;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const current = Date.now();
      const delta = (current - lastUpdateRef.current) / 1000; // секунды
      lastUpdateRef.current = current;

      setTime(prev => {
        const newTime = prev + delta;
        
        // Проверяем лимит времени
        if (timeLimit !== undefined && newTime >= timeLimit) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          onTimeLimit?.();
          return timeLimit;
        }
        
        return newTime;
      });
    }, interval);
  }, [isRunning, interval, timeLimit, onTimeLimit]);

  /**
   * Приостанавливает таймер
   */
  const pause = useCallback(() => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setPauseTime(time);
  }, [isRunning, time]);

  /**
   * Возобновляет таймер
   */
  const resume = useCallback(() => {
    if (isRunning) return;

    const now = Date.now();
    setStartTimestamp(now);
    setIsRunning(true);
    lastUpdateRef.current = now;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const current = Date.now();
      const delta = (current - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = current;

      setTime(prev => {
        const newTime = prev + delta;
        
        if (timeLimit !== undefined && newTime >= timeLimit) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          onTimeLimit?.();
          return timeLimit;
        }
        
        return newTime;
      });
    }, interval);
  }, [isRunning, interval, timeLimit, onTimeLimit]);

  /**
   * Сбрасывает таймер в начальное состояние
   */
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTime(initialTime);
    setIsRunning(autoStart);
    setStartTimestamp(null);
    setPauseTime(null);
    lastUpdateRef.current = Date.now();

    if (autoStart) {
      start();
    }
  }, [initialTime, autoStart, start]);

  /**
   * Устанавливает новое время
   */
  const setTimeManually = useCallback((newTime: number) => {
    setTime(newTime);
    lastUpdateRef.current = Date.now();
  }, []);

  /**
   * Форматирует время в строку MM:SS
   */
  const formatTime = useCallback((format: 'mm:ss' | 'ss' = 'mm:ss') => {
    const totalSeconds = Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (format === 'ss') {
      return totalSeconds.toString();
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [time]);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Автозапуск при изменении autoStart
  useEffect(() => {
    if (autoStart && !isRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      start();
    }
  }, [autoStart, isRunning, start]);

  return {
    // Состояние
    time,
    isRunning,
    startTimestamp,
    pauseTime,
    formattedTime: formatTime(),

    // Функции управления
    start,
    pause,
    resume,
    reset,
    setTime: setTimeManually,
    formatTime,
  };
}

/**
 * Хук для измерения времени реакции
 * @returns Объект с функциями для измерения времени реакции
 */
export function useReactionTimer() {
  const startTimeRef = useRef<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  /**
   * Начинает измерение времени реакции
   */
  const startMeasurement = useCallback(() => {
    startTimeRef.current = Date.now();
    setReactionTime(null);
  }, []);

  /**
   * Завершает измерение и возвращает время реакции в мс
   */
  const stopMeasurement = useCallback(() => {
    if (startTimeRef.current === null) {
      return null;
    }

    const endTime = Date.now();
    const rt = endTime - startTimeRef.current;
    setReactionTime(rt);
    startTimeRef.current = null;
    return rt;
  }, []);

  /**
   * Сбрасывает измерение
   */
  const resetMeasurement = useCallback(() => {
    startTimeRef.current = null;
    setReactionTime(null);
  }, []);

  /**
   * Получает текущее время реакции (без остановки)
   */
  const getCurrentReactionTime = useCallback(() => {
    if (startTimeRef.current === null) {
      return null;
    }
    return Date.now() - startTimeRef.current;
  }, []);

  return {
    reactionTime,
    startMeasurement,
    stopMeasurement,
    resetMeasurement,
    getCurrentReactionTime,
  };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;
export type UseReactionTimerReturn = ReturnType<typeof useReactionTimer>;