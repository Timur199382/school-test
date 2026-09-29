import { useState } from 'react';
import { motion } from 'framer-motion';
import AvatarPicker from '@/components/AvatarPicker';
import AnimatedWords from '@/components/AnimatedWords';
import { DIFFICULTIES, type Difficulty } from '@/lib/mathgen';
import { playClick } from '@/lib/sound';
import { assetUrl } from '@/lib/utils';

export type Subject = 'ru' | 'math';

export interface HomeSetup {
  players: number;
  names: string[];
  avatars: string[];
  subject: Subject;
  difficulty: Difficulty;
  /** math only: тестирование на время или тренировка без времени */
  mode: 'test' | 'practice';
  /** сколько заданий будет в игре (можно уменьшить или увеличить) */
  taskCount: number;
  /** math + test: сколько секунд даётся на один пример (можно уменьшить или увеличить) */
  timePerTask: number;
}

const DEFAULT_NAMES = ['Ученик 1', 'Ученик 2'];
const MIN_TASKS = 3;
const MAX_TASKS = 20;
const MIN_TIME = 10;
const MAX_TIME = 90;
const TIME_STEP = 5;

export default function Home({ onStart }: { onStart: (setup: HomeSetup) => void }) {
  const [players, setPlayers] = useState<1 | 2>(1);
  const [subject, setSubject] = useState<Subject>('math');
  const [difficulty, setDifficulty] = useState<Difficulty>('mid');
  const [mode, setMode] = useState<'test' | 'practice'>('test');
  const [avatars, setAvatars] = useState<string[]>(['girl1', 'boy1']);
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES]);
  const [taskCount, setTaskCount] = useState<number>(10);
  const [timePerTask, setTimePerTask] = useState<number>(
    DIFFICULTIES.find((d) => d.id === 'mid')!.timePerTask
  );

  const changeTaskCount = (delta: number) => {
    playClick();
    setTaskCount((c) => Math.min(MAX_TASKS, Math.max(MIN_TASKS, c + delta)));
  };

  const changeTime = (delta: number) => {
    playClick();
    setTimePerTask((t) => Math.min(MAX_TIME, Math.max(MIN_TIME, t + delta)));
  };

  const selectDifficulty = (d: Difficulty) => {
    playClick();
    setDifficulty(d);
    // подставляем время по умолчанию для новой сложности, чтобы не приходилось
    // подстраивать вручную каждый раз — но пользователь всё ещё может его изменить
    setTimePerTask(DIFFICULTIES.find((x) => x.id === d)!.timePerTask);
  };

  const canStart = names.slice(0, players).every((n) => n.trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-52 pt-6 sm:pb-40 sm:pt-10">
      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <motion.div
          className="mb-1 text-5xl"
          animate={{ rotate: [0, -8, 8, -4, 0], y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        >
          🎒
        </motion.div>
        <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-3xl font-black text-transparent text-shimmer sm:text-5xl">
          <AnimatedWords text="Тренажёр 4 класса" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 text-sm font-semibold text-slate-600 sm:text-base"
        >
          Русский язык: гласные и согласные в корне слова · Математика: деление на двузначное число
        </motion.p>
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
            <motion.button
              key={n}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
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
            </motion.button>
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
              <img src={assetUrl(`characters/${avatars[i]}.png`)} alt="" className="h-12 w-10 rounded-xl border-2 border-amber-300 object-cover object-top" />
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
          <motion.button
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
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
            <motion.div
              className="text-2xl"
              animate={subject === 'math' ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              ➗
            </motion.div>
            <div className="mt-1 text-base font-extrabold">Математика</div>
            <div className={`text-xs ${subject === 'math' ? 'text-emerald-50' : 'text-slate-400'}`}>
              Деление на двузначное число · на время
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
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
            <motion.div
              className="text-2xl"
              animate={subject === 'ru' ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              ✏️
            </motion.div>
            <div className="mt-1 text-base font-extrabold">Русский язык</div>
            <div className={`text-xs ${subject === 'ru' ? 'text-sky-50' : 'text-slate-400'}`}>
              Гласные и согласные в корне слова
            </div>
          </motion.button>
        </div>

        {subject === 'math' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => selectDifficulty(d.id)}
                  className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-[11px] font-bold transition sm:text-sm ${
                    difficulty === d.id
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300'
                  }`}
                >
                  {d.label.split('·')[0].trim()}
                  <span className="block text-[10px] font-semibold opacity-70">
                    {d.label.split('·')[1]?.trim()}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
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
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
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
              </motion.button>
            </div>

            {mode === 'test' && (
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3">
                <h3 className="mb-2 text-center text-xs font-extrabold text-amber-800">
                  ⏱️ Времени на один пример
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeTime(-TIME_STEP)}
                    disabled={timePerTask <= MIN_TIME}
                    aria-label="Уменьшить время на пример"
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-xl font-black text-amber-600 transition hover:border-amber-300 disabled:opacity-30"
                  >
                    −
                  </motion.button>
                  <div className="w-20 text-center">
                    <motion.div
                      key={timePerTask}
                      initial={{ scale: 1.25 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="text-2xl font-black text-slate-800"
                    >
                      {timePerTask}
                    </motion.div>
                    <div className="text-[10px] font-semibold text-slate-500">секунд</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeTime(TIME_STEP)}
                    disabled={timePerTask >= MAX_TIME}
                    aria-label="Увеличить время на пример"
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-xl font-black text-amber-600 transition hover:border-amber-300 disabled:opacity-30"
                  >
                    +
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.section>

      {/* Количество заданий */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-3xl border-2 border-white bg-white/80 p-4 shadow-xl backdrop-blur sm:p-6"
      >
        <h2 className="mb-3 text-center text-lg font-extrabold text-slate-800">Сколько заданий?</h2>
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeTaskCount(-1)}
            disabled={taskCount <= MIN_TASKS}
            aria-label="Уменьшить количество заданий"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-2xl font-black text-violet-600 transition hover:border-violet-300 disabled:opacity-30"
          >
            −
          </motion.button>
          <div className="w-24 text-center">
            <motion.div
              key={taskCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="text-3xl font-black text-slate-800"
            >
              {taskCount}
            </motion.div>
            <div className="text-[11px] font-semibold text-slate-500">заданий</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeTaskCount(1)}
            disabled={taskCount >= MAX_TASKS}
            aria-label="Увеличить количество заданий"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-2xl font-black text-violet-600 transition hover:border-violet-300 disabled:opacity-30"
          >
            +
          </motion.button>
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {[5, 8, 10, 15].map((n) => (
            <motion.button
              key={n}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                playClick();
                setTaskCount(n);
              }}
              className={`min-h-[36px] rounded-xl border-2 px-3 text-xs font-bold transition ${
                taskCount === n
                  ? 'border-violet-500 bg-violet-500 text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300'
              }`}
            >
              {n}
            </motion.button>
          ))}
        </div>
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
          onStart({
            players,
            names: names.slice(0, players),
            avatars: avatars.slice(0, players),
            subject,
            difficulty,
            mode,
            taskCount,
            timePerTask,
          });
        }}
        className={`group relative mt-6 min-h-[56px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-xl font-black text-white shadow-2xl transition disabled:opacity-40 ${
          canStart ? 'animate-glow-pulse' : ''
        }`}
      >
        <span className="shine-sweep-el pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30" />
        <span className="relative">🚀 Начать тестирование</span>
      </motion.button>
    </div>
  );
}
