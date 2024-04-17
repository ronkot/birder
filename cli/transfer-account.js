import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const fromId = ''

const toId = ''

// NOTE!! For some reason the previous time this script was used it didn't
// export ALL findings (year 2019 findigs were missing). Remember to
// double-check that all findings are exported!

async function main() {
  const findings = await db
    .collection('findings')
    .where('user', '=', fromId)
    .get()

  const batch = db.batch()

  const all = []

  findings.forEach(function(doc) {
    const oldFinding = doc.data()
    all.push(oldFinding)

    const newFinding = {
      ...oldFinding,
      user: toId
    }
    console.log('Adding new finding', newFinding)
    const newFindingDocRef = db.collection('findings').doc()
    batch.set(newFindingDocRef, newFinding)
  })

  const fs = require('fs')
  fs.writeFileSync('transferred-findings.json', JSON.stringify(all, null, 2))

  console.log('Findigngs length:', all.length)

  console.log('Saving')
  await batch.commit()
  console.log('DONE')

  await checkFindingsUpdated()
}

async function checkFindingsUpdated() {
  const originalFindings = await db
    .collection('findings')
    .where('user', '=', fromId)
    .get()

  const newFindings = await db
    .collection('findings')
    .where('user', '=', toId)
    .get()

  console.log({
    originalFindingsCount: originalFindings.docs.length,
    newFindingsCount: newFindings.docs.length
  })

  if (
    originalFindings.docs.length === 0 ||
    originalFindings.docs.length !== newFindings.docs.length
  ) {
    throw new Error('Something went wrong')
  }
}

main()
