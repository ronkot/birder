// Use Firebase v9 compat mode for react-redux-firebase v3 compatibility
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import 'firebase/compat/functions'
import 'firebase/compat/database'

import env from '../env'

const config = {
  apiKey: env.firebaseApiKey,
  authDomain: env.authDomain,
  databaseURL: env.firestoreURL,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessageSenderId
}

// Initialize Firebase app
firebase.initializeApp(config)

// Initialize services using compat mode
export const db = firebase.firestore()
export const auth = firebase.auth()
export const functions = firebase.functions()
export const database = firebase.database()

// Use firebase emulator during development
if (window.location.hostname === 'localhost') {
  console.log('Using firebase emulator')

  try {
    db.useEmulator('localhost', 8080)
    functions.useEmulator('localhost', 5001)
  } catch (error) {
    console.log('Emulator already connected:', error.message)
  }
}

// Enable offline persistence in compat mode
db.enablePersistence()
  .then(() => {
    console.log('Offline support enabled')
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.log('Persistence not available')
    } else {
      console.log('No offline support, error:', err.code)
    }
  })

console.log('Firebase v9 compat mode initialized')

// Export the firebase object for react-redux-firebase compatibility
export default firebase
