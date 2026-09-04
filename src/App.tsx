import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import { getProfile } from './lib/storage'
import BreathScreen from './screens/BreathScreen'
import ExerciseScreen from './screens/ExerciseScreen'
import GraphScreen from './screens/GraphScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import ProfileScreen from './screens/ProfileScreen'

type View = 'onboarding' | 'profile' | 'tabs'

export default function App() {
  const [view, setView] = useState<View>(() => (getProfile() ? 'tabs' : 'onboarding'))
  const [tab, setTab] = useState<Tab>('exercise')
  // Профиль читаем заново после каждого возврата с его экрана: аватар и вес
  // должны обновиться в шапке и в очках DOTS
  const [profileVersion, setProfileVersion] = useState(0)

  if (view === 'onboarding') {
    return (
      <main className="fade-in">
        <OnboardingScreen
          onDone={() => {
            setProfileVersion((version) => version + 1)
            setView('tabs')
          }}
        />
      </main>
    )
  }

  if (view === 'profile') {
    return (
      <main className="fade-in">
        <ProfileScreen
          onClose={() => {
            setProfileVersion((version) => version + 1)
            setView('tabs')
          }}
          onReset={() => {
            setProfileVersion((version) => version + 1)
            setView('onboarding')
          }}
        />
      </main>
    )
  }

  const openProfile = () => setView('profile')

  return (
    <>
      {/* key переводит экран через fade при переключении вкладки */}
      <main key={`${tab}-${profileVersion}`} className="fade-in">
        {tab === 'exercise' && <ExerciseScreen onOpenProfile={openProfile} />}
        {tab === 'breath' && <BreathScreen />}
        {tab === 'graph' && <GraphScreen onOpenProfile={openProfile} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
