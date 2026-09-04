/**
 * Прикладные расчёты вокруг 1ПМ: рабочие веса, разминка, блины на штангу.
 *
 * Таблица процентов - NSCA Training Load Chart (Baechle & Earle, Essentials of
 * Strength Training and Conditioning): сколько процентов от 1ПМ соответствует
 * подходу на заданное число повторений.
 * https://www.nsca.com/contentassets/61d813865e264c6e852cadfe247eae52/nsca_training_load_chart.pdf
 */

export const NSCA_PERCENT_BY_REPS: ReadonlyArray<{ reps: number; percent: number }> = [
  { reps: 1, percent: 100 },
  { reps: 2, percent: 95 },
  { reps: 3, percent: 93 },
  { reps: 4, percent: 90 },
  { reps: 5, percent: 87 },
  { reps: 6, percent: 85 },
  { reps: 7, percent: 83 },
  { reps: 8, percent: 80 },
  { reps: 9, percent: 77 },
  { reps: 10, percent: 75 },
  { reps: 12, percent: 67 },
]

export interface TrainingLoad {
  reps: number
  percent: number
  weight: number
}

/** Округление до ближайшего шага, который реально собрать на штанге */
export function roundToStep(weight: number, step = 2.5): number {
  return Math.round(weight / step) * step
}

export function trainingLoads(oneRM: number, step = 2.5): TrainingLoad[] {
  return NSCA_PERCENT_BY_REPS.map(({ reps, percent }) => ({
    reps,
    percent,
    weight: roundToStep((oneRM * percent) / 100, step),
  }))
}

/**
 * Разминочная лесенка к рабочему весу: 40/60/75/90 процентов.
 * Пустой гриф отдельным подходом не считаем - это разминка снарядом, не подход.
 */
const WARMUP_STEPS: ReadonlyArray<{ percent: number; reps: number }> = [
  { percent: 40, reps: 8 },
  { percent: 60, reps: 5 },
  { percent: 75, reps: 3 },
  { percent: 90, reps: 1 },
]

export function warmupSets(workingWeight: number, barWeight = 20, step = 2.5): TrainingLoad[] {
  return WARMUP_STEPS.map(({ percent, reps }) => ({
    reps,
    percent,
    weight: Math.max(roundToStep((workingWeight * percent) / 100, step), barWeight),
  })).filter((set, index, list) => index === 0 || set.weight > list[index - 1].weight)
}

/* Блины на штангу */

export const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const
export const DEFAULT_BAR = 20

export interface PlateLoad {
  /** Блины на одну сторону, от тяжёлых к лёгким */
  perSide: number[]
  /** Сколько килограммов собрать не удалось (нет подходящих блинов) */
  remainder: number
  achievable: number
}

/**
 * Жадный подбор: блины идут по убыванию, поэтому жадность здесь оптимальна
 * для стандартного набора, где каждый следующий блин делит предыдущий.
 */
export function platesFor(
  targetWeight: number,
  barWeight = DEFAULT_BAR,
  plates: readonly number[] = DEFAULT_PLATES,
): PlateLoad {
  const perSideTarget = (targetWeight - barWeight) / 2
  if (perSideTarget <= 0) {
    return { perSide: [], remainder: Math.max(targetWeight - barWeight, 0), achievable: barWeight }
  }

  const perSide: number[] = []
  let left = perSideTarget

  for (const plate of [...plates].sort((a, b) => b - a)) {
    while (left >= plate - 1e-9) {
      perSide.push(plate)
      left -= plate
    }
  }

  const loaded = perSide.reduce((sum, plate) => sum + plate, 0)
  return {
    perSide,
    remainder: Number((left * 2).toFixed(2)),
    achievable: barWeight + loaded * 2,
  }
}
