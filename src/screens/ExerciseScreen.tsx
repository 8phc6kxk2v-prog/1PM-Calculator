import { ArrowLeft, CaretDown, Check, Warning } from '@phosphor-icons/react'
import { useState } from 'react'
import ExerciseMuscles from '../components/ExerciseMuscles'
import ExercisePicker from '../components/ExercisePicker'
import UserBar from '../components/UserBar'
import { useCountUp } from '../hooks/useCountUp'
import { accuracyHint, calculateBrzycki, calculateEpley, checkReps, checkWeight } from '../lib/formulas'
import {
  addCustomExercise,
  addHistoryEntry,
  EXERCISE_GROUPS,
  getCustomExercises,
  getHistory,
  getProfile,
} from '../lib/storage'
import { platesFor, trainingLoads, warmupSets } from '../lib/training'
import styles from './ExerciseScreen.module.css'

interface Result {
  exercise: string
  weight: number
  reps: number
  epley: number
  brzycki: number
}

type Extra = 'loads' | 'warmup' | 'plates'

const EXTRA_TABS: ReadonlyArray<{ id: Extra; label: string }> = [
  { id: 'loads', label: 'Рабочие веса' },
  { id: 'warmup', label: 'Разминка' },
  { id: 'plates', label: 'Блины' },
]

