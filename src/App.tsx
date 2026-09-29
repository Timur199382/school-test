import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home, { type HomeSetup } from './pages/Home';
import Game from './pages/Game';
import Results from './pages/Results';
import Teacher from './components/Teacher';
import SoundToggle from './components/SoundToggle';
import type { Player } from './types';

type Screen = 'home' | 'game' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [setup, setSetup] = useState<HomeSetup | null>(null);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);
  const [teacher, setTeacher] = useState<{ msg: string; mood: 'happy' | 'think' | 'sad' | 'wow' }>({
    msg: 'Привет! Я твоя учительница. Выбери предмет и аватар — и начнём! 👋',
    mood: 'happy',
  });
  const [session, setSession] = useState(0);

  const onTeacher = (msg: string, mood: 'happy' | 'think' | 'sad' | 'wow') => setTeacher({ msg, mood });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-rose-200 bg-animated-gradient font-display">
      {/* декоративные пузыри */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-white/30 blur-md"
            style={{
              width: 60 + i * 26,
              height: 60 + i * 26,
              left: `${(i * 14) % 90}%`,
              top: `${(i * 23) % 85}%`,
            }}
          />
        ))}
      </div>

      <SoundToggle />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }}>
              <Home
                onStart={(s) => {
                  setSetup(s);
                  setSession((v) => v + 1);
                  setScreen('game');
                }}
              />
            </motion.div>
          )}
          {screen === 'game' && setup && (
            <motion.div key={`game-${session}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}>
              <Game
                setup={setup}
                onTeacher={onTeacher}
                onFinish={(players) => {
                  setFinalPlayers(players.map((p, i) => ({ id: i, ...p })));
                  setScreen('results');
                }}
              />
            </motion.div>
          )}
          {screen === 'results' && setup && (
            <motion.div key="results" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Results
                players={finalPlayers}
                subjectLabel={
                  setup.subject === 'math'
                    ? 'Математика · Деление на двузначное число'
                    : 'Русский язык · Гласные и согласные в корне слова'
                }
                onTeacher={onTeacher}
                onRestart={() => {
                  setSession((v) => v + 1);
                  setScreen('game');
                }}
                onHome={() => setScreen('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Teacher message={teacher.msg} mood={teacher.mood} />
    </div>
  );
}
