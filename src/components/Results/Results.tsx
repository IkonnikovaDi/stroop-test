import { useStroop } from '../../context/StroopContext';
import { generateStimuli } from '../../utils/stimulus';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import { saveResults } from '../../services/localStorageService';
import styles from './Results.module.css';

export function Results() {
  const { state, dispatch } = useStroop();
  const { metrics, difficulty, elapsedTime, answers } = state;

  if (!metrics) {
    return <div className={styles.container}>Загрузка результатов...</div>;
  }

  const config = DIFFICULTY_CONFIGS[difficulty];
  // Используем данные из metrics, если они есть, иначе вычисляем из answers
  const correct = metrics.correctAnswers ?? answers.filter(a => a.isCorrect).length;
  const incorrect = metrics.incorrectAnswers ?? (answers.length - correct);

  const handleRestart = () => {   /* новый набор стимулов */
    const stimuli = generateStimuli(difficulty);
    dispatch({
      type: 'INIT_TEST',
      payload: { difficulty, stimuli },
    });
  };

  const handleNewTest = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  const handleSave = () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      difficulty: config.name,
      accuracy: Math.round(metrics.accuracy),
      avgReactionTime: Math.round(metrics.averageReactionTime),
      correct,
      incorrect,
      totalTime: elapsedTime,
    };
    saveResults(sessionData);
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Тест завершён!</h1>
        <p className={styles.subtitle}>
          Уровень сложности: <strong>{config.name}</strong>
          <br />
          Общее время: <strong>{formatSeconds(elapsedTime)}</strong>
        </p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${styles.accuracy}`}>
          <div className={styles.metricValue}>{Math.round(metrics.accuracy)}%</div>
          <div className={styles.metricLabel}>Точность</div>
          <div className={styles.metricSub}>
            {correct} верных, {incorrect} ошибок
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.reaction}`}>
          <div className={styles.metricValue}>{Math.round(metrics.averageReactionTime)} мс</div>
          <div className={styles.metricLabel}>Среднее время реакции</div>
        </div>

        <div className={`${styles.metricCard} ${styles.interference}`}>
          <div className={styles.metricValue}>{Math.round(metrics.interferenceIndex)} мс</div>
          <div className={styles.metricLabel}>Индекс интерференции</div>
          <div className={styles.metricSub}>
            {metrics.interferenceIndex > 0 ? 'Замедление на ' : 'Ускорение на '}
            {Math.abs(Math.round(metrics.interferenceIndex))} мс
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleRestart}>
          Повторить этот уровень
        </button>
        <button className={styles.actionButton} onClick={handleNewTest}>
          Новый тест
        </button>
        <button className={styles.actionButton} onClick={handleSave}>
          💾 Сохранить результаты
        </button>
      </div>
    </div>
  );
}