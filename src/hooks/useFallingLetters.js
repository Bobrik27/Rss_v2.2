import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Хук для анимации падающих букв при скролле.
 * Основан на hero-animations.js из старого проекта.
 * 
 * @param {React.RefObject} titleRef - ссылка на элемент заголовка
 * @param {React.RefObject} containerRef - ссылка на контейнер секции (для ScrollTrigger)
 * @param {Object} options - дополнительные настройки
 */
const useFallingLetters = (titleRef, containerRef, options = {}) => {
  const {
    entranceDelay = 0.6, // задержка перед появлением букв
    staggerDelay = 0.05, // задержка между буквами при появлении
    fallDistance = 300,  // базовая дистанция падения
    maxHorizontalDrift = 150, // максимальный дрейф по горизонтали
    maxRotation = 120,   // максимальное вращение
    scrub = 0.5,         // параметр скраба ScrollTrigger
  } = options;

  const lettersRef = useRef([]);
  const scrollTriggerRef = useRef(null);
  const entranceTimelineRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !containerRef.current) return;

    const titleElement = titleRef.current;
    const container = containerRef.current;

    // 1. Обернуть каждую букву в span (если ещё не обёрнуты)
    // Проверяем, есть ли уже буквы с классом .letter
    let letters = titleElement.querySelectorAll('.letter');
    if (letters.length === 0) {
      const text = titleElement.textContent;
      let wrappedText = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ') {
          wrappedText += `<span class="letter letter--space"> </span>`;
        } else {
          wrappedText += `<span class="letter">${char}</span>`;
        }
      }
      titleElement.innerHTML = wrappedText;
      letters = titleElement.querySelectorAll('.letter:not(.letter--space)');
    } else {
      // Фильтруем пробелы
      letters = titleElement.querySelectorAll('.letter:not(.letter--space)');
    }

    lettersRef.current = Array.from(letters);

    if (letters.length === 0) return;

    // 2. Анимация появления (вход) через GSAP
    gsap.set(letters, { y: 100, opacity: 0 });
    entranceTimelineRef.current = gsap.to(letters, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: staggerDelay,
      ease: 'power3.out',
      delay: entranceDelay,
    });

    // 3. Анимация падения при скролле
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      // Генерируем случайные параметры для каждой буквы один раз
      const letterParams = lettersRef.current.map(() => ({
        randomY: fallDistance + Math.random() * 200,
        randomX: (Math.random() - 0.5) * maxHorizontalDrift,
        randomRotation: (Math.random() - 0.5) * maxRotation,
        randomDelayFactor: Math.random() * 0.6,
      }));

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=100px', // Как в оригинале: падение происходит за 100px скролла
        scrub,
        onUpdate: (self) => {
          lettersRef.current.forEach((letter, i) => {
            const params = letterParams[i];
            // Оригинальная формула из old_page
            let letterFallProgress = Math.max(0, (self.progress - params.randomDelayFactor * 0.3) / 2.4);
            letterFallProgress = Math.min(1, letterFallProgress);

            gsap.to(letter, {
              y: letterFallProgress * params.randomY,
              x: letterFallProgress * params.randomX,
              rotation: letterFallProgress * params.randomRotation,
              opacity: 1 - letterFallProgress,
              duration: 0.1,
              ease: 'power1.out',
              overwrite: true,
            });
          });
        },
        onLeave: () => {
          gsap.to(lettersRef.current, { opacity: 0, duration: 0.1 });
        },
        onEnterBack: () => {
          gsap.to(lettersRef.current, {
            y: 0,
            x: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.1,
            overwrite: true,
          });
        },
      });
    }

    // Очистка
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
      }
      lettersRef.current = [];
    };
  }, [titleRef, containerRef, entranceDelay, staggerDelay, fallDistance, maxHorizontalDrift, maxRotation, scrub]);
};

export default useFallingLetters;