import { useMemo, useState } from 'react'
import { MUSCLE_LABELS, type MuscleGroup } from '../data/muscleMap'
import { computeMuscleLoads, muscleInsight, type LoadSet } from '../lib/muscleLoad'
import type { HistoryEntry, Profile } from '../lib/storage'
import MuscleMap, { fillFor } from './MuscleMap'
import styles from './WeeklyLoad.module.css'

const LEGEND: { label: string; intensity: number }[] = [
  { label: 'нет нагрузки', intensity: 0 },
  { label: 'лёгкая', intensity: 0.3 },
  { label: 'заметная', intensity: 0.65 },
  { label: 'высокая', intensity: 1 },
]

function plural(value: number, one: string, few: string, many: string): string {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

interface WeeklyLoadProps {
  history: HistoryEntry[]
  profile: Profile | null
  bindings: Record<string, string>
}

/** Нагрузка по мышцам за последние 7 дней: силуэт, панель разбора, инсайт */
export default function WeeklyLoad({ history, profile, bindings }: WeeklyLoadProps) {
  const [selected, setSelected] = useState<MuscleGroup | null>(null)

  const sets: LoadSet[] = useMemo(
    () =>
      history.map((entry) => ({
        exercise: entry.exercise,
        weight: entry.weight,
        reps: entry.reps,
        date: entry.date,
      })),
    [history],
  )

  const options = { bodyweightKg: profile?.weightKg ?? 0, bindings }
  const loads = useMemo(
    () => computeMuscleLoads(sets, new Date(), 7, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sets, bindings, profile?.weightKg],
  )
  const insight = muscleInsight(loads, sets, new Date(), options)

  const intensities: Partial<Record<MuscleGroup, number>> = {}
  for (const [group, load] of Object.entries(loads.groups)) {
    intensities[group as MuscleGroup] = load.intensity
  }

  const load = selected ? loads.groups[selected] : null

  return (
    <div className={styles.card}>
      <MuscleMap intensities={intensities} selected={selected} onSelect={setSelected} />

      <div className={styles.legend}>
        {LEGEND.map((item) => (
          <span key={item.label} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: fillFor(item.intensity) }} />
            {item.label}
          </span>
        ))}
      </div>

      {loads.sparse && (
        <p className={styles.sparse}>Истории меньше двух недель, шкала нормирована по максимуму окна</p>
      )}

      <div className={styles.panel}>
        {load ? (
          <>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>{MUSCLE_LABELS[load.group]}</span>
              <span className={styles.panelMeta}>
                {Math.round(load.intensity * 100)}% · {load.sets}{' '}
                {plural(load.sets, 'подход', 'подхода', 'подходов')}
                <br />
                {load.lastTrainedDays === null
                  ? 'не тренировалась'
                  : load.lastTrainedDays < 1
                    ? 'сегодня'
                    : `${Math.floor(load.lastTrainedDays)} ${plural(Math.floor(load.lastTrainedDays), 'день', 'дня', 'дней')} назад`}
              </span>
            </div>

            {load.exercises.length > 0 ? (
              <div className={styles.rows}>
                {load.exercises.map((exercise) => (
                  <span key={exercise.name} className={styles.row}>
                    {exercise.name}
                    <b>{Math.round(exercise.volume)}</b>
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.placeholder}>За последние {loads.windowDays} дней нагрузки не было</p>
            )}
          </>
        ) : (
          <p className={styles.placeholder}>
            Коснитесь группы на силуэте, чтобы увидеть подходы за последние {loads.windowDays} дней
          </p>
        )}
      </div>

      <p className={styles.insight}>{insight}</p>

      {loads.unmatched.length > 0 && (
        <p className={styles.unmatched}>
          Вне карты остались записи без разметки мышц:{' '}
          {loads.unmatched.map((item) => item.name).join(', ')}
        </p>
      )}
    </div>
  )
}
