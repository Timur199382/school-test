import { motion } from 'framer-motion';

/**
 * Заголовок, слова которого "проявляются" по очереди снизу вверх с лёгким блюром —
 * даёт кинематографичное появление текста вместо статичного рендера.
 */
export default function AnimatedWords({
  text,
  className,
  delay = 0,
  wordDelay = 0.06,
}: {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * wordDelay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{ marginRight: '0.28em' }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}
