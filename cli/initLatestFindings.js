import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

console.log(env)

async function init() {
  const snapshot = await db
    .collection('findings')
    .where('date', '>=', '2019-01-01')
    .get()

  const data = snapshot.docs.map((doc) => doc.data())
  const byBird = _.groupBy(data, ({date, bird}) => {
    const year = date.slice(0, 4)
    return `${year}-${bird}`
  })

  const users = (await db.collection('users').get()).docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  }))

  const getUserName = (userId) =>
    users.find((u) => u.id === userId).playerName || ''

  const batch = db.batch()

  for (const [yearBird, findings] of Object.entries(byBird)) {
    const [year, bird] = yearBird.split('-')
    const first = _.minBy(findings, 'date')
    const entry = {
      user: first.user,
      bird: first.bird,
      year: parseInt(year),
      region: 'fi',
      date: first.date,
      playerName: getUserName(first.user)
    }
    console.log(
      `Adding first ${yearBird} of ${findings.length} findings:`,
      entry
    )
    const docRef = db.collection('latestFindings').doc()
    batch.set(docRef, entry)
  }

  console.log('Saving')
  await batch.commit()
  console.log('DONE')
}

init().catch(console.error)
