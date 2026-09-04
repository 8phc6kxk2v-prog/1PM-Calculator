import { accuracyHint } from '../../lib/formulas'
import { estimate1RM } from '../../lib/records'
import type { HistoryEntry } from '../../lib/storage'
import styles from './Chart.module.css'
import LineChart, { type ChartPoint } from './LineChart'

interface ProgressChartProps {
  entries: HistoryEntry[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

/**
 * Основная линия - максимум по той формуле, что точнее для этого числа
 * повторений; вторая формула идёт пунктирным коридором погрешности.
 */
export default function ProgressChart({ entries }: ProgressChartProps) {
  if (entries.length === 0) {
    return <p className={styles.empty}>Нет сохранённых расчётов для этого упражнения</p>
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

  const points: ChartPoint[] = sorted.map((entry) => {
    const primary = estimate1RM(entry)
    const other = accuracyHint(entry.reps).winner === 'epley' ? entry.brzycki1RM : entry.epley1RM
    return {
      label: formatDate(entry.date),
      value: primary,
      corridor: other,
      detail: `${entry.weight} кг × ${entry.reps}`,
    }
  })

  const recordIndex = points.reduce(
    (best, point, index) => (point.value > points[best].value ? index : best),
    0,
  )

  return (
    <LineChart
      points={points}
      primaryName="Точная формула"
      corridorName="Вторая формула"
      recordIndex={recordIndex}
    />
  )
}
