import firebase from './firebase'

const auth = firebase.auth()

export default {
  logout: () => auth.signOut()
}
