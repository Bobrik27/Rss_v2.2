# Аудит производительности и качества кода
**Проект:** RSS_v2 (Astro v5, React 19, Tailwind CSS v4, GSAP, Canvas)  
**Дата аудита:** 26 декабря 2025  
**Аудитор:** Kilo Code (Senior Software Architect & Performance Auditor)

---

## Резюме

Проведён анализ кодовой базы с фокусом на компоненты `OldProjectHero.jsx`, `global.css` и Astro-страницы. Выявлены критические проблемы производительности, потенциальные утечки памяти, нарушения best practices и мёртвый код. Ниже представлен детальный отчёт с категоризацией проблем и рекомендациями по исправлению.

---

## CRITICAL: Критические проблемы

### 1. Утечка памяти в `OldProjectHero.jsx`
**Файл:** [`src/components/OldProjectHero.jsx`](src/components/OldProjectHero.jsx:357)  
**Описание:** При смене темы (`isDark`) эффект перезапускается (зависимость `[isDark]`), но cleanup выполняется только при размонтировании компонента. Если смена темы происходит быстро, предыдущие анимации GSAP, ticker, слушатели resize и ScrollTrigger могут не успеть очиститься, что приводит к накоплению обработчиков и утечке памяти.

**Код:**
```jsx
useEffect(() => {
  // ... инициализация canvas, анимаций
  return () => {
    gsap.ticker.remove(updateNetwork);
    ScrollTrigger.getAll().forEach(t => t.kill());
    window.removeEventListener('resize', resizeCanvas);
  };
}, [isDark]); // Перезапуск при смене темы
```

**Рекомендация:**  
- Вынести логику анимации в отдельный эффект без зависимости от `isDark`, а изменение цветов реализовать через обновление параметров (например, `networkSettings.lineColors`) без пересоздания всей сцены.
- Использовать `useRef` для хранения ссылок на активные анимации и убивать их перед повторной инициализацией.

### 2. Тяжёлые вычисления при каждой смене темы
**Файл:** [`src/components/OldProjectHero.jsx`](src/components/OldProjectHero.jsx:30)  
**Описание:** Эффект с зависимостью `[isDark]` пересоздаёт 800 точек, canvas, GSAP-анимации, ScrollTrigger и сетевые соединения. Это приводит к резкому падению FPS и излишней нагрузке на CPU.

**Рекомендация:**  
- Разделить эффект на два: один для инициализации (пустой массив зависимостей), второй для обновления цветов (с зависимостью `isDark`).
- Использовать `useMemo` для `cometColors` и `networkSettings`.

### 3. Использование `innerHTML` (потенциальная XSS)
**Файлы:**  
- [`src/components/OldProjectHero.jsx:300`](src/components/OldProjectHero.jsx:300)  
- [`src/components/FallingLetters.jsx:19`](src/components/FallingLetters.jsx:19)  
- [`src/components/HeroOld.jsx:28`](src/components/HeroOld.jsx:28)

**Описание:** Хотя текст статичен (`"RUNSWIFT STUDIO"`), использование `innerHTML` создаёт риски безопасности и менее производительно, чем создание элементов через `document.createElement`.

**Рекомендация:**  
- Заменить на `textContent` или использовать React-элементы (например, разбить строку на массив букв и отобразить через `map`).

### 4. Гидратационное несоответствие темы
**Файлы:**  
- [`src/pages/index.astro:13-17`](src/pages/index.astro:13)  
- [`src/components/ThemeToggle.tsx:8-16`](src/components/ThemeToggle.tsx:8)

**Описание:** В `index.astro` inline-скрипт принудительно устанавливает `data-theme="dark"` и `localStorage.setItem('theme', 'dark')`. Компонент `ThemeToggle` читает `localStorage` в `useEffect` (только на клиенте). Это может вызвать мигание темы (flash of incorrect theme) и расхождение между SSR и клиентом.

