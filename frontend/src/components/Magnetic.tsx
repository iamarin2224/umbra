import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { soundFx } from '../lib/AudioEngine';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
  enableAudio?: boolean;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.25,
  className = '',
  style,
  enableAudio = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseEnter = () => {
    if (enableAudio) {
      soundFx.playTick();
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic ${className}`}
      style={{
        x: springX,
        y: springY,
        display: 'inline-flex',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};
