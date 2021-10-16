const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const topScores = require('./top-scores')
const updateProfile = require('./update-profile')
const sendFriendRequest = require('./send-friend-request')
const approveFriendRequest = require('./approve-friend-request')
const removeFriend = require('./remove-friend')
const finalizeNewProfile = require('./finalize-new-profile')
const backup = require('./backup')

exports.updateHiscores = functions.firestore
  .document('findings/{findingId}')
  .onWrite(topScores)

exports.finalizeNewProfile = functions.firestore
  .document('users/{userId}')
  .onCreate(finalizeNewProfile)

exports.updateProfile = functions.https.onCall(updateProfile)
exports.sendFriendRequest = functions.https.onCall(sendFriendRequest)
exports.approveFriendRequest = functions.https.onCall(approveFriendRequest)
exports.removeFriend = functions.https.onCall(removeFriend)

exports.backup = functions.pubsub.schedule('every monday 09:00').onRun(backup)
