/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { describe, expect, it } from 'vitest'
import { liftBalance, streakStats } from './insights'
import type { HistoryEntry } from './storage'

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

const NOW = new Date('2026-09-03T12:00:00.000Z')

describe('серия тренировок', () => {
  it('сетка ровно 12 недель по 7 дней', () => {
    expect(streakStats([], NOW).days).toHaveLength(84)
  })

  it('считает записи по дням', () => {
    const stats = streakStats(
      [entry({ date: '2026-09-02T10:00:00.000Z' }), entry({ date: '2026-09-02T18:00:00.000Z' })],
      NOW,
    )
    const day = stats.days.find((item) => item.key === '2026-09-02')
    expect(day?.count).toBe(2)
  })

  it('серия недель идёт подряд и рвётся на пропуске', () => {
    const weekly = [
      entry({ date: '2026-09-01T10:00:00.000Z' }), // текущая неделя
      entry({ date: '2026-08-25T10:00:00.000Z' }), // прошлая
      entry({ date: '2026-08-18T10:00:00.000Z' }), // позапрошлая
      entry({ date: '2026-07-20T10:00:00.000Z' }), // после пропуска
    ]
    expect(streakStats(weekly, NOW).weeks).toBe(3)
  })

  it('пустая текущая неделя не рвёт серию', () => {
    const stats = streakStats([entry({ date: '2026-08-25T10:00:00.000Z' })], NOW)
    expect(stats.weeks).toBe(1)
  })

  it('без истории серия ноль', () => {
    expect(streakStats([], NOW).weeks).toBe(0)
  })

  it('сессии за 30 дней считаются по уникальным дням', () => {
    const stats = streakStats(
      [
        entry({ date: '2026-09-02T10:00:00.000Z' }),
        entry({ date: '2026-09-02T12:00:00.000Z' }),
        entry({ date: '2026-06-01T10:00:00.000Z' }),
      ],
      NOW,
    )
    expect(stats.sessionsLast30).toBe(1)
  })
})

describe('баланс троеборья', () => {
  const bench = (oneRM: number) => entry({ exercise: 'Жим лёжа', reps: 1, brzycki1RM: oneRM, epley1RM: oneRM })
  const squat = (oneRM: number) => entry({ exercise: 'Присед со штангой', reps: 1, brzycki1RM: oneRM, epley1RM: oneRM })
  const deadlift = (oneRM: number) => entry({ exercise: 'Становая тяга', reps: 1, brzycki1RM: oneRM, epley1RM: oneRM })

  it('идеальные пропорции 100/130/160 не дают слабого звена', () => {
    const balance = liftBalance([bench(100), squat(130), deadlift(160)])
    expect(balance.weakest).toBeNull()
    expect(balance.lifts.every((lift) => Math.abs(lift.deviation) < 1)).toBe(true)
  })

  it('отставший жим определяется как слабое звено', () => {
    const balance = liftBalance([bench(70), squat(130), deadlift(160)])
    expect(balance.weakest?.exercise).toBe('Жим лёжа')
    expect(balance.weakest!.deviation).toBeLessThan(-15)
  })

  it('отставшая тяга тоже находится', () => {
    const balance = liftBalance([bench(100), squat(130), deadlift(110)])
    expect(balance.weakest?.exercise).toBe('Становая тяга')
  })

  it('одного движения мало для сравнения', () => {
    const balance = liftBalance([bench(100)])
    expect(balance.lifts).toEqual([])
    expect(balance.missing).toEqual(['Присед со штангой', 'Становая тяга'])
  })

  it('двух движений уже достаточно', () => {
    const balance = liftBalance([bench(100), squat(100)])
    expect(balance.lifts).toHaveLength(2)
    expect(balance.weakest?.exercise).toBe('Присед со штангой')
  })
})

