import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

/** Число, которое красиво "накручивается" от 0 (или от прошлого значения) до текущего. */
export default function AnimatedCounter({
  value,
  className,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('ru-RU'));
  const started = useRef(false);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: started.current ? duration : duration * 1.4,
      ease: 'easeOut',
    });
    started.current = true;
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
