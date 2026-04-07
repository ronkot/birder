import env from '../src/env'
import {writeFileSync, readFileSync, readdirSync} from 'fs'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')
const birds = require('../functions/birds')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const args = process.argv.slice(2)
const yearArg = args.find((a) => a.startsWith('--year=')) || args[args.indexOf('--year') + 1]
const YEAR = yearArg && !yearArg.startsWith('--') ? yearArg : args.find((a) => /^\d{4}$/.test(a))
const WRITE_MODE = args.includes('--write')
const LIST_WRONG_DELETIONS = args.includes('--list-wrong-deletions')
const FIX_WRONG_DELETIONS = args.includes('--fix-wrong-deletions')

if (!LIST_WRONG_DELETIONS && !FIX_WRONG_DELETIONS && !YEAR) {
  console.error('Usage: babel-node find-duplicate-findings.js --year <year> [--write]')
  console.error('       babel-node find-duplicate-findings.js --list-wrong-deletions')
  console.error('       babel-node find-duplicate-findings.js --fix-wrong-deletions')
  process.exit(1)
}

const DUPLICATES_FILE = `duplicates-${YEAR}.json`

// Finnish standard time is UTC+2. Year boundaries always fall in winter so a
// fixed +2h offset is safe (no DST ambiguity around Jan 1).
const FINNISH_OFFSET_MS = 2 * 60 * 60 * 1000

const getFinnishYear = (dateStr) =>
  new Date(new Date(dateStr).getTime() + FINNISH_OFFSET_MS)
    .getUTCFullYear()
    .toString()

// Finnish year YYYY starts at UTC "${YEAR-1}-12-31T22:00:00.000Z" and ends
// (exclusive) at "${YEAR}-12-31T22:00:00.000Z".
const yearStart = `${parseInt(YEAR) - 1}-12-31T22:00:00.000Z`
const yearEnd = `${YEAR}-12-31T22:00:00.000Z`

async function dryRun() {
  console.log(`Fetching findings for Finnish year ${YEAR} (${yearStart} – ${yearEnd})...`)

  const snapshot = await db
    .collection('findings')
    .where('date', '>=', yearStart)
    .where('date', '<', yearEnd)
    .get()

  const findings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))

  console.log(`Fetched ${findings.length} findings`)

  const grouped = _.groupBy(findings, (f) => {
    const year = f.date ? getFinnishYear(f.date) : YEAR
    return `${f.user}-${f.bird}-${year}`
  })

  const duplicateGroups = Object.entries(grouped)
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => {
      const sorted = _.sortBy(group, 'date')
      const [keep, ...deletions] = sorted
      return {
        key,
        keep: _.pick(keep, ['id', 'date', 'bird', 'user']),
        delete: deletions.map((f) => _.pick(f, ['id', 'date', 'bird', 'user']))
      }
    })

  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + g.delete.length, 0)

  console.log(`\nFound ${duplicateGroups.length} groups with duplicates`)
  console.log(`Total documents to delete: ${totalDuplicates}`)

  if (duplicateGroups.length > 0) {
    console.log('\nDuplicate groups:')
    for (const group of duplicateGroups) {
      console.log(`  ${group.key}`)
      console.log(`    keep:   ${group.keep.id} (${group.keep.date})`)
      for (const d of group.delete) {
        console.log(`    delete: ${d.id} (${d.date})`)
      }
    }
  }

  writeFileSync(DUPLICATES_FILE, JSON.stringify(duplicateGroups, null, 2))
  console.log(`\nDry run results saved to ${DUPLICATES_FILE}`)
  console.log(`Run with --write to delete the ${totalDuplicates} duplicate document(s)`)
}

