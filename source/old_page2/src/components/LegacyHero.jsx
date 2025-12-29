import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LegacyHero = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const canvasRef = useRef(null);
  
  // --- ЗАЩИТА ОТ ДВОЙНОГО ЗАПУСКА (Strict Mode Fix) ---
  const isInitialized = useRef(false);

  // Состояние темы
  const [isDarkState, setIsDarkState] = useState(true);
  const themeRef = useRef('dark');

  // 1. THEME OBSERVER
  useEffect(() => {
    const updateTheme = () => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      const isDark = docTheme === 'dark' || !docTheme;
      themeRef.current = isDark ? 'dark' : 'light';
      setIsDarkState(isDark);
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // 2. CANVAS & ANIMATION (С ФИКСОМ ПРОИЗВОДИТЕЛЬНОСТИ)
  useEffect(() => {
    // --- ГЛАВНЫЙ ФИКС: Если уже инициализировано, не запускаем второй раз ---
    if (isInitialized.current) return;
    
    const canvas = canvasRef.current;
    const titleElement = titleRef.current;
    const container = containerRef.current;

    if (!canvas || !titleElement || !container) return;

    // Помечаем, что инициализация прошла
    isInitialized.current = true;

    const ctx = canvas.getContext('2d', { alpha: true });
    
    // --- НАСТРОЙКИ ---
    const settings = {
      numPoints: 300,          // Оптимальное количество
      pointRadius: 1.5,
      connectDistance: 400,
      lineWidthStart: 2.5,
      cometTailLength: 7,
      lineAnimationDuration: 3,
      explosionMaxRadiusFactor: 15,
      explosionDuration: 0.9,
      maxActiveLines: 12
    };

    const colors = {
      dark: {
        points: 'rgba(133, 141, 148, 0)', 
        comets: ['rgba(255, 127, 80, 0.8)', 'rgba(66, 181, 239, 0.7)', 'rgba(219, 35, 239, 0.7)', 'rgba(234, 234, 234, 0.6)']
      },
      light: {
        points: 'rgba(0, 0, 0, 0)',
        comets: ['rgba(15, 23, 42, 0.8)', 'rgba(37, 99, 235, 0.7)', 'rgba(79, 70, 229, 0.7)', 'rgba(51, 65, 85, 0.6)']
      }
    };

    let width, height;
    let points = [];
    let activeLines = [];
    let activeExplosions = [];
    let animationFrameId; // ID для отмены анимации

    // --- ФИКС DPI (RETINA/4K) ---
    const resize = () => {
      // Ограничиваем PixelRatio до 2 (экономит GPU на 4K экранах)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      width = window.innerWidth;
      height = window.innerHeight;
      
      // Устанавливаем реальный размер буфера
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // Масштабируем контекст, чтобы координаты остались логическими
      ctx.scale(dpr, dpr);
      
      // Стили остаются 100% (растягиваемся на экран)
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      createPoints();
    };
    window.addEventListener('resize', resize);
    resize();

    // --- LOGIC ---
    // (Классы остались без изменений, но используют логические координаты)
    class ExplosionEffect {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.radius = settings.pointRadius; this.opacity = 0.8;
        this.dead = false;

        gsap.to(this, {
          radius: settings.pointRadius * settings.explosionMaxRadiusFactor,
          opacity: 0, duration: settings.explosionDuration, ease: "expo.out",
          onComplete: () => { this.dead = true; }
        });
      }
      draw() {
        if (this.opacity <= 0.05) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const rgb = this.color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        const rgbStr = rgb ? `${rgb[1]},${rgb[2]},${rgb[3]}` : '255,127,80';
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(${rgbStr}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    class AnimatedLine {
      constructor(p1, p2) {
        this.p1 = p1; this.p2 = p2; this.progress = 0; this.tailProgress = 0; this.dead = false;
        const currentTheme = themeRef.current; 
        const palette = colors[currentTheme].comets;
        this.color = palette[Math.floor(Math.random() * palette.length)];

        gsap.to(this, {
          progress: 1, duration: settings.lineAnimationDuration, ease: "linear",
          onUpdate: () => { this.tailProgress = Math.max(0, this.progress - 0.15); },
          onComplete: () => {
            this.dead = true;
            activeExplosions.push(new ExplosionEffect(this.p2.x, this.p2.y, this.color));
          }
        });
      }
      draw() {
        if (this.dead) return;
        const dx = this.p2.x - this.p1.x, dy = this.p2.y - this.p1.y;
        const hX = this.p1.x + dx * this.progress, hY = this.p1.y + dy * this.progress;
        const tX = this.p1.x + dx * this.tailProgress, tY = this.p1.y + dy * this.tailProgress;

        const gradient = ctx.createLinearGradient(tX, tY, hX, hY);
        gradient.addColorStop(0, this.color.replace(/[\d.]+\)$/, '0)'));
        gradient.addColorStop(1, this.color);

        ctx.beginPath(); ctx.moveTo(tX, tY); ctx.lineTo(hX, hY);
        ctx.strokeStyle = gradient; ctx.lineWidth = settings.lineWidthStart; ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath(); ctx.arc(hX, hY, settings.lineWidthStart/1.5, 0, Math.PI*2);
        ctx.fillStyle = this.color; ctx.fill();
      }
    }

    function createPoints() {
      points = [];
      for (let i = 0; i < settings.numPoints; i++) {
        points.push({ x: Math.random() * width, y: Math.random() * height });
      }
    }

    function spawnLine() {
      if (activeLines.length >= settings.maxActiveLines) return;
      const p1 = points[Math.floor(Math.random() * points.length)];
      let p2 = points[Math.floor(Math.random() * points.length)];
      if (p1 && p2 && p1 !== p2) activeLines.push(new AnimatedLine(p1, p2));
    }

    // --- MAIN LOOP ---
    const tick = () => {
      // Очищаем с учетом масштаба (width/height - логические)
      ctx.clearRect(0, 0, width, height);
      
      // Фильтруем мертвые объекты перед отрисовкой
      activeLines = activeLines.filter(l => !l.dead);
      activeExplosions = activeExplosions.filter(e => !e.dead);

      activeLines.forEach(l => l.draw());
      activeExplosions.forEach(e => e.draw());
      
      animationFrameId = requestAnimationFrame(tick);
    };

    // Старт
    tick(); // Используем RAF вместо gsap.ticker для чистого контроля
    const spawner = setInterval(spawnLine, 300);
    createPoints();

    // --- TEXT ANIMATION ---
    const letters = titleElement.querySelectorAll('.letter');
    gsap.to(letters, { y: 0, opacity: 1, duration: 1.2, stagger: 0.04, ease: "power3.out", delay: 0.2 });

    const st = ScrollTrigger.create({
      trigger: container, start: "top top", end: "+=500", scrub: 1,
      onUpdate: (self) => {
        const prog = self.progress;
        letters.forEach((el, i) => {
          const yDist = 300 + (i * 17) % 150; 
          const rot = (i % 2 === 0 ? 1 : -1) * 15 * prog;
          gsap.set(el, { y: prog * yDist, rotation: rot, opacity: 1 - prog, x: (i % 3 - 1) * 50 * prog });
        });
      }
    });

    // --- CLEANUP ---
    return () => {
      // Сбрасываем флаг, чтобы при перемонтировании запустилось снова
      isInitialized.current = false; 
      
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawner);
      st.kill();
      
      // Убиваем все твины, связанные с линиями
      gsap.killTweensOf(activeLines);
      gsap.killTweensOf(activeExplosions);
    };

  }, []);

  const text = "RUNSWIFT STUDIO";
  
  return (
    <header 
      ref={containerRef} 
      className={`hero-section h-screen overflow-hidden relative transition-colors duration-500 ${isDarkState ? 'bg-background' : 'bg-slate-50'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      <div className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-t ${isDarkState ? 'from-background via-transparent to-transparent' : 'from-slate-50 via-transparent to-transparent'}`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        <h1 ref={titleRef} 
            className={`text-6xl md:text-8xl lg:text-[10rem] font-black text-center leading-none transition-colors duration-300 ${isDarkState ? 'text-white' : 'text-slate-900'}`}
            style={{
              fontFamily: '"Inter", sans-serif',
              textShadow: isDarkState ? '0 0 25px rgba(34, 211, 238, 0.4), 0 0 5px rgba(255, 255, 255, 0.6)' : 'none',
              letterSpacing: '-0.02em', textTransform: 'uppercase'
            }}
        >
          {text.split('').map((char, i) => (
            <span key={i} className="letter inline-block opacity-0 translate-y-[100px]" style={{ minWidth: char === ' ' ? '20px' : 'auto' }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className={`mt-8 uppercase tracking-[0.5em] text-sm animate-pulse font-medium transition-colors duration-300 ${isDarkState ? 'text-brand-muted' : 'text-slate-500'}`}>
          Современные решения для вашего бизнеса
        </p>
      </div>
    </header>
  );
};

export default LegacyHero;