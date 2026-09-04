/**
 * DOTS - оценка силы с поправкой на собственный вес. Заменил формулу Уилкса
 * как более точный вариант на краях весового диапазона.
 *
 * DOTS = сумма (кг) * 500 / (a*BW^4 + b*BW^3 + c*BW^2 + d*BW + e), BW в кг.
 * Коэффициенты приведены по опубликованной формуле DOTS (мужская и женская),
 * см. отчёт IPF по оценочным формулам:
 * https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/Models_Evaluation-I-2020.pdf
 *
 * Формула построена на сумме троеборья, поэтому считаем её от суммы лучших
 * приседа, жима лёжа и становой тяги, а не от одного движения.
 */

export type Sex = 'male' | 'female'

const COEFFICIENTS: Record<Sex, [number, number, number, number, number]> = {
  // [a, b, c, d, e] для BW^4, BW^3, BW^2, BW, свободного члена
  male: [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076],
  female: [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288],
}

/** Диапазон собственного веса, на котором формула валидна */
const VALID_BODYWEIGHT: Record<Sex, [number, number]> = {
  male: [40, 200],
  female: [40, 150],
}

export function dotsCoefficient(bodyweightKg: number, sex: Sex): number {
  const [a, b, c, d, e] = COEFFICIENTS[sex]
  const bw = bodyweightKg
  return 500 / (a * bw ** 4 + b * bw ** 3 + c * bw ** 2 + d * bw + e)
}

export function dotsScore(totalKg: number, bodyweightKg: number, sex: Sex): number | null {
  const [min, max] = VALID_BODYWEIGHT[sex]
  if (bodyweightKg < min || bodyweightKg > max || totalKg <= 0) return null
  return totalKg * dotsCoefficient(bodyweightKg, sex)
}

/**
 * Ориентировочные уровни по очкам DOTS. Границы условные: они нужны, чтобы
 * человек понимал порядок величины, а не как официальная классификация.
 */
export function dotsLevel(score: number): string {
  if (score < 200) return 'новичок'
  if (score < 300) return 'любитель'
  if (score < 400) return 'уверенный уровень'
  if (score < 500) return 'продвинутый'
  return 'соревновательный уровень'
}
