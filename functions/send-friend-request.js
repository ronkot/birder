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

  const friendsResult = await db
    .collection('users')
    .where('shortId', '==', friendId)
    .get()

  if (friendsResult.size !== 1) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Friend not found with id ' + friendId
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

  await db
    .collection('users')
    .doc(userId)
    .collection('friends')
    .doc(friend.id)
    .create({
      state: 'request-sent',
      friendId: friend.id,
      friendName: friend.data().playerName
    })

  await db
    .collection('users')
    .doc(friend.id)
    .collection('friends')
    .doc(userId)
    .create({
      state: 'pending-approval',
      friendId: userId,
      friendName: user.data().playerName
    })

  return {
    success: true
  }

  // await checkForConflictingPlayerName(userId, playerName)

  // const profileRef = db.collection('users').doc(userId)
  // await profileRef.update({
  //   playerName,
  //   playerName_lowerCase: playerName.toLowerCase()
  // })

  // await updateUserTopScorePlayerNames(userId, playerName)

  // return profileRef.get().then(r => r.data())
}

async function updateUserTopScorePlayerNames(userId, playerName) {
  const hiscoresSnapshot = await db
    .collection('hiscores')
    .where('user', '==', userId)
    .get()

  for (const hiscore of hiscoresSnapshot.docs) {
    console.log('updating hiscore', hiscore.id, 'player name to ', playerName)
    await db
      .collection('hiscores')
      .doc(hiscore.id)
      .update({
        playerName
      })
  }
}

async function checkForConflictingPlayerName(userId, playerName) {
  const usersWithSamePlayerName = await db
    .collection('users')
    .where('playerName_lowerCase', '==', playerName.toLowerCase())
    .get()

  usersWithSamePlayerName.docs.forEach(userWithSamePlayerName => {
    if (userWithSamePlayerName.id !== userId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Name ${playerName} is already reserved`
      )
    }
  })
}
