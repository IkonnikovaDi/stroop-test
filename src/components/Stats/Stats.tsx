import { useStroop } from '../../context/StroopContext';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import styles from './Stats.module.css';

export function Stats() {
  const { state } = useStroop();
  const { answers, stimuli, difficulty, status } = state;

  const totalStimuli = stimuli.length;
  const completed = answers.length;
  const remaining = totalStimuli - completed;
  const correct = answers.filter(a => a.isCorrect).length;
  const incorrect = answers.filter(a => !a.isCorrect).length;
  const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;

  const averageReactionTime =
    answers.length > 0
      ? Math.round(
          answers.reduce((sum, a) => sum + a.reactionTime, 0) / answers.length
        )
      : 0;

  const config = DIFFICULTY_CONFIGS[difficulty];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Статистика теста</h3>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Уровень сложности</div>
            <div className={styles.cardValue}>{config.name}</div>
            <div className={styles.cardSub}>{config.description}</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Точность</div>
            <div className={styles.cardValue}>{accuracy}%</div>
            <div className={styles.cardSub}>
              {correct} верно, {incorrect} ошибок
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>⏱️</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Среднее время реакции</div>
            <div className={styles.cardValue}>{averageReactionTime} мс</div>
            <div className={styles.cardSub}>
              {answers.length > 0 ? 'по всем ответам' : 'нет данных'}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📈</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Прогресс</div>
            <div className={styles.cardValue}>
              {completed} / {totalStimuli}
            </div>
            <div className={styles.cardSub}>
              {remaining > 0 ? `${remaining} осталось` : 'завершено'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.detailedStats}>
        <h4>Детальная статистика</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Показатель</th>
              <th>Значение</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Статус теста</td>
              <td>
                <span className={styles[status]}>
                  {status === 'idle' && 'Ожидание'}
                  {status === 'running' && 'В процессе'}
                  {status === 'paused' && 'Пауза'}
                  {status === 'completed' && 'Завершено'}
                </span>
              </td>
              <td>Текущее состояние сессии</td>
            </tr>
            <tr>
              <td>Конгруэнтные стимулы</td>
              <td>
                {stimuli.filter(s => s.congruent).length} из {totalStimuli}
              </td>
              <td>Слово и цвет совпадают</td>
            </tr>
            <tr>
              <td>Неконгруэнтные стимулы</td>
              <td>
                {stimuli.filter(s => !s.congruent).length} из {totalStimuli}
              </td>
              <td>Слово и цвет различаются</td>
            </tr>
            <tr>
              <td>Скорость ответов</td>
              <td>
                {completed > 0
                  ? Math.round((completed / (state.elapsedTime || 1)) * 60)
                  : 0}{' '}
                стимулов/мин
              </td>
              <td>Количество ответов в минуту</td>
            </tr>
            <tr>
              <td>Лимит времени</td>
              <td>{config.timeLimit ? `${config.timeLimit} сек` : 'нет'}</td>
              <td>Ограничение на ответ для уровня</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#2ecc71' }} />
          <span>Конгруэнтные стимулы</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#e74c3c' }} />
          <span>Неконгруэнтные стимулы</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#3498db' }} />
          <span>Правильные ответы</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ background: '#f39c12' }} />
          <span>Ошибочные ответы</span>
        </div>
      </div>
    </div>
  );
}