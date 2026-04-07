import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const birds = require('../functions/birds')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

function getYear(dateField) {
  if (!dateField) return null
  const d = typeof dateField === 'string' ? new Date(dateField)
    : dateField.toDate ? dateField.toDate()
    : dateField instanceof Date ? dateField
    : null
  return d ? d.getFullYear() : null
}

function checkViolation(bird, year) {
  if (!bird) return 'unknown bird'
  if (bird.validUntil && year > bird.validUntil) return `after validUntil (${bird.validUntil})`
  if (bird.validFrom && year < bird.validFrom) return `before validFrom (${bird.validFrom})`
  return null
}

async function main() {
  console.log('Project:', env.firebaseProjectId)

  const birdsWithValidity = birds.filter((b) => b.validUntil || b.validFrom)
  const validityBirdIds = new Set(birdsWithValidity.map((b) => b.id))
  console.log(`Birds with validity constraints: ${birdsWithValidity.map((b) => `${b.id} (${b.nameFi})`).join(', ')}`)

  if (validityBirdIds.size === 0) {
    console.log('No birds with validity constraints found.')
    return
  }

  console.log(`\nFetching findings for ${validityBirdIds.size} bird(s) with validity constraints...`)
  const findingsByBird = await Promise.all(
    Array.from(validityBirdIds).map((birdId) =>
      db.collection('findings').where('bird', '==', birdId).get()
    )
  )
  const findings = findingsByBird.flatMap((snap) =>
    snap.docs.map((d) => ({id: d.id, ...d.data()}))
  )
  console.log(`Total findings for constrained birds: ${findings.length}`)

  console.log('Fetching user profiles...')
  const usersSnap = await db.collection('users').get()
  const userNames = {}
  usersSnap.forEach((doc) => {
    const data = doc.data()
    userNames[doc.id] = data.displayName || data.name || doc.id
  })

  const birdsById = {}
  birdsWithValidity.forEach((b) => { birdsById[b.id] = b })

  const violations = []
  for (const finding of findings) {
    const year = getYear(finding.date)
    if (!year) continue
    const bird = birdsById[finding.bird]
    const reason = checkViolation(bird, year)
    if (reason) {
      violations.push({
        userName: userNames[finding.user] || finding.user,
        userId: finding.user,
        birdId: finding.bird,
        birdNameFi: bird ? bird.nameFi : '(unknown)',
        timestamp: typeof finding.date === 'string' ? finding.date : finding.date?.toDate?.()?.toISOString?.() || String(finding.date),
        reason
      })
    }
  }

  violations.sort((a, b) => {
    if (a.userId < b.userId) return -1
    if (a.userId > b.userId) return 1
    return a.timestamp.localeCompare(b.timestamp)
  })

  if (violations.length === 0) {
    console.log('\nNo validity violations found.')
    return
  }

  console.log(`\nFound ${violations.length} violation(s):\n`)
  console.log('userName | userId | birdId | birdNameFi | timestamp | reason')
  console.log('-'.repeat(90))
  for (const v of violations) {
    console.log(`${v.userName} | ${v.userId} | ${v.birdId} | ${v.birdNameFi} | ${v.timestamp} | ${v.reason}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
