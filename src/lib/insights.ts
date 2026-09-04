/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { personalRecords } from './records'
import type { HistoryEntry } from './storage'

const DAY_MS = 24 * 60 * 60 * 1000

export function dayKey(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

/** Понедельник недели, в которую попадает дата */
function weekStart(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const shift = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - shift)
  return monday
}

export interface StreakStats {
  /** Дни последних 12 недель: сколько записей в каждом */
  days: { key: string; date: Date; count: number }[]
  /** Недель подряд хотя бы с одной тренировкой, считая от текущей */
  weeks: number
  sessionsLast30: number
  total: number
}

/**
 * Серия считается по неделям, а не по дням: силовые тренировки идут
 * 3-4 раза в неделю, и дневная серия рвалась бы на каждом дне отдыха.
 */
export function streakStats(history: HistoryEntry[], now = new Date()): StreakStats {
  const counts = new Map<string, number>()
  for (const entry of history) {
    const key = dayKey(entry.date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days: StreakStats['days'] = []
  // 12 недель ровными столбцами: начинаем с понедельника 11 недель назад
  const gridStart = weekStart(new Date(today.getTime() - 11 * 7 * DAY_MS))
  for (let i = 0; i < 12 * 7; i += 1) {
    const date = new Date(gridStart.getTime() + i * DAY_MS)
    const key = dayKey(date)
    days.push({ key, date, count: counts.get(key) ?? 0 })
  }

  const trainedWeeks = new Set(
    history.map((entry) => dayKey(weekStart(new Date(entry.date)))),
  )
  let weeks = 0
  for (let i = 0; ; i += 1) {
    const week = dayKey(weekStart(new Date(today.getTime() - i * 7 * DAY_MS)))
    if (!trainedWeeks.has(week)) {
      // текущая неделя может быть ещё пустой, это серию не рвёт
      if (i === 0) continue
      break
    }
    weeks += 1
  }

  const since = today.getTime() - 30 * DAY_MS
  const sessionsLast30 = new Set(
    history.filter((entry) => new Date(entry.date).getTime() >= since).map((entry) => dayKey(entry.date)),
  ).size

  return { days, weeks, sessionsLast30, total: counts.size }
}

/**
 * Ориентировочные пропорции троеборья: жим 1, присед 1.3, тяга 1.6.
 * Соотношение усреднённое, у конкретного человека зависит от рычагов,
 * поэтому это подсказка про отставшее движение, а не норматив.
 */
export const BALANCE_REFERENCE: Record<string, number> = {
  'Жим лёжа': 1,
  'Присед со штангой': 1.3,
  'Становая тяга': 1.6,
}

export interface BalanceLift {
  exercise: string
  oneRM: number
  /** Отклонение от ожидаемого по пропорции, в процентах */
  deviation: number
  expected: number
}

export interface Balance {
  lifts: BalanceLift[]
  weakest: BalanceLift | null
  missing: string[]
}

export function liftBalance(history: HistoryEntry[]): Balance {
  const records = personalRecords(history)
  const present: { exercise: string; oneRM: number; ratio: number }[] = []
  const missing: string[] = []

  for (const [exercise, ratio] of Object.entries(BALANCE_REFERENCE)) {
    const record = records.find((item) => item.exercise === exercise)
    if (record) present.push({ exercise, oneRM: record.oneRM, ratio })
    else missing.push(exercise)
  }

  // Одного движения мало: сравнивать не с чем
  if (present.length < 2) return { lifts: [], weakest: null, missing }

  // Индекс - вес, приведённый к жиму. Средний индекс задаёт общий уровень.
  const indexes = present.map((lift) => lift.oneRM / lift.ratio)
  const base = indexes.reduce((sum, value) => sum + value, 0) / indexes.length

  const lifts: BalanceLift[] = present.map((lift, i) => ({
    exercise: lift.exercise,
    oneRM: lift.oneRM,
    expected: base * lift.ratio,
    deviation: (indexes[i] / base - 1) * 100,
  }))

  const weakest = lifts.reduce((worst, lift) => (lift.deviation < worst.deviation ? lift : worst))
  // Расхождение меньше 5 процентов - это шум, слабого звена нет
  return { lifts, weakest: weakest.deviation < -5 ? weakest : null, missing }
}

