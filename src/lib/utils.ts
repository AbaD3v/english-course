import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Утилита для объединения Tailwind классов.
 * Позволяет динамически прокидывать условия и предотвращает конфликты стилей.
 * * Пример: cn("px-4 py-2 bg-blue-500", isError && "bg-red-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование даты в привычный человеческий вид (например, для курсов или профиля)
 */
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Задержка для имитации загрузки (полезно при разработке UI/Skeleton)
 */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Очистка URL или строк (полезно для генерации slug или обработки ввода)
 */
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
}