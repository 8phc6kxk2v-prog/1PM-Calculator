import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import ProfileForm from '../components/ProfileForm'
import { getProfile, resetProfile, saveProfile, type Profile } from '../lib/storage'
import styles from './ProfileScreen.module.css'

interface ProfileScreenProps {
  onClose: () => void
  onReset: () => void
}

export default function ProfileScreen({ onClose, onReset }: ProfileScreenProps) {
  const [saved, setSaved] = useState(false)

  function handleSubmit(profile: Profile) {
    saveProfile(profile)
    setSaved(true)
  }

  function handleReset() {
    if (!confirm('Профиль будет удалён, и приложение снова спросит данные. История тренировок останется. Продолжить?')) {
      return
    }
    resetProfile()
    onReset()
  }

  return (
    <div className="screen">
      <header className={styles.header}>
        <button type="button" className="chip" onClick={onClose}>
          <ArrowLeft size={14} weight="bold" /> Назад
        </button>
        <h1 className={styles.title}>Профиль</h1>
      </header>

      <ProfileForm initial={getProfile()} submitLabel="Сохранить" onSubmit={handleSubmit} />

      {saved && <p className={styles.saved}>Сохранено</p>}

      <div className={styles.danger}>
        <button type="button" className="chip" onClick={handleReset}>
          <Trash size={14} weight="bold" /> Сбросить профиль
        </button>
        <p className={styles.dangerHint}>История тренировок при сбросе не удаляется.</p>
      </div>
    </div>
  )
}
