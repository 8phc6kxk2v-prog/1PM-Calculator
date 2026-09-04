/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { describe, expect, it } from 'vitest'
import { dotsCoefficient, dotsLevel, dotsScore } from './dots'
import { personalRecords, powerliftingTotal, progressDelta } from './records'
import type { HistoryEntry } from './storage'
import { platesFor, roundToStep, trainingLoads, warmupSets } from './training'

describe('рабочие веса по таблице NSCA', () => {
  it('100 кг 1ПМ: подход на 5 повторений это 87 процентов', () => {
    const five = trainingLoads(100).find((load) => load.reps === 5)
    expect(five).toEqual({ reps: 5, percent: 87, weight: 87.5 })
  })

  it('вес округляется до шага 2.5 кг', () => {
    expect(trainingLoads(137).every((load) => (load.weight * 10) % 25 === 0)).toBe(true)
  })

  it('одно повторение это сам максимум', () => {
    expect(trainingLoads(200).find((load) => load.reps === 1)?.weight).toBe(200)
  })
})

describe('roundToStep', () => {
  it.each([
    [101.2, 2.5, 100],
    [101.3, 2.5, 102.5],
    [56, 5, 55],
  ])('%s кг с шагом %s -> %s', (weight, step, expected) => {
    expect(roundToStep(weight, step)).toBe(expected)
  })
})

describe('разминочная лесенка', () => {
  it('идёт по возрастанию и не опускается ниже грифа', () => {
    const sets = warmupSets(100)
    expect(sets.length).toBeGreaterThan(0)
    expect(sets[0].weight).toBeGreaterThanOrEqual(20)
    for (let i = 1; i < sets.length; i += 1) {
      expect(sets[i].weight).toBeGreaterThan(sets[i - 1].weight)
    }
  })

  it('для лёгкого рабочего веса не выдаёт подходы легче грифа', () => {
    expect(warmupSets(30).every((set) => set.weight >= 20)).toBe(true)
  })
})

describe('блины на штангу', () => {
  it('100 кг на грифе 20 кг это 25+15 на сторону, минимумом блинов', () => {
    const load = platesFor(100)
    expect(load.perSide).toEqual([25, 15])
    expect(load.achievable).toBe(100)
    expect(load.remainder).toBe(0)
  })

  it('вес меньше грифа не раскладывается', () => {
    expect(platesFor(15).perSide).toEqual([])
  })

  it('несобираемый остаток честно возвращается', () => {
    const load = platesFor(101)
    expect(load.achievable).toBeLessThan(101)
    expect(load.remainder).toBeGreaterThan(0)
  })

  it('сумма блинов и грифа сходится с достижимым весом', () => {
    const load = platesFor(142.5)
    const perSide = load.perSide.reduce((sum, plate) => sum + plate, 0)
    expect(20 + perSide * 2).toBeCloseTo(load.achievable, 5)
  })
})

describe('DOTS', () => {
  it('коэффициент для мужчины 80 кг около 0.68', () => {
    expect(dotsCoefficient(80, 'male')).toBeCloseTo(0.68, 1)
  })

  it('при равной сумме меньший вес тела даёт больше очков', () => {
    const light = dotsScore(500, 70, 'male')!
    const heavy = dotsScore(500, 110, 'male')!
    expect(light).toBeGreaterThan(heavy)
  })

  it('вне диапазона валидности возвращает null', () => {
    expect(dotsScore(400, 30, 'male')).toBeNull()
    expect(dotsScore(400, 160, 'female')).toBeNull()
  })

  it('уровни идут по возрастанию очков', () => {
    expect(dotsLevel(150)).toBe('новичок')
    expect(dotsLevel(520)).toBe('соревновательный уровень')
  })
})

const entry = (over: Partial<HistoryEntry>): HistoryEntry => ({
  id: crypto.randomUUID(),
  date: '2026-09-01T10:00:00.000Z',
  exercise: 'Присед со штангой',
  weight: 100,
  reps: 5,
  epley1RM: 116.67,
  brzycki1RM: 112.5,
  ...over,
})

describe('рекорды и прогресс', () => {
  it('на упражнение остаётся лучший результат', () => {
    const records = personalRecords([
      entry({}),
      entry({ weight: 120, epley1RM: 140, brzycki1RM: 135 }),
    ])
    expect(records).toHaveLength(1)
    expect(records[0].oneRM).toBe(135)
  })

  it('прогресс считается только при данных по обе стороны окна', () => {
    const now = new Date('2026-09-02T00:00:00.000Z').getTime()
    const history = [
      entry({ date: '2026-06-01T00:00:00.000Z', brzycki1RM: 100 }),
      entry({ date: '2026-08-30T00:00:00.000Z', brzycki1RM: 110 }),
    ]
    expect(progressDelta(history, 'Присед со штангой', 30, now)).toBe(10)
    expect(progressDelta([history[0]], 'Присед со штангой', 30, now)).toBeNull()
  })

  it('сумма троеборья показывает недостающие движения', () => {
    const partial = powerliftingTotal([entry({})])
    expect(partial.missing).toEqual(['Жим лёжа', 'Становая тяга'])

    const full = powerliftingTotal([
      entry({}),
      entry({ exercise: 'Жим лёжа', brzycki1RM: 90 }),
      entry({ exercise: 'Становая тяга', brzycki1RM: 180 }),
    ])
    expect(full.missing).toEqual([])
    expect(full.total).toBeCloseTo(112.5 + 90 + 180, 5)
  })
})
