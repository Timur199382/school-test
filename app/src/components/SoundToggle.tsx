import { useState } from 'react';
import { initMute, setMuted, startMusic, stopMusic } from '@/lib/sound';

export default function SoundToggle() {
  const [muted, setMutedState] = useState<boolean>(() => {
    const m = initMute();
    if (!m) startMusic();
    return m;
  });

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (next) stopMusic();
    else startMusic();
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Включить звук' : 'Выключить звук'}
      className="fixed left-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-white/80 text-xl shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
