import React, { useRef, useState } from 'react';
import { CornerAnchors } from './CornerAnchors';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  showAnchors?: boolean;
  anchorColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(0, 240, 255, 0.12)',
  showAnchors = true,
  anchorColor = 'rgba(255, 255, 255, 0.25)',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setOpacity(1);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setOpacity(0);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={`glass-card ${className}`}
      {...rest}
    >
      {/* Dynamic Cursor-Following Spotlight Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
          transition: 'opacity 0.35s ease',
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
          zIndex: 1,
        }}
      />

      {/* Spatial Precision Corner Crosshairs */}
      {showAnchors && <CornerAnchors color={anchorColor} size={6} />}

      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default SpotlightCard;
