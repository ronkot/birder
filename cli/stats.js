import {writeFileSync, readFileSync} from 'fs'

import env from '../src/env'
import birds from '../src/birds'

const Firestore = require('@google-cloud/firestore')
const _ = require('lodash')

const db = new Firestore({
  projectId: env.firebaseProjectId,
  keyFilename: env.firebaseCredentialsFile
})

const YEAR = '2022'
const FINDINGS_FILE = `findings-${YEAR}.json`
const COORDINATES_FILE = `coordinates-${YEAR}.txt`

async function getData() {
  try {
    const data = readFileSync(FINDINGS_FILE)
    console.log('Read data from file')
    return JSON.parse(data)
  } catch {}
  console.log('Fetch data from db')
  const snapshot = await db
    .collection('findings')
    .where('date', '>=', `${YEAR}-01-01`)
    .get()
  const data = snapshot.docs.map((doc) => doc.data())
  writeFileSync(FINDINGS_FILE, JSON.stringify(data))
  return data
}

async function main() {
  const data = await getData()
  const byUser = _.groupBy(data, 'user')
  const users = Object.keys(byUser)

  console.log(users)

  console.log('')
  console.log(`${users.length} users this year`)
  console.log(`${data.length} logs this year`)
  console.log('')

  const byBird = _.groupBy(data, 'bird')
  const birdCounts = _.sortBy(
    Object.entries(byBird).map(([birdId, findings]) => [
      birds.find((bird) => bird.id === birdId).nameFi,
      findings.length
    ]),
    (item) => item[1]
  )

  console.log('birds by findings')
  console.log(birdCounts.map((row) => row.join(' ')).join('\n'))

  // Data for http://www1.heatmapper.ca/geocoordinate/
  const heatMapCoordinates = data
    .filter((item) => item.place && item.place.type === 'coordinates')
    .map((item) =>
      [
        item.place.coordinates._longitude,
        item.place.coordinates._latitude
      ].join('\t')
    )

  const byDay = _.groupBy(data, (f) =>
    new Date(f.date).toLocaleDateString('fi-FI')
  )
  const accData = [['pvm', 'lkm']]
  for (
    let d = new Date(YEAR, 0, 1);
    d <= new Date(YEAR, 11, 31);
    d.setDate(d.getDate() + 1)
  ) {
    const date = d.toLocaleDateString('fi-FI')
    const count = byDay[date]?.length ?? 0
    accData.push([date, count])
  }
  const histogramCsv = accData.map((row) => row.join(',')).join('\n')
  writeFileSync('histogram.csv', histogramCsv)

  console.log(`${heatMapCoordinates.length} logs with coordinate points`)
  writeFileSync(
    COORDINATES_FILE,
    `Longitude\tLatitude\n${heatMapCoordinates.join('\n')}`
  )
}

main()
