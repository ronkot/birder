import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

console.log(env)

db.collection('findings')
  .where('date', '>=', '2019-01-01')
  .get()
  .then((snapshot) => {
    const data = snapshot.docs.map((doc) => doc.data())
    const byUser = _.groupBy(data, 'user')
    const users = Object.keys(byUser)

    console.log(users)

    console.log('')
    console.log(`${users.length} users this year`)
    console.log(`${snapshot.docs.length} logs this year`)
    console.log('')
    for (const [user, findings] of Object.entries(byUser)) {
      console.log(`${user}: ${findings.length}`)
    }
  })
  .catch((err) => {
    console.log('Error getting documents', err)
  })

// TODO: async/await
// Excel export
