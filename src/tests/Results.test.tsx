// src/tests/Results.test.tsx
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Results } from '../components/Results/Results';
import { useStroop } from '../context/StroopContext';
import type { StroopState } from '../types';

// Мокаем хук useStroop
vi.mock('../context/StroopContext', () => ({
  useStroop: vi.fn(),
}));

const mockUseStroop = vi.mocked(useStroop);

describe('Results component integration test', () => {
  let setItemSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Мокаем localStorage.setItem
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    // Мокаем alert
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('рендерит компонент с данными и кнопкой сохранения', () => {
    // Создаём состояние с завершённым тестом
    const mockState: StroopState = {
      status: 'completed',
      difficulty: 'medium',
      currentStimulus: null,
      stimuli: [],
      answers: [
        { stimulusId: '1', selectedColor: 'red', reactionTime: 1200, isCorrect: true, timestamp: 1000 },
        { stimulusId: '2', selectedColor: 'blue', reactionTime: 1500, isCorrect: false, timestamp: 2500 },
      ],
      metrics: {
        totalStimuli: 2,
        correctAnswers: 1,
        incorrectAnswers: 1,
        accuracy: 50,
        averageReactionTime: 1350,
        interferenceIndex: 0,
        speed: 30,
        congruentAvgTime: 1200,
        incongruentAvgTime: 1500,
      },
      startTime: 1000,
      endTime: 5000,
      elapsedTime: 4,
      currentStimulusStartTime: null,
      currentStimulusTime: 0,
    };

    mockUseStroop.mockReturnValue({
      state: mockState,
      dispatch: vi.fn(),
    });

    render(<Results />);

    // Проверяем, что компонент отображает заголовок
    expect(screen.getByText(/Тест завершён!/i)).toBeInTheDocument();
    // Проверяем наличие кнопок
    expect(screen.getByText(/Повторить этот уровень/i)).toBeInTheDocument();
    expect(screen.getByText(/Новый тест/i)).toBeInTheDocument();
    expect(screen.getByText(/💾 Сохранить результаты/i)).toBeInTheDocument();
  });

  test('при нажатии кнопки "Сохранить результаты" вызывается localStorage.setItem', () => {
    const mockState: StroopState = {
      status: 'completed',
      difficulty: 'medium',
      currentStimulus: null,
      stimuli: [],
      answers: [
        { stimulusId: '1', selectedColor: 'red', reactionTime: 1200, isCorrect: true, timestamp: 1000 },
      ],
      metrics: {
        totalStimuli: 1,
        correctAnswers: 1,
        incorrectAnswers: 0,
        accuracy: 100,
        averageReactionTime: 1200,
        interferenceIndex: 0,
        speed: 30,
        congruentAvgTime: 1200,
        incongruentAvgTime: 0,
      },
      startTime: 1000,
      endTime: 3000,
      elapsedTime: 2,
      currentStimulusStartTime: null,
      currentStimulusTime: 0,
    };

    mockUseStroop.mockReturnValue({
      state: mockState,
      dispatch: vi.fn(),
    });

    render(<Results />);

    // Находим кнопку сохранения
    const saveButton = screen.getByText(/💾 Сохранить результаты/i);
    // Нажимаем на неё
    fireEvent.click(saveButton);

    // Проверяем, что localStorage.setItem был вызван
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    // Проверяем, что ключ правильный
    expect(setItemSpy).toHaveBeenCalledWith('stroop_results', expect.any(String));
    // Проверяем, что данные содержат ожидаемые поля
    const callArgs = setItemSpy.mock.calls[0];
    const storedData = JSON.parse(callArgs[1]);
    expect(storedData).toBeInstanceOf(Array);
    expect(storedData[0]).toMatchObject({
      difficulty: expect.any(String),
      accuracy: expect.any(Number),
      avgReactionTime: expect.any(Number),
      correct: expect.any(Number),
      incorrect: expect.any(Number),
      totalTime: expect.any(Number),
    });
  });
});