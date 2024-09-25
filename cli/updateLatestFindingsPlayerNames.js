import env from '../src/env'

const Firestore = require('@google-cloud/firestore')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
  // projectId: 'demo-project',
  // port: 8080,
  // host: 'localhost',
  // ssl: false
})

async function updateLatestFindingsPlayerNames() {
  const latestFindingsSnapshot = await db.collection('latestFindings').get()
  const users = (await db.collection('users').get()).docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  }))

  const getUserName = (userId) =>
    users.find((u) => u.id === userId).playerName || ''

  const batch = db.batch()

  latestFindingsSnapshot.forEach((doc) => {
    const finding = doc.data()
    const currentPlayerName = finding.playerName
    const latestPlayerName = getUserName(finding.user)

    if (currentPlayerName !== latestPlayerName) {
      console.log(
        `Updating ${doc.id} player name from ${currentPlayerName} to ${latestPlayerName}`
      )
      batch.update(doc.ref, {playerName: latestPlayerName})
    }
  })

  console.log('Saving updates')
  await batch.commit()
  console.log('DONE')
}

updateLatestFindingsPlayerNames().catch(console.error)
