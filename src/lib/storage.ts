/**
 * Локальное хранилище: профиль, история тренировок, пользовательские упражнения.
 * Профиль хранится отдельным ключом и в расчёте 1ПМ не участвует.
 */

import type { Sex } from './dots'

export interface Profile {
  name: string
  age: number
  heightCm: number
  weightKg: number
  sex: Sex
  /** dataURL квадратной картинки 192px, необязателен */
  avatar?: string
}

export interface HistoryEntry {
  id: string
  date: string // ISO
  exercise: string
  weight: number
  reps: number
  epley1RM: number
  brzycki1RM: number
}

const KEYS = {
  profile: 'gymapp.profile',
  history: 'gymapp.history',
  customExercises: 'gymapp.customExercises',
} as const

export const EXERCISE_GROUPS: ReadonlyArray<{ group: string; items: string[] }> = [
  {
    group: 'Ноги',
    items: ['Присед со штангой', 'Фронтальный присед', 'Жим ногами', 'Румынская тяга', 'Выпады со штангой'],
  },
  {
    group: 'Грудь',
    items: ['Жим лёжа', 'Жим лёжа узким хватом', 'Жим гантелей лёжа', 'Жим под углом', 'Отжимания на брусьях'],
  },
  {
    group: 'Спина',
    items: ['Становая тяга', 'Становая сумо', 'Тяга штанги в наклоне', 'Подтягивания с весом', 'Тяга верхнего блока'],
  },
  { group: 'Плечи', items: ['Жим стоя', 'Жим гантелей сидя', 'Тяга к подбородку'] },
  { group: 'Руки', items: ['Подъём штанги на бицепс', 'Французский жим'] },
]

export const PRESET_EXERCISES = EXERCISE_GROUPS.flatMap((group) => group.items)

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    // Повреждённый JSON или недоступный localStorage не должны ронять приложение
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/* Профиль */

export function getProfile(): Profile | null {
  const stored = read<Partial<Profile> | null>(KEYS.profile, null)
  if (
    !stored ||
    typeof stored.age !== 'number' ||
    typeof stored.heightCm !== 'number' ||
    typeof stored.weightKg !== 'number'
  ) {
    return null
  }

  // Профили, сохранённые до появления имени и пола, дополняем значениями
  // по умолчанию, чтобы регистрация не запускалась заново
  return {
    name: stored.name ?? '',
    sex: stored.sex ?? 'male',
    age: stored.age,
    heightCm: stored.heightCm,
    weightKg: stored.weightKg,
    avatar: stored.avatar,
  }
}

export function saveProfile(profile: Profile): void {
  write(KEYS.profile, profile)
}

/** Сброс профиля. Историю тренировок не трогаем: она пережила бы и смену владельца */
export function resetProfile(): void {
  localStorage.removeItem(KEYS.profile)
}

/* История */

export function getHistory(): HistoryEntry[] {
  const history = read<HistoryEntry[]>(KEYS.history, [])
  return Array.isArray(history) ? history : []
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id'>): HistoryEntry {
  const saved: HistoryEntry = { ...entry, id: crypto.randomUUID() }
  write(KEYS.history, [...getHistory(), saved])
  return saved
}

export function deleteHistoryEntry(id: string): void {
  write(
    KEYS.history,
    getHistory().filter((entry) => entry.id !== id),
  )
}

/* Упражнения */

export function getCustomExercises(): string[] {
  const list = read<string[]>(KEYS.customExercises, [])
  return Array.isArray(list) ? list : []
}

export function addCustomExercise(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const known = getAllExercises().map((item) => item.toLowerCase())
  if (known.includes(trimmed.toLowerCase())) return
  write(KEYS.customExercises, [...getCustomExercises(), trimmed])
}

export function getAllExercises(): string[] {
  return [...PRESET_EXERCISES, ...getCustomExercises()]
}

/* Экспорт / импорт */

export function exportHistoryJSON(): string {
  return JSON.stringify(getHistory(), null, 2)
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.exercise === 'string' &&
    typeof entry.weight === 'number' &&
    typeof entry.reps === 'number' &&
    typeof entry.epley1RM === 'number' &&
    typeof entry.brzycki1RM === 'number'
  )
}

/**
 * Импорт заменяет историю целиком. Содержимое файла - внешние данные,
 * поэтому проверяем форму каждой записи, а не доверяем JSON.parse.
 */
export function importHistoryJSON(json: string): HistoryEntry[] {
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed) || !parsed.every(isHistoryEntry)) {
    throw new Error('Файл не похож на историю тренировок этого приложения')
  }
  write(KEYS.history, parsed)
  return parsed
}
