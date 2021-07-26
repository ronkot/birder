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

  const { friendShortId } = data

  if (!friendShortId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Friend id missing'
    )
  }

  const userId = context.auth.uid

  const friendsResult = await db
    .collection('users')
    .where('shortId', '==', friendShortId)
    .get()

  if (friendsResult.size !== 1) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Friend not found with short id ' + friendShortId
    )
  }

  const friend = friendsResult.docs[0]

  if (userId === friend.id) {
    throw new functions.https.HttpsError('invalid-argument', 'Friend not found')
  }

  const user = await db
    .collection('users')
    .doc(userId)
    .get()

  const sentFriendRequest = await db
    .collection('users')
    .doc(userId)
    .collection('friends')
    .doc(friend.id)

  if ((await sentFriendRequest.get()).exists) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Friend already exists'
    )
  }

  await Promise.all([
    sentFriendRequest.create({
      state: 'request-sent',
      friendId: friend.id,
      friendName: friend.data().playerName
    }),
    db
      .collection('users')
      .doc(friend.id)
      .collection('friends')
      .doc(userId)
      .create({
        state: 'pending-approval',
        friendId: userId,
        friendName: user.data().playerName
      })
  ])

  return {
    success: true
  }
}
