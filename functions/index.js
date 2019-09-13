const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const topScores = require('./top-scores')
const updateProfile = require('./update-profile')

exports.updateHiscores = functions.firestore
  .document('findings/{findingId}')
  .onWrite(topScores)

exports.updateProfile = functions.https.onCall(updateProfile)
