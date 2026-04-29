/**
 * Базовые типы для Stroop-теста
 */

export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'black' | 'white';
export type Word = Color;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Stimulus {
  id: string;
  word: Word;
  color: Color;
  congruent: boolean; // совпадает ли слово с цветом
  timestamp: number; // время показа
}

export interface Answer {
  stimulusId: string;
  selectedColor: Color;
  reactionTime: number; // время реакции в мс
  isCorrect: boolean;
  timestamp: number;
}

export interface Metrics {
  totalStimuli: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // точность в процентах
  averageReactionTime: number; // среднее время реакции в мс
  interferenceIndex: number; // индекс интерференции (разница между конгруэнтными и неконгруэнтными)
  speed: number; // скорость ответов (стимулов в минуту)
  congruentAvgTime: number;
  incongruentAvgTime: number;
}

export type TestStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface StroopState {
  status: TestStatus;
  difficulty: Difficulty;
  currentStimulus: Stimulus | null;
  stimuli: Stimulus[];
  answers: Answer[];
  metrics: Metrics | null;
  startTime: number | null;
  endTime: number | null;
  elapsedTime: number; // прошедшее время в секундах
}

export type ActionType =
  | 'INIT_TEST'
  | 'RECORD_ANSWER'
  | 'NEXT_STIMULUS'
  | 'COMPLETE_TEST'
  | 'RESET_TEST'
  | 'PAUSE_TEST'
  | 'RESUME_TEST'
  | 'UPDATE_ELAPSED_TIME';

export interface Action {
  type: ActionType;
  payload?: unknown;
}

export interface Session {
  id: string;
  date: string; // ISO строка
  difficulty: Difficulty;
  metrics: Metrics;
  duration: number; // длительность сессии в секундах
  stimuliCount: number;
}

// Константы для уровней сложности
export interface DifficultyConfig {
  name: string;
  description: string;
  colors: Color[];
  congruentRatio: number; // доля конгруэнтных стимулов (0-1)
  stimulusCount: number;
  timeLimit?: number; // ограничение по времени в секундах (опционально)
}

export type DifficultyConfigs = Record<Difficulty, DifficultyConfig>;