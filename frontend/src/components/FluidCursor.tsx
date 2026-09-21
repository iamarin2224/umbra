import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Splitstellar-style Magnetic Interactive Custom Cursor
 * - Smooth lerped trailing ring with mix-blend-mode: difference
 * - Snaps & expands dynamically when hovering over clickable elements
 */
export const FluidCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Apple-grade smoothed springs for organic fluid trailing
  const springX = useSpring(mouseX, { damping: 28, stiffness: 350, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 350, mass: 0.5 });

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Splitstellar pattern: update CSS variables for light-reactive cards
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive =
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.closest('.interactive-card') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovered(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Fluid Morphing Aura */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
        animate={{
          width: isHovered ? 48 : 26,
          height: isHovered ? 48 : 26,
          backgroundColor: isHovered ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
          borderColor: isHovered ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.28)',
          boxShadow: isHovered ? '0 0 16px rgba(0, 240, 255, 0.3)' : 'none',
          borderRadius: '50%',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.2 }}
      />

      {/* Center Precise Tracking Dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: 'var(--cyan)',
          boxShadow: '0 0 8px var(--cyan)',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};
