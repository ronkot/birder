import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

// process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

const db = new Firestore({
  // projectId: 'foo'
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

async function init() {
  const userDocs = await db
    .collection('users')
    // .where('email', '==', 'jaakko.k.juvonen@gmail.com')
    .get()

  const userIds = userDocs.docs.map((doc) => doc.id)

  for (const userId of userIds) {
    const update = {
      shortId: generateShortId()
    }

    console.log('Updating user', userId, 'short id to', update.shortId)

    await db
      .collection('users')
      .doc(userId)
      .update(update)
  }
  console.log('DONE')
}

init().catch(console.error)

function generateShortId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charsLength = chars.length
  const idLength = 8

  let shortId = ''
  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * charsLength)
    shortId += chars[randomIndex]
  }
  return shortId
}
