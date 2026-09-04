<div align="center">

<img src="docs/banner.svg" alt="1PM Calculator" width="820">

**Estimate your one-rep max, see which muscles you trained, and watch your numbers move.**
Works offline, keeps everything on your phone, needs no account.

[![Deploy](https://github.com/8phc6kxk2v-prog/1PM-Calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/8phc6kxk2v-prog/1PM-Calculator/actions/workflows/deploy.yml)
![PWA](https://img.shields.io/badge/installs%20like%20an%20app-b4e635?style=flat-square&labelColor=1c1c20)
![Offline](https://img.shields.io/badge/works%20offline-b4e635?style=flat-square&labelColor=1c1c20)
![No account](https://img.shields.io/badge/no%20account-b4e635?style=flat-square&labelColor=1c1c20)

### [Open the app →](https://8phc6kxk2v-prog.github.io/1PM-Calculator/)

</div>

---

## What it does

You rarely lift a true single. This app takes a set you actually did — say 100 kg for 5 reps — and
estimates the most you could lift once. From there it shows what to load for any rep range, how to
warm up to it, which plates to put on the bar, and how your strength changes over time.

## Install it on your phone

1. Open the app link above in your phone's browser
2. **Android (Chrome):** tap the menu, then *Add to Home screen*
3. **iPhone (Safari):** tap Share, then *Add to Home Screen*

It then launches like a normal app, full screen, and keeps working with no signal — handy in gym
basements. Your data never leaves the device.

## How to use it

### 1. Fill in your profile

On first launch you enter your name, sex, age, height and weight, and can pick a photo.

Age and height are stored but not used in the max calculation — only your working weight and reps
decide that. Body weight and sex are needed for the DOTS score later. The photo is shrunk to 192 px
and saved on your device only.

You can change all of it later by tapping your name at the top of the screen.

### 2. Calculate a max

Pick an exercise, enter the weight you lifted and how many reps you got, then tap **Рассчитать**.

The silhouette above the fields shows which muscles that exercise works, so you can tell at a glance
whether you are about to log a quad movement or a back one.

Results are saved to history automatically — there is no save button. Pressing calculate again with
the same numbers within five minutes will not create a duplicate.

### 3. Read the two numbers

You get two estimates side by side, because there is no single agreed formula:

| | |
|---|---|
| **Epley** | Tends to fit better above 10 reps |
| **Brzycki** | Tends to fit better below 10 reps |

At exactly 10 reps both formulas give the same number. The app tells you which one is closer for the
reps you entered.

Both are reliable in the **1–10 rep** range. Above that you will see a warning — the estimate drifts
as reps climb, because a 20-rep set measures endurance as much as strength. At 37 reps and above the
Brzycki formula breaks down mathematically, so the app blocks the calculation instead of showing a
meaningless number.

### 4. Use the three tabs under the result

- **Working weights** — what to load for 1 to 12 reps, based on the standard NSCA training-load
  chart. This is the practical output: you wanted a number for your next session, here it is.
- **Warm-up** — a ladder up to your working weight, 40 / 60 / 75 / 90 %, never lighter than the bar.
- **Plates** — which plates to put on each side of a 20 kg bar, using the fewest plates. If the
  weight cannot be made with standard plates, it says how much is missing.

### 5. Breathe

The **Дыхание** tab has three breathing patterns: box breathing 4-4-4-4 to settle down, 4-7-8 to fall
asleep after an evening session, and coherent breathing at about 5.5 breaths per minute for recovery.
The circle expands as you inhale and shrinks as you exhale — follow it, and don't count.

### 6. Track progress

The **Прогресс** tab collects everything from your history:

- **Chart** — your estimated max over time for one exercise, with the second formula as a dashed
  error corridor and your best result marked. Tap any point for the date and the set behind it.
  A second mode draws the weight-versus-reps curve for any weight you type in.
- **Muscles this week** — a body map coloured by how much work each muscle group got in the last
  seven days. Recent work counts for more. Each group is scaled against its own history, not against
  other groups, so quads don't drown out biceps. Tap a group to see which exercises loaded it.
- **Consistency** — a 12-week calendar and your current streak, counted in weeks rather than days,
  because rest days are part of training.
- **Weak link** — compares your bench, squat and deadlift against the rough 1 : 1.3 : 1.6 ratio and
  points out the lift that lags. Leverages differ between people, so treat it as a hint.
- **Records and DOTS** — your best estimate per exercise, the change over the last 30 days, and a
  DOTS score, which compares your three-lift total against your body weight so lifters of different
  sizes can be compared fairly.

## Your data

Everything lives in your browser's local storage on that one device. Nothing is uploaded, there is no
account, and no analytics.

That also means clearing your browser data deletes your history. Use **Экспорт** on the progress tab
to save it as a file, and **Импорт** to restore it or move it to another phone. Importing replaces
the whole history, so export first if you are unsure.

Individual entries can be deleted from the history list, and the profile can be reset from the
profile screen without touching your training history.

## Exercises

20 built-in exercises grouped by muscle: legs, chest, back, shoulders, arms. You can add your own
from the exercise picker — they are saved and appear in the list next time.

The muscle map recognises about 70 exercise names, including common synonyms and typos. If something
you logged is not recognised, the progress tab lists it so it isn't silently ignored.

## Credits

Body silhouette geometry from
[react-body-highlighter](https://github.com/giavinh79/react-body-highlighter) (MIT, © 2020 GV79).
Rep-percentage table from the NSCA training-load chart (Baechle & Earle, *Essentials of Strength
Training and Conditioning*).

---

Building or modifying the app: see [docs/development.md](docs/development.md).
