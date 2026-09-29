import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HomeSetup } from './Home';
import type { Mistake } from '@/types';
import { generateMathTasks, makeMathOptions, type MathTask } from '@/lib/mathgen';
import { RUSSIAN_TASKS, shuffleTasks, type RussianTask } from '@/data/russian';
import { playCorrect, playWrong, playClick } from '@/lib/sound';
import { assetUrl } from '@/lib/utils';

type AnyTask = { kind: 'math'; task: MathTask } | { kind: 'ru'; task: RussianTask };

type Mood = 'happy' | 'think' | 'sad' | 'wow';

export interface PlayerResult {
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  mistakes: Mistake[];
  /** суммарное время ответов в секундах (математика) */
  totalTime: number;
  bestStreak: number;
}

const PRAISE = [
  'Отлично! Так держать! 🌟',
  'Верно! Ты молодец! 🎉',
  'Супер! Видно, что старался! 💪',
  'Правильно! Горжусь тобой! 🌈',
];
const SUPPORT = [
  'Не расстраивайся, ошибки — лучшие учителя! 💜',
  'Почти получилось! Сейчас разберём. 🌱',
  'Ошибся — значит, учишься! Вперёд! 🚀',
];

/** Первое неполное делимое — для подсказки */
function firstIncomplete(task: MathTask): number {
  const ds = task.dividend.toString();
  let t = 1;
  while (t < ds.length && parseInt(ds.slice(0, t)) < task.divisor) t++;
  return parseInt(ds.slice(0, t));
}