export default function ExerciseScreen({ onOpenProfile }: { onOpenProfile: () => void }) {
  const profile = getProfile()
  const [custom, setCustom] = useState(getCustomExercises)
  const [exercise, setExercise] = useState(EXERCISE_GROUPS[0].items[0])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [extra, setExtra] = useState<Extra>('loads')

  const weightNumber = Number(weight)
  const repsNumber = Number(reps)
  const weightCheck = weight === '' ? null : checkWeight(weightNumber)
  const repsCheck = reps === '' ? null : checkReps(repsNumber)

  const blocked =
    weight === '' ||
    reps === '' ||
    weightCheck?.level === 'error' ||
    repsCheck?.level === 'error' ||
    (customMode && customName.trim() === '')

  const alert =
    weightCheck?.level === 'error'
      ? weightCheck
      : repsCheck?.level === 'error' || repsCheck?.level === 'warning'
        ? repsCheck
        : null

  const epleyValue = useCountUp(result?.epley ?? null)
  const brzyckiValue = useCountUp(result?.brzycki ?? null)

  function handleCalculate() {
    if (blocked) return

    const name = customMode ? customName.trim() : exercise
    if (customMode) {
      addCustomExercise(name)
      setCustom(getCustomExercises())
      setExercise(name)
      setCustomMode(false)
      setCustomName('')
    }

    const computed: Result = {
      exercise: name,
      weight: weightNumber,
      reps: repsNumber,
      epley: calculateEpley(weightNumber, repsNumber),
      brzycki: calculateBrzycki(weightNumber, repsNumber),
    }

    setResult(computed)
    autoSave(computed)
  }

  /**
   * Сохраняем сразу после расчёта, без отдельной кнопки. Повтор того же
   * подхода в пределах пяти минут не плодит записи: при подборе веса человек
   * жмёт «Рассчитать» несколько раз подряд, и история забивалась бы мусором.
   */
  function autoSave(entry: Result) {
    const recent = getHistory().at(-1)
    const isRepeat =
      recent?.exercise === entry.exercise &&
      recent.weight === entry.weight &&
      recent.reps === entry.reps &&
      Date.now() - new Date(recent.date).getTime() < 5 * 60 * 1000

    if (isRepeat) return
    addHistoryEntry({
      date: new Date().toISOString(),
      exercise: entry.exercise,
      weight: entry.weight,
      reps: entry.reps,
      epley1RM: entry.epley,
      brzycki1RM: entry.brzycki,
    })
  }

  const hint = result ? accuracyHint(result.reps) : null
  // За основу дополнительных расчётов берём более точную для этого диапазона формулу
  const baseOneRM = result ? (hint?.winner === 'epley' ? result.epley : result.brzycki) : 0
  const plates = result ? platesFor(result.weight) : null

  return (
    <div className="screen">
      <ExercisePicker
        open={pickerOpen}
        selected={exercise}
        custom={custom}
        onClose={() => setPickerOpen(false)}
        onPick={(name) => {
          setExercise(name)
          setPickerOpen(false)
        }}
        onAddCustom={() => {
          setPickerOpen(false)
          setCustomMode(true)
          setCustomName('')
        }}
      />

      {profile && <UserBar profile={profile} onOpenProfile={onOpenProfile} />}

      <header className={styles.header}>
        <h1>Расчёт 1ПМ</h1>
      </header>

      <div className={styles.fields}>
        <div>
          <div className={styles.labelRow}>
            <label htmlFor="exercise">Упражнение</label>
            {customMode && (
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setCustomMode(false)
                  setCustomName('')
                }}
              >
                <ArrowLeft size={13} weight="bold" /> К списку
              </button>
            )}
          </div>

          {customMode ? (
            <input
              id="exercise"
              type="text"
              autoFocus
              placeholder="Название упражнения"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
            />
          ) : (
            <button
              type="button"
              id="exercise"
              className={styles.pickerButton}
              onClick={() => setPickerOpen(true)}
            >
              {exercise}
              <CaretDown size={16} weight="bold" />
            </button>
          )}
        </div>

        {/* Силуэт живёт здесь: он про выбранное упражнение, а не про неделю */}
        <ExerciseMuscles exercise={customMode ? customName : exercise} />

        <div className={styles.pair}>
          <div>
            <label htmlFor="weight">Рабочий вес, кг</label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              placeholder="0"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="reps">Повторения</label>
            <input
              id="reps"
              type="number"
              inputMode="numeric"
              min="1"
              max="36"
              step="1"
              placeholder="0"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
        </div>
      </div>

      {alert && (
        <div
          className={`${styles.alert} ${alert.level === 'error' ? styles.alertError : styles.alertWarning}`}
          role={alert.level === 'error' ? 'alert' : 'status'}
        >
          <Warning size={16} weight="fill" />
          <span>{alert.message}</span>
        </div>
      )}

      <button type="button" className="btn" onClick={handleCalculate} disabled={blocked}>
        Рассчитать
      </button>

      {result && (
        <>
          <section className={`${styles.result} fade-in`} key={`${result.epley}-${result.reps}`}>
            <div className={styles.numbers}>
              <div className={styles.figure}>
                <div className={styles.figureLabel}>
                  <span className={styles.dot} style={{ background: 'var(--color-accent)' }} />
                  Эпли
                </div>
                <div className={`num ${styles.value} ${styles.valueEpley}`}>
                  {(epleyValue ?? 0).toFixed(1)}
                </div>
              </div>
              <div className={styles.figure}>
                <div className={styles.figureLabel}>
                  <span className={styles.dot} style={{ background: 'var(--color-brzycki)' }} />
                  Брзицки
                </div>
                <div className={`num ${styles.value} ${styles.valueBrzycki}`}>
                  {(brzyckiValue ?? 0).toFixed(1)}
                </div>
              </div>
            </div>
            <div className={styles.unit}>Килограммов на один раз</div>

            {hint && (
              <p className={styles.hint}>
                <strong>
                  {hint.winner === 'equal'
                    ? 'Формулы совпали'
                    : hint.winner === 'epley'
                      ? 'Точнее Эпли'
                      : 'Точнее Брзицки'}
                  :
                </strong>{' '}
                {hint.note}
              </p>
            )}

            <div className={styles.actions}>
              <span className={styles.autosaved}>
                <Check size={13} weight="bold" /> Записано в историю
              </span>
            </div>
          </section>

          <section className={styles.extras}>
            <div className={`segmented ${styles.extrasSwitch}`} role="tablist">
              {EXTRA_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={extra === id}
                  onClick={() => setExtra(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="card" key={extra}>
              {extra === 'loads' && (
                <>
                  {trainingLoads(baseOneRM).map(({ reps: loadReps, percent, weight: loadWeight }) => (
                    <div key={loadReps} className={styles.tableRow}>
                      <span className={styles.reps}>{loadReps} повт.</span>
                      <span className={styles.percent}>{percent}%</span>
                      <span className={`num ${styles.rowWeight}`}>
                        {loadWeight}
                        <span>кг</span>
                      </span>
                    </div>
                  ))}
                  <p className={styles.source}>
                    Проценты по таблице NSCA (Baechle, Earle. Essentials of Strength Training and
                    Conditioning). Вес округлён до 2.5 кг.
                  </p>
                </>
              )}

              {extra === 'warmup' && (
                <>
                  {warmupSets(result.weight).map(({ reps: setReps, percent, weight: setWeight }) => (
                    <div key={percent} className={styles.tableRow}>
                      <span className={styles.reps}>{setReps} повт.</span>
                      <span className={styles.percent}>{percent}% от рабочего</span>
                      <span className={`num ${styles.rowWeight}`}>
                        {setWeight}
                        <span>кг</span>
                      </span>
                    </div>
                  ))}
                  <p className={styles.source}>
                    Лесенка к рабочему весу {result.weight} кг. Ниже веса грифа подходы не
                    показываются.
                  </p>
                </>
              )}

              {extra === 'plates' && plates && (
                <>
                  <div className={styles.plateBar}>
                    {plates.perSide.length === 0 ? (
                      <span className={styles.plateSummary}>Хватает одного грифа</span>
                    ) : (
                      plates.perSide.map((plate, index) => (
                        <span
                          key={`${plate}-${index}`}
                          className={styles.plate}
                          style={{ height: `${34 + plate * 1.2}px` }}
                        >
                          {plate}
                        </span>
                      ))
                    )}
                  </div>
                  <p className={styles.plateSummary}>
                    На каждую сторону грифа 20 кг. Итого на штанге <strong>{plates.achievable} кг</strong>.
                  </p>
                  {plates.remainder > 0 && (
                    <p className={styles.plateWarning}>
                      Стандартными блинами не добрать {plates.remainder} кг до {result.weight} кг.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
