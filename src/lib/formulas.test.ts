/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { describe, expect, it } from 'vitest'
import { accuracyHint, calculateBrzycki, calculateEpley, checkReps, checkWeight } from './formulas'

describe('calculateEpley', () => {
  it('100 кг x 5 повторений ≈ 116.7', () => {
    expect(calculateEpley(100, 5)).toBeCloseTo(116.7, 1)
  })

  it('на 1 повторении возвращает почти рабочий вес', () => {
    expect(calculateEpley(100, 1)).toBeCloseTo(103.3, 1)
  })
})

describe('calculateBrzycki', () => {
  it('100 кг x 5 повторений ≈ 112.5', () => {
    expect(calculateBrzycki(100, 5)).toBeCloseTo(112.5, 1)
  })

  it('на 1 повторении возвращает рабочий вес', () => {
    expect(calculateBrzycki(100, 1)).toBeCloseTo(100, 5)
  })

  it('бросает RangeError при 37 повторениях (деление на ноль)', () => {
    expect(() => calculateBrzycki(100, 37)).toThrow(RangeError)
  })

  it('бросает RangeError выше 37 повторений (отрицательный результат)', () => {
    expect(() => calculateBrzycki(100, 50)).toThrow(RangeError)
  })
})

describe('обе формулы совпадают на 10 повторениях', () => {
  it('100 кг x 10 повторений', () => {
    expect(calculateEpley(100, 10)).toBeCloseTo(calculateBrzycki(100, 10), 6)
  })
})

describe('checkReps', () => {
  it.each([1, 5, 9])('%i повторений: ok', (reps) => {
    expect(checkReps(reps).level).toBe('ok')
  })

  it.each([10, 20, 36])('%i повторений: предупреждение', (reps) => {
    expect(checkReps(reps).level).toBe('warning')
  })

  it.each([37, 50])('%i повторений: ошибка', (reps) => {
    expect(checkReps(reps).level).toBe('error')
  })

  it.each([0, -3, Number.NaN])('%s повторений: ошибка', (reps) => {
    expect(checkReps(reps).level).toBe('error')
  })

  it('текст предупреждения соответствует спецификации', () => {
    const check = checkReps(12)
    expect(check.level).toBe('warning')
    expect(check.level === 'warning' && check.message).toContain('1-10 повторений')
  })
})

describe('checkWeight', () => {
  it.each([0, -10, Number.NaN])('%s кг: ошибка', (weight) => {
    expect(checkWeight(weight).level).toBe('error')
  })

  it('100 кг: ok', () => {
    expect(checkWeight(100).level).toBe('ok')
  })
})

describe('accuracyHint', () => {
  it('ниже 10 повторений выигрывает Брзицки', () => {
    expect(accuracyHint(5).winner).toBe('brzycki')
  })

  it('ровно 10 повторений: равны', () => {
    expect(accuracyHint(10).winner).toBe('equal')
  })

  it('выше 10 повторений выигрывает Эпли', () => {
    expect(accuracyHint(15).winner).toBe('epley')
  })
})
