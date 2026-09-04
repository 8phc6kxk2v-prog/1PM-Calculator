import { useId, useState } from 'react'
import styles from './Chart.module.css'
import { paddedDomain, scaleLinear, toPoints } from './scale'

export interface ChartPoint {
  /** Подпись под осью X */
  label: string
  /** Основное значение, по нему построена линия и заливка */
  value: number
  /** Второе значение того же замера, рисуется пунктирным коридором */
  corridor: number
  /** Строка в тултипе под числом */
  detail?: string
}

interface LineChartProps {
  points: ChartPoint[]
  /** Название основной серии для легенды */
  primaryName: string
  corridorName: string
  /** Индекс точки, помеченной как рекорд */
  recordIndex?: number
  unit?: string
  width?: number
  height?: number
}

const PADDING = { top: 16, right: 10, bottom: 26, left: 38 }
const GRID_LINES = 4

export default function LineChart({
  points,
  primaryName,
  corridorName,
  recordIndex,
  unit = 'кг',
  width = 320,
  height = 220,
}: LineChartProps) {
  const gradientId = useId()
  const [active, setActive] = useState<number | null>(null)

  const [min, max] = paddedDomain([points.map((p) => p.value), points.map((p) => p.corridor)])
  const xScale = scaleLinear([0, Math.max(points.length - 1, 1)], [PADDING.left, width - PADDING.right])
  const yScale = scaleLinear([min, max], [height - PADDING.bottom, PADDING.top])

  const gridValues = Array.from(
    { length: GRID_LINES },
    (_, index) => min + ((max - min) / (GRID_LINES - 1)) * index,
  )

  const linePoints = toPoints(points.map((p) => p.value), xScale, yScale)
  const areaPath = `M ${xScale(0)},${height - PADDING.bottom} L ${linePoints.replaceAll(' ', ' L ')} L ${xScale(points.length - 1)},${height - PADDING.bottom} Z`

  const shown = active ?? (points.length > 0 ? points.length - 1 : null)
  const shownPoint = shown === null ? null : points[shown]

  return (
    <div className={styles.wrap}>
      {shownPoint && (
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>
            {active === null ? 'последний замер' : shownPoint.label}
          </span>
          <span className={`num ${styles.readoutValue}`}>
            {shownPoint.value.toFixed(1)}
            <small>{unit}</small>
          </span>
          {shownPoint.detail && <span className={styles.readoutDetail}>{shownPoint.detail}</span>}
        </div>
      )}

      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${primaryName} по замерам, коридор ${corridorName}`}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-fill)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-accent-fill)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={value}>
            <line
              className={styles.grid}
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={yScale(value)}
              y2={yScale(value)}
            />
            <text className={styles.axisLabel} x={0} y={yScale(value) + 3}>
              {value.toFixed(0)}
            </text>
          </g>
        ))}

        {points.length > 1 && <path className={styles.area} d={areaPath} fill={`url(#${gradientId})`} />}

        {/* Коридор второй формулы: пунктир тоньше основной линии */}
        <polyline
          className={styles.corridor}
          points={toPoints(points.map((p) => p.corridor), xScale, yScale)}
        />
        <polyline className={styles.line} points={linePoints} />

        {points.map((point, index) => (
          <g key={index}>
            {index === recordIndex && (
              <circle className={styles.recordRing} cx={xScale(index)} cy={yScale(point.value)} r={9} />
            )}
            <circle
              className={styles.dot}
              data-active={index === shown}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r={4.5}
            />
            {/* Прозрачная зона нажатия шире самой точки */}
            <circle
              className={styles.hit}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r={16}
              onPointerDown={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
            />
          </g>
        ))}

        {points.map((point, index) =>
          index === 0 || index === points.length - 1 || index === shown ? (
            <text
              key={`label-${index}`}
              className={styles.axisLabel}
              x={xScale(index)}
              y={height - 8}
              textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} data-kind="primary" />
          {primaryName}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} data-kind="corridor" />
          {corridorName}
        </span>
        {recordIndex !== undefined && (
          <span className={styles.legendItem}>
            <span className={styles.legendSwatch} data-kind="record" />
            рекорд
          </span>
        )}
      </div>
    </div>
  )
}
