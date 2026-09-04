import { Camera } from '@phosphor-icons/react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { fileToAvatar, initials } from '../lib/avatar'
import type { Sex } from '../lib/dots'
import type { Profile } from '../lib/storage'
import styles from './ProfileForm.module.css'

interface ProfileFormProps {
  initial: Profile | null
  submitLabel: string
  onSubmit: (profile: Profile) => void
}

export default function ProfileForm({ initial, submitLabel, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'male')
  const [age, setAge] = useState(initial ? String(initial.age) : '')
  const [height, setHeight] = useState(initial ? String(initial.heightCm) : '')
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : '')
  const [avatar, setAvatar] = useState(initial?.avatar)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const numbers = [Number(age), Number(height), Number(weight)]
  const isValid =
    name.trim() !== '' &&
    [age, height, weight].every((value) => value !== '') &&
    numbers.every((value) => Number.isFinite(value) && value > 0)

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setAvatar(await fileToAvatar(file))
      setError('')
    } catch {
      setError('Не удалось прочитать картинку. Попробуйте другую.')
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isValid) return
    onSubmit({
      name: name.trim(),
      sex,
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
      avatar,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.avatarRow}>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => fileInput.current?.click()}
          aria-label="Выбрать аватар"
        >
          {avatar ? (
            <img className={styles.avatarImage} src={avatar} alt="" />
          ) : (
            <span className={styles.avatarInitials}>{initials(name)}</span>
          )}
          <span className={styles.avatarBadge}>
            <Camera size={14} weight="fill" />
          </span>
        </button>
        <div className={styles.avatarText}>
          <span className="eyebrow">Аватар</span>
          <p className={styles.avatarHint}>
            Фото ужимается до 192px и остаётся на этом устройстве, никуда не отправляется.
          </p>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleAvatar}
        />
      </div>

      <div className={styles.fields}>
        <div>
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            autoComplete="given-name"
            placeholder="Как к вам обращаться"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label id="sex-label">Пол</label>
          <div className="segmented" role="group" aria-labelledby="sex-label">
            <button type="button" aria-pressed={sex === 'male'} onClick={() => setSex('male')}>
              Мужской
            </button>
            <button type="button" aria-pressed={sex === 'female'} onClick={() => setSex('female')}>
              Женский
            </button>
          </div>
        </div>

        <div className={styles.triple}>
          <div>
            <label htmlFor="age">Возраст</label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              placeholder="0"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            <span className={styles.unit}>лет</span>
          </div>
          <div>
            <label htmlFor="height">Рост</label>
            <input
              id="height"
              type="number"
              inputMode="numeric"
              min="50"
              max="260"
              placeholder="0"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
            <span className={styles.unit}>см</span>
          </div>
          <div>
            <label htmlFor="weight">Вес</label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="20"
              max="400"
              step="0.1"
              placeholder="0"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
            <span className={styles.unit}>кг</span>
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className="btn" style={{ marginTop: 24 }} disabled={!isValid}>
        {submitLabel}
      </button>
    </form>
  )
}
