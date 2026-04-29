import { StroopProvider } from './context/StroopContext';
import { DifficultySelector } from './components/DifficultySelector/DifficultySelector';
import { Stimulus } from './components/Stimulus/Stimulus';
import { ButtonPanel } from './components/ButtonPanel/ButtonPanel';
import { Timer } from './components/Timer/Timer';
import { Stats } from './components/Stats/Stats';
import { Results } from './components/Results/Results';
import { useStroop } from './context/StroopContext';
import './App.css';

function StroopApp() {
  const { state, dispatch } = useStroop();
  const { status, currentStimulus, difficulty } = state;

  const handlePause = () => {
    dispatch({ type: 'PAUSE_TEST' });
  };

  const handleResume = () => {
    dispatch({ type: 'RESUME_TEST' });
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TEST' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stroop-тест</h1>
        <p>Оцените свой когнитивный контроль</p>
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
              <div className="session-controls">
                <h3>Управление тестом</h3>
                <div className="control-buttons">
                  {status === 'running' && (
                    <button className="control-button pause" onClick={handlePause}>
                      ⏸️ Пауза
                    </button>
                  )}
                  {status === 'paused' && (
                    <button className="control-button resume" onClick={handleResume}>
                      ▶️ Продолжить
                    </button>
                  )}
                  <button className="control-button complete" onClick={handleComplete}>
                    ✅ Завершить досрочно
                  </button>
                  <button className="control-button reset" onClick={handleReset}>
                    🔄 Сбросить тест
                  </button>
                </div>
                <p className="control-hint">
                  Уровень сложности: <strong>{difficulty}</strong>. Вы можете приостановить тест в любой момент.
                </p>
              </div>
            </div>
            <div className="session-right">
              <Timer />
              <Stats />
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="results-screen">
            <Results />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Stroop-тест &copy; {new Date().getFullYear()} • Разработано в рамках
          учебного проекта •{' '}
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Исходный код
          </a>
        </p>
      </footer>
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
