import type { RussianTask } from './data/russian';
import type { MathTask } from './lib/mathgen';

export interface Player {
  id: number;
  name: string;
  avatar: string; // путь к картинке
  score: number;
  correctCount: number;
  mistakes: Mistake[];
  /** суммарное время ответов, сек */
  totalTime: number;
  /** лучшая серия верных подряд */
  bestStreak: number;
}

export type Mistake =
  | {
      kind: 'ru';
      task: RussianTask;
      chosen: string;
      timedOut?: boolean;
    }
  | {
      kind: 'math';
      task: MathTask;
      chosen: string;
      timedOut?: boolean;
    };
