import React from 'react';

interface CornerAnchorsProps {
  color?: string;
  size?: number;
  className?: string;
}

export const CornerAnchors: React.FC<CornerAnchorsProps> = ({
  color = 'rgba(255, 255, 255, 0.25)',
  size = 6,
  className = '',
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 select-none ${className}`} style={{ pointerEvents: 'none' }}>
      {/* Top-Left */}
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: size,
          height: size,
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
          opacity: 0.6,
        }}
      />
      {/* Top-Right */}
      <span
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: size,
          height: size,
          borderTop: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
          opacity: 0.6,
        }}
      />
      {/* Bottom-Left */}
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          left: 4,
          width: size,
          height: size,
          borderBottom: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
          opacity: 0.6,
        }}
      />
      {/* Bottom-Right */}
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: size,
          height: size,
          borderBottom: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
          opacity: 0.6,
        }}
      />
    </div>
  );
};
