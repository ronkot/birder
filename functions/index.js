const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const topScores = require('./top-scores')
const updateProfile = require('./update-profile')
const sendFriendRequest = require('./send-friend-request')
const approveFriendRequest = require('./approve-friend-request')

exports.updateHiscores = functions.firestore
  .document('findings/{findingId}')
  .onWrite(topScores)

exports.updateProfile = functions.https.onCall(updateProfile)
exports.sendFriendRequest = functions.https.onCall(sendFriendRequest)
exports.approveFriendRequest = functions.https.onCall(approveFriendRequest)
