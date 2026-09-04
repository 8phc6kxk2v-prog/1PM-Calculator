import { CaretRight } from '@phosphor-icons/react'
import { initials } from '../lib/avatar'
import type { Profile } from '../lib/storage'
import styles from './UserBar.module.css'

interface UserBarProps {
  profile: Profile
  onOpenProfile: () => void
}

export default function UserBar({ profile, onOpenProfile }: UserBarProps) {
  return (
    <button type="button" className={styles.bar} onClick={onOpenProfile}>
      <span className={styles.avatar}>
        {profile.avatar ? <img src={profile.avatar} alt="" /> : initials(profile.name)}
      </span>
      <span className={styles.text}>
        <span className={styles.hello}>Профиль</span>
        <span className={styles.name}>
          {profile.name || 'Без имени'} · {profile.weightKg} кг
        </span>
      </span>
      <span className={styles.gear}>
        <CaretRight size={16} weight="bold" />
      </span>
    </button>
  )
}
