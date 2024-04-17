import env from '../src/env'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const fs = require('fs')
const readline = require('readline/promises')
const {stdin: input, stdout: output} = require('process')

const rl = readline.createInterface({input, output})

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const userId = ''

async function main() {
  await deleteUser()
  await deleteFindings()
  await deleteHiscores()
  await deleteLatestFindings()
  process.exit(0)
}

async function deleteUser() {
  const userRef = db.collection('users').doc(userId)
  const user = await userRef.get()
  const userData = user.data()
  console.log('deleting user', userData)
  const res = await rl.question('Are you sure? (y/n)')
  if (res !== 'y') {
    return
  }
  fs.writeFileSync('deleted-user.json', JSON.stringify(userData, null, 2))
  userRef.delete()
  console.log('deleting user done')
}

async function deleteHiscores() {
  const scores = await db
    .collection('hiscores')
    .where('user', '=', userId)
    .get()
  console.log('deleting hiscores')
  scores.forEach(async (score) => {
    await score.ref.delete()
  })
  console.log('deleting hiscores done')
}

async function deleteFindings() {
  const scores = await db
    .collection('findings')
    .where('user', '=', userId)
    .get()
  console.log('deleting findings')
  scores.forEach(async (score) => {
    await score.ref.delete()
  })
  console.log('deleting findings done')
}

async function deleteLatestFindings() {
  const scores = await db
    .collection('latestFindings')
    .where('user', '=', userId)
    .get()
  console.log('deleting latestFindings')
  scores.forEach(async (score) => {
    await score.ref.delete()
  })
  console.log('deleting latestFindings done')
}

main()
