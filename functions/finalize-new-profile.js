const admin = require('firebase-admin')

const db = admin.firestore()

module.exports = async (change, context) => {
  const userDocumentId = context.params.userId

  console.log('finalize-new-profile start', { userId: userDocumentId })

  const update = {
    shortId: generateShortId()
  }

  console.log('update', update)

  await db
    .collection('users')
    .doc(userDocumentId)
    .update(update)
}

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

module.exports.generateShortId = generateShortId
