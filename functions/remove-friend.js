const functions = require('firebase-functions')
const admin = require('firebase-admin')

const db = admin.firestore()

module.exports = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const { friendId } = data

  if (!friendId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Friend id missing'
    )
  }

  const userId = context.auth.uid

  console.log('User', userId, 'wants to remove friend', friendId)

  await Promise.all([
    db
      .collection('users')
      .doc(userId)
      .collection('friends')
      .doc(friendId)
      .delete(),
    db
      .collection('users')
      .doc(friendId)
      .collection('friends')
      .doc(userId)
      .delete()
  ])

  return {
    success: true
  }
}
