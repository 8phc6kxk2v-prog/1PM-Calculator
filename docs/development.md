# Разработка

React + Vite + TypeScript, PWA через vite-plugin-pwa. Без бэкенда: профиль, история тренировок и
свои упражнения лежат в localStorage.

## Команды

```bash
npm install      # первая установка
npm run dev      # разработка, http://localhost:5173
npm run test     # юнит-тесты: формулы, хранилище, нагрузка на мышцы, рендер экранов
npm run build    # проверка типов + продакшен-сборка в dist/
npm run preview  # просмотр собранной версии с рабочим service worker
```

Иконки пересобираются из `public/icon-source.svg`:

```bash
npm run generate-icons
```

## Проверка PWA

Service worker работает только в собранной версии, не в `npm run dev`.

1. `npm run build`, затем `npm run preview`
2. DevTools → Application → Service Workers: статус `activated and running`
3. DevTools → Application → Manifest: иконки и `theme_color` без ошибок
4. DevTools → Network → Offline, перезагрузить страницу: приложение должно открыться

## Деплой

**GitHub Pages** настроен в [../.github/workflows/deploy.yml](../.github/workflows/deploy.yml): на
каждый пуш в `main` прогоняются тесты, собирается проект и публикуется на
`https://ЛОГИН.github.io/ИМЯ-РЕПОЗИТОРИЯ/`.

Один раз после создания репозитория нужно включить Pages вручную: **Settings → Pages → Source:
GitHub Actions**. Из workflow это сделать нельзя — токену не хватает прав администратора, шаг
`configure-pages` падает с `Resource not accessible by integration`. Пока Pages не включены, сборка
будет валиться именно на этом шаге, хотя тесты и билд проходят.

Pages отдаёт сайт из подпапки, поэтому базовый путь приходит из переменной `BASE_PATH`, а workflow
подставляет туда имя репозитория. Локальная сборка работает из корня без настройки.

**Первая публикация на GitHub** одной командой:

```bash
powershell -ExecutionPolicy Bypass -File setup-github.ps1
```

Скрипт создаёт репозиторий, коммит, репозиторий на GitHub через `gh`, заливает код и включает Pages.
Существующий `origin` не трогает, только пушит.

## Структура

| Путь | Назначение |
| --- | --- |
| `src/lib/formulas.ts` | Формулы 1ПМ и валидация числа повторений |
| `src/lib/training.ts` | Рабочие веса по NSCA, разминка, раскладка блинов |
| `src/lib/storage.ts` | Профиль, история, свои упражнения, экспорт/импорт JSON |
| `src/lib/records.ts` | Личные рекорды, прогресс, сумма троеборья |
| `src/lib/insights.ts` | Регулярность и баланс троеборья |
| `src/lib/dots.ts` | Очки DOTS |
| `src/lib/muscleLoad.ts` | Нагрузка по мышечным группам за окно |
| `src/lib/breathing.ts` | Схемы дыхания и раскладка фаз |
| `src/data/muscleMap.ts` | Справочник упражнений: доли нагрузки, алиасы, матчинг |
| `src/components/BodySilhouette.tsx` | Геометрия силуэта, файл сгенерирован |
| `src/screens/` | Регистрация, профиль, расчёт, дыхание, прогресс |

## Формулы

```
Epley:   1RM = W * (1 + R / 30)
Brzycki: 1RM = W * 36 / (37 - R)
```

Обе валидны в диапазоне 1-10 повторений. При 10 и более показывается предупреждение о снижении
точности, при 37 и более расчёт блокируется: у Брзицки знаменатель уходит в ноль.

Контрольные значения в тестах: 100 кг × 5 → Эпли ≈ 116.7, Брзицки ≈ 112.5. На 10 повторениях обе
формулы дают одно и то же число.

## Сторонние материалы

Геометрия силуэта в [../src/components/BodySilhouette.tsx](../src/components/BodySilhouette.tsx)
взята из [react-body-highlighter](https://github.com/giavinh79/react-body-highlighter) (MIT,
Copyright © 2020 GV79): полигоны переведены в пути, таксономия мышц отображена на внутреннюю. Сам
пакет в зависимости не добавлялся.

Коэффициенты DOTS сверены по [отчёту IPF об оценочных
формулах](https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/Models_Evaluation-I-2020.pdf).
