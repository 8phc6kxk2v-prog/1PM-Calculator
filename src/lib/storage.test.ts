/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addCustomExercise,
  addHistoryEntry,
  deleteHistoryEntry,
  exportHistoryJSON,
  getAllExercises,
  getHistory,
  getProfile,
  importHistoryJSON,
  PRESET_EXERCISES,
  saveProfile,
} from './storage'

beforeEach(() => {
  localStorage.clear()
})

const entry = {
  date: '2026-09-02T10:00:00.000Z',
  exercise: 'Присед',
  weight: 100,
  reps: 5,
  epley1RM: 116.67,
  brzycki1RM: 112.5,
}

describe('профиль', () => {
  it('пустой до первого сохранения', () => {
    expect(getProfile()).toBeNull()
  })

  it('сохраняется и читается обратно', () => {
    const profile = { name: 'Иван', sex: 'male' as const, age: 30, heightCm: 180, weightKg: 82 }
    saveProfile(profile)
    expect(getProfile()).toEqual(profile)
  })

  it('профилю без имени и пола проставляются значения по умолчанию', () => {
    localStorage.setItem('gymapp.profile', JSON.stringify({ age: 28, heightCm: 175, weightKg: 70 }))
    expect(getProfile()).toEqual({ name: '', sex: 'male', age: 28, heightCm: 175, weightKg: 70 })
  })
})

describe('история', () => {
  it('добавляет запись с уникальным id', () => {
    const saved = addHistoryEntry(entry)
    expect(saved.id).toBeTruthy()
    expect(getHistory()).toHaveLength(1)
  })

  it('удаляет запись по id', () => {
    const saved = addHistoryEntry(entry)
    addHistoryEntry(entry)
    deleteHistoryEntry(saved.id)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].id).not.toBe(saved.id)
  })

  it('переживает round-trip экспорт/импорт', () => {
    addHistoryEntry(entry)
    const json = exportHistoryJSON()
    localStorage.clear()
    importHistoryJSON(json)
    expect(getHistory()).toHaveLength(1)
    expect(getHistory()[0].exercise).toBe('Присед')
  })

  it('импорт заменяет историю целиком, а не дописывает', () => {
    addHistoryEntry(entry)
    const json = exportHistoryJSON()
    addHistoryEntry(entry)
    addHistoryEntry(entry)
    importHistoryJSON(json)
    expect(getHistory()).toHaveLength(1)
  })

  it('отклоняет чужой JSON', () => {
    expect(() => importHistoryJSON('[{"foo":1}]')).toThrow()
    expect(() => importHistoryJSON('{"not":"an array"}')).toThrow()
    expect(() => importHistoryJSON('сломанный json')).toThrow()
  })

  it('не роняет приложение на повреждённых данных в localStorage', () => {
    localStorage.setItem('gymapp.history', '{{{')
    expect(getHistory()).toEqual([])
  })
})

describe('упражнения', () => {
  it('пресеты доступны без сохранений', () => {
    expect(getAllExercises()).toEqual(PRESET_EXERCISES)
  })

  it('добавляет своё упражнение и не дублирует его', () => {
    addCustomExercise('Гакк-присед')
    addCustomExercise('гакк-присед')
    addCustomExercise('Жим лёжа')
    expect(getAllExercises()).toHaveLength(PRESET_EXERCISES.length + 1)
  })

  it('игнорирует пустое имя', () => {
    addCustomExercise('   ')
    expect(getAllExercises()).toEqual(PRESET_EXERCISES)
  })
})
