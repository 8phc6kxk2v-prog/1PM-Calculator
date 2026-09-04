import { accuracyHint } from './formulas'
import type { HistoryEntry } from './storage'

/** Соревновательная тройка: из неё складывается сумма для DOTS */
export const COMPETITION_LIFTS = ['Присед со штангой', 'Жим лёжа', 'Становая тяга'] as const

/**
 * Одна оценка 1ПМ на запись: берём ту формулу, которая точнее в этом
 * диапазоне повторений, чтобы рекорды не прыгали между двумя числами.
 */
export function estimate1RM(entry: HistoryEntry): number {
  return accuracyHint(entry.reps).winner === 'epley' ? entry.epley1RM : entry.brzycki1RM
}

export interface PersonalRecord {
  exercise: string
  oneRM: number
  weight: number
  reps: number
  date: string
}

export function personalRecords(history: HistoryEntry[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>()

  for (const entry of history) {
    const oneRM = estimate1RM(entry)
    const current = best.get(entry.exercise)
    if (!current || oneRM > current.oneRM) {
      best.set(entry.exercise, {
        exercise: entry.exercise,
        oneRM,
        weight: entry.weight,
        reps: entry.reps,
        date: entry.date,
      })
    }
  }

  return [...best.values()].sort((a, b) => b.oneRM - a.oneRM)
}

/**
 * Насколько вырос расчётный максимум за последние `days` дней:
 * сравниваем лучший результат внутри окна с лучшим результатом до него.
 */
export function progressDelta(
  history: HistoryEntry[],
  exercise: string,
  days = 30,
  now = Date.now(),
): number | null {
  const since = now - days * 24 * 60 * 60 * 1000
  const forExercise = history.filter((entry) => entry.exercise === exercise)

  const inWindow = forExercise.filter((entry) => new Date(entry.date).getTime() >= since)
  const before = forExercise.filter((entry) => new Date(entry.date).getTime() < since)
  if (inWindow.length === 0 || before.length === 0) return null

  const bestOf = (list: HistoryEntry[]) => Math.max(...list.map(estimate1RM))
  return bestOf(inWindow) - bestOf(before)
}

export interface Total {
  total: number
  lifts: { exercise: string; oneRM: number }[]
  missing: string[]
}

/** Сумма троеборья по лучшим расчётным максимумам */
export function powerliftingTotal(history: HistoryEntry[]): Total {
  const records = personalRecords(history)
  const lifts: Total['lifts'] = []
  const missing: string[] = []

  for (const lift of COMPETITION_LIFTS) {
    const record = records.find((item) => item.exercise === lift)
    if (record) lifts.push({ exercise: lift, oneRM: record.oneRM })
    else missing.push(lift)
  }

  return { total: lifts.reduce((sum, lift) => sum + lift.oneRM, 0), lifts, missing }
}
