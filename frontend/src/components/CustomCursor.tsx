import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  // Raw mouse position motion values
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Outer smooth follower ring spring physics
  const outerSpringX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const outerSpringY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  // Inner high-speed center dot spring physics
  const innerSpringX = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const innerSpringY = useSpring(mouseY, { stiffness: 300, damping: 20 });

  useEffect(() => {
    // Only active on devices with a fine pointer (mouse/trackpad)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Inject --mouse-x and --mouse-y into document element for CSS Spotlight effects
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive =
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'select' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.closest('.magnetic') !== null ||
        target.closest('.interactive') !== null ||
        target.closest('.glass-card') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovered(Boolean(interactive));
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Follower Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 hidden md:block"
        style={{
          x: outerSpringX,
          y: outerSpringY,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
        animate={{
          width: isHovered ? 44 : isMouseDown ? 20 : 28,
          height: isHovered ? 44 : isMouseDown ? 20 : 28,
          borderColor: isHovered
            ? 'rgba(0, 240, 255, 0.7)'
            : 'rgba(255, 255, 255, 0.35)',
          backgroundColor: isHovered
            ? 'rgba(0, 240, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.02)',
          boxShadow: isHovered
            ? '0 0 20px rgba(0, 240, 255, 0.3)'
            : 'none',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid inherit',
          }}
        />
      </motion.div>

      {/* Inner Center Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 hidden md:block"
        style={{
          x: innerSpringX,
          y: innerSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: '#00f0ff',
          boxShadow: '0 0 8px #00f0ff',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0 : isMouseDown ? 1.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};
