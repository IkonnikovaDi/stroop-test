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
  const { state } = useStroop();
  const { status, currentStimulus } = state;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stroop-тест</h1>
        <p>Оцените свой когнитивный контроль</p>
      </header>

      <main className="app-main">
        {status === 'idle' && <DifficultySelector />}

        {(status === 'running' || status === 'paused') && (
          <div className="test-session">
            <div className="session-left">
              <Stimulus
                word={currentStimulus?.word || 'red'}
                color={currentStimulus?.color || 'red'}
                displayTime={1500}
              />
              <ButtonPanel />
            </div>
            <div className="session-right">
              <Timer />
              <Stats />
            </div>
          </div>
        )}

        {status === 'completed' && <Results />}
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
