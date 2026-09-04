import { ArrowUpRight, DownloadSimple, TrashSimple, UploadSimple } from '@phosphor-icons/react'
import { useRef, useState, type ChangeEvent } from 'react'
import CurveChart from '../components/charts/CurveChart'
import ProgressChart from '../components/charts/ProgressChart'
import { BalanceCard, StreakCard } from '../components/InsightCards'
import UserBar from '../components/UserBar'
import WeeklyLoad from '../components/WeeklyLoad'
import { dotsLevel, dotsScore } from '../lib/dots'
import { personalRecords, powerliftingTotal, progressDelta } from '../lib/records'
import {
  deleteHistoryEntry,
  exportHistoryJSON,
  getAllExercises,
  getHistory,
  getProfile,
  importHistoryJSON,
} from '../lib/storage'
import styles from './GraphScreen.module.css'

type Mode = 'progress' | 'curve'

export default function GraphScreen({ onOpenProfile }: { onOpenProfile: () => void }) {
  const [mode, setMode] = useState<Mode>('progress')
  const [history, setHistory] = useState(getHistory)
  const [exercise, setExercise] = useState(() => getHistory()[0]?.exercise ?? getAllExercises()[0])
  const [curveWeight, setCurveWeight] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const profile = getProfile()
  const exerciseOptions = Array.from(new Set([...history.map((item) => item.exercise), ...getAllExercises()]))
  const filtered = history.filter((item) => item.exercise === exercise)

  const records = personalRecords(history)
  const total = powerliftingTotal(history)
  const score =
    profile?.sex && total.missing.length === 0
      ? dotsScore(total.total, profile.weightKg, profile.sex)
      : null

  function handleDelete(id: string) {
    deleteHistoryEntry(id)
    setHistory(getHistory())
  }

  function handleExport() {
    const blob = new Blob([exportHistoryJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `1pm-history-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (history.length > 0 && !confirm('Импорт заменит текущую историю целиком. Продолжить?')) return

    try {
      importHistoryJSON(await file.text())
      setHistory(getHistory())
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось прочитать файл')
    }
  }

  return (
    <div className="screen">
      {profile && <UserBar profile={profile} onOpenProfile={onOpenProfile} />}

      <header className={styles.header}>
        <h1>Прогресс</h1>
      </header>

      <div className={`segmented ${styles.switch}`} role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'progress'} onClick={() => setMode('progress')}>
          По датам
        </button>
        <button type="button" role="tab" aria-selected={mode === 'curve'} onClick={() => setMode('curve')}>
          Вес / повторы
        </button>
      </div>

      {mode === 'progress' ? (
        <div className="fade-in" key="progress">
          <div className={styles.control}>
            <label htmlFor="graph-exercise">Упражнение</label>
            <select id="graph-exercise" value={exercise} onChange={(event) => setExercise(event.target.value)}>
              {exerciseOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.chartCard}>
            <ProgressChart entries={filtered} />
          </div>
        </div>
      ) : (
        <div className="fade-in" key="curve">
          <div className={styles.control}>
            <label htmlFor="curve-weight">Рабочий вес, кг</label>
            <input
              id="curve-weight"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              placeholder="0"
              value={curveWeight}
              onChange={(event) => setCurveWeight(event.target.value)}
            />
          </div>
          <div className={styles.chartCard}>
            <CurveChart weight={Number(curveWeight)} />
          </div>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className={styles.sectionTitle}>
            <h2>Мышцы за неделю</h2>
            <span className={styles.count}>свежее весит больше</span>
          </div>
          <WeeklyLoad history={history} profile={profile} />

          <div className={styles.sectionTitle}>
            <h2>Регулярность</h2>
            <span className={styles.count}>12 недель</span>
          </div>
          <StreakCard history={history} />

          <div className={styles.sectionTitle}>
            <h2>Слабое звено</h2>
            <span className={styles.count}>пропорции троеборья</span>
          </div>
          <BalanceCard history={history} />
        </>
      )}

      {records.length > 0 && (
        <>
          <div className={styles.sectionTitle}>
            <h2>Рекорды</h2>
            <span className={styles.count}>расчётный максимум</span>
          </div>
          <div className={styles.records}>
            {records.slice(0, 5).map((record) => {
              const delta = progressDelta(history, record.exercise)
              return (
                <div key={record.exercise} className={styles.record}>
                  <div>
                    <div className={styles.recordName}>{record.exercise}</div>
                    <div className={styles.recordMeta}>
                      {record.weight} кг × {record.reps}
                      {delta !== null && (
                        <span className={`${styles.delta} ${delta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
                          <ArrowUpRight size={11} weight="bold" />
                          {delta >= 0 ? '+' : ''}
                          {delta.toFixed(1)} кг за 30 дней
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`num ${styles.recordValue}`}>
                    {record.oneRM.toFixed(1)}
                    <small>кг</small>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.sectionTitle}>
            <h2>Очки DOTS</h2>
            <span className={styles.count}>сумма троеборья</span>
          </div>
          <div className={styles.dots}>
            {score !== null ? (
              <>
                <div className={styles.dotsTop}>
                  <div className={`num ${styles.dotsScore}`}>{score.toFixed(1)}</div>
                  <div className={styles.dotsLevel}>
                    {dotsLevel(score)}
                    <br />
                    сумма {total.total.toFixed(1)} кг
                  </div>
                </div>
                <div className={styles.dotsLifts}>
                  {total.lifts.map((lift) => (
                    <div key={lift.exercise} className={styles.dotsLift}>
                      <span>{lift.exercise}</span>
                      <b>{lift.oneRM.toFixed(1)} кг</b>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.dotsHint}>
                {!profile?.sex
                  ? 'Укажите пол и собственный вес в профиле: очки считаются с поправкой на вес тела.'
                  : `Для расчёта нужны все три движения. Не хватает: ${total.missing.join(', ')}.`}
              </p>
            )}
          </div>
          <p className={styles.source}>
            DOTS - оценка силы с поправкой на собственный вес, пришла на смену формуле Уилкса.
            Считается по сумме приседа, жима лёжа и становой тяги.
          </p>
        </>
      )}

      <div className={styles.sectionTitle}>
        <h2>История</h2>
        <span className={styles.count}>{history.length} записей</span>
      </div>

      {history.length === 0 ? (
        <p className={styles.empty}>Пусто. Рассчитайте 1ПМ и сохраните результат.</p>
      ) : (
        <ul className={styles.list}>
          {[...history].reverse().map((item) => (
            <li key={item.id} className={styles.entry}>
              <div>
                <div className={styles.entryName}>{item.exercise}</div>
                <div className={styles.entryMeta}>
                  {new Date(item.date).toLocaleDateString('ru-RU')} · {item.weight} кг × {item.reps}
                </div>
              </div>
              <div className={styles.entryValues}>
                <span className={styles.entryEpley}>{item.epley1RM.toFixed(1)}</span>
                <span className={styles.entryBrzycki}>{item.brzycki1RM.toFixed(1)}</span>
              </div>
              <button
                type="button"
                className={styles.delete}
                aria-label={`Удалить запись ${item.exercise}`}
                onClick={() => handleDelete(item.id)}
              >
                <TrashSimple size={17} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.transfer}>
        <button type="button" className="chip" onClick={handleExport} disabled={history.length === 0}>
          <DownloadSimple size={14} weight="bold" /> Экспорт
        </button>
        <button type="button" className="chip" onClick={() => fileInput.current?.click()}>
          <UploadSimple size={14} weight="bold" /> Импорт
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className={styles.fileInput}
          onChange={handleImport}
        />
      </div>
    </div>
  )
}
