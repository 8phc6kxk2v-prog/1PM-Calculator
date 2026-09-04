/**
 * Дыхательные практики. Каждая - последовательность фаз с длительностью
 * в секундах, повторяемая циклами.
 *
 * Квадратное дыхание 4-4-4-4 - протокол, известный по подготовке военных
 * (box breathing), используется для быстрого успокоения перед нагрузкой.
 * 4-7-8 - схема Эндрю Вейла, применяется для засыпания.
 * Когерентное дыхание около 5.5 вдоха в минуту - режим, на котором в
 * исследованиях вариабельности сердечного ритма наблюдается резонанс.
 */

export type Phase = 'inhale' | 'hold' | 'exhale' | 'holdOut'

export const PHASE_LABELS: Record<Phase, string> = {
  inhale: 'Вдох',
  hold: 'Задержка',
  exhale: 'Выдох',
  holdOut: 'Пауза',
}

export interface Step {
  phase: Phase
  seconds: number
}

export interface Pattern {
  id: string
  name: string
  hint: string
  steps: Step[]
}

export const PATTERNS: Pattern[] = [
  {
    id: 'box',
    name: 'Квадрат 4-4-4-4',
    hint: 'Собраться перед подходом или после стресса',
    steps: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 4 },
      { phase: 'exhale', seconds: 4 },
      { phase: 'holdOut', seconds: 4 },
    ],
  },
  {
    id: 'relax',
    name: '4-7-8 на сон',
    hint: 'Замедлить пульс, легче уснуть после вечерней тренировки',
    steps: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 7 },
      { phase: 'exhale', seconds: 8 },
    ],
  },
  {
    id: 'coherent',
    name: 'Когерентное 5.5',
    hint: 'Ровный ритм примерно 5.5 дыхания в минуту, для восстановления',
    steps: [
      { phase: 'inhale', seconds: 5.5 },
      { phase: 'exhale', seconds: 5.5 },
    ],
  },
]

export function cycleDuration(pattern: Pattern): number {
  return pattern.steps.reduce((sum, step) => sum + step.seconds, 0)
}

export interface PhaseState {
  phase: Phase
  /** Секунд осталось в текущей фазе, округляется вверх для показа */
  remaining: number
  /** Прогресс внутри фазы, 0..1 - им управляется размер круга */
  progress: number
  cycle: number
}

/** Где мы находимся спустя `elapsed` секунд от старта */
export function phaseAt(pattern: Pattern, elapsed: number): PhaseState {
  const total = cycleDuration(pattern)
  const cycle = Math.floor(elapsed / total)
  let offset = elapsed - cycle * total

  for (const step of pattern.steps) {
    if (offset < step.seconds) {
      return {
        phase: step.phase,
        remaining: Math.max(0, step.seconds - offset),
        progress: offset / step.seconds,
        cycle,
      }
    }
    offset -= step.seconds
  }

  const last = pattern.steps[pattern.steps.length - 1]
  return { phase: last.phase, remaining: 0, progress: 1, cycle }
}

/** Насколько раздут круг в этой фазе: 0 - выдох до конца, 1 - полный вдох */
export function expansion(state: PhaseState): number {
  switch (state.phase) {
    case 'inhale':
      return state.progress
    case 'exhale':
      return 1 - state.progress
    case 'hold':
      return 1
    case 'holdOut':
      return 0
  }
}
