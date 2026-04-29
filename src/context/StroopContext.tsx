import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type {
  StroopState,
  Action,
  Difficulty,
  Stimulus,
  Answer,
  Metrics,
  TestStatus,
} from '../types';

// Начальное состояние
const initialState: StroopState = {
  status: 'idle',
  difficulty: 'medium',
  currentStimulus: null,
  stimuli: [],
  answers: [],
  metrics: null,
  startTime: null,
  endTime: null,
  elapsedTime: 0,
};

// Вспомогательная функция для расчёта метрик (временная, позже будет вынесена в utils)
function calculateMetrics(
  answers: Answer[],
  stimuli: Stimulus[]
): Metrics | null {
  if (answers.length === 0) return null;

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const totalStimuli = stimuli.length;
  const accuracy = (correctAnswers / answers.length) * 100;
  const averageReactionTime =
    answers.reduce((sum, a) => sum + a.reactionTime, 0) / answers.length;

  // Разделим ответы на конгруэнтные и неконгруэнтные
  const congruentAnswers = answers.filter((a) => {
    const stimulus = stimuli.find((s) => s.id === a.stimulusId);
    return stimulus?.congruent;
  });
  const incongruentAnswers = answers.filter((a) => {
    const stimulus = stimuli.find((s) => s.id === a.stimulusId);
    return stimulus && !stimulus.congruent;
  });

  const congruentAvgTime =
    congruentAnswers.length > 0
      ? congruentAnswers.reduce((sum, a) => sum + a.reactionTime, 0) /
        congruentAnswers.length
      : 0;
  const incongruentAvgTime =
    incongruentAnswers.length > 0
      ? incongruentAnswers.reduce((sum, a) => sum + a.reactionTime, 0) /
        incongruentAnswers.length
      : 0;

  const interferenceIndex = incongruentAvgTime - congruentAvgTime;
  const speed = answers.length > 0 ? (answers.length / (totalStimuli / 60)) : 0; // упрощённо

  return {
    totalStimuli,
    correctAnswers,
    incorrectAnswers: answers.length - correctAnswers,
    accuracy,
    averageReactionTime,
    interferenceIndex,
    speed,
    congruentAvgTime,
    incongruentAvgTime,
  };
}

// Редьюсер
function stroopReducer(state: StroopState, action: Action): StroopState {
  switch (action.type) {
    case 'INIT_TEST': {
      const { difficulty, stimuli } = action.payload;
      return {
        ...state,
        status: 'running',
        difficulty,
        startTime: Date.now(),
        elapsedTime: 0,
        stimuli,
        currentStimulus: stimuli[0] || null,
        answers: [],
        metrics: null,
        endTime: null,
      };
    }
    case 'RECORD_ANSWER': {
      const { stimulusId, selectedColor, reactionTime, timestamp } = action.payload;
      const stimulus = state.stimuli.find((s) => s.id === stimulusId);
      const isCorrect = stimulus?.color === selectedColor;
      const newAnswer: Answer = {
        stimulusId,
        selectedColor,
        reactionTime,
        isCorrect,
        timestamp,
      };
      const newAnswers = [...state.answers, newAnswer];
      return {
        ...state,
        answers: newAnswers,
      };
    }
    case 'NEXT_STIMULUS': {
      const currentIndex = state.stimuli.findIndex(
        (s) => s.id === state.currentStimulus?.id
      );
      const nextIndex = currentIndex + 1;
      const nextStimulus = state.stimuli[nextIndex] || null;
      const newStatus = nextStimulus ? 'running' : 'completed';
      // Если стимулы закончились, автоматически завершаем тест
      if (!nextStimulus) {
        const metrics = calculateMetrics(state.answers, state.stimuli);
        return {
          ...state,
          status: 'completed',
          currentStimulus: null,
          endTime: Date.now(),
          metrics,
        };
      }
      return {
        ...state,
        currentStimulus: nextStimulus,
        status: newStatus,
      };
    }
    case 'COMPLETE_TEST': {
      const metrics = calculateMetrics(state.answers, state.stimuli);
      return {
        ...state,
        status: 'completed',
        endTime: Date.now(),
        metrics,
      };
    }
    case 'RESET_TEST':
      return initialState;
    case 'PAUSE_TEST':
      return { ...state, status: 'paused' };
    case 'RESUME_TEST':
      return { ...state, status: 'running' };
    case 'UPDATE_ELAPSED_TIME':
      return { ...state, elapsedTime: action.payload.elapsedTime };
    default:
      return state;
  }
}

// Создание контекста
interface StroopContextValue {
  state: StroopState;
  dispatch: Dispatch<Action>;
}

const StroopContext = createContext<StroopContextValue | undefined>(undefined);

// Провайдер контекста
interface StroopProviderProps {
  children: ReactNode;
}

export function StroopProvider({ children }: StroopProviderProps) {
  const [state, dispatch] = useReducer(stroopReducer, initialState);

  return (
    <StroopContext.Provider value={{ state, dispatch }}>
      {children}
    </StroopContext.Provider>
  );
}

// Хук для использования контекста
export function useStroop() {
  const context = useContext(StroopContext);
  if (context === undefined) {
    throw new Error('useStroop must be used within a StroopProvider');
  }
  return context;
}