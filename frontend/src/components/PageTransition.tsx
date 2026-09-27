import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  routeKey: string;
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ routeKey, children }) => {
  const displacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 650; // ms
    let frameId: number;

    const animateWarp = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      // Ease out cubic [0.22, 1, 0.36, 1]
      const ease = 1 - Math.pow(1 - progress, 3);
      const scaleValue = (1 - ease) * 60; // 60 -> 0

      if (displacementMapRef.current) {
        displacementMapRef.current.setAttribute('scale', scaleValue.toFixed(2));
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(animateWarp);
      }
    };

    frameId = requestAnimationFrame(animateWarp);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [routeKey]);

  return (
    <>
      {/* Hidden SVG Liquid Shader Filter */}
      <svg
        style={{
          position: 'fixed',
          width: 0,
          height: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id="liquid-warp-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.04"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementMapRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: 14, filter: 'url(#liquid-warp-filter)' }}
          animate={{ opacity: 1, y: 0, filter: 'url(#liquid-warp-filter)' }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
