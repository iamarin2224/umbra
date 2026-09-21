import React, { useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(0, 229, 255, 0.2)',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (onMouseMove) onMouseMove(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = e => {
    setIsFocused(true);
    setOpacity(0.6);
    if (onFocus) onFocus(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = e => {
    setIsFocused(false);
    setOpacity(0);
    if (onBlur) onBlur(e);
  };

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = e => {
    setOpacity(0.6);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = e => {
    setOpacity(0);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle 320px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
