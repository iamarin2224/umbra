import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface KineticTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  maxDist?: number;
  maxForce?: number;
}

interface KineticCharProps {
  char: string;
  maxDist: number;
  maxForce: number;
}

const KineticChar: React.FC<KineticCharProps> = ({ char, maxDist, maxForce }) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  const xVal = useMotionValue(0);
  const yVal = useMotionValue(0);
  const rotateVal = useMotionValue(0);

  const springConfig = { stiffness: 450, damping: 22, mass: 0.4 };
  const springX = useSpring(xVal, springConfig);
  const springY = useSpring(yVal, springConfig);
  const springRotate = useSpring(rotateVal, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!spanRef.current) return;
      const rect = spanRef.current.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;

      const dx = charCenterX - e.clientX;
      const dy = charCenterY - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist && dist > 0) {
        const force = Math.pow((maxDist - dist) / maxDist, 2) * maxForce;
        const normX = dx / dist;
        const normY = dy / dist;

        xVal.set(normX * force);
        yVal.set(normY * force);
        rotateVal.set(normX * 24);
      } else {
        xVal.set(0);
        yVal.set(0);
        rotateVal.set(0);
      }
    };

    const handleMouseLeave = () => {
      xVal.set(0);
      yVal.set(0);
      rotateVal.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxDist, maxForce, xVal, yVal, rotateVal]);

  if (char === ' ') {
    return <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>;
  }

  return (
    <motion.span
      ref={spanRef}
      style={{
        display: 'inline-block',
        position: 'relative',
        x: springX,
        y: springY,
        rotate: springRotate,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {char}
    </motion.span>
  );
};

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  className = '',
  style,
  maxDist = 110,
  maxForce = 35,
}) => {
  const characters = Array.from(text);

  return (
    <span
      className={`kinetic-text-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        userSelect: 'none',
        ...style,
      }}
    >
      {characters.map((char, index) => (
        <KineticChar
          key={`${char}-${index}`}
          char={char}
          maxDist={maxDist}
          maxForce={maxForce}
        />
      ))}
    </span>
  );
};
