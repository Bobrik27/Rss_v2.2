import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

 // --- 1. COMETS VISUALS (The "Good" Version) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Comet[] = [];
    
    // Config
    const cometCount = 8; // Меньше комет, но качественнее
    const speedMultiplier = 1.5;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Comet {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.length = Math.random() * 200 + 100; // Длинные хвосты
        this.speed = (Math.random() * 10 + 5) * speedMultiplier; // Быстрые
        this.opacity = 0; // Начинаем невидимыми
        // Цвета: Cyan и Orange (акценты)
        this.color = Math.random() > 0.5 ? "#22d3ee" : "#ff6d5a";
      }

      reset() {
        this.x = Math.random() * canvas!.width + canvas!.width * 0.5; // Начинаем справа
        this.y = Math.random() * -500; // Высоко сверху
        this.speed = (Math.random() * 10 + 5) * speedMultiplier;
        this.opacity = 0;
      }

      update() {
        this.x -= this.speed; // Летим влево
        this.y += this.speed; // Летим вниз (Диагональ / )

        // Fade in/out logic
        if (this.y < canvas!.height * 0.8) {
             if (this.opacity < 1) this.opacity += 0.05;
        } else {
             if (this.opacity > 0) this.opacity -= 0.05;
        }

        // Reset if out of bounds
        if (this.x < -this.length || this.y > canvas!.height + this.length) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        // Градиент хвоста
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y - this.length);
        gradient.addColorStop(0, this.color); // Голова
        gradient.addColorStop(1, "transparent"); // Хвост

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.opacity;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y - this.length);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Init
    for (let i = 0; i < cometCount; i++) {
      particles.push(new Comet());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Чистый кадр (без шлейфа)
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- 2. GSAP FALLING LETTERS (Correct Physics) ---
  useGSAP(() => {
    if (!textRef.current || !containerRef.current) return;

    const letters = textRef.current.querySelectorAll(".char");
    
    // Анимация входа (появление)
    gsap.fromTo(letters, 
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.02, ease: "power2.out" }
    );

    // Главная анимация падения (ScrollTrigger)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", 
        end: "bottom top", 
        scrub: 0.5, // 0.5 добавит инерции (smoothness), буквы не будут "приклеены" к скроллу
      }
    });

    letters.forEach((letter, i) => {
      // Параметры "разлета"
      const xDir = (Math.random() - 0.5) * 800; // Сильный разлет в стороны
      const rotation = Math.random() * 720 - 360; // Сильное вращение
      const speed = 1 + Math.random(); // Разная скорость падения

      tl.to(letter, {
        y: window.innerHeight * 1.5 * speed, // Улетаем далеко вниз за экран
        x: xDir,
        rotation: rotation,
        opacity: 0, // Исчезаем в самом конце
        ease: "power1.in", // Ускорение (гравитация)
      }, 0);
    });

  }, { scope: containerRef });

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block will-change-transform">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center">
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" />

      {/* Text Container */}
      <div ref={textRef} className="z-10 relative text-center select-none p-4">
        
        <div className="mb-6 opacity-0 animate-fade-in-up">
           <span className="text-sm font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-800/50">
             AI Automation Architect
           </span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter flex flex-wrap justify-center gap-x-6 md:gap-x-12">
          {/* RUNSWIFT (White) */}
          <div className="flex text-white drop-shadow-2xl">
            {splitText("RUNSWIFT")}
          </div>

          {/* STUDIO (Orange) */}
          <div className="flex text-[#ff6d5a] drop-shadow-2xl">
            {splitText("STUDIO")}
          </div>
        </h1>

        <p className="mt-8 text-xl text-neutral-400 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          We build autonomous systems.
        </p>
      </div>
    </div>
  );
}