async function write() {
  let duplicateGroups
  try {
    duplicateGroups = JSON.parse(readFileSync(DUPLICATES_FILE, 'utf8'))
  } catch {
    console.error(`Could not read ${DUPLICATES_FILE}. Run dry run first (without --write).`)
    process.exit(1)
  }

  const idsToDelete = duplicateGroups.flatMap((g) => g.delete.map((d) => d.id))

  if (idsToDelete.length === 0) {
    console.log('No duplicates to delete.')
    process.exit(0)
  }

  console.log(`Deleting ${idsToDelete.length} duplicate document(s) in batches...`)

  const BATCH_SIZE = 500
  let deleted = 0

  for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
    const chunk = idsToDelete.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    for (const id of chunk) {
      batch.delete(db.collection('findings').doc(id))
    }
    await batch.commit()
    deleted += chunk.length
    console.log(`Deleted ${deleted} / ${idsToDelete.length}`)
  }

  console.log('DONE')
}

function collectWrongDeletions() {
  const files = readdirSync('.').filter((f) => /^duplicates-\d{4}\.json$/.test(f))

  if (files.length === 0) {
    console.log('No duplicates-*.json files found.')
    return null
  }

  console.log(`Reading ${files.length} duplicates file(s): ${files.join(', ')}`)

  const wrongByUser = {}

  for (const file of files) {
    const groups = JSON.parse(readFileSync(file, 'utf8'))
    for (const group of groups) {
      const keyYear = group.key.split('-').pop()
      for (const deleted of group.delete) {
        const finnishYear = getFinnishYear(deleted.date)
        if (finnishYear !== keyYear) {
          if (!wrongByUser[deleted.user]) wrongByUser[deleted.user] = []
          wrongByUser[deleted.user].push({
            user: deleted.user,
            bird: deleted.bird,
            date: deleted.date,
            id: deleted.id,
            keyYear,
            finnishYear
          })
        }
      }
    }
  }

  return wrongByUser
}

async function listWrongDeletions() {
  const wrongByUser = collectWrongDeletions()
  if (!wrongByUser) return

  const userIds = Object.keys(wrongByUser)

  if (userIds.length === 0) {
    console.log('No wrong deletions found.')
    return
  }

  console.log(`\nFetching users from Firestore...`)
  const usersSnapshot = await db.collection('users').get()
  const usersById = {}
  usersSnapshot.forEach((doc) => {
    usersById[doc.id] = doc.data()
  })

  const getBirdName = (birdId) => {
    const bird = birds.find((b) => b.id === birdId)
    return bird ? bird.nameFi : birdId
  }

  console.log('\n=== Wrong deletions by user ===\n')

  for (const userId of userIds) {
    const user = usersById[userId]
    const email = user ? user.email || userId : userId
    console.log(`${email}:`)
    for (const entry of wrongByUser[userId]) {
      console.log(
        `  ${getBirdName(entry.bird)} (${entry.date})` +
        `  [key year: ${entry.keyYear}, Finnish year: ${entry.finnishYear}, doc: ${entry.id}]`
      )
    }
    console.log('')
  }

  const total = userIds.reduce((sum, uid) => sum + wrongByUser[uid].length, 0)
  console.log(`Total wrong deletions: ${total} across ${userIds.length} user(s)`)
}

async function fixWrongDeletions() {
  const wrongByUser = collectWrongDeletions()
  if (!wrongByUser) return

  const allWrong = Object.values(wrongByUser).flat()

  if (allWrong.length === 0) {
    console.log('No wrong deletions found.')
    return
  }

  console.log(`\nRe-creating ${allWrong.length} wrongly deleted finding(s) (without coordinates)...`)

  const BATCH_SIZE = 500
  let created = 0

  for (let i = 0; i < allWrong.length; i += BATCH_SIZE) {
    const chunk = allWrong.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    for (const entry of chunk) {
      const docRef = db.collection('findings').doc()
      batch.set(docRef, {
        user: entry.user,
        bird: entry.bird,
        date: entry.date
      })
    }
    await batch.commit()
    created += chunk.length
    console.log(`Created ${created} / ${allWrong.length}`)
  }

  console.log('DONE')
}

async function main() {
  if (LIST_WRONG_DELETIONS) {
    await listWrongDeletions()
  } else if (FIX_WRONG_DELETIONS) {
    await fixWrongDeletions()
  } else if (WRITE_MODE) {
    await write()
  } else {
    await dryRun()
  }
}

main().catch(console.error)
