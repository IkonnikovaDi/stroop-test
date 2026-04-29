import { useState, useEffect } from 'react';
import { useStroop } from '../../context/StroopContext';
import { useReactionTimer } from '../../hooks/useTimer';
import { COLOR_NAMES, COLOR_HEX, DIFFICULTY_CONFIGS } from '../../utils/constants';
import type { Color } from '../../types';
import styles from './ButtonPanel.module.css';

export function ButtonPanel() {
  const { state, dispatch } = useStroop();
  const { startMeasurement, stopMeasurement, resetMeasurement } = useReactionTimer();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Доступные цвета из конфига (а не хардкод)
  const availableColors = DIFFICULTY_CONFIGS[state.difficulty].colors;

  const currentStimulus = state.currentStimulus;

  // Запуск таймера при новом стимуле
  useEffect(() => {
    if (currentStimulus && !isProcessing) {
      startMeasurement();
    }
  }, [currentStimulus?.id]);

  // Сброс при смене стимула
  useEffect(() => {
    setSelectedColor(null);
    setIsProcessing(false);
    resetMeasurement();
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

    const reactionTime = stopMeasurement(); // ← реальное время реакции!

    setIsProcessing(true);
    setSelectedColor(color);

    dispatch({
      type: 'RECORD_ANSWER',
      payload: {
        stimulusId: currentStimulus.id,
        selectedColor: color,
        reactionTime,
        timestamp: Date.now(),
      },
    });

    setTimeout(() => {
      dispatch({ type: 'NEXT_STIMULUS' });
    }, 500);
  };

  const isCorrect = (color: Color) => color === currentStimulus.color;

  return (
    <div className={styles.container}>
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

    </div>
  );
}