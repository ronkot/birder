const admin = require('firebase-admin')

const birds = require('./birds')

const db = admin.firestore()

module.exports = async (change, context) => {
  console.log(JSON.stringify(change, null, 2))

  const deleted = !change.after.exists
  const document = deleted ? change.before.data() : change.after.data()

  const { date, user, bird } = document
  const year = new Date(date).getFullYear()

  await Promise.all([
    updateHiscores(year, user),
    updateLatestFindings(year, date, user, bird)
  ])
}

async function updateHiscores(year, user) {
  const findingsSnapshot = await db
    .collection('findings')
    .where('user', '==', user)
    .where('date', '>=', `${year}-01-01`)
    .where('date', '<', `${year + 1}-01-01`)
    .get()
  const findings = findingsSnapshot.docs.map(doc => doc.data())

  const getRarity = finding =>
    birds.find(bird => bird.id === finding.bird).rarity

  const starsCount = findings.reduce(
    (count, finding) => count + getRarity(finding),
    0
  )

  try {
    const snapshot = await db
      .collection('hiscores')
      .where('user', '==', user)
      .where('year', '==', year)
      .get()

    const userHiscore = snapshot.docs[0]

    if (!userHiscore) {
      const userObj = await getUser(user)
      console.log('userObj', userObj)

      const entry = {
        user,
        year,
        region: 'fi',
        findings: findings.length,
        stars: starsCount,
        playerName: userObj.playerName || ''
      }
      console.log('Adding hiscore', entry)
      await db.collection('hiscores').add(entry)
    } else {
      const update = {
        findings: findings.length,
        stars: starsCount
      }
      console.log('Updating hiscore', update)
      await db
        .collection('hiscores')
        .doc(userHiscore.id)
        .update(update)
    }
  } catch (err) {
    console.log(err)
  }
}

async function updateLatestFindings(year, date, user, bird) {
  const latestFindingSnapshot = await db
    .collection('latestFindings')
    .where('bird', '==', bird)
    .where('year', '>=', year)
    .get()
  const latestFinding = latestFindingSnapshot[0]

  console.log(`Latest finding for bird ${bird} on year ${year}`, latestFinding)

  if (!latestFinding) {
    const userObj = await getUser(user)
    const entry = {
      user,
      bird,
      year,
      region: 'fi',
      date,
      playerName: userObj.playerName || ''
    }
    console.log('Adding latest finding', entry)
    await db.collection('latestFindings').add(entry)
  } else {
    const latestFindingData = latestFinding.data()
    if (date >= latestFindingData.date) {
      console.log(
        `Was not latest finding for bird ${bird}: ${date}. Returning.`
      )
      return
    }
    const userObj = await getUser(user)
    const update = {
      user,
      date,
      playerName: userObj.playerName || ''
    }
    console.log('Updating latest finding', update)
    await db
      .collection('latestFindings')
      .doc(latestFinding.id)
      .update(update)
  }
}

async function getUser(userId) {
  const userDoc = await db
    .collection('users')
    .doc(userId)
    .get()
  return userDoc.data()
}
