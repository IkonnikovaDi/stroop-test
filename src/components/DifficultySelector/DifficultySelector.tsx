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
    <div className={styles.container}>
      <h1 className={styles.title}>Stroop-тест</h1>
      <p className={styles.subtitle}>
        Выберите уровень сложности и начните тестирование.
        <br />
        Вам будет показано слово, обозначающее цвет, написанное цветным шрифтом.
        <br />
        Выберите цвет шрифта, игнорируя значение слова.
      </p>

      <div className={styles.cards}>
        {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => {
          const difficulty = key as Difficulty;
          return (
            <div
              key={difficulty}
              className={`${styles.card} ${styles[difficulty]}`}
            >
              <h2 className={styles.cardTitle}>{config.name}</h2>
              <p className={styles.cardDescription}>{config.description}</p>
              <ul className={styles.cardDetails}>
                <li>
                  <strong>Цвета:</strong> {config.colors.length}
                </li>
                <li>
                  <strong>Стимулов:</strong> {config.stimulusCount}
                </li>
                <li>
                  <strong>Конгруэнтных:</strong>{' '}
                  {config.congruentRatio === 0
                    ? '0%'
                    : config.congruentRatio === 1
                    ? '100%'
                    : `${Math.round(config.congruentRatio * 100)}%`}
                </li>
                {config.timeLimit && (
                  <li>
                    <strong>Лимит времени:</strong> {config.timeLimit} сек
                  </li>
                )}
              </ul>
              <button
                className={styles.startButton}
                onClick={() => handleStart(difficulty)}
              >
                Начать
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.instructions}>
        <h3>Как проходит тест:</h3>
        <ol>
          <li>Нажмите "Начать" для выбранного уровня сложности.</li>
          <li>
            На экране появится слово (например, "<span style={{ color: '#FF0000' }}>Красный</span>"
            ), написанное цветным шрифтом.
          </li>
          <li>
            Выберите цвет шрифта, нажав на соответствующую кнопку в панели.
          </li>
          <li>Старайтесь отвечать как можно быстрее и точнее.</li>
          <li>После завершения вы увидите статистику ваших результатов.</li>
        </ol>
      </div>
    </div>
  );
}