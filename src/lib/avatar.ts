/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
const SIZE = 192
const QUALITY = 0.82

/**
 * Аватар лежит в localStorage вместе с профилем, поэтому картинку
 * ужимаем до квадрата 192px и жмём в JPEG: исходное фото с телефона
 * весит мегабайты и в хранилище просто не влезет.
 */
export async function fileToAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)

  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Браузер не дал холст для обработки картинки')

  context.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', QUALITY)
}

/** Инициалы для заглушки, пока аватар не выбран */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
