/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { describe, expect, it } from 'vitest'
import { cycleDuration, expansion, PATTERNS, phaseAt } from './breathing'

const box = PATTERNS[0]

describe('фазы дыхания', () => {
  it('цикл квадрата длится 16 секунд', () => {
    expect(cycleDuration(box)).toBe(16)
  })

  it.each([
    [0, 'inhale'],
    [3.9, 'inhale'],
    [4, 'hold'],
    [8, 'exhale'],
    [12, 'holdOut'],
    [15.9, 'holdOut'],
  ])('на %s секунде фаза %s', (elapsed, phase) => {
    expect(phaseAt(box, elapsed).phase).toBe(phase)
  })

  it('второй цикл начинается на 16 секунде', () => {
    const state = phaseAt(box, 16)
    expect(state.phase).toBe('inhale')
    expect(state.cycle).toBe(1)
  })

  it('остаток секунд убывает внутри фазы', () => {
    expect(phaseAt(box, 1).remaining).toBeCloseTo(3, 5)
    expect(phaseAt(box, 3).remaining).toBeCloseTo(1, 5)
  })

  it('несимметричная схема 4-7-8 тоже раскладывается', () => {
    const relax = PATTERNS[1]
    expect(cycleDuration(relax)).toBe(19)
    expect(phaseAt(relax, 5).phase).toBe('hold')
    expect(phaseAt(relax, 12).phase).toBe('exhale')
  })
})

describe('раздутие круга', () => {
  it('вдох раздувает, выдох сдувает', () => {
    expect(expansion(phaseAt(box, 0))).toBeCloseTo(0, 5)
    expect(expansion(phaseAt(box, 3.99))).toBeGreaterThan(0.95)
    expect(expansion(phaseAt(box, 8))).toBeCloseTo(1, 5)
    expect(expansion(phaseAt(box, 11.99))).toBeLessThan(0.05)
  })

  it('задержки держат размер постоянным', () => {
    expect(expansion(phaseAt(box, 5))).toBe(1)
    expect(expansion(phaseAt(box, 13))).toBe(0)
  })
})
