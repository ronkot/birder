import toast from 'react-hot-toast'
import {functions} from '../firebase/firebase'

export async function sendFriendRequest(friendShortId) {
  console.log('sendFriendRequest', friendShortId)
  const res = await functions.httpsCallable('sendFriendRequest')({
    friendShortId
  })
  console.log('sendFriendRequest done', res)
  return res.data
}

export async function approveFriendRequest(friendId) {
  console.log('approveFriend', friendId)
  const res = await functions.httpsCallable('approveFriendRequest')({
    friendId
  })
  console.log('approveFriend done', res)
  return res.data
}

export async function removeFriend(friendId) {
  console.log('removeFriend', friendId)
  try {
    const res = await functions.httpsCallable('removeFriend')({
      friendId
    })
    console.log('removeFriend done', res)
    return res.data
  } catch (err) {
    toast.error('Poistaminen epäonnistui. Virhe: ' + err.message)
  }
}
