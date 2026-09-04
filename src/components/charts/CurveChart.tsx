/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { calculateBrzycki, calculateEpley } from '../../lib/formulas'
import styles from './Chart.module.css'
import LineChart, { type ChartPoint } from './LineChart'

interface CurveChartProps {
  weight: number
}

const REPS = Array.from({ length: 12 }, (_, index) => index + 1)

/**
 * Предсказанный 1ПМ на диапазоне 1-12 повторений. Основная линия - Эпли,
 * пунктир Брзицки: видно, как формулы расходятся к концу диапазона.
 */
export default function CurveChart({ weight }: CurveChartProps) {
  if (!Number.isFinite(weight) || weight <= 0) {
    return <p className={styles.empty}>Введите рабочий вес, чтобы построить кривую</p>
  }

  const points: ChartPoint[] = REPS.map((reps) => {
    const epley = calculateEpley(weight, reps)
    const brzycki = calculateBrzycki(weight, reps)
    return {
      label: `${reps}`,
      value: epley,
      corridor: brzycki,
      detail: `${reps} повт. · расхождение ${Math.abs(epley - brzycki).toFixed(1)} кг`,
    }
  })

  return <LineChart points={points} primaryName="Эпли" corridorName="Брзицки" />
}
