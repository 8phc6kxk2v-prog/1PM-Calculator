/**
 * Справочник упражнений для тепловой карты мышц.
 *
 * involvement - доли нагрузки по группам, сумма строго 1.0 (проверяется тестом).
 * Доли усреднённые: реальное распределение зависит от техники и рычагов,
 * поэтому там, где биомеханика спорная, стоит консервативная раскладка
 * и пометка // проверить.
 *
 * bodyweight - доля собственного веса, которая реально движется в упражнении.
 * Складывается с дополнительным весом из записи.
 */

export type MuscleGroup =
  | 'chest'
  | 'frontDelts'
  | 'sideDelts'
  | 'rearDelts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'lats'
  | 'midBack'
  | 'traps'
  | 'lowerBack'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'calves'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'frontDelts', 'sideDelts', 'rearDelts', 'biceps', 'triceps', 'forearms',
  'lats', 'midBack', 'traps', 'lowerBack', 'abs', 'obliques', 'glutes', 'quads',
  'hamstrings', 'adductors', 'calves',
]

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Грудь',
  frontDelts: 'Передние дельты',
  sideDelts: 'Средние дельты',
  rearDelts: 'Задние дельты',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  forearms: 'Предплечья',
  lats: 'Широчайшие',
  midBack: 'Середина спины',
  traps: 'Трапеции',
  lowerBack: 'Поясница',
  abs: 'Пресс',
  obliques: 'Косые',
  glutes: 'Ягодицы',
  quads: 'Квадрицепс',
  hamstrings: 'Бицепс бедра',
  adductors: 'Приводящие',
  calves: 'Икры',
}

export type Pattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'horizontalPush'
  | 'verticalPush'
  | 'horizontalPull'
  | 'verticalPull'
  | 'isolation'
  | 'core'
  | 'carry'

export interface Exercise {
  id: string
  name: string
  aliases: string[]
  pattern: Pattern
  involvement: Partial<Record<MuscleGroup, number>>
  /** Доля собственного веса, если упражнение с весом тела */
  bodyweight?: number
}

