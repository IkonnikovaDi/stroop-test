import { useStroop } from '../../context/StroopContext';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';
import styles from './Results.module.css';

export function Results() {
  const { state, dispatch } = useStroop();
  const { metrics, difficulty, elapsedTime, answers, stimuli } = state;

  if (!metrics) {
    return (
      <div className={styles.container}>
        <h2>Результаты теста</h2>
        <p>Метрики не рассчитаны. Завершите тест для просмотра результатов.</p>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIGS[difficulty];
  const totalStimuli = stimuli.length;
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

  const handleViewHistory = () => {
    // TODO: переход к экрану истории
    alert('Функция истории будет реализована позже');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Тест завершён!</h1>
        <p className={styles.subtitle}>
          Вы прошли Stroop-тест на уровне сложности «{config.name}».
          <br />
          Общее время: {formatTime(elapsedTime)}
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

        <div className={`${styles.metricCard} ${styles.speed}`}>
          <div className={styles.metricIcon}>⚡</div>
          <div className={styles.metricValue}>{metrics.speed.toFixed(1)}</div>
          <div className={styles.metricLabel}>Скорость (стимулов/мин)</div>
          <div className={styles.metricSub}>
            {totalStimuli} стимулов за {formatTime(elapsedTime)}
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.reaction}`}>
          <div className={styles.metricIcon}>⏱️</div>
          <div className={styles.metricValue}>{metrics.averageReactionTime} мс</div>
          <div className={styles.metricLabel}>Среднее время реакции</div>
          <div className={styles.metricSub}>
            Конгруэнтные: {metrics.congruentAvgTime} мс,
            Неконгруэнтные: {metrics.incongruentAvgTime} мс
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.interference}`}>
          <div className={styles.metricIcon}>📊</div>
          <div className={styles.metricValue}>
            {metrics.interferenceIndex > 0 ? '+' : ''}
            {metrics.interferenceIndex.toFixed(1)} мс
          </div>
          <div className={styles.metricLabel}>Индекс интерференции</div>
          <div className={styles.metricSub}>
            Разница между конгруэнтными и неконгруэнтными
          </div>
        </div>
      </div>

      <div className={styles.detailedTable}>
        <h3>Детальные результаты</h3>
        <table>
          <thead>
            <tr>
              <th>Показатель</th>
              <th>Значение</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Всего стимулов</td>
              <td>{totalStimuli}</td>
              <td>Количество показанных слов</td>
            </tr>
            <tr>
              <td>Правильные ответы</td>
              <td>{correct}</td>
              <td>Количество верно выбранных цветов</td>
            </tr>
            <tr>
              <td>Ошибочные ответы</td>
              <td>{incorrect}</td>
              <td>Количество неверных выборов</td>
            </tr>
            <tr>
              <td>Конгруэнтные стимулы</td>
              <td>{stimuli.filter(s => s.congruent).length}</td>
              <td>Слово и цвет совпадают</td>
            </tr>
            <tr>
              <td>Неконгруэнтные стимулы</td>
              <td>{stimuli.filter(s => !s.congruent).length}</td>
              <td>Слово и цвет различаются</td>
            </tr>
            <tr>
              <td>Общее время теста</td>
              <td>{formatTime(elapsedTime)}</td>
              <td>От начала до завершения</td>
            </tr>
            <tr>
              <td>Уровень сложности</td>
              <td>{config.name}</td>
              <td>{config.description}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleRestart}>
          Повторить этот уровень
        </button>
        <button className={styles.actionButton} onClick={handleNewTest}>
          Новый тест
        </button>
        <button className={styles.actionButton} onClick={handleViewHistory}>
          История результатов
        </button>
      </div>

      <div className={styles.feedback}>
        <h3>Интерпретация результатов</h3>
        <p>
          <strong>Индекс интерференции</strong> показывает, насколько сложнее
          обрабатывать неконгруэнтные стимулы по сравнению с конгруэнтными.
          Положительное значение означает, что неконгруэнтные стимулы требуют
          больше времени на реакцию (что нормально для Stroop-эффекта).
        </p>
        <p>
          <strong>Точность выше 90%</strong> считается отличным результатом.
          <strong>Среднее время реакции менее 800 мс</strong> указывает на
          высокую скорость когнитивной обработки.
        </p>
        <p>
          Попробуйте пройти тест на другом уровне сложности, чтобы сравнить
          свои показатели!
        </p>
      </div>
    </div>
  );
}