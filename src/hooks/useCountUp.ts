/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { useEffect, useState } from 'react'

const DURATION_MS = 400

/**
 * Анимация числа 0 -> target. При prefers-reduced-motion значение
 * ставится сразу, без анимации.
 */
export function useCountUp(target: number | null): number | null {
  const [value, setValue] = useState(target)

  useEffect(() => {
    if (target === null) {
      setValue(null)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // В скрытой вкладке requestAnimationFrame не вызывается, и число застряло бы
    // на нуле: показывать пользователю неверный результат нельзя, ставим сразу
    if (reduced || document.hidden) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      // ease-out: быстро стартует, мягко тормозит у финального значения
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    // Страховка на случай, если кадры прекратятся посреди анимации
    const settle = setTimeout(() => setValue(target), DURATION_MS + 200)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [target])

  return value
}
