import { StroopProvider } from './context/StroopContext';
import { DifficultySelector } from './components/DifficultySelector/DifficultySelector';
import { Stimulus } from './components/Stimulus/Stimulus';
import { ButtonPanel } from './components/ButtonPanel/ButtonPanel';
import { Timer } from './components/Timer/Timer';
import { Results } from './components/Results/Results';
import { useStroop } from './context/StroopContext';
import { useEffect, useRef } from 'react';
import './App.css';

function StroopApp() {
  const { state, dispatch } = useStroop();
  const { status, currentStimulus, startTime, currentStimulusStartTime } = state;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Эффект для обновления прошедшего времени
  useEffect(() => {
    if (status === 'running' && startTime) {
      // Очищаем предыдущий интервал, если он есть
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Запускаем интервал обновления каждые 100 мс
      intervalRef.current = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // в секундах
        dispatch({
          type: 'UPDATE_ELAPSED_TIME',
          payload: { elapsedTime },
        });
        // Обновляем время текущего стимула
        if (currentStimulusStartTime !== null) {
          const currentStimulusTime = (Date.now() - currentStimulusStartTime) / 1000;
          dispatch({
            type: 'UPDATE_CURRENT_STIMULUS_TIME',
            payload: currentStimulusTime,
          });
        }
      }, 100);
    } else {
      // Останавливаем интервал, если тест не запущен
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Очистка интервала при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, startTime, dispatch, currentStimulusStartTime]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stroop-тест</h1>
      </header>

      <main className="app-main">
        {status === 'idle' && (
          <div className="difficulty-selector-screen">
            <DifficultySelector />
          </div>
        )}

        {(status === 'running' || status === 'paused') && (
          <div className="test-session">
            <div className="session-left">
              {currentStimulus ? (
                <Stimulus
                  word={currentStimulus.word}
                  color={currentStimulus.color}
                  displayTime={1500}
                />
              ) : (
                <div className="stimulus-placeholder">
                  <h3>Ожидание стимула...</h3>
                  <p>Стимулы загружаются. Если это сообщение не исчезает, проверьте настройки.</p>
                </div>
              )}
              <ButtonPanel />
            </div>
            <div className="session-right">
              <Timer />
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="results-screen">
            <Results />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <StroopProvider>
      <StroopApp />
    </StroopProvider>
  );
}

export default App;