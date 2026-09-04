import { BALANCE_REFERENCE, dayKey, liftBalance, streakStats } from '../lib/insights'
import type { HistoryEntry } from '../lib/storage'
import styles from './InsightCards.module.css'

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function StreakCard({ history }: { history: HistoryEntry[] }) {
  const stats = streakStats(history)
  const today = dayKey(new Date())

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={`num ${styles.big}`}>
          {stats.weeks}
          <small>{plural(stats.weeks, 'неделя подряд', 'недели подряд', 'недель подряд')}</small>
        </span>
        <span className={styles.side}>
          {stats.sessionsLast30} {plural(stats.sessionsLast30, 'день', 'дня', 'дней')} за 30 суток
          <br />
          всего {stats.total} {plural(stats.total, 'день', 'дня', 'дней')}
        </span>
      </div>

      <div className={styles.grid}>
        {stats.days.map((day) => (
          <span
            key={day.key}
            className={styles.cell}
            data-count={Math.min(day.count, 3)}
            data-today={day.key === today}
            title={`${day.date.toLocaleDateString('ru-RU')}: ${day.count} ${plural(day.count, 'запись', 'записи', 'записей')}`}
          />
        ))}
      </div>

      <div className={styles.scale}>
        12 недель
        <span className={styles.scaleCell} style={{ background: 'var(--color-line-soft)' }} />
        <span
          className={styles.scaleCell}
          style={{ background: 'color-mix(in srgb, var(--color-accent) 45%, var(--color-line-soft))' }}
        />
        <span className={styles.scaleCell} style={{ background: 'var(--color-accent)' }} />
        больше записей
      </div>
    </div>
  )
}

export function BalanceCard({ history }: { history: HistoryEntry[] }) {
  const balance = liftBalance(history)

  if (balance.lifts.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.hint}>
          Нужны замеры минимум двух движений из троеборья. Не хватает: {balance.missing.join(', ')}.
        </p>
      </div>
    )
  }

  const maxRM = Math.max(...balance.lifts.map((lift) => Math.max(lift.oneRM, lift.expected)))

  return (
    <div className={styles.card}>
      <div className={styles.bars}>
        {balance.lifts.map((lift) => (
          <div key={lift.exercise} className={styles.bar}>
            <span className={styles.barName}>{lift.exercise}</span>
            <span className={styles.barValue}>
              {lift.oneRM.toFixed(0)} кг · {lift.deviation >= 0 ? '+' : ''}
              {lift.deviation.toFixed(0)}%
            </span>
            <span className={styles.barTrack}>
              <span
                className={styles.barFill}
                data-weak={lift.exercise === balance.weakest?.exercise}
                style={{ width: `${(lift.oneRM / maxRM) * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>

      <p className={styles.verdict}>
        {balance.weakest ? (
          <>
            <strong>Отстаёт {balance.weakest.exercise.toLowerCase()}</strong> — на{' '}
            {Math.abs(balance.weakest.deviation).toFixed(0)}% ниже ожидаемого по пропорции. Ожидаемо
            около {balance.weakest.expected.toFixed(0)} кг.
          </>
        ) : (
          <>
            <strong>Движения сбалансированы</strong> — расхождение с пропорцией в пределах 5%.
          </>
        )}
      </p>

      <p className={styles.source}>
        Ориентир пропорций: жим {BALANCE_REFERENCE['Жим лёжа']}, присед{' '}
        {BALANCE_REFERENCE['Присед со штангой']}, тяга {BALANCE_REFERENCE['Становая тяга']}.
        Соотношение усреднённое, у конкретного человека зависит от рычагов.
      </p>
    </div>
  )
}
