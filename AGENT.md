# План разработки Stroop-теста

## Технологический стек
- React 19 + TypeScript
- Vite
- CSS Modules
- React Context + useReducer
- Vitest + React Testing Library (тестирование)

## Текущее состояние
Проект инициализирован, созданы компоненты `DifficultySelector`, `Stimulus`, `ButtonPanel`, `Timer`, `Results`, реализован `StroopContext`, утилиты `constants`, `stimulus`, `metrics`, типы.

## Пошаговый план

### Этап 1: Структура проекта и типы
- [ ] Создать папки: components/, context/, utils/, types/
- [ ] Настроить tsconfig.json для абсолютных импортов
- [ ] Создать types/index.ts (Color, Stimulus, Answer, Metrics, StroopState)

### Этап 2: Контекст и редьюсер
- [ ] Создать StroopContext.tsx
- [ ] Реализовать редьюсер с экшенами: INIT_TEST, RECORD_ANSWER, NEXT_STIMULUS, COMPLETE_TEST, RESET_TEST, UPDATE_ELAPSED_TIME

### Этап 3: Утилиты
- [ ] constants.ts — цвета, конфиги уровней сложности
- [ ] stimulus.ts — generateStimuli()
- [ ] metrics.ts — calculateMetrics()

### Этап 4: Компоненты
- [ ] DifficultySelector (выбор сложности)
- [ ] Stimulus (слово с цветом)
- [ ] ButtonPanel (кнопки цветов + измерение времени через useRef)
- [ ] Timer (отображение времени)
- [ ] Results (результаты)

### Этап 5: Интеграция в App.tsx
- [ ] Условный рендеринг: idle → DifficultySelector, running → Stimulus+ButtonPanel+Timer, completed → Results
- [ ] setInterval для обновления elapsedTime

### Этап 6: Доработки
- [ ] Таймаут 3 секунды для среднего и сложного уровня (ButtonPanel.tsx)
- [ ] Округление точности в Results (Math.round)
- [ ] Горизонтальная панель выбора сложности (DifficultySelector)

### Этап 7: Тестирование (Vitest)
- [ ] Настроить Vitest
- [ ] Тесты для generateStimuli (30 стимулов, 50/50)
- [ ] Тесты для calculateMetrics (точность, среднее время)

## Команды
```bash
npm run dev        # запуск проекта
npm run test       # запуск тестов
npm run build      # сборка