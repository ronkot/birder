import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const birds = require('../functions/birds')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

// Defines how to handle validUntil/validFrom violations per bird ID.
// Set value to a replacement bird ID (string) to migrate the finding.
// Set value to null to delete the finding.
// Birds not listed here are reported but left untouched by --fix.
const VIOLATION_MIGRATIONS = {
  'b-4': 'b-374',  // Metsähanhi → Tundrametsähanhi
  'b-246': null,   // Amerikantavi → delete (no replacement)
}

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

async function cleanupLatestFindings(birdYears) {
  console.log('\nCleaning up stale latestFindings entries...')
  for (const { birdId, year } of birdYears) {
    const staleSnap = await db
      .collection('latestFindings')
      .where('bird', '==', birdId)
      .where('year', '==', year)
      .get()
    if (staleSnap.empty) {
      console.log(`  No stale latestFindings for ${birdId} / ${year}`)
    } else {
      for (const doc of staleSnap.docs) {
        await doc.ref.delete()
        console.log(`  Deleted stale latestFindings ${doc.id} (${birdId} / ${year})`)
      }
    }
  }
}

async function main() {
  const fix = process.argv.includes('--fix')
  const cleanupOnly = process.argv.includes('--cleanup-latest-findings')
  console.log('Project:', env.firebaseProjectId)
  if (fix) console.log('Mode: FIX (migrate findings + clean up latestFindings)')
  if (cleanupOnly) console.log('Mode: CLEANUP latestFindings only')

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
    snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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

  const allBirdsById = {}
  birds.forEach((b) => { allBirdsById[b.id] = b })

  const violations = []
  for (const finding of findings) {
    const year = getYear(finding.date)
    if (!year) continue
    const bird = birdsById[finding.bird]
    const reason = checkViolation(bird, year)
    if (reason) {
      const replacementId = VIOLATION_MIGRATIONS[finding.bird]
      violations.push({
        findingId: finding.id,
        finding,
        userName: userNames[finding.user] || finding.user,
        userId: finding.user,
        birdId: finding.bird,
        birdNameFi: bird ? bird.nameFi : '(unknown)',
        timestamp: typeof finding.date === 'string' ? finding.date : finding.date?.toDate?.()?.toISOString?.() || String(finding.date),
        reason,
        replacementId,
        replacementNameFi: replacementId && allBirdsById[replacementId] ? allBirdsById[replacementId].nameFi : null
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
  console.log('userName | userId | birdId | birdNameFi | timestamp | reason | fix')
  console.log('-'.repeat(100))
  for (const v of violations) {
    const fixLabel = !(v.birdId in VIOLATION_MIGRATIONS)
      ? 'not configured'
      : v.replacementId
        ? `→ ${v.replacementId} (${v.replacementNameFi})`
        : 'delete'
    console.log(`${v.userName} | ${v.userId} | ${v.birdId} | ${v.birdNameFi} | ${v.timestamp} | ${v.reason} | ${fixLabel}`)
  }

  if (!fix && !cleanupOnly) {
    console.log('\nRun with --fix to migrate/delete findings and clean up latestFindings.')
    console.log('Run with --cleanup-latest-findings to only remove stale latestFindings entries.')
    return
  }

  // Collect all affected bird+year pairs for latestFindings cleanup
  const affectedBirdYears = [
    ...new Map(
      violations.map((v) => {
        const year = new Date(v.timestamp).getFullYear()
        return [`${v.birdId}|${year}`, { birdId: v.birdId, year }]
      })
    ).values()
  ]

  if (cleanupOnly) {
    await cleanupLatestFindings(affectedBirdYears)
    console.log('Done.')
    return
  }

  // --fix: only act on violations explicitly listed in VIOLATION_MIGRATIONS
  const configured = violations.filter((v) => v.birdId in VIOLATION_MIGRATIONS)
  const notConfigured = violations.filter((v) => !(v.birdId in VIOLATION_MIGRATIONS))

  if (notConfigured.length > 0) {
    console.log(`\nSkipping ${notConfigured.length} violation(s) not listed in VIOLATION_MIGRATIONS.`)
  }

  const migratable = configured.filter((v) => v.replacementId)
  const deletable = configured.filter((v) => !v.replacementId)

  if (migratable.length === 0 && deletable.length === 0) {
    console.log('\nNothing to fix.')
    return
  }


  if (migratable.length > 0) {
    console.log(`\nMigrating ${migratable.length} finding(s)...`)
    for (const v of migratable) {
      await db.collection('findings').doc(v.findingId).update({ bird: v.replacementId })
      console.log(`  Updated ${v.findingId}: ${v.birdId} (${v.birdNameFi}) → ${v.replacementId} (${v.replacementNameFi}) [${v.userName}]`)
    }
  }

  if (deletable.length > 0) {
    console.log(`\nDeleting ${deletable.length} finding(s) with no migration...`)
    for (const v of deletable) {
      await db.collection('findings').doc(v.findingId).delete()
      console.log(`  Deleted ${v.findingId}: ${v.birdId} (${v.birdNameFi}) [${v.userName}] ${v.timestamp}`)
    }
  }

  await cleanupLatestFindings(affectedBirdYears)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
