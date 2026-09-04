/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { Play, Stop } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import {
  cycleDuration,
  expansion,
  PATTERNS,
  PHASE_LABELS,
  phaseAt,
  type PhaseState,
} from '../lib/breathing'
import styles from './BreathScreen.module.css'

const IDLE: PhaseState = { phase: 'inhale', remaining: 0, progress: 0, cycle: 0 }

export default function BreathScreen() {
  const [patternId, setPatternId] = useState(PATTERNS[0].id)
  const [running, setRunning] = useState(false)
  const [state, setState] = useState<PhaseState>(IDLE)
  const startedAt = useRef(0)

  const pattern = PATTERNS.find((item) => item.id === patternId) ?? PATTERNS[0]

  useEffect(() => {
    if (!running) return

    // Тик по таймеру, а не по requestAnimationFrame: кадры встают в скрытой
    // вкладке, а плавность круга даёт CSS-transition, не частота обновлений.
    // Время считаем от метки старта, поэтому после возврата фаза верная.
    const tick = () => setState(phaseAt(pattern, (Date.now() - startedAt.current) / 1000))

    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [running, pattern])

  function start() {
    startedAt.current = Date.now()
    setRunning(true)
  }

  function stop() {
    setRunning(false)
    setState(IDLE)
  }

  // 0.55 на полном выдохе, 1 на полном вдохе
  const scale = 0.55 + expansion(state) * 0.45

  return (
    <div className="screen">
      <header className={styles.header}>
        <h1>Дыхание</h1>
        <p className={styles.subtitle}>
          Успокоить пульс после тренировки, собраться перед подходом или уснуть вечером
        </p>
      </header>

      {/*
        Показания вынесены под кружок: раньше текст был внутри и на полном
        выдохе не влезал в него, кружок сжимается до 55 процентов.
      */}
      <div className={styles.stage}>
        <div
          className={styles.halo}
          style={{ transform: `scale(${scale})`, opacity: running ? 1 : 0.35 }}
        />
        <div className={styles.orb} style={{ transform: `scale(${scale})` }} />
      </div>

      <div className={styles.readout}>
        {running ? (
          <>
            <div className={styles.phase}>{PHASE_LABELS[state.phase]}</div>
            <div className={`num ${styles.count}`}>{Math.ceil(state.remaining)}</div>
            <div className={styles.cycles}>цикл {state.cycle + 1}</div>
          </>
        ) : (
          <>
            <div className={styles.phase}>{pattern.name}</div>
            <div className={`num ${styles.count}`}>{cycleDuration(pattern)}</div>
            <div className={styles.cycles}>секунд в цикле</div>
          </>
        )}
      </div>

      <div className={styles.controls}>
        <button type="button" className="btn" onClick={running ? stop : start}>
          {running ? <Stop size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          {running ? 'Закончить' : 'Начать'}
        </button>
        {running && (
          <button type="button" className={styles.stop} aria-label="Сбросить" onClick={stop}>
            <Stop size={18} weight="bold" />
          </button>
        )}
      </div>

      {!running && (
        <div className={styles.patterns} style={{ marginTop: 26 }}>
          {PATTERNS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.pattern}
              aria-pressed={item.id === patternId}
              onClick={() => setPatternId(item.id)}
            >
              <span>
                <span className={styles.patternName}>{item.name}</span>
                <span className={styles.patternHint}>{item.hint}</span>
              </span>
              <span className={styles.patternMeta}>{cycleDuration(item)} с</span>
            </button>
          ))}
        </div>
      )}

      <p className={styles.note}>
        Квадратное дыхание известно как box breathing и используется для быстрого успокоения. Схема
        4-7-8 предложена Эндрю Вейлом и помогает засыпать. Когерентное дыхание около 5.5 вдоха в
        минуту - режим, на котором в исследованиях вариабельности сердечного ритма наблюдается
        резонанс.
      </p>
    </div>
  )
}
