import { useStroop } from '../../context/StroopContext';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import styles from './Timer.module.css';

export function Timer() {
  const { state, dispatch } = useStroop();
  const { status, difficulty, elapsedTime } = state;

  const config = DIFFICULTY_CONFIGS[difficulty];
  const timeLimit = config.timeLimit; // в секундах

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLimit ? (elapsedTime / timeLimit) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Таймер сессии</h3>
        <span className={styles.status}>
          Статус:{' '}
          <span className={styles[status]}>
            {status === 'idle' && 'Ожидание'}
            {status === 'running' && 'В процессе'}
            {status === 'paused' && 'Пауза'}
            {status === 'completed' && 'Завершено'}
          </span>
        </span>
      </div>

      <div className={styles.timeDisplay}>
        <div className={styles.time}>{formatTime(elapsedTime)}</div>
        <div className={styles.timeLabel}>Прошедшее время</div>
      </div>

      {timeLimit && (
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            Лимит: {timeLimit} сек ({Math.round(progress)}%)
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.controls}>
        {status === 'running' && (
          <button
            className={styles.controlButton}
            onClick={() => {
              dispatch({ type: 'PAUSE_TEST' });
            }}
          >
            Пауза
          </button>
        )}
        {(status === 'paused' || status === 'idle') && (
          <button
            className={styles.controlButton}
            onClick={() => {
              dispatch({ type: 'RESUME_TEST' });
            }}
          >
            {status === 'idle' ? 'Старт' : 'Продолжить'}
          </button>
        )}
        <button
          className={styles.controlButton}
          onClick={() => {
            dispatch({ type: 'RESET_TEST' });
          }}
        >
          Сброс
        </button>
        <button
          className={styles.controlButton}
          onClick={() => dispatch({ type: 'COMPLETE_TEST' })}
          disabled={status === 'completed'}
        >
          Завершить досрочно
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Уровень:</span>
          <span className={styles.statValue}>{config.name}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Стимулов:</span>
          <span className={styles.statValue}>
            {state.answers.length} / {state.stimuli.length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Точность:</span>
          <span className={styles.statValue}>
            {state.answers.length > 0
              ? Math.round(
                  (state.answers.filter(a => a.isCorrect).length /
                    state.answers.length) *
                    100
                )
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
}