**Рекомендация:**  
- Убрать inline-скрипт и определять тему исключительно на клиенте (или использовать cookie и SSR-логику Astro).
- Использовать `useSyncExternalStore` для подписки на `localStorage` (React 18+).

---

## WARNING: Предупреждения (best practice violations)

### 1. Неэффективная анимация в `CometCanvas.jsx`
**Файл:** [`src/components/CometCanvas.jsx`](src/components/CometCanvas.jsx:173)  
**Описание:** В каждом кадре анимации выполняются регулярные выражения для извлечения цвета (`color.match`), что излишне. Также нет ограничения FPS, анимация работает на полной скорости, потребляя CPU даже когда страница неактивна.

**Рекомендация:**  
- Вынести разбор цвета в конструктор класса.
- Добавить `throttle` или использовать `requestAnimationFrame` с фиксированным шагом времени.

### 2. Некорректная очистка ScrollTrigger
**Файл:** [`src/components/OldProjectHero.jsx:359`](src/components/OldProjectHero.jsx:359)  
**Описание:** `ScrollTrigger.getAll().forEach(t => t.kill())` убивает все триггеры в документе, включая те, что принадлежат другим компонентам. Это может сломать анимации на других частях страницы.

**Рекомендация:**  
- Сохранять ссылку на созданный ScrollTrigger и убивать только его.

### 3. Случайные значения внутри `onUpdate`
**Файл:** [`src/components/OldProjectHero.jsx:327-344`](src/components/OldProjectHero.jsx:327)  
**Описание:** В `onUpdate` ScrollTrigger для каждой буквы вычисляются новые случайные значения (`randomYValue`, `randomXValue` и т.д.) на каждом кадре скролла. Это приводит к джиттеру и излишним вычислениям.

**Рекомендация:**  
- Вычислить случайные значения один раз при монтировании и сохранить в `useRef`.

### 4. Тяжёлая библиотека Matter.js в неиспользуемом компоненте
**Файл:** [`src/components/GravityHero.jsx`](src/components/GravityHero.jsx)  
**Описание:** Компонент `GravityHero` импортирует Matter.js (~250 КБ), но нигде не используется. Это увеличивает размер бандла.

**Рекомендация:**  
- Удалить компонент или закомментировать импорт, если он не нужен.

### 5. Дублирующий код
**Файлы:**  
- [`src/components/HeroOld.jsx`](src/components/HeroOld.jsx)  
- [`src/components/OldProjectHero.jsx`](src/components/OldProjectHero.jsx)

**Описание:** `HeroOld` содержит схожую логику анимации букв, но не используется. Дублирование усложняет поддержку.

**Рекомендация:**  
- Удалить `HeroOld.jsx` (или объединить с `OldProjectHero`).

---

## OPTIMIZATION: Оптимизации производительности

### 1. Мемоизация вычисляемых значений
**Файл:** [`src/components/OldProjectHero.jsx:48-60`](src/components/OldProjectHero.jsx:48)  
**Описание:** `cometColors` и `networkSettings` пересоздаются при каждом рендере.

**Рекомендация:**  
```jsx
const cometColors = useMemo(() => isDark ? [...darkColors] : [...lightColors], [isDark]);
const networkSettings = useMemo(() => ({ ... }), [cometColors]);
```

### 2. Отложенная загрузка тяжёлых компонентов
**Файл:** [`src/pages/index.astro:23`](src/pages/index.astro:23)  
**Описание:** `<OldProjectHero client:load />` загружается сразу. Можно отложить до появления в viewport.

**Рекомендация:**  
```astro
<OldProjectHero client:visible />
```

### 3. Оптимизация Canvas
**Файл:** [`src/components/OldProjectHero.jsx:77-82`](src/components/OldProjectHero.jsx:77)  
**Описание:** Canvas рисует 800 точек и линии каждый кадр.

**Рекомендация:**  
- Уменьшить `numPoints` до 400–500.
- Использовать `will-change: transform` для canvas.
- Отключить антиалиасинг для повышения производительности: `ctx.imageSmoothingEnabled = false`.