export default function Game({
  setup,
  onTeacher,
  onFinish,
}: {
  setup: HomeSetup;
  onTeacher: (msg: string, mood: Mood) => void;
  onFinish: (players: PlayerResult[]) => void;
}) {
  // Задания каждому игроку — свои
  const playerTasks = useMemo<AnyTask[][]>(() => {
    return Array.from({ length: setup.players }, () => {
      if (setup.subject === 'math') {
        return generateMathTasks(setup.difficulty, setup.taskCount, new Set()).map((task) => ({
          kind: 'math' as const,
          task,
        }));
      }
      return shuffleTasks(RUSSIAN_TASKS, setup.taskCount).map((task) => ({ kind: 'ru' as const, task }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [scores, setScores] = useState<number[]>(Array(setup.players).fill(0));
  const resultsRef = useRef<(PlayerResult | null)[]>(Array(setup.players).fill(null));
  const finishedRef = useRef(0);

  // приветствие учительницы
  useEffect(() => {
    if (setup.subject === 'math') {
      onTeacher(
        setup.mode === 'test'
          ? setup.players === 2
            ? 'Тестирование: выбирайте ответ из вариантов! Быстрые серии дают бонус 🔥. Застряли — жмите 💡!'
            : 'Тестирование: выбирай ответ из вариантов! Три верных подряд — бонус 🔥. Застрял — жми 💡!'
          : setup.players === 2
            ? 'Тренировка без спешки! Решайте столбиком, ответ пишите сами. Если застряли — 💡 Подсказка! 🌱'
            : 'Тренировка без ограничения времени. Решай столбиком и вписывай ответ сам. Если застрял — 💡 Подсказка! 🌱',
        'happy'
      );
    } else {
      onTeacher(
        setup.players === 2
          ? 'Орфограммы в корне слова! Работаем параллельно. Сомневаетесь — сначала 💡 Подсказка! ✏️'
          : 'Орфограммы в корне слова! Сомневаешься — жми 💡 Подсказку! ✏️',
        'think'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDone = (idx: number, res: PlayerResult) => {
    resultsRef.current[idx] = res;
    finishedRef.current += 1;
    if (finishedRef.current >= setup.players) {
      onFinish(resultsRef.current.filter((r): r is PlayerResult => r !== null));
    }
  };

  const handleScore = (idx: number, delta: number) => {
    setScores((s) => s.map((v, i) => (i === idx ? v + delta : v)));
  };

  const isTest = setup.subject === 'math' && setup.mode === 'test';
  const timePerTask = isTest ? setup.timePerTask : 0;
  const split = setup.players === 2;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-44 pt-4 sm:px-4 sm:pt-6">
      {/* Шапка: счёт всех игроков + рекорд */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {setup.names.map((name, i) => (
          <div key={i} className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-white px-3 py-1.5 shadow">
            <img src={assetUrl(`characters/${setup.avatars[i]}.png`)} alt="" className="h-9 w-8 rounded-lg object-cover object-top" />
            <div className="text-left">
              <div className="max-w-[110px] truncate text-xs font-extrabold text-slate-700 sm:text-sm">
                {name.trim() || `Ученик ${i + 1}`}
              </div>
              <div className="text-[11px] font-bold text-emerald-600">⭐ {scores[i]}</div>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-white px-3 py-1.5 shadow">
          <span className="text-sm">👑</span>
          <div className="text-left">
            <div className="text-[10px] font-bold text-slate-500">Рекорд</div>
            <div className="text-xs font-extrabold text-amber-600">{loadBestScore()}</div>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-white/60 bg-white/50 px-3 py-1.5 text-center">
          <div className="text-[11px] font-bold text-slate-500">
            {setup.subject === 'math' ? (isTest ? '⏱️ Тестирование' : '🌱 Тренировка') : '✏️ Русский язык'}
          </div>
        </div>
      </div>

      {/* Панели игроков: рядом на десктопе, друг под другом на телефоне */}
      <div className={`flex gap-4 ${split ? 'flex-col md:flex-row' : 'justify-center'}`}>
        {playerTasks.map((tasks, i) => (
          <PlayerArea
            key={i}
            index={i}
            name={setup.names[i].trim() || `Ученик ${i + 1}`}
            avatar={setup.avatars[i]}
            tasks={tasks}
            timePerTask={timePerTask}
            useOptions={isTest}
            compact={split}
            onTeacher={(msg, mood) => onTeacher(setup.players === 2 ? `${nameShort(setup.names[i])}: ${msg}` : msg, mood)}
            onScore={(d) => handleScore(i, d)}
            onDone={(res) => handleDone(i, res)}
          />
        ))}
      </div>
    </div>
  );
}

function nameShort(n: string) {
  const t = n.trim();
  return t.length > 10 ? t.slice(0, 10) + '…' : t || 'Ученик';
}

function loadBestScore(): number {
  try {
    return parseInt(localStorage.getItem('trainer-best') || '0') || 0;
  } catch {
    return 0;
  }
}

function PlayerArea({
  index,
  name,
  avatar,
  tasks,
  timePerTask,
  useOptions,
  compact,
  onTeacher,
  onScore,
  onDone,
}: {
  index: number;
  name: string;
  avatar: string;
  tasks: AnyTask[];
  timePerTask: number; // 0 = без времени
  useOptions: boolean; // тест: выбор из вариантов
  compact: boolean;
  onTeacher: (msg: string, mood: Mood) => void;
  onScore: (delta: number) => void;
  onDone: (res: PlayerResult) => void;
}) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  /** тренировка: ждём нажатия «Далее» вместо автоперехода */
  const [waitNext, setWaitNext] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerTask);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const taskStartRef = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const current = tasks[taskIdx];
  const isMath = current?.kind === 'math';
  const timed = timePerTask > 0 && isMath;
  // варианты ответов для тестового режима математики (генерируются один раз на задание)
  const mathOptions = useMemo(() => {
    if (isMath && useOptions) return makeMathOptions(current.task);
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdx]);

  // таймер (только тестовый режим)
  useEffect(() => {
    if (!timed || feedback || taskIdx >= tasks.length) return;
    if (timeLeft <= 0) {
      applyResult(false, '— время вышло', true);
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((s) => +(s - 0.1).toFixed(1)), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timed, feedback, taskIdx]);

  useEffect(() => {
    taskStartRef.current = Date.now();
    if (!isMath && !feedback) inputRef.current?.focus();
  }, [taskIdx, isMath, feedback]);

  const finish = (
    finalMistakes: Mistake[],
    finalCorrect: number,
    finalStreak: number,
    finalScore: number,
    finalTime: number
  ) => {
    const finalBestStreak = Math.max(bestStreak, finalStreak);
    setDone(true);
    window.setTimeout(() => {
      onDone({
        name,
        avatar,
        score: finalScore,
        correctCount: finalCorrect,
        mistakes: finalMistakes,
        totalTime: finalTime,
        bestStreak: finalBestStreak,
      });
      // рекорд
      try {
        const best = parseInt(localStorage.getItem('trainer-best') || '0') || 0;
        if (finalScore > best) localStorage.setItem('trainer-best', String(finalScore));
      } catch {
        /* ignore */
      }
    }, 1200);
  };

  const advance = (
    finalMistakes: Mistake[],
    finalCorrect: number,
    newStreak: number,
    newScore: number,
    newTime: number
  ) => {
    setFeedback(null);
    setAnswer('');
    setSelected(null);
    setHintOpen(false);
    setShowSolution(false);
    setWaitNext(false);
    if (taskIdx + 1 >= tasks.length) {
      finish(finalMistakes, finalCorrect, newStreak, newScore, newTime);
    } else {
      setTaskIdx(taskIdx + 1);
      if (timed) setTimeLeft(timePerTask);
    }
  };

  const applyResult = (ok: boolean, chosen: string, timedOut = false) => {
    const spentSec = Math.round((Date.now() - taskStartRef.current) / 100) / 10;
    const mistake: Mistake =
      current.kind === 'math'
        ? { kind: 'math', task: current.task, chosen, timedOut }
        : { kind: 'ru', task: current.task, chosen, timedOut };

    const newMistakes = ok ? mistakes : [...mistakes, mistake];
    const newCorrect = correctCount + (ok ? 1 : 0);
    const newStreak = ok ? streak + 1 : 0;
    const combo = ok && streak >= 2; // третий и далее подряд
    const points = ok ? 10 + (combo ? 5 : 0) : 0;
    const newScore = score + points;
    const newTime = +(totalTime + spentSec).toFixed(1);

    setMistakes(newMistakes);
    setCorrectCount(newCorrect);
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    setScore(newScore);
    setTotalTime(newTime);
    setFeedback(ok ? 'correct' : 'wrong');

    if (ok) {
      onScore(points);
      playCorrect();
      if (combo) {
        onTeacher(`🔥 Серия из ${newStreak}! +${points} баллов!`, 'wow');
      } else {
        onTeacher(PRAISE[Math.floor(Math.random() * PRAISE.length)], 'happy');
      }
    } else {
      playWrong();
      onTeacher(
        timedOut ? 'Время вышло! Не волнуйся, разберём этот пример в работе над ошибками. ⏰' : SUPPORT[Math.floor(Math.random() * SUPPORT.length)],
        'sad'
      );
    }
    // в тренировке не убегаем дальше: ученик сам жмёт «Следующий пример», успев разобрать решение
    const holdForNext = isMath && !useOptions;
    window.setTimeout(() => {
      if (holdForNext) {
        setWaitNext(true);
      } else {
        advance(newMistakes, newCorrect, newStreak, newScore, newTime);
      }
    }, ok ? 1000 : 2000);
  };

  const submitMath = () => {
    if (feedback || current.kind !== 'math' || useOptions) return;
    const val = parseInt(answer.trim());
    if (Number.isNaN(val)) return;
    playClick();
    applyResult(val === current.task.quotient, answer.trim());
  };

  const pickOption = (opt: number, i: number) => {
    if (feedback || current.kind !== 'math') return;
    playClick();
    setSelected(i);
    applyResult(opt === current.task.quotient, String(opt));
  };

  const chooseRu = (optIdx: number) => {
    if (feedback || current.kind !== 'ru') return;
    playClick();
    setSelected(optIdx);
    applyResult(optIdx === current.task.correct, current.task.options[optIdx]);
  };

  if (!current) return null;
  const progress = ((taskIdx + (feedback ? 1 : 0)) / tasks.length) * 100;
  const shortOptions = current.kind === 'ru' && current.task.options.every((o) => o.length <= 3);

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.12 }}
      className={`relative min-w-0 overflow-hidden rounded-3xl border-2 bg-white/90 shadow-2xl backdrop-blur ${
        compact ? 'flex-1 border-violet-200' : 'w-full max-w-2xl border-white'
      }`}
    >
      {/* Шапка панели */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-slate-100 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <img src={assetUrl(`characters/${avatar}.png`)} alt="" className="h-10 w-9 rounded-xl border-2 border-amber-300 object-cover object-top" />
          <div>
            <div className="max-w-[110px] truncate text-sm font-extrabold text-slate-800">{name}</div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span>⭐ {score}</span>
              <AnimatePresence>
                {streak >= 2 && (
                  <motion.span
                    key={streak}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="rounded-full bg-orange-100 px-1.5 py-0.5 text-orange-600"
                  >
                    🔥{streak}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-100 px-2.5 py-1 text-center">
          <div className="text-[10px] font-bold text-slate-500">Вопрос</div>
          <div className="text-xs font-extrabold text-slate-700">
            {Math.min(taskIdx + 1, tasks.length)}/{tasks.length}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {/* Прогресс */}
        <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
          />
        </div>

        {/* Таймер */}
        {timed && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>⏱️ Время</span>
              <span className={timeLeft <= 10 ? 'text-rose-500' : ''}>{Math.ceil(timeLeft)} сек</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-100 ${timeLeft <= 10 ? 'bg-rose-400' : 'bg-amber-400'}`}
                style={{ width: `${(timeLeft / timePerTask) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Задание */}
        <AnimatePresence mode="wait">
          <motion.div
            key={taskIdx}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {current.kind === 'ru' && (
              <div className="mb-2 inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-sky-700">
                {current.task.category}
              </div>
            )}

            {isMath ? (
              <>
                <p className="text-center text-xs font-semibold text-slate-500">
                  {useOptions ? 'Выбери верный ответ:' : 'Реши и введи ответ:'}
                </p>
                <div className={`my-3 flex items-center justify-center gap-1.5 font-black text-slate-800 ${compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'}`}>
                  <span>{current.task.dividend}</span>
                  <span className="px-0.5 text-emerald-500">÷</span>
                  <span>{current.task.divisor}</span>
                  <span className="text-slate-400">=</span>
                  {useOptions ? <span className="text-amber-500">?</span> : null}
                </div>

                {useOptions ? (
                  <div className="grid grid-cols-2 gap-2">
                    {mathOptions!.map((opt, i) => {
                      const isCorrect = feedback && opt === current.task.quotient;
                      const isWrongPick = feedback === 'wrong' && selected === i;
                      return (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          disabled={!!feedback}
                          onClick={() => pickOption(opt, i)}
                          className={`min-h-[52px] rounded-2xl border-3 text-xl font-black transition ${
                            isCorrect
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                              : isWrongPick
                                ? 'border-rose-400 bg-rose-100 text-rose-600'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="numeric"
                      value={answer}
                      disabled={!!feedback}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitMath()}
                      placeholder="Ответ"
                      className={`min-h-[52px] w-full rounded-2xl border-4 border-emerald-300 bg-emerald-50 text-center font-black text-emerald-700 outline-none transition focus:border-emerald-500 ${
                        compact ? 'text-2xl' : 'text-3xl'
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitMath}
                      disabled={!!feedback || !answer.trim()}
                      className="group relative min-h-[52px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-black text-white shadow-lg transition disabled:opacity-40 sm:w-auto sm:px-8"
                    >
                      <span className="shine-sweep-el pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30" />
                      <span className="relative">Проверить ✔</span>
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className={`text-center font-semibold text-slate-600 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
                  {current.task.prompt}
                </p>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`my-4 text-center font-black tracking-widest text-sky-700 ${
                    compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
                  }`}
                >
                  {current.task.display}
                </motion.div>
                <div className={`grid gap-2 ${shortOptions ? 'grid-cols-4' : 'grid-cols-2'}`}>
                  {current.task.options.map((opt, i) => {
                    const isCorrect = feedback && i === current.task.correct;
                    const isWrongPick = feedback === 'wrong' && selected === i;
                    return (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        disabled={!!feedback}
                        onClick={() => chooseRu(i)}
                        className={`min-h-[52px] rounded-2xl border-3 font-black transition ${
                          compact ? 'text-lg' : 'text-xl sm:text-2xl'
                        } ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                            : isWrongPick
                              ? 'border-rose-400 bg-rose-100 text-rose-600'
                              : 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400'
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Разбор решения (тренировка, после ответа) */}
        {isMath && !useOptions && feedback && (
          <div className="mt-3">
            <button
              onClick={() => {
                playClick();
                setShowSolution((v) => !v);
              }}
              className="min-h-[44px] w-full rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-sm font-extrabold text-emerald-700 shadow transition hover:bg-emerald-100 active:scale-[0.98]"
            >
              {showSolution ? '🙈 Скрыть решение' : '🧮 Показать решение столбиком'}
            </button>
            <AnimatePresence>
              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3">
                    <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                      🧮 Решение {current.task.dividend} ÷ {current.task.divisor} = {current.task.quotient}
                    </div>
                    <ol className="space-y-1.5">
                      {current.task.steps.map((s, i) => (
                        <li key={i} className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Следующий пример (тренировка) */}
        {waitNext && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playClick();
                advance(mistakes, correctCount, streak, score, totalTime);
              }}
              className="group relative min-h-[52px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-base font-black text-white shadow-xl transition"
            >
              <span className="shine-sweep-el pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30" />
              <span className="relative">Следующий пример ➜</span>
            </motion.button>
          </motion.div>
        )}

        {/* Кнопка подсказки */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => {
              playClick();
              setHintOpen((h) => !h);
            }}
            disabled={!!feedback}
            className="min-h-[44px] rounded-full border-2 border-violet-300 bg-violet-50 px-5 text-sm font-extrabold text-violet-700 shadow transition hover:bg-violet-100 active:scale-95 disabled:opacity-40"
          >
            {hintOpen ? '🙈 Скрыть подсказку' : '💡 Подсказка'}
          </button>
        </div>

        {/* Текст подсказки */}
        <AnimatePresence>
          {hintOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-2xl border-2 border-violet-200 bg-violet-50 p-3">
                <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700">
                  💡 Подсказка учительницы
                </div>
                {current.kind === 'math' ? (
                  <>
                    <p className="mb-1 text-xs font-semibold leading-snug text-slate-700 sm:text-sm">
                      Начни с первого неполного делимого: возьми слева столько цифр, чтобы число было ≥ {current.task.divisor}. Здесь это —{' '}
                      <span className="font-black text-violet-700">{firstIncomplete(current.task)}</span>.
                    </p>
                    <p className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">{current.task.tip}</p>
                  </>
                ) : (
                  <p className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">{current.task.tip}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Галочка завершения */}
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="py-6 text-center">
            <div className="text-5xl">🏁</div>
            <div className="mt-2 font-extrabold text-slate-700">Готово! Ждём результаты…</div>
          </motion.div>
        )}
      </div>

      {/* Реакция ✔ / ✖ + комбо */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
          >
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-2xl sm:h-32 sm:w-32 sm:text-6xl ${
                feedback === 'correct' ? 'bg-emerald-400/95' : 'bg-rose-400/95'
              }`}
            >
              {feedback === 'correct' ? '✔' : '✖'}
            </div>
            {feedback === 'correct' && streak + 1 >= 3 && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 12 }}
                className="rounded-full bg-orange-500 px-4 py-1.5 text-lg font-black text-white shadow-xl"
              >
                🔥 Серия {streak + 1}! +15
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
