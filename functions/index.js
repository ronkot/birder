const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')

admin.initializeApp()

const functionOptions = {
  maxInstances: 100
}

const topScores = require('./top-scores')
const updateProfile = require('./update-profile')
const sendFriendRequest = require('./send-friend-request')
const approveFriendRequest = require('./approve-friend-request')
const removeFriend = require('./remove-friend')
const finalizeNewProfile = require('./finalize-new-profile')
const backup = require('./backup')

exports.updateHiscores = functions
  .runWith(functionOptions)
  .firestore.document('findings/{findingId}')
  .onWrite(topScores)

exports.finalizeNewProfile = functions
  .runWith(functionOptions)
  .firestore.document('users/{userId}')
  .onCreate(finalizeNewProfile)

exports.updateProfile = functions
  .runWith(functionOptions)
  .https.onCall(updateProfile)
exports.sendFriendRequest = functions
  .runWith(functionOptions)
  .https.onCall(sendFriendRequest)
exports.approveFriendRequest = functions
  .runWith(functionOptions)
  .https.onCall(approveFriendRequest)
exports.removeFriend = functions
  .runWith(functionOptions)
  .https.onCall(removeFriend)

exports.backup = functions.pubsub.schedule('every monday 09:00').onRun(backup)
