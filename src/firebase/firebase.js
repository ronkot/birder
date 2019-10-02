import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/functions'
import 'firebase/auth'

import env from '../env'

const config = {
  apiKey: env.firebaseApiKey,
  authDomain: env.authDomain,
  databaseURL: env.firestoreURL,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessageSenderId
}
firebase.initializeApp(config)

export const db = firebase.firestore()
db.enablePersistence()
  .then(() => {
    console.log('Offline support enabled')
  })
  .catch(function(err) {
    console.log('No offline support, error:', err.code)
  })

export const functions = firebase.functions()

export default firebase
