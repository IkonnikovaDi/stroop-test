import { useStroop } from '../../context/StroopContext';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import styles from './Stats.module.css';

export function Stats() {
  const { state } = useStroop();
  const { answers, stimuli, difficulty, status, metrics } = state;

  const totalStimuli = stimuli.length;
  const completed = answers.length;
  const remaining = totalStimuli - completed;
  const correct = answers.filter(a => a.isCorrect).length;
  const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;

  const avgTime = metrics?.averageReactionTime || 0;
  const interference = metrics?.interferenceIndex || 0;

  const config = DIFFICULTY_CONFIGS[difficulty];

  return (
    <div className={styles.container}>
      <h3>Статистика теста</h3>

      <div className={styles.stats}>
        <div>
          <strong>Уровень:</strong> {config.name}
        </div>
        <div>
          <strong>Прогресс:</strong> {completed} / {totalStimuli} ({remaining} осталось)
        </div>
        <div>
          <strong>Точность:</strong> {accuracy}% ({correct} верно, {completed - correct} ошибок)
        </div>
        <div>
          <strong>Среднее время:</strong> {Math.round(avgTime)} мс
        </div>
        <div>
          <strong>Интерференция:</strong> {interference > 0 ? '+' : ''}{Math.round(interference)} мс
        </div>
        <div>
          <strong>Статус:</strong> {status === 'running' ? 'В процессе' : status === 'completed' ? 'Завершён' : 'Ожидание'}
        </div>
      </div>
    </div>
  );
}