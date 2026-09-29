import { motion } from 'framer-motion';
import { assetUrl } from '@/lib/utils';

export const GIRLS = ['girl1', 'girl2', 'girl3', 'girl4', 'girl5'];
export const BOYS = ['boy1', 'boy2', 'boy3', 'boy4', 'boy5'];
export const avatarSrc = (id: string) => assetUrl(`characters/${id}.png`);

export default function AvatarPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {GIRLS.map((g) => (
          <AvatarButton key={g} id={g} selected={selected === g} onSelect={onSelect} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {BOYS.map((b) => (
          <AvatarButton key={b} id={b} selected={selected === b} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function AvatarButton({
  id,
  selected,
  onSelect,
}: {
  id: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.93 }}
      animate={selected ? { scale: [1, 1.12, 1.08] } : { scale: 1 }}
      onClick={() => onSelect(id)}
      className={`h-20 w-16 overflow-hidden rounded-2xl border-3 bg-gradient-to-b from-sky-100 to-violet-100 transition sm:h-24 sm:w-20 ${
        selected
          ? 'border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.35)]'
          : 'border-white/80 shadow'
      }`}
      aria-label={`Аватар ${id}`}
    >
      <img src={avatarSrc(id)} alt="" className="h-full w-full object-cover object-top" draggable={false} />
    </motion.button>
  );
}
