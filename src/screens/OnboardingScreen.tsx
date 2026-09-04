/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import ProfileForm from '../components/ProfileForm'
import { saveProfile, type Profile } from '../lib/storage'
import styles from './OnboardingScreen.module.css'

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  function handleSubmit(profile: Profile) {
    saveProfile(profile)
    onDone()
  }

  return (
    <div className={`screen ${styles.screen}`}>
      <header className={styles.header}>
        <span className="eyebrow">Знакомимся</span>
        <h1 className={styles.title}>
          Заполните
          <br />
          профиль
        </h1>
        <p className={styles.subtitle}>
          Всё хранится только на этом устройстве. Возраст и рост в расчёте максимума не участвуют,
          вес и пол нужны для очков DOTS.
        </p>
      </header>

      <ProfileForm initial={null} submitLabel="Начать" onSubmit={handleSubmit} />
    </div>
  )
}
