/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { Barbell, ChartLineUp, Wind } from '@phosphor-icons/react'
import styles from './BottomNav.module.css'

export type Tab = 'exercise' | 'breath' | 'graph'

const TABS = [
  { id: 'exercise', label: 'Расчёт', Icon: Barbell },
  { id: 'breath', label: 'Дыхание', Icon: Wind },
  { id: 'graph', label: 'Прогресс', Icon: ChartLineUp },
] as const satisfies ReadonlyArray<{ id: Tab; label: string; Icon: typeof Barbell }>

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const activeIndex = TABS.findIndex((tab) => tab.id === active)

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        {/* Указатель едет между вкладками, кнопки только меняют цвет текста */}
        <span className={styles.indicator} style={{ transform: `translateX(${activeIndex * 100}%)` }} />

        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={styles.item}
            aria-current={active === id}
            onClick={() => onChange(id)}
          >
            <Icon size={20} weight={active === id ? 'fill' : 'duotone'} />
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
