import moment from 'moment'

export function isBirdVisibleForYearSelection(bird, year) {
  if (year === 'all') return true
  if (bird.validUntil && year > bird.validUntil) return false
  if (bird.validFrom && year < bird.validFrom) return false
  return true
}

export function isBirdValidForDate(bird, momentDate) {
  const year = momentDate.year()
  if (bird.validUntil && year > bird.validUntil) return false
  if (bird.validFrom && year < bird.validFrom) return false
  return true
}

/**
 * Returns a default moment date for the edit form when year selection is 'all'.
 * If the bird has validUntil in the past, clamps to Dec 31 of that year.
 * Otherwise returns today.
 */
export function defaultDateForBird(bird) {
  const today = moment()
  if (bird.validUntil && today.year() > bird.validUntil) {
    return moment(`${bird.validUntil}-12-31`)
  }
  return today
}
