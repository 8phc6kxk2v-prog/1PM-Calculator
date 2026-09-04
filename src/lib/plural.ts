/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
/** Русское склонение по числу: 1 день, 2 дня, 5 дней */
export function plural(count: number, one: string, few: string, many: string): string {
  const value = Math.floor(Math.abs(count))
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
