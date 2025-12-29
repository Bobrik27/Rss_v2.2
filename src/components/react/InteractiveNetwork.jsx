import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * InteractiveNetwork – адаптация старой реализации интерактивной сети точек и комет.
 * Использует GSAP для анимации и Canvas для отрисовки.
 * Настройки можно передавать через props.
 */
const InteractiveNetwork = ({
  canvasId = 'interactiveNetworkCanvas',
  numPoints = 800,
  pointRadius = 1.5,
  pointColor = 'rgba(133, 141, 148, 0)',
  connectDistance = 500,
  lineColors = [
    'rgba(255, 127, 80, 0.8)', // --accent-bright
    'rgba(66, 181, 239, 0.7)', // --accent-warm
    'rgba(219, 35, 239, 0.7)',
    'rgba(234, 234, 234, 0.6)',
  ],
  lineWidthStart = 2.5,
  cometTailLength = 7.35,
  lineAnimationDuration = 2.8,
  explosionMaxRadiusFactor = 20,
  explosionDuration = 0.9,
  maxActiveLines = 20,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const pointsRef = useRef([]);
  const activeLinesRef = useRef([]);
  const activeExplosionsRef = useRef([]);
  const animationRef = useRef(null);
  const isInitialized = useRef(false);

  // Настройки сети
  const networkSettings = {
    numPoints,
    pointRadius,
    pointColor,
    connectDistance,
    lineColors,
    lineWidthStart,
    cometTailLength,
    lineAnimationDuration,
    explosionMaxRadiusFactor,
    explosionDuration,
    maxActiveLines,
  };

  // Класс ExplosionEffect
  class ExplosionEffect {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = networkSettings.pointRadius;
      this.opacity = 0.8;

      gsap.to(this, {
        radius: networkSettings.pointRadius * networkSettings.explosionMaxRadiusFactor,
        opacity: 0,
        duration: networkSettings.explosionDuration,
        ease: 'expo.out',
        onComplete: () => {
          activeExplosionsRef.current = activeExplosionsRef.current.filter(exp => exp !== this);
        },
      });
    }

    draw(ctx) {
      if (this.opacity <= 0.01 || this.radius <= 0.1) return;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      const rgbColorMatch = this.color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      const rgbColor = rgbColorMatch ? `${rgbColorMatch[1]},${rgbColorMatch[2]},${rgbColorMatch[3]}` : '255,127,80';

      const gradient = ctx.createRadialGradient(
        this.x, this.y, this.radius * 0.1,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, `rgba(${rgbColor}, ${this.opacity * 0.9})`);
      gradient.addColorStop(0.6, `rgba(${rgbColor}, ${this.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${rgbColor}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  // Класс AnimatedLine (комета)
  class AnimatedLine {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.headProgress = 0;
      this.tailStartProgress = 0;
      this.isVisible = true;
      this.color = networkSettings.lineColors[
        Math.floor(Math.random() * networkSettings.lineColors.length)
      ];

      const tl = gsap.timeline();
      tl.to(this, {
        headProgress: 1,
        onUpdate: () => {
          this.tailStartProgress = Math.max(0, this.headProgress - networkSettings.cometTailLength);
        },
        duration: networkSettings.lineAnimationDuration,
        ease: 'linear',
        onComplete: () => {
          this.isVisible = false;
          const explosion = new ExplosionEffect(this.p2.x, this.p2.y, this.color);
          activeExplosionsRef.current.push(explosion);
          activeLinesRef.current = activeLinesRef.current.filter(line => line !== this);
        },
      });
    }

    draw(ctx) {
      if (!ctx || !this.isVisible) return;
      if (this.headProgress >= 1 && this.tailStartProgress >= this.headProgress) return;

      const dx = this.p2.x - this.p1.x;
      const dy = this.p2.y - this.p1.y;

      const headX = this.p1.x + dx * this.headProgress;
      const headY = this.p1.y + dy * this.headProgress;
      const tailStartX = this.p1.x + dx * this.tailStartProgress;
      const tailStartY = this.p1.y + dy * this.tailStartProgress;

      if (Math.abs(headX - tailStartX) < 0.1 && Math.abs(headY - tailStartY) < 0.1 && this.headProgress < 0.05) {
        return;
      }

      // Рисуем хвост
      ctx.beginPath();
      ctx.moveTo(tailStartX, tailStartY);
      ctx.lineTo(headX, headY);

      const gradient = ctx.createLinearGradient(tailStartX, tailStartY, headX, headY);
      const baseColorAlphaMatch = this.color.match(/, (\d\.\d+)\)/);
      const baseColorAlpha = baseColorAlphaMatch ? parseFloat(baseColorAlphaMatch[1]) : 0.7;

      gradient.addColorStop(0, this.color.replace(/, \d\.\d+\)/, ', 0)'));
      gradient.addColorStop(0.5, this.color.replace(/, \d\.\d+\)/, `, ${baseColorAlpha * 0.3})`));
      gradient.addColorStop(1, this.color.replace(/, \d\.\d+\)/, `, ${baseColorAlpha})`));

      ctx.strokeStyle = gradient;
      ctx.lineWidth = networkSettings.lineWidthStart;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Рисуем голову
      const headRadius = networkSettings.lineWidthStart > 1 ? networkSettings.lineWidthStart / 1.5 : 1;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(/, \d\.\d+\)/, `, ${Math.min(1, baseColorAlpha + 0.2)})`);
      ctx.fill();
    }
  }

  // Вспомогательные функции
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    canvas.width = Math.floor(canvas.parentElement.offsetWidth);
    canvas.height = Math.floor(canvas.parentElement.offsetHeight);
  };

  const createPoints = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pointsRef.current = [];
    for (let i = 0; i < networkSettings.numPoints; i++) {
      pointsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: networkSettings.pointRadius,
        id: i,
      });
    }
  };

  const drawStaticPoints = (ctx) => {
    const pointColorAlphaMatch = networkSettings.pointColor.match(/, (\d\.\d+|\d)\)/);
    let pointColorAlpha = 0;
    if (pointColorAlphaMatch) {
      pointColorAlpha = parseFloat(pointColorAlphaMatch[1]);
    } else if (networkSettings.pointColor && !networkSettings.pointColor.includes('rgba')) {
      pointColorAlpha = 1;
    }
    if (pointColorAlpha === 0) return;

    pointsRef.current.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = networkSettings.pointColor;
      ctx.fill();
    });
  };

  const getDistance = (p1, p2) => {
    if (!p1 || !p2) return Infinity;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const spawnRandomLine = () => {
    const canvas = canvasRef.current;
    const points = pointsRef.current;
    const activeLines = activeLinesRef.current;
    if (!canvas || points.length < 2 || activeLines.length >= networkSettings.maxActiveLines) {
      return;
    }

    let p1Index = Math.floor(Math.random() * points.length);
    let p2Index = Math.floor(Math.random() * points.length);
    let attempts = 0;
    const maxAttempts = 50;

    while (p1Index === p2Index && attempts < maxAttempts) {
      p2Index = Math.floor(Math.random() * points.length);
      attempts++;
    }
    if (p1Index === p2Index) return;

    attempts = 0;
    while (getDistance(points[p1Index], points[p2Index]) > networkSettings.connectDistance && attempts < maxAttempts) {
      p1Index = Math.floor(Math.random() * points.length);
      p2Index = Math.floor(Math.random() * points.length);
      let innerAttempts = 0;
      while (p1Index === p2Index && innerAttempts < maxAttempts) {
        p2Index = Math.floor(Math.random() * points.length);
        innerAttempts++;
      }
      if (p1Index === p2Index) {
        attempts = maxAttempts;
        break;
      }
      attempts++;
    }

    if (p1Index !== p2Index && getDistance(points[p1Index], points[p2Index]) <= networkSettings.connectDistance) {
      const newLine = new AnimatedLine(points[p1Index], points[p2Index]);
      activeLinesRef.current.push(newLine);
    }
  };

  const updateNetwork = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStaticPoints(ctx);

    activeLinesRef.current.forEach(line => line.draw(ctx));
    activeExplosionsRef.current.forEach(explosion => explosion.draw(ctx));
  };

  // Инициализация
  useEffect(() => {
    if (isInitialized.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');
    isInitialized.current = true;

    resizeCanvas();
    createPoints();

    // Обработчик изменения размера окна
    const handleResize = () => {
      resizeCanvas();
      activeLinesRef.current = [];
      activeExplosionsRef.current = [];
      createPoints();
    };
    window.addEventListener('resize', handleResize);

    // Добавляем обновление сети в тикер GSAP
    gsap.ticker.add(updateNetwork);

    // Спауним кометы с интервалом
    const spawnInterval = gsap.to({}, {
      duration: 0.7,
      repeat: -1,
      onRepeat: spawnRandomLine,
      delay: 2,
    });

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(updateNetwork);
      spawnInterval.kill();
      activeLinesRef.current = [];
      activeExplosionsRef.current = [];
      isInitialized.current = false;
    };
  }, []);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default InteractiveNetwork;