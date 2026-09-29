import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Строит корректный путь к файлу из папки `public`, учитывая base path сборки.
 * Нужно, чтобы картинки не ломались при деплое на GitHub Pages в подпапку
 * (например https://user.github.io/repo-name/), где абсолютные пути вида
 * "/characters/foo.png" указывали бы мимо репозитория.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
