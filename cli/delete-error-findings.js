import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const ERROR_TIMESTAMP = '2020-12-31T22:00:00.000Z'

async function main() {
  console.log('commented out for safety')
  // const snapshot = await db
  //   .collection('findings')
  //   .where('date', '=', ERROR_TIMESTAMP)
  //   .get()

  // const byUser = {}
  // snapshot.forEach(function(doc) {
  //   const data = doc.data()
  //   byUser[data.user] = byUser[data.user] || []
  //   if (byUser[data.user].includes(data.bird)) {
  //     console.log('ERROR: user', data.user, 'already has bird', data.bird)
  //     doc.ref.delete()
  //   } else {
  //     console.log('saving bird', data.bird, 'for user', data.user)
  //     byUser[data.user].push(data.bird)
  //   }
  // })
}

main()
