import { useEffect, useState } from 'react';
import { COLOR_NAMES, COLOR_HEX } from '../../utils/constants';
import type { Color, Word } from '../../types';
import styles from './Stimulus.module.css';

interface StimulusProps {
  word: Word;
  color: Color;
  /** Время показа стимула в мс (для анимации) */
  displayTime?: number;
  /** Callback, вызываемый когда стимул полностью показан */
  onDisplayComplete?: () => void;
}

export function Stimulus({
  word,
  color,
  displayTime = 1500,
  onDisplayComplete,
}: StimulusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Анимация появления
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Анимация исчезновения (если нужно)
    if (displayTime > 0) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, displayTime - 300); // начинаем fade-out за 300 мс до конца

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        onDisplayComplete?.();
      }, displayTime);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [displayTime, onDisplayComplete]);

  const wordText = COLOR_NAMES[word];
  const colorHex = COLOR_HEX[color];

  return (
    <div className={styles.container}>
      <div
        className={`${styles.stimulus} ${isVisible ? styles.visible : ''} ${
          isFading ? styles.fading : ''
        }`}
        style={{ color: colorHex }}
        aria-label={`Слово "${wordText}" написано цветом ${COLOR_NAMES[color]}`}
      >
        {wordText}
      </div>
    </div>
  );
}