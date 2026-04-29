/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type {
  StroopState,
  Action,
  Stimulus,
  Answer,
  // Metrics,
  Color,
  Difficulty,
} from '../types';
import { calculateMetrics } from '../utils/metrics';

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

// Редьюсер
function stroopReducer(state: StroopState, action: Action): StroopState {
  switch (action.type) {
    case 'INIT_TEST': {
      const payload = action.payload as { difficulty: Difficulty; stimuli: Stimulus[] };
      const { difficulty, stimuli } = payload;
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
      const payload = action.payload as { stimulusId: string; selectedColor: Color; reactionTime: number; timestamp: number };
      const { stimulusId, selectedColor, reactionTime, timestamp } = payload;
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
    case 'UPDATE_ELAPSED_TIME': {
      const payload = action.payload as { elapsedTime: number };
      return { ...state, elapsedTime: payload.elapsedTime };
    }
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