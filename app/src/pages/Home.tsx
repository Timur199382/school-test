import { useState } from 'react';
import { motion } from 'framer-motion';
import AvatarPicker from '@/components/AvatarPicker';
import { DIFFICULTIES, type Difficulty } from '@/lib/mathgen';
import { playClick } from '@/lib/sound';

export type Subject = 'ru' | 'math';

export interface HomeSetup {
  players: number;
  names: string[];
  avatars: string[];
  subject: Subject;
  difficulty: Difficulty;
  /** math only: тестирование на время или тренировка без времени */
  mode: 'test' | 'practice';
}

const DEFAULT_NAMES = ['Ученик 1', 'Ученик 2'];

export default function Home({ onStart }: { onStart: (setup: HomeSetup) => void }) {
  const [players, setPlayers] = useState<1 | 2>(1);
  const [subject, setSubject] = useState<Subject>('math');
  const [difficulty, setDifficulty] = useState<Difficulty>('mid');
  const [mode, setMode] = useState<'test' | 'practice'>('test');
  const [avatars, setAvatars] = useState<string[]>(['girl1', 'boy1']);
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES]);

  const canStart = names.slice(0, players).every((n) => n.trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-52 pt-6 sm:pb-40 sm:pt-10">
      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <div className="mb-1 text-5xl">🎒</div>
        <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
          Тренажёр 4 класса
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-600 sm:text-base">
          Русский язык: гласные и согласные в корне слова · Математика: деление на двузначное число
        </p>
      </motion.div>

      {/* Количество игроков */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-3xl border-2 border-white bg-white/80 p-4 shadow-xl backdrop-blur sm:p-6"
      >
        <h2 className="mb-3 text-center text-lg font-extrabold text-slate-800">Сколько будет играть?</h2>
        <div className="grid grid-cols-2 gap-3">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              onClick={() => {
                playClick();
                setPlayers(n);
              }}
              className={`min-h-[44px] rounded-2xl border-2 px-3 py-3 text-base font-extrabold transition sm:text-lg ${
                players === n
                  ? 'border-violet-500 bg-violet-500 text-white shadow-lg'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'
              }`}
            >
              {n === 1 ? '🙋 Один ученик' : '🙋‍♂️🙋‍♀️ Два ученика'}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Игроки */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-4 rounded-3xl border-2 border-white bg-white/80 p-4 shadow-xl backdrop-blur sm:p-6"
      >
        <h2 className="mb-3 text-center text-lg font-extrabold text-slate-800">
          {players === 1 ? 'Выбери себя' : 'Выберите себя'}
        </h2>
        {Array.from({ length: players }, (_, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-center gap-2">
              <img src={`/characters/${avatars[i]}.png`} alt="" className="h-12 w-10 rounded-xl border-2 border-amber-300 object-cover object-top" />
              <input
                value={names[i]}
                maxLength={14}
                onChange={(e) => {
                  const nn = [...names];
                  nn[i] = e.target.value;
                  setNames(nn);
                }}
                placeholder={`Имя ученика ${i + 1}`}
                className="min-h-[44px] w-48 rounded-xl border-2 border-slate-200 bg-white px-3 text-center text-base font-bold text-slate-700 outline-none transition focus:border-violet-400"
              />
            </div>
            <AvatarPicker
              selected={avatars[i]}
              onSelect={(id) => {
                playClick();
                const aa = [...avatars];
                aa[i] = id;
                setAvatars(aa);
              }}
            />
          </div>
        ))}
      </motion.section>

      {/* Предмет */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mt-4 rounded-3xl border-2 border-white bg-white/80 p-4 shadow-xl backdrop-blur sm:p-6"
      >
        <h2 className="mb-3 text-center text-lg font-extrabold text-slate-800">Что будем решать?</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              playClick();
              setSubject('math');
            }}
            className={`min-h-[44px] rounded-2xl border-2 px-4 py-4 text-left transition ${
              subject === 'math'
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
            }`}
          >
            <div className="text-2xl">➗</div>
            <div className="mt-1 text-base font-extrabold">Математика</div>
            <div className={`text-xs ${subject === 'math' ? 'text-emerald-50' : 'text-slate-400'}`}>
              Деление на двузначное число · на время
            </div>
          </button>
          <button
            onClick={() => {
              playClick();
              setSubject('ru');
            }}
            className={`min-h-[44px] rounded-2xl border-2 px-4 py-4 text-left transition ${
              subject === 'ru'
                ? 'border-sky-500 bg-sky-500 text-white shadow-lg'
                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'
            }`}
          >
            <div className="text-2xl">✏️</div>
            <div className="mt-1 text-base font-extrabold">Русский язык</div>
            <div className={`text-xs ${subject === 'ru' ? 'text-sky-50' : 'text-slate-400'}`}>
              Гласные и согласные в корне слова
            </div>
          </button>
        </div>

        {subject === 'math' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    playClick();
                    setDifficulty(d.id);
                  }}
                  className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-[11px] font-bold transition sm:text-sm ${
                    difficulty === d.id
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300'
                  }`}
                >
                  {d.label.split('·')[0].trim()}
                  <span className="block text-[10px] font-semibold opacity-70">
                    {d.count} примеров{mode === 'test' ? ` · ${d.timePerTask} сек` : ''}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  playClick();
                  setMode('test');
                }}
                className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-left transition ${
                  mode === 'test'
                    ? 'border-amber-400 bg-amber-100 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
                }`}
              >
                <span className="text-sm font-extrabold">⏱️ Тестирование</span>
                <span className="block text-[11px] font-semibold opacity-70">каждый пример на время</span>
              </button>
              <button
                onClick={() => {
                  playClick();
                  setMode('practice');
                }}
                className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-left transition ${
                  mode === 'practice'
                    ? 'border-amber-400 bg-amber-100 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
                }`}
              >
                <span className="text-sm font-extrabold">🌱 Тренировка</span>
                <span className="block text-[11px] font-semibold opacity-70">без ограничения времени</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.section>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        disabled={!canStart}
        onClick={() => {
          playClick();
          onStart({ players, names: names.slice(0, players), avatars: avatars.slice(0, players), subject, difficulty, mode });
        }}
        className="mt-6 w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-xl font-black text-white shadow-2xl transition disabled:opacity-40"
      >
        🚀 Начать тестирование
      </motion.button>
    </div>
  );
}
