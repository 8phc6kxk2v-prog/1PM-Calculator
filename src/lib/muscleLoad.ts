import {
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  resolveExercise,
  type Exercise,
  type MuscleGroup,
} from '../data/muscleMap'

const DAY_MS = 24 * 60 * 60 * 1000
const DECAY_DAYS = 4
const REFERENCE_DAYS = 56
const SPARSE_DAYS = 14

/**
 * Калибровка верха шкалы. 90-й процентиль берётся по дневным окнам, а максимум
 * окна выпадает на день тренировки с нулевым затуханием, поэтому без поправки
 * карта живёт в диапазоне 0.2-0.7 и до полной заливки не доходит никогда.
 * Делим процентиль на 0.85: день тренировки упирается в потолок, дальше спад.
 */
const REFERENCE_GAIN = 0.85

export interface LoadSet {
  exercise: string
  weight: number
  reps: number
  date: string
}

export interface GroupLoad {
  group: MuscleGroup
  /** Тоннаж с учётом затухания по свежести */
  volume: number
  /** 0..1 относительно собственной истории группы, не относительно других */
  intensity: number
  sets: number
  exercises: { name: string; volume: number; sets: number }[]
  /** Сколько дней назад группу трогали в последний раз, null если не трогали */
  lastTrainedDays: number | null
}

export interface MuscleLoads {
  groups: Record<MuscleGroup, GroupLoad>
  /** Записи, для которых упражнение не опознано: молча не теряем */
  unmatched: { name: string; sets: number }[]
  /** Истории меньше двух недель, нормировка по максимуму окна */
  sparse: boolean
  windowDays: number
}

export interface LoadOptions {
  bodyweightKg?: number
}

/** Вес, который реально двигали: свой вес по коэффициенту плюс дополнительный */
function effectiveWeight(set: LoadSet, exercise: Exercise, bodyweightKg: number): number {
  if (!exercise.bodyweight) return set.weight
  return bodyweightKg * exercise.bodyweight + set.weight
}

function daysBetween(from: number, to: number): number {
  return (to - from) / DAY_MS
}

/** Свежая работа весит больше старой: exp(-дней / 4) */
function freshness(daysAgo: number): number {
  return Math.exp(-daysAgo / DECAY_DAYS)
}

function emptyGroups(): Record<MuscleGroup, GroupLoad> {
  const groups = {} as Record<MuscleGroup, GroupLoad>
  for (const group of MUSCLE_GROUPS) {
    groups[group] = { group, volume: 0, intensity: 0, sets: 0, exercises: [], lastTrainedDays: null }
  }
  return groups
}

/** Затухший тоннаж по группам за окно, заканчивающееся в момент `at` */
function windowVolumes(
  resolved: { set: LoadSet; exercise: Exercise; weight: number; time: number }[],
  at: number,
  windowDays: number,
): Record<MuscleGroup, number> {
  const volumes = {} as Record<MuscleGroup, number>
  for (const group of MUSCLE_GROUPS) volumes[group] = 0

  for (const item of resolved) {
    const daysAgo = daysBetween(item.time, at)
    if (daysAgo < 0 || daysAgo > windowDays) continue
    const work = item.weight * item.set.reps * freshness(daysAgo)
    for (const [group, share] of Object.entries(item.exercise.involvement)) {
      volumes[group as MuscleGroup] += work * (share ?? 0)
    }
  }

  return volumes
}

function percentile(values: number[], p: number): number {
  const positive = values.filter((value) => value > 0).sort((a, b) => a - b)
  if (positive.length === 0) return 0
  const index = Math.min(positive.length - 1, Math.floor(p * positive.length))
  return positive[index]
}

/**
 * Нагрузка по мышечным группам за окно.
 *
 * Интенсивность считается относительно 90-го процентиля этой же группы
 * за 8 недель: если нормировать группы друг относительно друга, квадрицепс
 * с его тоннажем всегда упирается в потолок, а бицепс всегда у нуля,
 * и карта перестаёт что-либо сообщать.
 */
