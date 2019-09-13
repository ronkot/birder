export function currentYear() {
  return new Date().getFullYear()
}

export function currentDay() {
  return new Date().toISOString().slice(0, 10)
}

export function firstDayOfYear() {
  return `${currentYear()}-01-01`
}
