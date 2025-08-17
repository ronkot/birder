const functions = require('firebase-functions/v1')
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

  await Promise.all([
    db
      .collection('users')
      .doc(userId)
      .collection('friends')
      .doc(friendId)
      .update({
        state: 'approved'
      }),
    db
      .collection('users')
      .doc(friendId)
      .collection('friends')
      .doc(userId)
      .update({
        state: 'approved'
      })
  ])

  return {
    success: true
  }
}
