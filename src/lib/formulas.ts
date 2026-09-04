/**
 * Формулы одноповторного максимума (1ПМ). Зашиты как константы, не настраиваются.
 *
 *   Epley:   1RM = W * (1 + R / 30)
 *   Brzycki: 1RM = W * 36 / (37 - R)
 *
 * W - рабочий вес (кг), R - число повторений.
 * Обе валидны в диапазоне 1-10 повторений.
 */

export const REPS_ACCURATE_MAX = 10
export const REPS_HARD_LIMIT = 37

export function calculateEpley(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

export function calculateBrzycki(weight: number, reps: number): number {
  const denominator = REPS_HARD_LIMIT - reps
  if (denominator <= 0) {
    // При R >= 37 знаменатель уходит в ноль/минус: вернуть Infinity или
    // отрицательный вес нельзя, поэтому блокируем в самой формуле, а не только в UI.
    throw new RangeError('Формула Брзицки не определена при 37 и более повторениях')
  }
  return (weight * 36) / denominator
}

export type RepsCheck =
  | { level: 'ok' }
  | { level: 'warning'; message: string }
  | { level: 'error'; message: string }

export function checkReps(reps: number): RepsCheck {
  if (!Number.isFinite(reps) || reps < 1) {
    return { level: 'error', message: 'Введите количество повторений: минимум 1.' }
  }
  if (reps >= REPS_HARD_LIMIT) {
    return {
      level: 'error',
      message: 'При 37 и более повторениях формула Брзицки делится на ноль. Расчёт заблокирован.',
    }
  }
  if (reps >= REPS_ACCURATE_MAX) {
    return {
      level: 'warning',
      message: 'точность снижается - формулы рассчитаны на диапазон 1-10 повторений',
    }
  }
  return { level: 'ok' }
}

export function checkWeight(weight: number): RepsCheck {
  if (!Number.isFinite(weight) || weight <= 0) {
    return { level: 'error', message: 'Введите рабочий вес больше нуля.' }
  }
  return { level: 'ok' }
}

export type AccuracyHint = { winner: 'epley' | 'brzycki' | 'equal'; note: string }

/**
 * На 10 повторениях формулы совпадают точно: W*(1+10/30) === W*36/27.
 * Ниже 10 Брзицки ближе к реальному максимуму, выше 10 он начинает завышать,
 * и Эпли становится консервативнее и точнее.
 */
export function accuracyHint(reps: number): AccuracyHint {
  if (reps < REPS_ACCURATE_MAX) {
    return { winner: 'brzycki', note: 'до 10 повторений Брзицки обычно ближе к реальному максимуму' }
  }
  if (reps === REPS_ACCURATE_MAX) {
    return { winner: 'equal', note: 'на 10 повторениях обе формулы дают одно и то же число' }
  }
  return { winner: 'epley', note: 'выше 10 повторений Брзицки завышает, Эпли ближе к реальности' }
}
