export type Difficulty = 'easy' | 'mid' | 'hard';

export interface MathTask {
  dividend: number;
  divisor: number;
  quotient: number;
  /** пошаговое объяснение решения (столбиком) */
  steps: string[];
  /** лёгкий путь / приём */
  tip: string;
}

export interface DifficultyInfo {
  id: Difficulty;
  label: string;
  divisorMin: number;
  divisorMax: number;
  count: number;
  timePerTask: number; // секунд на пример
}

export const DIFFICULTIES: DifficultyInfo[] = [
  { id: 'easy', label: 'Лёгкий · делитель 11–25', divisorMin: 11, divisorMax: 25, count: 8, timePerTask: 45 },
  { id: 'mid', label: 'Средний · делитель 12–50', divisorMin: 12, divisorMax: 50, count: 10, timePerTask: 40 },
  { id: 'hard', label: 'Сложный · делитель 13–99', divisorMin: 13, divisorMax: 99, count: 10, timePerTask: 35 },
];

function roundDivisor(d: number): number {
  return Math.round(d / 10) * 10;
}

function buildTip(divisor: number, quotient: number, dividend: number): string {
  const tips: string[] = [];
  const rounded = roundDivisor(divisor);
  if (rounded !== divisor) {
    tips.push(
      `Округли делитель: ${divisor} ≈ ${rounded}. Подбирай цифру по ${rounded}: ${rounded} × ${Math.floor(quotient / 10) * 10 || 10} = ${
        rounded * (Math.floor(quotient / 10) * 10 || 10)
      } — ориентируйся на такие «круглые» произведения.`
    );
  }
  if (dividend % 100 === 0) {
    tips.push(`Заметил? Делимое ${dividend} — круглое: сразу ищи, на что умножить ${divisor}, чтобы получить сотни.`);
  }
  if (quotient % 10 === 0) {
    tips.push(`Ответ ${quotient} — круглое число: значит, последняя цифра частного — 0, сразу после первого неполного делимого.`);
  }
  if (divisor * 5 === Math.round(divisor * 5) && (divisor * 5) % 10 === 0) {
    tips.push(`Приём ×5: ${divisor} × 5 = ${divisor * 5} — легко получить половину «круглого», это ускоряет подбор.`);
  }
  if (tips.length === 0) {
    tips.push(
      `Подбирай цифру частного и сразу проверяй умножением: ${divisor} × … = ${dividend}. Не угадал — пробуй цифру больше или меньше.`
    );
  }
  return tips[0];
}

function buildSteps(dividend: number, divisor: number, quotient: number): string[] {
  const steps: string[] = [];
  const ds = dividend.toString();
  // первое неполное делимое
  let take = 1;
  while (take < ds.length && parseInt(ds.slice(0, take)) < divisor) take++;
  let first = parseInt(ds.slice(0, take));
  steps.push(
    `1️⃣ Первое неполное делимое — ${first} (берём столько цифр, сколько нужно, чтобы число было ≥ ${divisor}).`
  );
  let rem = first;
  let pos = take;
  let digitIndex = 0;
  const qDigits = quotient.toString();
  while (pos <= ds.length) {
    const qd = parseInt(qDigits[digitIndex]);
    steps.push(`2️⃣${digitIndex + 1} Сколько раз ${divisor} содержится в ${rem}? ${divisor} × ${qd} = ${
      divisor * qd
    }. Цифра частного — ${qd}.`);
    const sub = rem - divisor * qd;
    if (pos < ds.length) {
      const nextDigit = parseInt(ds[pos]);
      steps.push(
        `   Остаток ${sub}. Сносим цифру ${nextDigit} → получаем ${sub * 10 + nextDigit} и повторяем деление.`
      );
      rem = sub * 10 + nextDigit;
      pos++;
    } else {
      steps.push(`   Остаток ${sub}. Деление закончено, остаток должен быть меньше делителя — всё верно!`);
      break;
    }
    digitIndex++;
    if (digitIndex > 10) break;
  }
  steps.push(`✅ Проверка: ${divisor} × ${quotient} = ${dividend}. Значит, ${dividend} : ${divisor} = ${quotient}.`);
  return steps;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** Варианты ответов для тестового режима (с дистракторами) */
export function makeMathOptions(task: MathTask): number[] {
  const opts = new Set<number>([task.quotient]);
  const near = [
    task.quotient + 1,
    task.quotient - 1,
    task.quotient + 10,
    task.quotient - 10,
    task.quotient + 2,
    task.quotient - 2,
    task.quotient * 2,
    Math.max(2, Math.round(task.quotient / 2)),
  ];
  for (const n of near) {
    if (opts.size >= 4) break;
    if (n > 0 && n !== task.quotient) opts.add(n);
  }
  const arr = [...opts].sort((a, b) => a - b);
  // перемешиваем
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateMathTasks(difficulty: Difficulty, count: number, exclude: Set<string>): MathTask[] {
  const info = DIFFICULTIES.find((d) => d.id === difficulty)!;
  const tasks: MathTask[] = [];
  let guard = 0;
  while (tasks.length < count && guard < 5000) {
    guard++;
    const divisor =
      info.divisorMin + Math.floor(Math.random() * (info.divisorMax - info.divisorMin + 1));
    const quotient = 11 + Math.floor(Math.random() * 85); // 11–95
    const dividend = divisor * quotient;
    if (dividend > 9999 || dividend < 1000) continue;
    if (difficulty === 'easy' && dividend > 5000) continue;
    const key = `${dividend}:${divisor}`;
    if (exclude.has(key)) continue;
    exclude.add(key);
    tasks.push({
      dividend,
      divisor,
      quotient,
      steps: buildSteps(dividend, divisor, quotient),
      tip: buildTip(divisor, quotient, dividend),
    });
  }
  return tasks;
}

/** Разложение «лёгкого пути» для экрана работы над ошибками */
export function easyPath(task: MathTask): string[] {
  const g = gcd(task.dividend, task.divisor);
  const lines: string[] = [];
  if (g > 1 && g !== task.divisor) {
    lines.push(
      `🚀 Лёгкий путь: у ${task.dividend} и ${task.divisor} есть общий множитель ${g}. Раздели оба числа на ${g}: получится ${
        task.dividend / g
      } : ${task.divisor / g} = ${task.quotient} — считать намного проще!`
    );
  }
  lines.push(`⏱️ Приём подбора: округли ${task.divisor} до десятков ≈ ${roundDivisor(task.divisor)} и проверяй умножением.`);
  lines.push(`🔁 Всегда проверяй: ${task.divisor} × ${task.quotient} = ${task.dividend}.`);
  return lines;
}