### 4. Code splitting для GSAP
**Описание:** GSAP и ScrollTrigger загружаются в каждом компоненте, где используются.

**Рекомендация:**  
- Динамически импортировать GSAP только на клиенте (в `useEffect`).
- Использовать Astro's `import()` для разделения чанков.

### 5. Убрать неиспользуемый CSS
**Файл:** [`src/styles/global.css:99-100`](src/styles/global.css:99)  
**Описание:** Класс `.scrollbar-hide` может не использоваться.

**Рекомендация:**  
- Проверить использование класса и удалить, если не нужен.

---

## CLEANUP: Очистка мёртвого кода

### 1. Неиспользуемые компоненты
Следующие компоненты не импортируются нигде (кроме взаимных импортов) и могут быть удалены:

- `src/components/GravityHero.jsx` (тяжёлый Matter.js)
- `src/components/HeroOld.jsx` (дубликат OldProjectHero)
- `src/components/FallingLetters.jsx` (использует CometCanvas, но сам не используется)
- `src/components/CometCanvas.jsx` (используется только в FallingLetters)

**Действие:** Удалить или закомментировать с пометкой `// DEPRECATED`.

### 2. Неиспользуемые импорты
Проверить все файлы на наличие неиспользуемых импортов (например, `useState` в `ThemeToggle` используется, но можно проверить остальные).

**Рекомендация:** Запустить линтер (ESLint) с правилом `no-unused-imports`.

### 3. Неиспользуемые CSS-классы
**Файл:** `src/styles/global.css`  
**Проверить:** `.scrollbar-hide`, возможно другие кастомные классы.

**Рекомендация:** Использовать инструмент типа `purgecss` или `tailwindcss-purge`.

---

## Дорожная карта исправлений

### Phase 1: Quick Wins (48 часов)
1. **Заменить `innerHTML` на `textContent`** в трёх компонентах.
2. **Добавить мемоизацию** `cometColors` и `networkSettings` в `OldProjectHero`.
3. **Исправить очистку ScrollTrigger** – сохранять ссылку на инстанс.
4. **Удалить неиспользуемые компоненты** (`GravityHero`, `HeroOld`).
5. **Поправить гидратацию темы** – убрать inline-скрипт, использовать `useSyncExternalStore`.

### Phase 2: System Fixes (1 неделя)
1. **Рефакторинг `OldProjectHero`** – разделить эффекты инициализации и обновления темы.
2. **Оптимизация Canvas** – уменьшить количество точек, отключить антиалиасинг.
3. **Добавить throttle для анимаций** в `CometCanvas`.
4. **Code splitting** для GSAP и тяжёлых библиотек.
5. **Настроить линтер и pre-commit хуки**.

### Phase 3: Scale & Innovation (3–6 месяцев)
1. **Переписать анимации на WebGL** (например, Three.js) для максимальной производительности.
2. **Внедрить виртуализацию** для больших списков в будущих компонентах.
3. **Настроить мониторинг производительности** (Core Web Vitals, RUM).
4. **Автоматическая проверка на утечки памяти** с помощью DevTools.

---

## Прогноз улучшений

После исправления критических проблем ожидается:

- **Увеличение FPS** на 20–30% (особенно на мобильных устройствах).
- **Сокращение времени интерактивности (TTI)** на 15% за счёт удаления мёртвого кода и оптимизации загрузки.
- **Устранение мигания темы** – улучшение UX.
- **Снижение потребления памяти** на 10–15% за счёт устранения утечек.

---

## Заключение

Кодовая база демонстрирует хорошую архитектуру и использование современных технологий (Astro v5, React 19, Tailwind v4). Однако наличие критических проблем с производительностью и памятью требует немедленного внимания. Рекомендуется начать с Phase 1, чтобы быстро устранить наиболее опасные issues, затем перейти к системным оптимизациям.

**Аудитор:** Kilo Code  
**Статус:** Требуются срочные исправления