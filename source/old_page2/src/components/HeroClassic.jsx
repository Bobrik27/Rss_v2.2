import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroClassic = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);

  // 1. КОМЕТЫ
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() { this.reset(); }

      reset() {
        const side = Math.floor(Math.random() * 4);
        // Снизил скорость (умножение на 0.5 вместо 1)
        if (side === 0) { this.x = Math.random() * canvas.width; this.y = -10; this.vx = (Math.random() - 0.5); this.vy = Math.random() * 1 + 0.5; }
        else if (side === 1) { this.x = canvas.width + 10; this.y = Math.random() * canvas.height; this.vx = -(Math.random() * 1 + 0.5); this.vy = (Math.random() - 0.5); }
        else if (side === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height + 10; this.vx = (Math.random() - 0.5); this.vy = -(Math.random() * 1 + 0.5); }
        else { this.x = -10; this.y = Math.random() * canvas.height; this.vx = Math.random() * 1 + 0.5; this.vy = (Math.random() - 0.5); }

        this.size = Math.random() * 2;
        this.life = 300 + Math.random() * 100;
        this.alpha = 0;
        const colors = ['255, 109, 90', '59, 130, 246', '255, 255, 255']; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.history = []; 
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life > 250) this.alpha += 0.01;
        else if (this.life < 50) this.alpha -= 0.02;
        if (this.alpha > 0.7) this.alpha = 0.7; // Макс прозрачность меньше
        if (this.alpha < 0) this.alpha = 0;

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 10) this.history.shift(); // Хвост короче

        if (this.life <= 0 || this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
          this.reset();
        }
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        for (let i = 0; i < this.history.length; i++) {
            const point = this.history[i];
            const tailAlpha = (i / this.history.length) * this.alpha;
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.size;
            ctx.strokeStyle = `rgba(${this.color}, ${tailAlpha})`;
        }
        ctx.stroke();
      }
    }

    const pCount = window.innerWidth < 768 ? 10 : 25;
    for (let i = 0; i < pCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over'; // Стандартный режим наложения
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. ТЕКСТ
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const text = "RUNSWIFT STUDIO";
    title.innerHTML = '';
    [...text].forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        span.className = 'inline-block min-w-[0.4em] will-change-transform';
        title.appendChild(span);
    });
    const chars = title.querySelectorAll('span');

    // Появление
    gsap.fromTo(chars, 
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.05, duration: 1, ease: "power2.out", delay: 0.1 }
    );

    // Скролл
    const randoms = Array.from(chars).map(() => ({
        x: (Math.random() - 0.5) * window.innerWidth * 1.5,
        y: Math.random() * window.innerHeight * 1.5,
        r: (Math.random() - 0.5) * 360
    }));

    const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%", // Еще длиннее скролл
        pin: true,
        scrub: 1,
        pinSpacing: true, // Важно!
        onUpdate: (self) => {
            const p = self.progress;
            chars.forEach((c, i) => {
                gsap.to(c, {
                    x: randoms[i].x * p,
                    y: randoms[i].y * p,
                    rotation: randoms[i].r * p,
                    opacity: 1 - p * 2, // Исчезают быстрее
                    scale: 1 - p * 0.5,
                    overwrite: 'auto',
                    duration: 0
                });
            });
        }
    });
    return () => st.kill();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#0f172a] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
            {/* Используем drop-shadow вместо text-shadow для чистоты */}
            <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-9xl font-black text-white text-center leading-none drop-shadow-[0_0_25px_rgba(255,109,90,0.5)]">
                {/* JS content */}
            </h1>
            <p className="mt-8 text-brand-muted uppercase tracking-[0.3em] text-xs md:text-sm font-medium animate-pulse">
                Modern Automation Solutions
            </p>
        </div>
        
        {/* Градиент снизу увеличен */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default HeroClassic;