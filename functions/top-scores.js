const admin = require('firebase-admin')

const birds = require('./birds')

const db = admin.firestore()

module.exports = async (change, context) => {
  console.log(JSON.stringify(change, null, 2))

  const document = change.after.exists
    ? change.after.data()
    : change.before.data()

  const { date, user } = document
  const year = new Date(date).getFullYear()

  await updateHiscores(year, user)
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
      const userObj = (await db
        .collection('users')
        .doc(user)
        .get()).data()
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
