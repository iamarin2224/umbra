import React, { useEffect, useRef } from 'react';

interface CanvasFluidBackgroundProps {
  theme?: 'dark' | 'light';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  hue: number;
  angle: number;
  speed: number;
}

export const CanvasFluidBackground: React.FC<CanvasFluidBackgroundProps> = ({
  theme = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 380 : 850;

    const particles: Particle[] = [];
    const isDark = theme === 'dark';

    // Mouse tracking with velocity computation
    const mouse = {
      x: -1000,
      y: -1000,
      lastX: -1000,
      lastY: -1000,
      vx: 0,
      vy: 0,
      active: false,
    };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        baseVx: (Math.random() - 0.5) * 0.4,
        baseVy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.4 + 0.2,
        hue: Math.random() > 0.8 ? 185 : Math.random() > 0.5 ? 260 : 210, // Cyan, Amethyst, Azure
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.35 + 0.15,
      });
    }

    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouse.lastX === -1000) {
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      } else {
        mouse.vx = (e.clientX - mouse.lastX) * 0.4;
        mouse.vy = (e.clientY - mouse.lastY) * 0.4;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      time += 0.003;

      // Accumulator trail effect
      ctx.fillStyle = isDark
        ? 'rgba(6, 8, 12, 0.12)'
        : 'rgba(247, 247, 247, 0.14)';
      ctx.fillRect(0, 0, width, height);

      // Dampen mouse velocity
      mouse.vx *= 0.92;
      mouse.vy *= 0.92;

      const repelRadius = 240;
      const repelRadiusSq = repelRadius * repelRadius;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Pseudo-noise mathematical flow field (trigonometric matrix)
        const noiseAngle =
          Math.sin(p.x * 0.0025 + time) * Math.cos(p.y * 0.0025 + time) * Math.PI * 2;
        const flowX = Math.cos(noiseAngle) * p.speed;
        const flowY = Math.sin(noiseAngle) * p.speed;

        // Base flow velocity integration
        p.vx = p.vx * 0.95 + flowX * 0.05 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + flowY * 0.05 + p.baseVy * 0.05;

        // Cursor dynamic repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelRadiusSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow((repelRadius - dist) / repelRadius, 2) * 2.8;
            const normX = dx / dist;
            const normY = dy / dist;

            // Repel away from mouse + inject mouse momentum
            p.vx += normX * force + mouse.vx * 0.15;
            p.vy += normY * force + mouse.vy * 0.15;
          }
        }

        // Apply speed clamp
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 4.5;
        if (currentSpeed > maxSpeed) {
          p.vx = (p.vx / currentSpeed) * maxSpeed;
          p.vy = (p.vy / currentSpeed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isDark) {
          // Luminous celestial particle
          ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${p.alpha * 0.65})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.4)`;
        } else {
          // Graphite ink particle
          ctx.fillStyle = `rgba(30, 35, 45, ${p.alpha * 0.4})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Initial clear
    ctx.fillStyle = isDark ? '#06080c' : '#f7f7f7';
    ctx.fillRect(0, 0, width, height);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Spatial Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)'
              : 'radial-gradient(ellipse at 50% 30%, transparent 50%, rgba(220, 220, 225, 0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