export const EXERCISES: Exercise[] = [
  /* Присед и квадрицепс */
  {
    id: 'back-squat',
    name: 'Присед со штангой',
    aliases: ['присед', 'приседания', 'приседания со штангой', 'squat', 'back squat'],
    pattern: 'squat',
    involvement: { quads: 0.45, glutes: 0.25, hamstrings: 0.1, lowerBack: 0.1, abs: 0.1 },
  },
  {
    id: 'front-squat',
    name: 'Фронтальный присед',
    aliases: ['фронтальные приседания', 'front squat'],
    pattern: 'squat',
    involvement: { quads: 0.5, glutes: 0.2, abs: 0.15, lowerBack: 0.1, hamstrings: 0.05 },
  },
  {
    id: 'leg-press',
    name: 'Жим ногами',
    aliases: ['жим ногами в тренажере', 'leg press'],
    pattern: 'squat',
    involvement: { quads: 0.6, glutes: 0.25, hamstrings: 0.15 },
  },
  {
    id: 'hack-squat',
    name: 'Гакк-присед',
    aliases: ['гакк присед', 'гакк машина', 'hack squat'],
    pattern: 'squat',
    involvement: { quads: 0.65, glutes: 0.2, hamstrings: 0.15 },
  },
  {
    id: 'goblet-squat',
    name: 'Гоблет-присед',
    aliases: ['гоблет присед', 'присед с гирей', 'goblet squat'],
    pattern: 'squat',
    involvement: { quads: 0.45, glutes: 0.25, abs: 0.2, lowerBack: 0.1 },
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Болгарский присед',
    aliases: ['болгарские выпады', 'сплит присед', 'bulgarian split squat'],
    pattern: 'lunge',
    involvement: { quads: 0.4, glutes: 0.35, hamstrings: 0.15, abs: 0.1 },
  },
  {
    id: 'barbell-lunge',
    name: 'Выпады со штангой',
    aliases: ['выпады', 'выпады с гантелями', 'lunge'],
    pattern: 'lunge',
    involvement: { quads: 0.35, glutes: 0.35, hamstrings: 0.2, abs: 0.1 },
  },
  {
    id: 'step-up',
    name: 'Зашагивания на тумбу',
    aliases: ['зашагивания', 'step up'],
    pattern: 'lunge',
    involvement: { quads: 0.4, glutes: 0.35, hamstrings: 0.15, calves: 0.1 },
  },
  {
    id: 'leg-extension',
    name: 'Разгибания ног',
    aliases: ['разгибание ног', 'разгибания ног в тренажере', 'leg extension'],
    pattern: 'isolation',
    involvement: { quads: 1 },
  },
  {
    id: 'sissy-squat',
    name: 'Сисси-присед',
    aliases: ['сисси присед', 'sissy squat'],
    pattern: 'isolation',
    involvement: { quads: 0.85, abs: 0.15 }, // проверить: вклад пресса зависит от наклона
    bodyweight: 0.6,
  },

  /* Тазобедренный шарнир и задняя цепь */
  {
    id: 'deadlift',
    name: 'Становая тяга',
    aliases: ['становая', 'тяга становая', 'deadlift', 'классическая становая'],
    pattern: 'hinge',
    involvement: { hamstrings: 0.25, glutes: 0.25, lowerBack: 0.2, lats: 0.1, traps: 0.1, forearms: 0.1 },
  },
  {
    id: 'sumo-deadlift',
    name: 'Становая сумо',
    aliases: ['сумо', 'становая тяга сумо', 'sumo deadlift'],
    pattern: 'hinge',
    involvement: { glutes: 0.3, quads: 0.2, adductors: 0.15, hamstrings: 0.15, lowerBack: 0.1, forearms: 0.1 },
  },
  {
    id: 'romanian-deadlift',
    name: 'Румынская тяга',
    aliases: ['румынка', 'мертвая тяга', 'тяга на прямых ногах', 'romanian deadlift', 'rdl'],
    pattern: 'hinge',
    involvement: { hamstrings: 0.45, glutes: 0.25, lowerBack: 0.2, forearms: 0.1 },
  },
  {
    id: 'rack-pull',
    name: 'Тяга с плинтов',
    aliases: ['тяга с плинтов', 'rack pull'],
    pattern: 'hinge',
    involvement: { traps: 0.25, lowerBack: 0.25, glutes: 0.2, hamstrings: 0.2, forearms: 0.1 },
  },
  {
    id: 'good-morning',
    name: 'Наклоны со штангой',
    aliases: ['гуд морнинг', 'good morning'],
    pattern: 'hinge',
    involvement: { hamstrings: 0.4, lowerBack: 0.35, glutes: 0.25 },
  },
  {
    id: 'hip-thrust',
    name: 'Ягодичный мост',
    aliases: ['хип траст', 'мост со штангой', 'hip thrust'],
    pattern: 'hinge',
    involvement: { glutes: 0.6, hamstrings: 0.25, abs: 0.15 }, // проверить: доля пресса ориентировочная
  },
  {
    id: 'kettlebell-swing',
    name: 'Махи гирей',
    aliases: ['свинг', 'махи с гирей', 'kettlebell swing'],
    pattern: 'hinge',
    involvement: { glutes: 0.35, hamstrings: 0.3, lowerBack: 0.2, abs: 0.15 }, // проверить
  },
  {
    id: 'leg-curl',
    name: 'Сгибания ног',
    aliases: ['сгибание ног', 'сгибания ног лежа', 'leg curl'],
    pattern: 'isolation',
    involvement: { hamstrings: 1 },
  },
  {
    id: 'back-extension',
    name: 'Гиперэкстензия',
    aliases: ['гиперэкстензии', 'разгибания спины', 'back extension'],
    pattern: 'hinge',
    involvement: { lowerBack: 0.5, glutes: 0.3, hamstrings: 0.2 },
    bodyweight: 0.55,
  },
  {
    id: 'hip-abduction',
    name: 'Разведение ног в тренажёре',
    aliases: ['отведение бедра', 'разведение ног', 'hip abduction'],
    pattern: 'isolation',
    involvement: { glutes: 1 }, // проверить: часть нагрузки уходит на напрягатель широкой фасции
  },
  {
    id: 'hip-adduction',
    name: 'Сведение ног в тренажёре',
    aliases: ['сведение ног', 'приведение бедра', 'hip adduction'],
    pattern: 'isolation',
    involvement: { adductors: 1 },
  },

  /* Горизонтальный жим */
  {
    id: 'bench-press',
    name: 'Жим лёжа',
    aliases: ['жим лежа', 'жим штанги лежа', 'bench press', 'жим'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.5, triceps: 0.25, frontDelts: 0.25 },
  },
  {
    id: 'close-grip-bench',
    name: 'Жим лёжа узким хватом',
    aliases: ['жим узким хватом', 'узкий жим', 'close grip bench'],
    pattern: 'horizontalPush',
    involvement: { triceps: 0.45, chest: 0.3, frontDelts: 0.25 },
  },
  {
    id: 'incline-bench',
    name: 'Жим под углом',
    aliases: ['жим на наклонной', 'наклонный жим', 'incline bench'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.4, frontDelts: 0.35, triceps: 0.25 },
  },
  {
    id: 'decline-bench',
    name: 'Жим головой вниз',
    aliases: ['жим вниз головой', 'decline bench'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.55, triceps: 0.25, frontDelts: 0.2 },
  },
  {
    id: 'dumbbell-bench',
    name: 'Жим гантелей лёжа',
    aliases: ['жим гантелей', 'жим гантель лежа', 'dumbbell bench press'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.5, frontDelts: 0.25, triceps: 0.25 },
  },
  {
    id: 'incline-dumbbell-bench',
    name: 'Жим гантелей под углом',
    aliases: ['наклонный жим гантелей', 'incline dumbbell press'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.4, frontDelts: 0.35, triceps: 0.25 },
  },
  {
    id: 'machine-chest-press',
    name: 'Жим в тренажёре на грудь',
    aliases: ['жим в хаммере', 'жим сидя в тренажере', 'chest press'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.5, triceps: 0.27, frontDelts: 0.23 },
  },
  {
    id: 'push-up',
    name: 'Отжимания',
    aliases: ['отжимания от пола', 'push up'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.45, triceps: 0.3, frontDelts: 0.2, abs: 0.05 },
    bodyweight: 0.65,
  },
  {
    id: 'dips',
    name: 'Отжимания на брусьях',
    aliases: ['брусья', 'отжимания брусья', 'dips'],
    pattern: 'horizontalPush',
    involvement: { chest: 0.4, triceps: 0.4, frontDelts: 0.2 },
    bodyweight: 1,
  },
  {
    id: 'cable-fly',
    name: 'Сведения в кроссовере',
    aliases: ['сведение рук в кроссовере', 'кроссовер', 'cable fly'],
    pattern: 'isolation',
    involvement: { chest: 0.8, frontDelts: 0.2 },
  },
  {
    id: 'pec-deck',
    name: 'Бабочка',
    aliases: ['сведение рук в тренажере', 'pec deck', 'butterfly'],
    pattern: 'isolation',
    involvement: { chest: 0.85, frontDelts: 0.15 },
  },
  {
    id: 'dumbbell-fly',
    name: 'Разведения гантелей лёжа',
    aliases: ['разводка гантелей', 'разведение гантелей', 'dumbbell fly'],
    pattern: 'isolation',
    involvement: { chest: 0.8, frontDelts: 0.2 },
  },

  /* Вертикальный жим */
  {
    id: 'overhead-press',
    name: 'Жим стоя',
    aliases: ['армейский жим', 'жим штанги стоя', 'overhead press', 'ohp'],
    pattern: 'verticalPush',
    involvement: { frontDelts: 0.45, triceps: 0.25, sideDelts: 0.2, abs: 0.1 },
  },
  {
    id: 'seated-dumbbell-press',
    name: 'Жим гантелей сидя',
    aliases: ['жим гантелей на плечи', 'seated dumbbell press'],
    pattern: 'verticalPush',
    involvement: { frontDelts: 0.45, sideDelts: 0.25, triceps: 0.3 },
  },
  {
    id: 'arnold-press',
    name: 'Жим Арнольда',
    aliases: ['арнольд жим', 'arnold press'],
    pattern: 'verticalPush',
    involvement: { frontDelts: 0.4, sideDelts: 0.3, triceps: 0.3 }, // проверить
  },
  {
    id: 'push-press',
    name: 'Швунг',
    aliases: ['швунг жимовой', 'push press'],
    pattern: 'verticalPush',
    involvement: { frontDelts: 0.35, triceps: 0.2, quads: 0.2, sideDelts: 0.15, abs: 0.1 }, // проверить
  },
  {
    id: 'machine-shoulder-press',
    name: 'Жим в тренажёре на плечи',
    aliases: ['жим на плечи в тренажере', 'shoulder press machine'],
    pattern: 'verticalPush',
    involvement: { frontDelts: 0.5, triceps: 0.3, sideDelts: 0.2 },
  },

  /* Вертикальная тяга */
  {
    id: 'pull-up',
    name: 'Подтягивания с весом',
    aliases: ['подтягивания', 'подтягивание', 'pull up', 'турник'],
    pattern: 'verticalPull',
    involvement: { lats: 0.5, biceps: 0.2, midBack: 0.2, forearms: 0.1 },
    bodyweight: 1,
  },
  {
    id: 'chin-up',
    name: 'Подтягивания обратным хватом',
    aliases: ['подтягивания узким обратным', 'chin up'],
    pattern: 'verticalPull',
    involvement: { lats: 0.4, biceps: 0.3, midBack: 0.2, forearms: 0.1 },
    bodyweight: 1,
  },
  {
    id: 'lat-pulldown',
    name: 'Тяга верхнего блока',
    aliases: ['верхняя тяга', 'тяга блока к груди', 'lat pulldown'],
    pattern: 'verticalPull',
    involvement: { lats: 0.5, biceps: 0.2, midBack: 0.2, forearms: 0.1 },
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Пулловер на блоке',
    aliases: ['пуловер', 'пулловер', 'straight arm pulldown'],
    pattern: 'isolation',
    involvement: { lats: 0.7, triceps: 0.15, abs: 0.15 }, // проверить
  },

  /* Горизонтальная тяга */
  {
    id: 'barbell-row',
    name: 'Тяга штанги в наклоне',
    aliases: ['тяга штанги', 'тяга в наклоне', 'barbell row'],
    pattern: 'horizontalPull',
    involvement: { lats: 0.35, midBack: 0.3, biceps: 0.15, lowerBack: 0.1, forearms: 0.1 },
  },
  {
    id: 'dumbbell-row',
    name: 'Тяга гантели в наклоне',
    aliases: ['тяга гантели', 'тяга гантели одной рукой', 'dumbbell row'],
    pattern: 'horizontalPull',
    involvement: { lats: 0.4, midBack: 0.3, biceps: 0.2, forearms: 0.1 },
  },
  {
    id: 'cable-row',
    name: 'Тяга горизонтального блока',
    aliases: ['горизонтальная тяга', 'тяга нижнего блока', 'cable row'],
    pattern: 'horizontalPull',
    involvement: { midBack: 0.35, lats: 0.35, biceps: 0.2, forearms: 0.1 },
  },
  {
    id: 't-bar-row',
    name: 'Тяга Т-грифа',
    aliases: ['т-гриф', 'тяга т грифа', 't bar row'],
    pattern: 'horizontalPull',
    involvement: { lats: 0.35, midBack: 0.35, biceps: 0.15, forearms: 0.15 },
  },
  {
    id: 'inverted-row',
    name: 'Австралийские подтягивания',
    aliases: ['горизонтальные подтягивания', 'inverted row'],
    pattern: 'horizontalPull',
    involvement: { midBack: 0.35, lats: 0.3, biceps: 0.25, forearms: 0.1 },
    bodyweight: 0.65,
  },
  {
    id: 'face-pull',
    name: 'Тяга к лицу',
    aliases: ['фейс пул', 'face pull'],
    pattern: 'horizontalPull',
    involvement: { rearDelts: 0.5, traps: 0.3, midBack: 0.2 },
  },
  {
    id: 'rear-delt-fly',
    name: 'Разведения в наклоне',
    aliases: ['разводка в наклоне', 'махи в наклоне', 'reverse fly'],
    pattern: 'isolation',
    involvement: { rearDelts: 0.7, traps: 0.2, midBack: 0.1 },
  },

  /* Плечи и трапеции */
  {
    id: 'lateral-raise',
    name: 'Махи гантелями в стороны',
    aliases: ['махи в стороны', 'разведение гантелей стоя', 'lateral raise'],
    pattern: 'isolation',
    involvement: { sideDelts: 0.85, traps: 0.15 },
  },
  {
    id: 'front-raise',
    name: 'Подъёмы перед собой',
    aliases: ['подъем гантелей перед собой', 'front raise'],
    pattern: 'isolation',
    involvement: { frontDelts: 0.8, sideDelts: 0.2 },
  },
  {
    id: 'upright-row',
    name: 'Тяга к подбородку',
    aliases: ['протяжка', 'тяга штанги к подбородку', 'upright row'],
    pattern: 'verticalPull',
    involvement: { sideDelts: 0.4, traps: 0.35, biceps: 0.15, forearms: 0.1 },
  },
  {
    id: 'shrug',
    name: 'Шраги',
    aliases: ['шраги со штангой', 'шраги с гантелями', 'shrug'],
    pattern: 'isolation',
    involvement: { traps: 0.85, forearms: 0.15 },
  },

  /* Руки */
  {
    id: 'barbell-curl',
    name: 'Подъём штанги на бицепс',
    aliases: ['подъем на бицепс', 'бицепс со штангой', 'barbell curl'],
    pattern: 'isolation',
    involvement: { biceps: 0.8, forearms: 0.2 },
  },
  {
    id: 'dumbbell-curl',
    name: 'Подъём гантелей на бицепс',
    aliases: ['сгибания с гантелями', 'бицепс с гантелями', 'dumbbell curl'],
    pattern: 'isolation',
    involvement: { biceps: 0.8, forearms: 0.2 },
  },
  {
    id: 'hammer-curl',
    name: 'Молотковые сгибания',
    aliases: ['молотки', 'хаммер керл', 'hammer curl'],
    pattern: 'isolation',
    involvement: { biceps: 0.6, forearms: 0.4 },
  },
  {
    id: 'preacher-curl',
    name: 'Сгибания на скамье Скотта',
    aliases: ['скамья скотта', 'парта скотта', 'preacher curl'],
    pattern: 'isolation',
    involvement: { biceps: 0.85, forearms: 0.15 },
  },
  {
    id: 'cable-curl',
    name: 'Сгибания на блоке',
    aliases: ['бицепс на блоке', 'cable curl'],
    pattern: 'isolation',
    involvement: { biceps: 0.85, forearms: 0.15 },
  },
  {
    id: 'skullcrusher',
    name: 'Французский жим',
    aliases: ['французский жим лежа', 'skullcrusher'],
    pattern: 'isolation',
    involvement: { triceps: 0.9, frontDelts: 0.1 },
  },
  {
    id: 'triceps-pushdown',
    name: 'Разгибания на блоке',
    aliases: ['разгибание рук на блоке', 'трицепс на блоке', 'triceps pushdown'],
    pattern: 'isolation',
    involvement: { triceps: 1 },
  },
  {
    id: 'overhead-triceps-extension',
    name: 'Разгибания из-за головы',
    aliases: ['французский жим сидя', 'трицепс из-за головы', 'overhead extension'],
    pattern: 'isolation',
    involvement: { triceps: 0.9, frontDelts: 0.1 },
  },
  {
    id: 'bench-dips',
    name: 'Обратные отжимания',
    aliases: ['отжимания от скамьи', 'bench dips'],
    pattern: 'horizontalPush',
    involvement: { triceps: 0.6, chest: 0.2, frontDelts: 0.2 },
    bodyweight: 0.65,
  },
  {
    id: 'wrist-curl',
    name: 'Сгибания на предплечья',
    aliases: ['сгибание запястий', 'предплечья', 'wrist curl'],
    pattern: 'isolation',
    involvement: { forearms: 1 },
  },

  /* Корпус */
  {
    id: 'plank',
    name: 'Планка',
    aliases: ['планка на локтях', 'plank'],
    pattern: 'core',
    involvement: { abs: 0.55, obliques: 0.25, lowerBack: 0.2 },
    bodyweight: 0.6, // проверить: в планке движения нет, вес условный
  },
  {
    id: 'hanging-leg-raise',
    name: 'Подъём ног в висе',
    aliases: ['подъемы ног в висе', 'подъем ног на турнике', 'hanging leg raise'],
    pattern: 'core',
    involvement: { abs: 0.6, obliques: 0.2, forearms: 0.2 }, // проверить: доля хвата зависит от лямок
    bodyweight: 0.5,
  },
  {
    id: 'crunch',
    name: 'Скручивания',
    aliases: ['скручивание', 'пресс скручивания', 'crunch'],
    pattern: 'core',
    involvement: { abs: 0.8, obliques: 0.2 },
    bodyweight: 0.35,
  },
  {
    id: 'cable-crunch',
    name: 'Скручивания на блоке',
    aliases: ['молитва', 'скручивания в блоке', 'cable crunch'],
    pattern: 'core',
    involvement: { abs: 0.8, obliques: 0.2 },
  },
  {
    id: 'russian-twist',
    name: 'Русские скручивания',
    aliases: ['повороты корпуса', 'russian twist'],
    pattern: 'core',
    involvement: { obliques: 0.6, abs: 0.4 },
  },
  {
    id: 'ab-wheel',
    name: 'Ролик для пресса',
    aliases: ['колесо для пресса', 'ab wheel', 'ab rollout'],
    pattern: 'core',
    involvement: { abs: 0.6, obliques: 0.2, lats: 0.1, lowerBack: 0.1 }, // проверить
    bodyweight: 0.5,
  },

  /* Икры и прочее */
  {
    id: 'standing-calf-raise',
    name: 'Подъёмы на носки стоя',
    aliases: ['икры стоя', 'подъем на носки', 'standing calf raise'],
    pattern: 'isolation',
    involvement: { calves: 1 },
  },
  {
    id: 'seated-calf-raise',
    name: 'Подъёмы на носки сидя',
    aliases: ['икры сидя', 'seated calf raise'],
    pattern: 'isolation',
    involvement: { calves: 1 },
  },
  {
    id: 'farmer-carry',
    name: 'Прогулка фермера',
    aliases: ['фермерская прогулка', 'farmer walk', 'farmer carry'],
    pattern: 'carry',
    involvement: { forearms: 0.35, traps: 0.3, abs: 0.2, glutes: 0.15 }, // проверить
  },
]

/* Матчинг свободного текста */

export function normalize(name: string): string {
  return name.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim()
}

/** Расстояние Левенштейна, две строки коротких названий - считать дёшево */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    previous = current
  }

  return previous[b.length]
}

const INDEX = new Map<string, Exercise>()
for (const exercise of EXERCISES) {
  INDEX.set(normalize(exercise.name), exercise)
  for (const alias of exercise.aliases) INDEX.set(normalize(alias), exercise)
}

/**
 * Опечатки ловим Левенштейном с порогом в четверть длины, но не больше трёх
 * правок - иначе короткие названия начинают склеиваться между собой.
 */
export function resolveExercise(name: string): Exercise | null {
  const key = normalize(name)
  if (!key) return null

  const exact = INDEX.get(key)
  if (exact) return exact

  const threshold = Math.min(3, Math.max(1, Math.floor(key.length * 0.25)))
  let best: Exercise | null = null
  let bestDistance = Infinity

  for (const [candidate, exercise] of INDEX) {
    const distance = levenshtein(key, candidate)
    if (distance < bestDistance) {
      bestDistance = distance
      best = exercise
    }
  }

  return bestDistance <= threshold ? best : null
}
