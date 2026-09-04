import { describe, expect, it } from 'vitest'
import { EXERCISES, MUSCLE_GROUPS, normalize, resolveExercise } from '../data/muscleMap'
import { computeMuscleLoads, muscleInsight, type LoadSet } from './muscleLoad'

const NOW = new Date('2026-09-03T12:00:00.000Z')
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86400000).toISOString()

const set = (over: Partial<LoadSet> = {}): LoadSet => ({
  exercise: 'Жим лёжа',
  weight: 100,
  reps: 5,
  date: daysAgo(0),
  ...over,
})

describe('справочник упражнений', () => {
  it('не меньше 60 упражнений', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60)
  })

  it('доли нагрузки в каждом упражнении дают ровно единицу', () => {
    for (const exercise of EXERCISES) {
      const sum = Object.values(exercise.involvement).reduce((total, share) => total + (share ?? 0), 0)
      expect(sum, exercise.id).toBeCloseTo(1, 3)
    }
  })

  it('все группы из справочника известны', () => {
    for (const exercise of EXERCISES) {
      for (const group of Object.keys(exercise.involvement)) {
        expect(MUSCLE_GROUPS, exercise.id).toContain(group)
      }
    }
  })

  it('идентификаторы уникальны', () => {
    const ids = EXERCISES.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('матчинг названий', () => {
  it('нормализация убирает регистр, ё и лишние пробелы', () => {
    expect(normalize('  Жим  Лёжа ')).toBe('жим лежа')
  })

  it('точное совпадение по названию', () => {
    expect(resolveExercise('Жим лёжа')?.id).toBe('bench-press')
  })

  it('совпадение по алиасу и старым записям', () => {
    expect(resolveExercise('присед')?.id).toBe('back-squat')
    expect(resolveExercise('становая')?.id).toBe('deadlift')
    expect(resolveExercise('bench press')?.id).toBe('bench-press')
  })

  it('опечатка ловится Левенштейном', () => {
    expect(resolveExercise('жим лежа')?.id).toBe('bench-press')
    expect(resolveExercise('становя тяга')?.id).toBe('deadlift')
  })

  it('незнакомое название возвращает null, а не случайное упражнение', () => {
    expect(resolveExercise('прыжки на скакалке')).toBeNull()
    expect(resolveExercise('')).toBeNull()
  })

  it('ручная привязка имеет приоритет', () => {
    expect(resolveExercise('моя тяга', { 'моя тяга': 'deadlift' })?.id).toBe('deadlift')
  })
})

describe('computeMuscleLoads', () => {
  it('пустая история не ломается и даёт нули', () => {
    const loads = computeMuscleLoads([], NOW)
    expect(loads.unmatched).toEqual([])
    expect(loads.groups.chest.volume).toBe(0)
    expect(loads.groups.chest.intensity).toBe(0)
    expect(loads.groups.chest.lastTrainedDays).toBeNull()
  })

  it('одна тренировка раскладывается по долям упражнения', () => {
    const loads = computeMuscleLoads([set()], NOW)
    // 100 кг × 5 = 500, свежесть 1, грудь берёт 0.5
    expect(loads.groups.chest.volume).toBeCloseTo(250, 5)
    expect(loads.groups.triceps.volume).toBeCloseTo(125, 5)
    expect(loads.groups.frontDelts.volume).toBeCloseTo(125, 5)
    expect(loads.groups.quads.volume).toBe(0)
    expect(loads.groups.chest.sets).toBe(1)
  })

  it('затухание: подход четырёхдневной давности весит e раз меньше', () => {
    const fresh = computeMuscleLoads([set()], NOW).groups.chest.volume
    const old = computeMuscleLoads([set({ date: daysAgo(4) })], NOW).groups.chest.volume
    expect(fresh / old).toBeCloseTo(Math.E, 5)
  })

  it('за пределы окна подход не попадает', () => {
    const loads = computeMuscleLoads([set({ date: daysAgo(9) })], NOW, 7)
    expect(loads.groups.chest.volume).toBe(0)
    // но дата последней тренировки всё равно известна
    expect(loads.groups.chest.lastTrainedDays).toBeCloseTo(9, 3)
  })

  it('упражнения с весом тела берут вес из профиля', () => {
    const loads = computeMuscleLoads(
      [set({ exercise: 'Подтягивания', weight: 0, reps: 10 })],
      NOW,
      7,
      { bodyweightKg: 80 },
    )
    // 80 кг × 1.0 × 10 повторений, широчайшим достаётся 0.5
    expect(loads.groups.lats.volume).toBeCloseTo(400, 5)
  })

  it('дополнительный вес складывается с собственным', () => {
    const loads = computeMuscleLoads(
      [set({ exercise: 'Отжимания', weight: 20, reps: 10 })],
      NOW,
      7,
      { bodyweightKg: 80 },
    )
    // 80 × 0.65 + 20 = 72, × 10 повторений, грудь берёт 0.45
    expect(loads.groups.chest.volume).toBeCloseTo(324, 5)
  })

  it('короткий лог нормируется по максимуму окна и помечается', () => {
    const loads = computeMuscleLoads([set(), set({ exercise: 'Подъём штанги на бицепс', weight: 30, reps: 10 })], NOW)
    expect(loads.sparse).toBe(true)
    const peak = Math.max(...MUSCLE_GROUPS.map((group) => loads.groups[group].intensity))
    expect(peak).toBeCloseTo(1, 5)
  })

  it('на длинной истории интенсивность считается внутри группы, а не между группами', () => {
    const history: LoadSet[] = []
    for (let week = 0; week < 8; week += 1) {
      // тяжёлый присед и лёгкий бицепс каждую неделю
      history.push(set({ exercise: 'Присед со штангой', weight: 150, reps: 5, date: daysAgo(week * 7 + 1) }))
      history.push(set({ exercise: 'Подъём штанги на бицепс', weight: 30, reps: 10, date: daysAgo(week * 7 + 1) }))
    }

    const loads = computeMuscleLoads(history, NOW)
    expect(loads.sparse).toBe(false)
    // тоннаж у групп разный, но каждая держит привычный для себя уровень
    expect(loads.groups.quads.volume).toBeGreaterThan(loads.groups.biceps.volume)
    expect(loads.groups.biceps.intensity).toBeGreaterThan(0.5)
    expect(loads.groups.quads.intensity).toBeGreaterThan(0.5)
  })

  it('неопознанные упражнения возвращаются списком, а не пропадают', () => {
    const loads = computeMuscleLoads(
      [set({ exercise: 'Прыжки на скакалке' }), set({ exercise: 'Прыжки на скакалке' }), set()],
      NOW,
    )
    expect(loads.unmatched).toEqual([{ name: 'Прыжки на скакалке', sets: 2 }])
    expect(loads.groups.chest.volume).toBeGreaterThan(0)
  })

  it('ручная привязка втягивает запись в расчёт', () => {
    const raw = [set({ exercise: 'Мой комплекс', weight: 60, reps: 10 })]
    expect(computeMuscleLoads(raw, NOW).unmatched).toHaveLength(1)

    const bound = computeMuscleLoads(raw, NOW, 7, { bindings: { 'мой комплекс': 'kettlebell-swing' } })
    expect(bound.unmatched).toEqual([])
    expect(bound.groups.glutes.volume).toBeGreaterThan(0)
  })

  it('вклад упражнений в группу перечисляется по убыванию', () => {
    const loads = computeMuscleLoads(
      [set(), set({ exercise: 'Разведения гантелей лёжа', weight: 20, reps: 12 })],
      NOW,
    )
    expect(loads.groups.chest.exercises[0].name).toBe('Жим лёжа')
    expect(loads.groups.chest.exercises).toHaveLength(2)
  })
})

describe('строка инсайта', () => {
  it('без записей сообщает, что их нет', () => {
    const loads = computeMuscleLoads([], NOW)
    expect(muscleInsight(loads, [], NOW)).toBe('За последние 7 дней записей нет')
  })

  it('замечает перекос жима над тягой', () => {
    const sets = [
      set({ exercise: 'Жим лёжа', weight: 100, reps: 10, date: daysAgo(2) }),
      set({ exercise: 'Тяга штанги в наклоне', weight: 40, reps: 5, date: daysAgo(3) }),
    ]
    const text = muscleInsight(computeMuscleLoads(sets, NOW), sets, NOW)
    expect(text).toMatch(/жимового объёма в .* раза больше тягового/)
  })

  it('замечает обратный перекос', () => {
    const sets = [
      set({ exercise: 'Жим лёжа', weight: 40, reps: 5, date: daysAgo(2) }),
      set({ exercise: 'Тяга штанги в наклоне', weight: 100, reps: 10, date: daysAgo(3) }),
    ]
    expect(muscleInsight(computeMuscleLoads(sets, NOW), sets, NOW)).toMatch(/тягового объёма/)
  })

  it('при ровном балансе показывает давно не тронутую группу', () => {
    const sets = [
      set({ exercise: 'Жим лёжа', weight: 80, reps: 5, date: daysAgo(1) }),
      set({ exercise: 'Тяга штанги в наклоне', weight: 80, reps: 5, date: daysAgo(1) }),
      set({ exercise: 'Присед со штангой', weight: 100, reps: 5, date: daysAgo(20) }),
    ]
    expect(muscleInsight(computeMuscleLoads(sets, NOW), sets, NOW)).toMatch(/не в работе 20 дней/)
  })

  it('формулировки без эмодзи и восклицаний', () => {
    const sets = [set({ date: daysAgo(1) })]
    const text = muscleInsight(computeMuscleLoads(sets, NOW), sets, NOW)
    expect(text).not.toMatch(/[!\p{Extended_Pictographic}]/u)
  })
})
