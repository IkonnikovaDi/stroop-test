/**
 * Хук для работы с localStorage (сохранение истории, настроек)
 */

import { useState,  useCallback } from 'react';
import type { Session, Difficulty } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'stroop_sessions',
  SETTINGS: 'stroop_settings',
  STATS: 'stroop_stats',
} as const;

interface Settings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  defaultDifficulty: Difficulty;
  showTutorial: boolean;
  language: 'ru' | 'en';
}

interface Stats {
  totalSessions: number;
  totalStimuli: number;
  totalCorrect: number;
  bestAccuracy: number;
  bestSpeed: number;
  fastestReactionTime: number;
}

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  animationsEnabled: true,
  defaultDifficulty: 'medium',
  showTutorial: true,
  language: 'ru',
};

const DEFAULT_STATS: Stats = {
  totalSessions: 0,
  totalStimuli: 0,
  totalCorrect: 0,
  bestAccuracy: 0,
  bestSpeed: 0,
  fastestReactionTime: Infinity,
};

// Вспомогательные функции загрузки (объявлены до хуков)

function loadSessions(): Session[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load sessions from localStorage:', error);
    return [];
  }
}

function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load stats from localStorage:', error);
    return DEFAULT_STATS;
  }
}

/**
 * Хук для работы с сессиями в localStorage
 */
export function useSessionStorage() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());

  /**
   * Сохраняет сессии в localStorage
   */
  const saveSessions = useCallback((newSessions: Session[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }, []);

  /**
   * Добавляет новую сессию
   */
  const addSession = useCallback(
    (session: Session) => {
      const updated = [session, ...sessions].slice(0, 100); // храним последние 100 сессий
      saveSessions(updated);
    },
    [sessions, saveSessions]
  );

  /**
   * Удаляет сессию по ID
   */
  const removeSession = useCallback(
    (sessionId: string) => {
      const updated = sessions.filter(s => s.id !== sessionId);
      saveSessions(updated);
    },
    [sessions, saveSessions]
  );

  /**
   * Очищает все сессии
   */
  const clearSessions = useCallback(() => {
    saveSessions([]);
  }, [saveSessions]);

  /**
   * Фильтрует сессии по уровню сложности
   */
  const filterSessionsByDifficulty = useCallback(
    (difficulty: Difficulty) => {
      return sessions.filter(s => s.difficulty === difficulty);
    },
    [sessions]
  );

  /**
   * Получает статистику по сессиям
   */
  const getSessionsStats = useCallback(() => {
    if (sessions.length === 0) {
      return {
        total: 0,
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        averageAccuracy: 0,
        averageSpeed: 0,
        bestSession: null,
      };
    }

    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    let totalAccuracy = 0;
    let totalSpeed = 0;
    let bestSession = sessions[0];

    sessions.forEach(session => {
      byDifficulty[session.difficulty]++;
      totalAccuracy += session.metrics.accuracy;
      totalSpeed += session.metrics.speed;

      if (session.metrics.accuracy > bestSession.metrics.accuracy) {
        bestSession = session;
      }
    });

    return {
      total: sessions.length,
      byDifficulty,
      averageAccuracy: totalAccuracy / sessions.length,
      averageSpeed: totalSpeed / sessions.length,
      bestSession,
    };
  }, [sessions]);

  // Загрузка сессий уже выполнена в useState, эффект не требуется

  return {
    sessions,
    addSession,
    removeSession,
    clearSessions,
    filterSessionsByDifficulty,
    getSessionsStats,
    refreshSessions: () => setSessions(loadSessions()),
  };
}

/**
 * Хук для работы с настройками в localStorage
 */
export function useSettingsStorage() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const saveSettings = useCallback((newSettings: Partial<Settings>) => {
    try {
      const current = loadSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return {
    settings,
    saveSettings,
    resetSettings,
    updateSetting: (key: keyof Settings, value: unknown) =>
      saveSettings({ [key]: value }),
  };
}

/**
 * Хук для работы со статистикой в localStorage
 */
export function useStatsStorage() {
  const [stats, setStats] = useState<Stats>(() => loadStats());

  const saveStats = useCallback((newStats: Partial<Stats>) => {
    try {
      const current = loadStats();
      const updated = { ...current, ...newStats };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      setStats(updated);
    } catch (error) {
      console.error('Failed to save stats to localStorage:', error);
    }
  }, []);

  /**
   * Обновляет статистику на основе новой сессии
   */
  const updateStats = useCallback(
    (session: Session) => {
      const current = loadStats();
      const newStats: Partial<Stats> = {
        totalSessions: current.totalSessions + 1,
        totalStimuli: current.totalStimuli + session.stimuliCount,
        totalCorrect: current.totalCorrect + session.metrics.correctAnswers,
      };

      // Лучшая точность
      if (session.metrics.accuracy > current.bestAccuracy) {
        newStats.bestAccuracy = session.metrics.accuracy;
      }

      // Лучшая скорость
      if (session.metrics.speed > current.bestSpeed) {
        newStats.bestSpeed = session.metrics.speed;
      }

      // Самое быстрое время реакции (только для правильных ответов)
      if (
        session.metrics.averageReactionTime > 0 &&
        session.metrics.averageReactionTime < current.fastestReactionTime
      ) {
        newStats.fastestReactionTime = session.metrics.averageReactionTime;
      }

      saveStats(newStats);
    },
    [saveStats]
  );

  const resetStats = useCallback(() => {
    saveStats(DEFAULT_STATS);
  }, [saveStats]);

  return {
    stats,
    updateStats,
    resetStats,
    getFormattedStats: () => ({
      ...stats,
      fastestReactionTime:
        stats.fastestReactionTime === Infinity
          ? '—'
          : `${stats.fastestReactionTime.toFixed(0)} мс`,
      bestAccuracy: `${stats.bestAccuracy.toFixed(1)}%`,
      bestSpeed: `${stats.bestSpeed.toFixed(1)} стим/мин`,
    }),
  };
}

/**
 * Композитный хук, объединяющий все хранилища
 */
export function useLocalStorage() {
  const sessions = useSessionStorage();
  const settings = useSettingsStorage();
  const stats = useStatsStorage();

  /**
   * Экспортирует все данные в JSON
   */
  const exportData = useCallback(() => {
    try {
      const data = {
        sessions: sessions.sessions,
        settings: settings.settings,
        stats: stats.stats,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }, [sessions.sessions, settings.settings, stats.stats]);

  /**
   * Импортирует данные из JSON
   */
  const importData = useCallback(
    (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        
        if (data.sessions) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
          sessions.refreshSessions();
        }
        
        if (data.settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
          // Перезагружаем настройки через эффект в хуке
        }
        
        if (data.stats) {
          localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
          // Перезагружаем статистику через эффект в хуке
        }
        
        return true;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    [sessions]
  );

  /**
   * Очищает все данные приложения
   */
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    sessions.refreshSessions();
    // Настройки и статистика перезагрузятся автоматически через эффекты
  }, [sessions]);

  return {
    sessions,
    settings,
    stats,
    exportData,
    importData,
    clearAllData,
  };
}

export type UseLocalStorageReturn = ReturnType<typeof useLocalStorage>;