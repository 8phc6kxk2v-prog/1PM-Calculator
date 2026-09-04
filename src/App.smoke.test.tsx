import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import CurveChart from './components/charts/CurveChart'
import ProgressChart from './components/charts/ProgressChart'
import { saveProfile } from './lib/storage'

beforeEach(() => {
  localStorage.clear()
})

const profile = { name: 'Иван', sex: 'male' as const, age: 30, heightCm: 180, weightKg: 82 }

describe('монтирование экранов', () => {
  it('первый запуск открывает регистрацию одним окном', () => {
    const html = renderToString(<App />)
    expect(html).toContain('Заполните')
    expect(html).toContain('Аватар')
    expect(html).toContain('Начать')
  })

  it('с заполненным профилем открывается экран расчёта', () => {
    saveProfile(profile)
    const html = renderToString(<App />)
    expect(html).toContain('Расчёт 1ПМ')
    expect(html).toContain('Рассчитать')
  })

  it('в шапке видно имя и вес, вкладки без отдыха', () => {
    saveProfile(profile)
    const html = renderToString(<App />)
    // SSR разбивает соседние текстовые узлы комментариями, поэтому проверяем по частям
    expect(html).toContain('Иван')
    expect(html.replace(/<!-- -->/g, '')).toContain('82 кг')
    expect(html).toContain('Дыхание')
    expect(html).not.toContain('Отдых')
  })
})

describe('графики рендерятся', () => {
  it('кривая вес-повторения строит две линии на 12 точках', () => {
    const html = renderToString(<CurveChart weight={100} />)
    expect(html.match(/<polyline/g)).toHaveLength(2)
    expect(html.match(/<circle/g)).toHaveLength(24)
  })

  it('кривая без веса показывает подсказку вместо графика', () => {
    expect(renderToString(<CurveChart weight={0} />)).toContain('Введите рабочий вес')
  })

  it('прогресс без истории показывает пустое состояние', () => {
    expect(renderToString(<ProgressChart entries={[]} />)).toContain('Нет сохранённых расчётов')
  })
})
