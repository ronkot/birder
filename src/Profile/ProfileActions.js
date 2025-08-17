import { functions } from '../firebase/firebase'

const updateProfileFunction = functions.httpsCallable('updateProfile')

export async function updateProfile(values) {
  console.log('updateprofile', values)
  const res = await updateProfileFunction(values)
  console.log('Done', res)
  return res.data
}
