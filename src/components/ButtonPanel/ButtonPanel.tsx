import { useState, useEffect } from 'react';
import { useStroop } from '../../context/StroopContext';
import { COLOR_NAMES, COLOR_HEX } from '../../utils/constants';
import type { Color } from '../../types';
import styles from './ButtonPanel.module.css';

export function ButtonPanel() {
  const { state, dispatch } = useStroop();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Получаем доступные цвета для текущего уровня сложности
  const availableColors: Color[] =
    state.difficulty === 'easy'
      ? ['red', 'green', 'blue', 'yellow']
      : state.difficulty === 'medium'
      ? ['red', 'green', 'blue', 'yellow', 'purple']
      : ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

  const currentStimulus = state.currentStimulus;

  useEffect(() => {
    // Сброс выбора при смене стимула
    setSelectedColor(null);
    setIsProcessing(false);
  }, [currentStimulus?.id]);

  if (!currentStimulus) {
    return (
      <div className={styles.container}>
        <p className={styles.noStimulus}>Стимул не загружен</p>
      </div>
    );
  }

  const handleColorClick = (color: Color) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSelectedColor(color);

    const reactionTime = 0; // TODO: заменить на реальное время реакции (из хука useTimer)
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();

    // Диспатч записи ответа
    dispatch({
      type: 'RECORD_ANSWER',
      payload: {
        stimulusId: currentStimulus.id,
        selectedColor: color,
        reactionTime,
        timestamp,
      },
    });

    // Задержка перед следующим стимулом для визуальной обратной связи
    setTimeout(() => {
      dispatch({ type: 'NEXT_STIMULUS' });
    }, 500);
  };

  const isCorrect = (color: Color) =>
    color === currentStimulus.color;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Выберите цвет шрифта</h3>
      <p className={styles.subtitle}>
        Текущий стимул: <strong>{COLOR_NAMES[currentStimulus.word]}</strong>
        <br />
        Конгруэнтность:{' '}
        <span className={currentStimulus.congruent ? styles.congruent : styles.incongruent}>
          {currentStimulus.congruent ? 'конгруэнтный' : 'неконгруэнтный'}
        </span>
      </p>

      <div className={styles.buttons}>
        {availableColors.map((color) => {
          const hex = COLOR_HEX[color];
          const isSelected = selectedColor === color;
          const correct = isCorrect(color);
          let buttonClass = styles.button;
          if (isSelected) {
            buttonClass += ` ${correct ? styles.correct : styles.incorrect}`;
          }

          return (
            <button
              key={color}
              className={buttonClass}
              style={{
                backgroundColor: hex,
                color: color === 'yellow' || color === 'white' ? '#333' : 'white',
                border: `3px solid ${isSelected ? (correct ? '#2ecc71' : '#e74c3c') : hex}`,
                transform: isSelected ? 'scale(0.95)' : 'scale(1)',
              }}
              onClick={() => handleColorClick(color)}
              disabled={isProcessing}
              aria-label={`Выбрать ${COLOR_NAMES[color]}`}
            >
              <span className={styles.colorName}>{COLOR_NAMES[color]}</span>
              <span className={styles.hex}>{hex}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.feedback}>
        {selectedColor && (
          <p className={isCorrect(selectedColor) ? styles.feedbackCorrect : styles.feedbackIncorrect}>
            {isCorrect(selectedColor) ? '✓ Верно!' : '✗ Неверно. Правильный цвет: ' + COLOR_NAMES[currentStimulus.color]}
          </p>
        )}
        {isProcessing && <p className={styles.processing}>Загрузка следующего стимула...</p>}
      </div>

      <div className={styles.stats}>
        <span>Ответов: {state.answers.length}</span>
        <span>Осталось: {state.stimuli.length - state.answers.length}</span>
      </div>
    </div>
  );
}