/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { useState } from 'react'
import { MUSCLE_LABELS, type MuscleGroup } from '../data/muscleMap'
import { BODY_PARTS, BODY_VIEWBOX, VIEW_PATHS, type BodyView } from './BodySilhouette'
import styles from './MuscleMap.module.css'

/**
 * Цвет группы: интерполяция в OKLCH от холодной точки палитры к акценту.
 * Смешивает браузер нативно, без ручной математики по каналам.
 */
export function fillFor(intensity: number): string {
  if (intensity <= 0.02) return 'var(--muscle-idle)'
  return `color-mix(in oklch, var(--color-accent) ${Math.round(intensity * 100)}%, var(--muscle-cold))`
}

interface MuscleMapProps {
  /** 0..1 по группам; отсутствующие считаются нулевыми */
  intensities: Partial<Record<MuscleGroup, number>>
  selected?: MuscleGroup | null
  onSelect?: (group: MuscleGroup | null) => void
  /** Компактный режим: без переключателя проекций, силуэт мельче */
  compact?: boolean
  view?: BodyView
}

export default function MuscleMap({
  intensities,
  selected = null,
  onSelect,
  compact = false,
  view: viewProp,
}: MuscleMapProps) {
  const [ownView, setOwnView] = useState<BodyView>('front')
  const view = viewProp ?? ownView

  return (
    <div className={styles.wrap} data-compact={compact}>
      {!compact && (
        <div className={`segmented ${styles.switch}`} role="tablist">
          <button type="button" role="tab" aria-selected={view === 'front'} onClick={() => setOwnView('front')}>
            Спереди
          </button>
          <button type="button" role="tab" aria-selected={view === 'back'} onClick={() => setOwnView('back')}>
            Сзади
          </button>
        </div>
      )}

      <div className={styles.stage}>
        <svg
          className={styles.svg}
          viewBox={BODY_VIEWBOX}
          role="img"
          aria-label="Силуэт с подсветкой мышечных групп"
        >
          {BODY_PARTS[view].map((d, index) => (
            <path key={`body-${index}`} className={styles.outline} d={d} />
          ))}

          {VIEW_PATHS[view].map((path, index) => {
            // Фигуру делят несколько групп: показываем самую нагруженную из них
            const leading = path.groups.reduce((best, group) =>
              (intensities[group] ?? 0) > (intensities[best] ?? 0) ? group : best,
            )
            const intensity = intensities[leading] ?? 0

            return (
              <path
                // ключ без вида: смена проекции меняет d, но не перемонтирует
                // элемент, поэтому каскад проигрывается один раз при монтировании
                key={`${path.groups.join('-')}-${index}`}
                id={leading}
                className={styles.muscle}
                d={path.d}
                fill={fillFor(intensity)}
                data-selected={path.groups.includes(selected as MuscleGroup)}
                data-interactive={Boolean(onSelect)}
                style={{ animationDelay: `${path.row * 20}ms` }}
                onClick={() => onSelect?.(selected === leading ? null : leading)}
              >
                <title>
                  {path.groups.map((group) => MUSCLE_LABELS[group]).join(' / ')}:{' '}
                  {Math.round(intensity * 100)}%
                </title>
              </path>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
