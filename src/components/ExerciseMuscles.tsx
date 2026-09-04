import { MUSCLE_LABELS, resolveExercise, type MuscleGroup } from '../data/muscleMap'
import styles from './ExerciseMuscles.module.css'
import MuscleMap, { fillFor } from './MuscleMap'

/**
 * Какие мышцы грузит выбранное упражнение. Доли нормируются на самую
 * загруженную группу: главная мышца всегда в полном цвете, остальные
 * читаются относительно неё.
 */
export default function ExerciseMuscles({ exercise }: { exercise: string }) {
  const resolved = resolveExercise(exercise)

  if (!resolved) {
    return (
      <div className={styles.card}>
        <p className={styles.unknown}>
          Для «{exercise}» нет разметки мышц в справочнике. Расчёт максимума это не затрагивает.
        </p>
      </div>
    )
  }

  const shares = Object.entries(resolved.involvement) as [MuscleGroup, number][]
  const peak = Math.max(...shares.map(([, share]) => share))

  const intensities: Partial<Record<MuscleGroup, number>> = {}
  for (const [group, share] of shares) intensities[group] = share / peak

  const ranked = [...shares].sort((a, b) => b[1] - a[1])

  /*
   * Проекцию выбираем по сумме долей, а не по одной верхней группе:
   * у приседа сверху квадрицепс, но выбор по нему прятал бы ягодицы,
   * а у становой почти вся нагрузка сзади при неочевидном лидере.
   */
  const BACK_ONLY = new Set<MuscleGroup>([
    'lats', 'midBack', 'lowerBack', 'rearDelts', 'glutes', 'hamstrings', 'triceps',
  ])
  const backShare = shares.reduce((sum, [group, share]) => sum + (BACK_ONLY.has(group) ? share : 0), 0)
  const view = backShare > 0.5 ? 'back' : 'front'

  return (
    <div className={styles.card}>
      <MuscleMap intensities={intensities} compact view={view} />

      <div className={styles.side}>
        <div className={styles.title}>Работают мышцы</div>
        <div className={styles.rows}>
          {ranked.slice(0, 4).map(([group, share]) => (
            <div key={group} className={styles.row}>
              <span className={styles.name}>{MUSCLE_LABELS[group]}</span>
              <span className={styles.share}>{Math.round(share * 100)}%</span>
              <span className={styles.track}>
                <span
                  className={styles.fill}
                  style={{ width: `${(share / peak) * 100}%`, background: fillFor(share / peak) }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
