import { motion } from 'framer-motion';
import type { Player } from '@/types';
import { easyPath } from '@/lib/mathgen';
import Confetti from '@/components/Confetti';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnimatedWords from '@/components/AnimatedWords';
import { playClick, playVictory } from '@/lib/sound';
import { assetUrl } from '@/lib/utils';
import { useEffect } from 'react';

export default function Results({
  players,
  subjectLabel,
  onTeacher,
  onRestart,
  onHome,
}: {
  players: Player[];
  subjectLabel: string;
  onTeacher: (msg: string, mood: 'happy' | 'think' | 'sad' | 'wow') => void;
  onRestart: () => void;
  onHome: () => void;
}) {
  const totalMistakes = players.reduce((s, p) => s + p.mistakes.length, 0);
  // разбор ошибок по темам (русский язык)
  const topicMap = new Map<string, number>();
  players.forEach((p) =>
    p.mistakes.forEach((m) => {
      if (m.kind === 'ru') topicMap.set(m.task.category, (topicMap.get(m.task.category) || 0) + 1);
    })
  );
  const topics = [...topicMap.entries()].sort((a, b) => b[1] - a[1]);
  const best = Math.max(...players.map((p) => p.score));
  // новый рекорд?
  let record = 0;
  try {
    record = parseInt(localStorage.getItem('trainer-best') || '0') || 0;
  } catch {
    record = 0;
  }
  const newRecord = record > 0 && best >= record;
  const winners = players.filter((p) => p.score === best);
  const isDraw = players.length > 1 && winners.length > 1;
  const celebration = totalMistakes === 0;

  useEffect(() => {
    playVictory();
    if (celebration) {
      onTeacher('Ни одной ошибки! Безупречная работа! 🏆', 'wow');
    } else if (players.length === 2) {
      onTeacher(
        isDraw
          ? 'Ничья! Вы оба молодцы! А теперь вместе разберите ошибки — это самое полезное. 📖'
          : `${winners[0].name} победил(а)! А теперь главное — работа над ошибками: разберите каждый промах. 📖`,
        'happy'
      );
    } else {
      onTeacher('Тестирование завершено! А теперь самое важное — работа над ошибками. Разбери каждый промах 📖', 'think');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-44 pt-6 sm:pt-10">
      <Confetti fire={celebration} />

      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <motion.div
          className="text-5xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
        >
          {celebration ? '🏆' : players.length > 1 ? '🥇' : '📋'}
        </motion.div>
        <h1 className="text-3xl font-black text-slate-800 sm:text-4xl">
          <AnimatedWords
            text={players.length > 1 ? (isDraw ? 'Ничья!' : `Победил(а): ${winners[0].name}!`) : 'Тестирование завершено!'}
          />
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subjectLabel}</p>
        {newRecord && (
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 14 }}
            className="mx-auto mt-3 w-fit rounded-full border-2 border-amber-300 bg-amber-100 px-5 py-2 text-sm font-black text-amber-700 shadow-lg"
          >
            👑 Новый рекорд: {record} баллов!
          </motion.div>
        )}
      </motion.div>

      {/* Счёт */}
      <div className={`mt-6 grid gap-3 ${players.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ x: i === 0 ? -40 : 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className={`relative rounded-3xl border-2 bg-white/90 p-4 text-center shadow-xl ${
              winners.includes(p) ? 'border-amber-400' : 'border-white'
            }`}
          >
            {winners.includes(p) && (
              <motion.div
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl"
              >
                👑
              </motion.div>
            )}
            <img src={assetUrl(`characters/${p.avatar}.png`)} alt="" className="mx-auto h-24 w-20 rounded-2xl border-2 border-slate-200 object-cover object-top" />
            <div className="mt-1 truncate text-base font-extrabold text-slate-800">{p.name}</div>
            <div className="text-3xl font-black text-amber-500">
              ⭐ <AnimatedCounter value={p.score} />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Верно: {p.correctCount} · Ошибок: {p.mistakes.length}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="rounded-xl bg-orange-50 py-1.5 text-center">
                <div className="text-sm font-black text-orange-600">🔥 {p.bestStreak}</div>
                <div className="text-[9px] font-bold text-slate-500">лучшая серия</div>
              </div>
              <div className="rounded-xl bg-sky-50 py-1.5 text-center">
                <div className="text-sm font-black text-sky-600">
                  ⏱️ {p.correctCount > 0 ? (p.totalTime / p.correctCount).toFixed(1) : '—'}
                </div>
                <div className="text-[9px] font-bold text-slate-500">сек/пример</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Работа над ошибками */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-8"
      >
        <h2 className="mb-3 text-center text-2xl font-black text-slate-800">
          📖 Работа над ошибками
          <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-sm font-extrabold text-rose-600">
            {totalMistakes}
          </span>
        </h2>

        {totalMistakes === 0 ? (
          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center font-bold text-emerald-700">
            Ошибок нет — разбирать нечего! Ты справился идеально! 🎉
          </div>
        ) : (
          <>
            {topics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-3xl border-2 border-sky-200 bg-sky-50 p-4"
              >
                <div className="mb-2 text-center text-sm font-extrabold uppercase tracking-wide text-sky-700">
                  🧭 С какими темами разобраться
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {topics.map(([cat, n]) => (
                    <span key={cat} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow">
                      {cat} <span className="ml-1 rounded-full bg-rose-100 px-1.5 font-black text-rose-600">{n}</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            <div className="space-y-4">
            {players.map((p) =>
              p.mistakes.map((m, mi) => (
                <motion.article
                  key={`${p.id}-${mi}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + mi * 0.08 }}
                  className="overflow-hidden rounded-3xl border-2 border-rose-200 bg-white/95 shadow-lg"
                >
                  <div className="flex items-center gap-2 border-b-2 border-rose-100 bg-rose-50 px-4 py-2.5">
                    <img src={assetUrl(`characters/${p.avatar}.png`)} alt="" className="h-9 w-8 rounded-lg object-cover object-top" />
                    <span className="truncate text-sm font-extrabold text-slate-700">{p.name}</span>
                    {m.timedOut && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                        ВРЕМЯ ВЫШЛО
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    {m.kind === 'math' ? (
                      <>
                        <div className="text-center text-2xl font-black text-slate-800 sm:text-3xl">
                          {m.task.dividend} <span className="text-emerald-500">÷</span> {m.task.divisor} ={' '}
                          <span className="text-rose-500 line-through decoration-2">{m.chosen}</span>{' '}
                          <span className="text-emerald-600">{m.task.quotient}</span>
                        </div>
                        <div className="mt-4 rounded-2xl bg-emerald-50 p-3">
                          <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                            Как решать столбиком
                          </div>
                          <ol className="space-y-1.5">
                            {m.task.steps.map((s, i) => (
                              <li key={i} className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">
                                {s}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="mt-3 rounded-2xl bg-violet-50 p-3">
                          <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-violet-700">
                            💡 Лёгкие пути
                          </div>
                          {easyPath(m.task).map((l, i) => (
                            <p key={i} className="mb-1 text-xs font-semibold leading-snug text-slate-700 last:mb-0 sm:text-sm">
                              {l}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center text-xl font-black tracking-wider text-sky-700 sm:text-2xl">
                          {m.task.display.replace('_', '❓')}
                        </div>
                        <p className="mt-1 text-center text-sm font-bold text-slate-600">
                          Твой ответ: <span className="text-rose-500 line-through">{m.chosen}</span> · Правильно:{' '}
                          <span className="text-emerald-600">{m.task.options[m.task.correct]}</span>
                        </p>
                        <div className="mt-3 rounded-2xl bg-sky-50 p-3">
                          <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-sky-700">📏 Правило</div>
                          <p className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">{m.task.rule}</p>
                        </div>
                        <div className="mt-3 rounded-2xl bg-violet-50 p-3">
                          <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-violet-700">💡 Лёгкий путь</div>
                          <p className="text-xs font-semibold leading-snug text-slate-700 sm:text-sm">{m.task.tip}</p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.article>
              ))
            )}
            </div>
          </>
        )}
      </motion.section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playClick();
            onRestart();
          }}
          className="group relative min-h-[56px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-lg font-black text-white shadow-xl transition"
        >
          <span className="shine-sweep-el pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30" />
          <span className="relative">🔁 Пройти ещё раз</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playClick();
            onHome();
          }}
          className="group relative min-h-[56px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-xl transition"
        >
          <span className="shine-sweep-el pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30" />
          <span className="relative">🏠 На главную</span>
        </motion.button>
      </div>
    </div>
  );
}
