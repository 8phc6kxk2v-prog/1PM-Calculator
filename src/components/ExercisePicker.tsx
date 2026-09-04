import { Check, MagnifyingGlass, Plus, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { EXERCISE_GROUPS } from '../lib/storage'
import styles from './ExercisePicker.module.css'

interface ExercisePickerProps {
  open: boolean
  selected: string
  custom: string[]
  onClose: () => void
  onPick: (exercise: string) => void
  /** Открыть ввод своего названия */
  onAddCustom: () => void
  /** Свой список групп: экран мышц подставляет справочник биомеханики */
  groups?: ReadonlyArray<{ group: string; items: string[] }>
  allowCustom?: boolean
  title?: string
}

export default function ExercisePicker({
  open,
  selected,
  custom,
  onClose,
  onPick,
  onAddCustom,
  groups: groupsProp,
  allowCustom = true,
  title = 'Упражнение',
}: ExercisePickerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      setQuery('')
      element.showModal()
    }
    if (!open && element.open) element.close()
  }, [open])

  const groups = groupsProp ?? [
    ...EXERCISE_GROUPS,
    ...(custom.length > 0 ? [{ group: 'Свои', items: custom }] : []),
  ]
  const needle = query.trim().toLowerCase()
  const filtered = groups
    .map(({ group, items }) => ({
      group,
      items: needle ? items.filter((name) => name.toLowerCase().includes(needle)) : items,
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <dialog ref={dialog} className={styles.sheet} onClose={onClose} aria-label="Выбор упражнения">
      <div className={styles.inner}>
        <span className={styles.grabber} />

        <div className={styles.head}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{title}</span>
            <button type="button" className={styles.close} aria-label="Закрыть" onClick={onClose}>
              <X size={18} weight="bold" />
            </button>
          </div>

          <div className={styles.search}>
            <MagnifyingGlass size={16} weight="bold" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по названию"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p className={styles.nothing}>Ничего не нашлось</p>
          ) : (
            filtered.map(({ group, items }) => (
              <div key={group}>
                <div className={styles.group}>{group}</div>
                {items.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={styles.option}
                    aria-selected={name === selected}
                    onClick={() => onPick(name)}
                  >
                    {name}
                    {name === selected && <Check size={16} weight="bold" />}
                  </button>
                ))}
              </div>
            ))
          )}

          {allowCustom && (
            <button type="button" className={styles.custom} onClick={onAddCustom}>
              <Plus size={16} weight="bold" />
              Добавить своё упражнение
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
