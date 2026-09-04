export function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0
  // Плоская серия (один замер или все значения равны) рисуется по центру,
  // иначе получилось бы деление на ноль
  return (value: number) => (span === 0 ? (r0 + r1) / 2 : r0 + ((value - d0) / span) * (r1 - r0))
}

export function toPoints(
  values: number[],
  xScale: (index: number) => number,
  yScale: (value: number) => number,
): string {
  return values.map((value, index) => `${xScale(index)},${yScale(value)}`).join(' ')
}

/** Домен по всем сериям с запасом 8%, чтобы линии не липли к краям */
export function paddedDomain(series: number[][]): [number, number] {
  const all = series.flat()
  if (all.length === 0) return [0, 1]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const padding = (max - min || max || 1) * 0.08
  return [min - padding, max + padding]
}
