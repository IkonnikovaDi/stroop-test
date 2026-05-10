import { useStroop } from '../../context/StroopContext';
import { generateStimuli } from '../../utils/stimulus';
import { DIFFICULTY_CONFIGS } from '../../utils/constants';
import type { Difficulty } from '../../types';
import styles from './DifficultySelector.module.css';

export function DifficultySelector() {
  const { dispatch } = useStroop();

  const handleStart = (difficulty: Difficulty) => {
    const stimuli = generateStimuli(difficulty);
    dispatch({
      type: 'INIT_TEST',
      payload: { difficulty, stimuli },
    });
  };

  return (
    <div className={styles.horizontalContainer}>
      <h2 className={styles.panelTitle}>Выберите уровень сложности</h2>
      <div className={styles.panel}>
        {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => {
          const difficulty = key as Difficulty;
          return (
            <div
              key={difficulty}
              className={`${styles.panelCard} ${styles[difficulty]}`}
            >
              <h3 className={styles.panelCardTitle}>{config.name}</h3>
              <p className={styles.panelCardDescription}>{config.description}</p>
              <button
                className={styles.panelButton}
                onClick={() => handleStart(difficulty)}
              >
                Начать
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}