import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface OdometerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Odometer: React.FC<OdometerProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style,
}) => {
  const spring = useSpring(0, { stiffness: 75, damping: 15 });
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (decimals > 0) {
        setDisplayValue(latest.toFixed(decimals));
      } else {
        setDisplayValue(Math.round(latest).toLocaleString());
      }
    });
    return () => unsubscribe();
  }, [spring, decimals]);

  return (
    <span className={className} style={{ fontFamily: 'inherit', ...style }}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
