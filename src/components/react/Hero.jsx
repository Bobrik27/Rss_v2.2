import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InteractiveNetwork from './InteractiveNetwork';
import useFallingLetters from '../../hooks/useFallingLetters';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [isDark, setIsDark] = useState(true);

  // 1. THEME OBSERVER
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme !== 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // 2. Используем хук для анимации падающих букв (вход + скролл)
  useFallingLetters(titleRef, containerRef, {
    entranceDelay: 0.6,
    staggerDelay: 0.05,
    fallDistance: 300,
    maxHorizontalDrift: 150,
    maxRotation: 120,
    scrub: 0.5,
  });

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white'
          : 'bg-white text-slate-900'
      }`}
    >
      {/* Интерактивная сеть комет */}
      <InteractiveNetwork
        canvasId="heroInteractiveNetwork"
        numPoints={800}
        pointRadius={1.5}
        pointColor="rgba(133, 141, 148, 0)"
        connectDistance={500}
        lineColors={[
          'rgba(255, 127, 80, 0.8)',
          'rgba(66, 181, 239, 0.7)',
          'rgba(219, 35, 239, 0.7)',
          'rgba(234, 234, 234, 0.6)',
        ]}
        lineWidthStart={2.5}
        cometTailLength={7.35}
        lineAnimationDuration={2.8}
        explosionMaxRadiusFactor={20}
        explosionDuration={0.9}
        maxActiveLines={20}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 ref={titleRef} className="flex flex-wrap justify-center font-black leading-none select-none">
          {/* RUNSWIFT (Белый + Белая обводка + Белое свечение) */}
          {"RUNSWIFT".split("").map((char, i) => (
            <span key={`r-${i}`}
              className={`letter inline-block text-[10vw] md:text-[8rem] lg:text-[9rem] ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{
                // Четкая обводка (разделяет буквы)
                WebkitTextStroke: isDark ? '1px rgba(255, 255, 255, 0.5)' : '0px',
                // Двойное свечение: яркий контур + мягкий свет
                textShadow: isDark
                  ? '0 0 10px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3)'
                  : 'none'
              }}>
              {char}
            </span>
          ))}
          
          {/* Пробел */}
          <span className="inline-block w-[2vw] md:w-[2rem]"></span>

          {/* STUDIO (Оранжевый + Белая обводка + Оранжевое свечение) */}
          {"STUDIO".split("").map((char, i) => (
            <span key={`s-${i}`}
              className="letter inline-block text-[10vw] md:text-[8rem] lg:text-[9rem] text-[#ff6d5a]"
              style={{
                // Обводка сохраняет форму букв
                WebkitTextStroke: isDark ? '1px rgba(255, 255, 255, 0.5)' : '0px',
                // Оранжевое свечение
                textShadow: isDark
                  ? '0 0 10px rgba(255, 109, 90, 0.6), 0 0 40px rgba(255, 109, 90, 0.4)'
                  : 'none'
              }}>
              {char}
            </span>
          ))}
        </h1>

        <p
          className={`mt-8 uppercase tracking-[0.5em] text-sm animate-pulse font-medium transition-colors duration-300 ${
            isDark ? 'text-white/60' : 'text-slate-500'
          }`}
        >
          Современные решения для вашего бизнеса
        </p>
      </div>
    </section>
  );
};

export default Hero;