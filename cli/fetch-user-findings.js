import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const fs = require('fs')
const _ = require('lodash')

// Use the same birds data the Cloud Function uses for rarity calculations
// so our star totals match production logic.
const birds = require('../functions/birds')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

function parseYear(value) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1900 || n > 3000) return null
  return n
}

function toJsDate(dateField) {
  // Supports Firestore Timestamp, ISO string, or Date
  if (!dateField) return null
  if (typeof dateField === 'string') return new Date(dateField)
  if (dateField.toDate && typeof dateField.toDate === 'function') return dateField.toDate()
  if (dateField instanceof Date) return dateField
  return null
}

function getRarityByBirdId(birdId) {
  const bird = birds.find((b) => b.id === birdId)
  return bird ? bird.rarity : undefined
}

function computeYearStats(findings) {
  const unknownBirds = new Set()
  const stars = findings.reduce((sum, f) => {
    const rarity = getRarityByBirdId(f.bird)
    if (rarity === undefined) unknownBirds.add(f.bird)
    return sum + (rarity || 0)
  }, 0)
  return {
    findingsCount: findings.length,
    stars,
    unknownBirdIds: Array.from(unknownBirds)
  }
}

async function main() {
  const userId = process.argv[2]
  const yearArg = process.argv[3]
  const year = parseYear(yearArg)

  if (!userId) {
    console.error('Usage: babel-node cli/fetch-user-findings.js <USER_ID> [YEAR]')
    process.exit(1)
  }

  console.log('Project:', env.firebaseProjectId)
  console.log('User:', userId)
  if (year) console.log('Year:', year)

  // Fetch findings for user, optionally filter by year on server
  let findingsQuery = db
    .collection('findings')
    .where('user', '==', userId)

  if (year) {
    const lower = `${year}-01-01T00:00:00.000Z`
    const upper = `${year + 1}-01-01T00:00:00.000Z`
    findingsQuery = findingsQuery
      .where('date', '>=', lower)
      .where('date', '<', upper)
      .orderBy('date', 'asc')
  }

  const findingsSnap = await findingsQuery.get()

  const allFindings = findingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const parsed = allFindings.map((f) => ({
    ...f,
    jsDate: toJsDate(f.date)
  }))

  // Sort descending by date for readability
  const sorted = _.orderBy(parsed, (f) => f.jsDate ? f.jsDate.getTime() : 0, 'desc')

  let filteredByYear = sorted
  if (year) {
    filteredByYear = sorted.filter((f) => f.jsDate && f.jsDate.getFullYear() === year)
  }

  console.log(`\nFindings total for user: ${allFindings.length}`)
  console.log(`Findings matching${year ? ' ' + year : ''}: ${filteredByYear.length}`)

  if (filteredByYear.length > 0) {
    const sample = filteredByYear.slice(0, 10).map((f) => ({ id: f.id, bird: f.bird, date: f.jsDate?.toISOString() || f.date }))
    console.log('\nSample findings (up to 10):')
    console.log(sample)
  }

  // Collect all unique bird ids from the (optionally) year-filtered findings
  const uniqueBirdIds = Array.from(new Set(filteredByYear.map((f) => f.bird))).sort()
  const knownBirdIdSet = new Set(birds.map((b) => b.id))
  const missingFromBirds = uniqueBirdIds.filter((id) => !knownBirdIdSet.has(id))

  console.log('\nUnique bird IDs in findings (count):', uniqueBirdIds.length)
  console.log(uniqueBirdIds)
  if (missingFromBirds.length) {
    console.log('\nBird IDs missing from functions/birds.js:')
    console.log(missingFromBirds)
  }

  // Compute stats (count + stars) the same way the function does
  const stats = computeYearStats(filteredByYear)
  console.log('\nComputed stats:')
  console.log({ findings: stats.findingsCount, stars: stats.stars })
  if (stats.unknownBirdIds.length) {
    console.log('\nWARNING: Unknown bird IDs (not found in functions/birds.js):')
    console.log(stats.unknownBirdIds)
  }

  // Fetch existing hiscore doc for comparison (if year provided)
  if (year) {
    const hisnap = await db
      .collection('hiscores')
      .where('user', '==', userId)
      .where('year', '==', year)
      .get()

    const hiscore = hisnap.docs[0] ? { id: hisnap.docs[0].id, ...hisnap.docs[0].data() } : null

    console.log('\nExisting hiscore:')
    console.log(hiscore || '(none)')

    if (hiscore) {
      console.log('\nDiff (existing vs computed):')
      console.log({
        existingFindings: hiscore.findings,
        computedFindings: stats.findingsCount,
        existingStars: hiscore.stars,
        computedStars: stats.stars
      })
    }
  }

  // Write findings to file
  const fnameYear = year ? year : 'all'
  const filename = `findings_${userId}_${fnameYear}.json`
  fs.writeFileSync(filename, JSON.stringify(filteredByYear, null, 2))
  console.log(`\nWrote ${filteredByYear.length} findings to ${filename}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