export function computeMuscleLoads(
  sets: LoadSet[],
  now: Date | number = new Date(),
  windowDays = 7,
  options: LoadOptions = {},
): MuscleLoads {
  const at = typeof now === 'number' ? now : now.getTime()
  const bodyweightKg = options.bodyweightKg ?? 0
  const groups = emptyGroups()
  const unmatchedCounts = new Map<string, number>()

  const resolved: { set: LoadSet; exercise: Exercise; weight: number; time: number }[] = []
  for (const set of sets) {
    const exercise = resolveExercise(set.exercise)
    if (!exercise) {
      unmatchedCounts.set(set.exercise, (unmatchedCounts.get(set.exercise) ?? 0) + 1)
      continue
    }
    resolved.push({
      set,
      exercise,
      weight: effectiveWeight(set, exercise, bodyweightKg),
      time: new Date(set.date).getTime(),
    })
  }

  // Детали окна: тоннаж, подходы, вклад упражнений, свежесть
  const perExercise = new Map<MuscleGroup, Map<string, { volume: number; sets: number }>>()

  for (const item of resolved) {
    const daysAgo = daysBetween(item.time, at)
    if (daysAgo < 0 || daysAgo > windowDays) continue
    const work = item.weight * item.set.reps * freshness(daysAgo)

    for (const [key, share] of Object.entries(item.exercise.involvement)) {
      const group = key as MuscleGroup
      const load = groups[group]
      load.volume += work * (share ?? 0)
      load.sets += 1
      load.lastTrainedDays =
        load.lastTrainedDays === null ? daysAgo : Math.min(load.lastTrainedDays, daysAgo)

      const byExercise = perExercise.get(group) ?? new Map()
      const current = byExercise.get(item.exercise.name) ?? { volume: 0, sets: 0 }
      current.volume += work * (share ?? 0)
      current.sets += 1
      byExercise.set(item.exercise.name, current)
      perExercise.set(group, byExercise)
    }
  }

  for (const group of MUSCLE_GROUPS) {
    groups[group].exercises = [...(perExercise.get(group) ?? new Map())]
      .map(([name, value]) => ({ name, volume: value.volume, sets: value.sets }))
      .sort((a, b) => b.volume - a.volume)
  }

  // Последняя тренировка группы могла быть и раньше окна
  for (const item of resolved) {
    const daysAgo = daysBetween(item.time, at)
    if (daysAgo < 0) continue
    for (const key of Object.keys(item.exercise.involvement)) {
      const load = groups[key as MuscleGroup]
      load.lastTrainedDays = load.lastTrainedDays === null ? daysAgo : Math.min(load.lastTrainedDays, daysAgo)
    }
  }

  const times = resolved.map((item) => item.time)
  const span = times.length > 0 ? daysBetween(Math.min(...times), at) : 0
  const sparse = span < SPARSE_DAYS

  if (sparse) {
    // Данных мало для процентиля: нормируем по максимуму самого окна
    const peak = Math.max(...MUSCLE_GROUPS.map((group) => groups[group].volume), 0)
    for (const group of MUSCLE_GROUPS) {
      groups[group].intensity = peak > 0 ? groups[group].volume / peak : 0
    }
  } else {
    // ponytail: пересчёт окна на каждый из 56 дней, O(дни × подходы).
    // На локальной истории это микросекунды; станет узким местом - кэшировать по дням.
    const history = {} as Record<MuscleGroup, number[]>
    for (const group of MUSCLE_GROUPS) history[group] = []

    for (let day = 0; day < REFERENCE_DAYS; day += 1) {
      const volumes = windowVolumes(resolved, at - day * DAY_MS, windowDays)
      for (const group of MUSCLE_GROUPS) history[group].push(volumes[group])
    }

    for (const group of MUSCLE_GROUPS) {
      const reference = percentile(history[group], 0.9) * REFERENCE_GAIN
      groups[group].intensity = reference > 0 ? Math.min(1, groups[group].volume / reference) : 0
    }
  }

  return {
    groups,
    unmatched: [...unmatchedCounts].map(([name, sets]) => ({ name, sets })),
    sparse,
    windowDays,
  }
}

const PUSH_PATTERNS = new Set(['horizontalPush', 'verticalPush'])
const PULL_PATTERNS = new Set(['horizontalPull', 'verticalPull'])

/**
 * Одна строка под картой. Приоритет: заметный перекос жима над тягой,
 * потом давно не тронутая группа, потом просто объём.
 * Формулировки нейтральные: это сводка, а не указание, что делать.
 */
export function muscleInsight(
  loads: MuscleLoads,
  sets: LoadSet[],
  now: Date | number = new Date(),
  options: LoadOptions = {},
): string {
  const at = typeof now === 'number' ? now : now.getTime()
  let push = 0
  let pull = 0

  for (const set of sets) {
    const exercise = resolveExercise(set.exercise)
    if (!exercise) continue
    const daysAgo = daysBetween(new Date(set.date).getTime(), at)
    if (daysAgo < 0 || daysAgo > 28) continue
    const weight = effectiveWeight(set, exercise, options.bodyweightKg ?? 0)
    const work = weight * set.reps
    if (PUSH_PATTERNS.has(exercise.pattern)) push += work
    if (PULL_PATTERNS.has(exercise.pattern)) pull += work
  }

  if (push > 0 && pull > 0) {
    const ratio = push / pull
    if (ratio >= 1.5) return `За четыре недели жимового объёма в ${ratio.toFixed(1)} раза больше тягового`
    if (ratio <= 1 / 1.5) return `За четыре недели тягового объёма в ${(1 / ratio).toFixed(1)} раза больше жимового`
  }

  const trained = MUSCLE_GROUPS.map((group) => loads.groups[group]).filter(
    (load) => load.lastTrainedDays !== null,
  )

  if (trained.length > 0) {
    const stale = trained.reduce((worst, load) =>
      (load.lastTrainedDays ?? 0) > (worst.lastTrainedDays ?? 0) ? load : worst,
    )
    if ((stale.lastTrainedDays ?? 0) >= 7) {
      return `${MUSCLE_LABELS[stale.group]} не в работе ${Math.floor(stale.lastTrainedDays ?? 0)} дней`
    }
  }

  const volume = MUSCLE_GROUPS.reduce((sum, group) => sum + loads.groups[group].volume, 0)
  if (volume === 0) return 'За последние 7 дней записей нет'
  return `Объём за ${loads.windowDays} дней: ${Math.round(volume).toLocaleString('ru-RU')} условных килограммов`
}
