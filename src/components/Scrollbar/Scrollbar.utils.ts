export const normalizeValue = (x: number, min: number, max: number) => {
  if (x <= min) return min
  if (x >= max) return max
  return x
}
