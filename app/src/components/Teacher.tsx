import { motion, AnimatePresence } from 'framer-motion';

export default function Teacher({ message, mood }: { message: string; mood: 'happy' | 'think' | 'sad' | 'wow' }) {
  const tilt = mood === 'happy' ? -3 : mood === 'sad' ? 3 : mood === 'wow' ? -6 : 0;
  return (
    <div className="pointer-events-none fixed bottom-0 right-2 z-40 flex items-end gap-1 sm:right-4">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="mb-16 max-w-[210px] rounded-2xl border-2 border-violet-200 bg-white/95 px-3 py-2 text-[12px] font-semibold leading-snug text-violet-800 shadow-xl sm:mb-24 sm:max-w-[240px] sm:text-sm"
          >
            {message}
            <span className="absolute -bottom-[9px] right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-violet-200 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.img
        src="/characters/teacher.png"
        alt="Учительница"
        animate={{ y: [0, -8, 0], rotate: tilt }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 translate-y-2 drop-shadow-2xl sm:w-32 sm:translate-y-0 md:w-36"
        draggable={false}
      />
    </div>
  );
}
