import {functions} from '../firebase/firebase'

export async function sendFriendRequest(friendId) {
  console.log('sendFriendRequest', friendId)
  const res = await functions.httpsCallable('sendFriendRequest')({friendId})
  console.log('sendFriendRequest done', res)
  return res.data
}
