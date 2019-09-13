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

  const playerName = data.playerName

  if (!playerName || playerName.length > 20) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Player name has to be 1-20 characters long'
    )
  }

  const userId = context.auth.uid

  await checkForConflictingPlayerName(userId, playerName)

  const profileRef = db.collection('users').doc(userId)
  await profileRef.update({
    playerName,
    playerName_lowerCase: playerName.toLowerCase()
  })

  await updateUserTopScorePlayerNames(userId, playerName)

  return profileRef.get().then(r => r.data())
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
