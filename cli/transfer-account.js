import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const fromId = ''

const toId = ''

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

  console.log('Saving')
  await batch.commit()
  console.log('DONE')
}

main()
