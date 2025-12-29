import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
 const containerRef = useRef(null);
  const titleRef = useRef(null);
  const canvasRef = useRef(null);
  const isInitialized = useRef(false); // Strict Mode Guard
 const [isDark, setIsDark] = useState(true);

 // 1. THEME OBSERVER
 useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      // If no attribute or 'dark', it is dark.
      setIsDark(theme !== 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // 2. ANIMATION LOOP (Optimized)
  useEffect(() => {
    if (isInitialized.current) return; // Prevent double run
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const titleElement = titleRef.current;

    if (!canvas || !container || !titleElement) return;

    isInitialized.current = true; // Mark as running

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;
    let particles = [];
    let comets = [];
    let explosions = [];
    let animationFrameId;

    // PERFORMANCE SETTINGS
    const settings = {
      starCount: 120, // Reduced from 800 for performance
      cometCount: 4,  // Minimal active comets
      colors: ['255, 109, 90', '66, 181, 239', '219, 35, 239', '255, 255, 255']
    };

    // DPI FIX for 4K Screens
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- ANIMATION CLASSES ---
    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.fade = Math.random() * 0.01 + 0.005;
      }
      update() {
        this.alpha += this.fade;
        if (this.alpha >= 1 || this.alpha <= 0.1) this.fade = -this.fade;
      }
      draw() {
        // Theme check inside draw loop is okay for 120 points
        const isDarkTheme = document.documentElement.getAttribute('data-theme') !== 'light';
        const color = isDarkTheme ? '255, 255, 255' : '15, 23, 42';
        ctx.fillStyle = `rgba(${color}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Explosion {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.particles = [];
        for(let i=0; i<8; i++) {
          this.particles.push({
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1, size: Math.random() * 2 + 1
          });
        }
      }
      update() {
        this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; });
        this.particles = this.particles.filter(p => p.life > 0);
      }
      draw() {
        this.particles.forEach(p => {
          ctx.fillStyle = `rgba(${this.color}, ${p.life})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
      }
    }

    class Comet {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 1.0; // Chaos angle
        this.speed = Math.random() * 3 + 2;
        this.length = Math.random() * 80 + 40;
        this.colorVal = settings.colors[Math.floor(Math.random() * settings.colors.length)];
        this.opacity = 0;
        this.state = 'in';
      }
      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.state === 'in') {
          this.opacity += 0.05;
          if (this.opacity >= 1) this.state = 'fly';
        }
        // Hit logic
        if (this.y > height || this.x > width || this.x < 0) {
          if (this.y > height - 100 && this.y < height + 10) {
             explosions.push(new Explosion(this.x, this.y, this.colorVal));
          }
          this.reset();
        }
      }
      draw() {
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(${this.colorVal}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${this.colorVal}, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    // INIT
    for(let i=0; i<settings.starCount; i++) particles.push(new Star());
    for(let i=0; i<settings.cometCount; i++) comets.push(new Comet());

    // LOOP
    const animate = () => {
      // Clear with logical dimensions
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => p.update() || p.draw());
      comets.forEach(c => c.update() || c.draw());
      explosions.forEach((e, i) => {
        e.update(); e.draw();
        if(e.particles.length === 0) explosions.splice(i, 1);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // --- GSAP LETTERS ---
    const letters = titleElement.querySelectorAll('.letter');
    
    // Intro
    gsap.set(letters, { y: 100, opacity: 0 });
    gsap.to(letters, {
      y: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: "power3.out", delay: 0.2
    });

    // Scroll Falling
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=100%",
      scrub: 1,
      onUpdate: (self) => {
        const prog = self.progress;
        letters.forEach((l, i) => {
          const yDist = window.innerHeight * 1.5 + (i * 100) % 300;
          const xDist = (Math.random() - 0.5) * 300 * prog;
          const rot = (i % 2 === 0 ? 1 : -1) * 45 * prog;
          
          // Using gsap.to for smoothness
          gsap.to(l, {
            y: prog * yDist,
            x: xDist,
            rotation: rot,
            opacity: 1 - prog,
            duration: 0.1,
            overwrite: true
          });
        });
      }
    });

    // CLEANUP
    return () => {
      isInitialized.current = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      st.kill();
      gsap.killTweensOf(letters);
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-500`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 ref={titleRef} className="flex flex-wrap justify-center font-black leading-none select-none">
          {/* RUNSWIFT (Connected) */}
          {"RUNSWIFT".split("").map((char, i) => (
            <span key={`r-${i}`} className={`letter inline-block text-[10vw] md:text-[8rem] lg:text-[9rem] ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ textShadow: isDark ? '0 0 30px rgba(255,255,255,0.3)' : 'none' }}>
              {char}
            </span>
          ))}
          
          <span className="inline-block w-[2vw] md:w-[2rem]"></span>

          {/* STUDIO (Orange) */}
          {"STUDIO".split("").map((char, i) => (
            <span key={`s-${i}`} className="letter inline-block text-[10vw] md:text-[8rem] lg:text-[9rem] text-[#ff6d5a]"
              style={{ textShadow: isDark ? '0 0 30px rgba(255, 109, 90, 0.4)' : 'none' }}>
              {char}
            </span>
          ))}
        </h1>

        <p className={`mt-8 uppercase tracking-[0.5em] text-sm animate-pulse font-medium transition-colors duration-300 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
          Современные решения для вашего бизнеса
        </p>
      </div>
    </section>
  );
};

export default Hero;