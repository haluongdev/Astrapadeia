import React, { useEffect, useRef } from 'react';

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star objects
    const numStars = 180;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      speedX: number;
      speedY: number;
      color: string;
    }> = [];

    const colors = ['#ffffff', '#a5b4fc', '#93c5fd', '#c4b5fd', '#fde047', '#67e8f9'];

    for (let i = 0; i < numStars; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.7;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1.2,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.12,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Shooting stars
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      life: number;
    }> = [];

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.4,
        length: 80 + Math.random() * 60,
        speed: 9 + Math.random() * 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 1,
        life: 0
      });
    };

    let shootingTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle cosmic dust
      const gradient = ctx.createRadialGradient(
        width * 0.2,
        height * 0.25,
        50,
        width * 0.2,
        height * 0.25,
        width * 0.5
      );
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.07)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const cyanGrad = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        50,
        width * 0.8,
        height * 0.7,
        width * 0.4
      );
      cyanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      cyanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cyanGrad;
      ctx.fillRect(0, 0, width, height);

      // Render & update twinkling stars
      for (const star of stars) {
        star.x += star.speedX;
        star.y += star.speedY;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.alpha += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha + Math.sin(star.alpha) * 0.3;
        const safeAlpha = Math.max(0.1, Math.min(1, currentAlpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = safeAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Starlight glow for larger stars
        if (star.size > 2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(165, 180, 252, 0.15)';
          ctx.fill();
        }
      }

      // Shooting stars
      shootingTimer++;
      if (shootingTimer > 180 && Math.random() < 0.04) {
        spawnShootingStar();
        shootingTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.012;
        s.life++;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const lineGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        lineGrad.addColorStop(0, 'transparent');
        lineGrad.addColorStop(0.7, 'rgba(199, 210, 254, 0.4)');
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
