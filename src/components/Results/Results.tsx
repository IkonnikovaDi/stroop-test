import { useStroop } from '../../context/StroopContext';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';
import styles from './Results.module.css';

export function Results() {
  const { state, dispatch } = useStroop();
  const { metrics, difficulty, elapsedTime, answers } = state;

  if (!metrics) {
    return (
      <div className={styles.container}>
        <h2>Результаты теста</h2>
        <p>Метрики не рассчитаны. Завершите тест для просмотра результатов.</p>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIGS[difficulty];
  const correct = answers.filter(a => a.isCorrect).length;
  const incorrect = answers.filter(a => !a.isCorrect).length;

  const handleRestart = () => {
    dispatch({ type: 'RESET_TEST' });
  };

  const handleNewTest = () => {
    dispatch({ type: 'RESET_TEST' });
    // После сброса пользователь должен выбрать уровень сложности
    // (это произойдет автоматически, т.к. статус станет 'idle')
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Тест завершён!</h1>
        <p className={styles.subtitle}>
          Уровень сложности: <strong>{config.name}</strong>
          <br />
          Общее время: <strong>{formatTime(elapsedTime)}</strong>
        </p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${styles.accuracy}`}>
          <div className={styles.metricIcon}>🎯</div>
          <div className={styles.metricValue}>{metrics.accuracy}%</div>
          <div className={styles.metricLabel}>Точность</div>
          <div className={styles.metricSub}>
            {correct} верных, {incorrect} ошибок
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.reaction}`}>
          <div className={styles.metricIcon}>⏱️</div>
          <div className={styles.metricValue}>{metrics.averageReactionTime} мс</div>
          <div className={styles.metricLabel}>Среднее время реакции</div>
          <div className={styles.metricSub}></div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleRestart}>
          Повторить этот уровень
        </button>
        <button className={styles.actionButton} onClick={handleNewTest}>
          Новый тест
        </button>
      </div>
    </div>
  );
}