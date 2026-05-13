export const saveResults = (data: unknown): void => {
  try {
    const saved = localStorage.getItem('stroop_results');
    const existing = saved ? JSON.parse(saved) : [];
    const newData = Array.isArray(existing) ? [...existing, data] : [data];
    localStorage.setItem('stroop_results', JSON.stringify(newData));
    alert('Результаты сохранены!');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Не удалось сохранить результаты');
  }
};

export const loadResults = (): unknown[] => {
  try {
    const saved = localStorage.getItem('stroop_results');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return [];
  }
};