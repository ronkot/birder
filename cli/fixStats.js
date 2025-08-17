import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

// Import birds data for rarity calculations
const birds = require('../functions/birds')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const YEAR = 2025

console.log('Starting stats fix for year', YEAR)
console.log('Using environment:', env)

async function fixStats() {
  console.log('\n=== Step 1: Getting all data ===')

  // Get all findings for 2025
  const findingsSnapshot = await db
    .collection('findings')
    .where('date', '>=', `${YEAR}-01-01`)
    .where('date', '<', `${YEAR + 1}-01-01`)
    .get()

  const findings = findingsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  }))

  console.log(`Found ${findings.length} findings for ${YEAR}`)

  // Get all users
  const usersSnapshot = await db.collection('users').get()
  const users = usersSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  }))

  console.log(`Found ${users.length} users`)

  // Get existing hiscores for 2025 (to delete them)
  const existingHiscoresSnapshot = await db
    .collection('hiscores')
    .where('year', '==', YEAR)
    .get()

  console.log(`Found ${existingHiscoresSnapshot.docs.length} existing hiscores for ${YEAR}`)

  // Get existing latestFindings for 2025 (to delete them)
  const existingLatestFindingsSnapshot = await db
    .collection('latestFindings')
    .where('year', '==', YEAR)
    .get()

  console.log(`Found ${existingLatestFindingsSnapshot.docs.length} existing latestFindings for ${YEAR}`)

  console.log('\n=== Step 2: Deleting existing data ===')

  // Delete existing hiscores and latestFindings for 2025
  const deleteBatch = db.batch()

  existingHiscoresSnapshot.docs.forEach(doc => {
    deleteBatch.delete(doc.ref)
  })

  existingLatestFindingsSnapshot.docs.forEach(doc => {
    deleteBatch.delete(doc.ref)
  })

  if (existingHiscoresSnapshot.docs.length > 0 || existingLatestFindingsSnapshot.docs.length > 0) {
    console.log('Deleting existing data...')
    await deleteBatch.commit()
    console.log('Existing data deleted')
  }

  console.log('\n=== Step 3: Calculating new hiscores ===')

  await fixHiscores(findings, users)

  console.log('\n=== Step 4: Calculating new latestFindings ===')

  await fixLatestFindings(findings, users)

  console.log('\n=== STATS FIX COMPLETED ===')
}

async function fixHiscores(findings, users) {
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.playerName || '' : ''
  }

  const getRarity = (birdId) => {
    const bird = birds.find(bird => bird.id === birdId)
    return bird ? bird.rarity : 0
  }

  // Group findings by user
  const findingsByUser = _.groupBy(findings, 'user')

  let batch = db.batch()
  let batchCount = 0
  const BATCH_SIZE = 500

  for (const [userId, userFindings] of Object.entries(findingsByUser)) {
    const starsCount = userFindings.reduce((count, finding) => {
      return count + getRarity(finding.bird)
    }, 0)

    const hiscoreEntry = {
      user: userId,
      year: YEAR,
      region: 'fi',
      findings: userFindings.length,
      stars: starsCount,
      playerName: getUserName(userId)
    }

    console.log(`Adding hiscore for ${hiscoreEntry.playerName || userId}: ${hiscoreEntry.findings} findings, ${hiscoreEntry.stars} stars`)

    const docRef = db.collection('hiscores').doc()
    batch.set(docRef, hiscoreEntry)
    batchCount++

    // Commit batch when it reaches the limit
    if (batchCount >= BATCH_SIZE) {
      console.log(`Committing batch of ${batchCount} hiscores...`)
      await batch.commit()
      batch = db.batch() // Create new batch after commit
      batchCount = 0
    }
  }

  // Commit remaining items
  if (batchCount > 0) {
    console.log(`Committing final batch of ${batchCount} hiscores...`)
    await batch.commit()
  }

  console.log(`✅ Fixed hiscores for ${Object.keys(findingsByUser).length} users`)
}

async function fixLatestFindings(findings, users) {
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.playerName || '' : ''
  }

  // Group findings by bird to find the earliest (latest = first to find)
  const findingsByBird = _.groupBy(findings, 'bird')

  let batch = db.batch()
  let batchCount = 0
  const BATCH_SIZE = 500

  for (const [birdId, birdFindings] of Object.entries(findingsByBird)) {
    // Find the earliest finding for this bird
    const earliestFinding = _.minBy(birdFindings, 'date')

    const latestFindingEntry = {
      user: earliestFinding.user,
      bird: birdId,
      year: YEAR,
      region: 'fi',
      date: earliestFinding.date,
      playerName: getUserName(earliestFinding.user)
    }

    console.log(`Adding latest finding for bird ${birdId}: ${latestFindingEntry.playerName || latestFindingEntry.user} on ${latestFindingEntry.date}`)

    const docRef = db.collection('latestFindings').doc()
    batch.set(docRef, latestFindingEntry)
    batchCount++

    // Commit batch when it reaches the limit
    if (batchCount >= BATCH_SIZE) {
      console.log(`Committing batch of ${batchCount} latestFindings...`)
      await batch.commit()
      batch = db.batch() // Create new batch after commit
      batchCount = 0
    }
  }

  // Commit remaining items
  if (batchCount > 0) {
    console.log(`Committing final batch of ${batchCount} latestFindings...`)
    await batch.commit()
  }

  console.log(`✅ Fixed latestFindings for ${Object.keys(findingsByBird).length} birds`)
}

fixStats().catch(console.error)