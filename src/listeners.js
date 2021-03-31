import {firestoreConnect} from 'react-redux-firebase'
import moment from 'moment'

import {selectUser} from './selectors'

export const listenFindings = firestoreConnect((props, store) => {
  const year = props.year
  const nextYear = year + 1
  const user = selectUser(store.getState())
  const where = [['user', '==', user.uid]]
  if (year !== 'all') {
    where.push([
      'date',
      '>=',
      moment()
        .year(year)
        .startOf('year')
        .toISOString()
    ])
    where.push([
      'date',
      '<',
      moment()
        .year(nextYear)
        .startOf('year')
        .toISOString()
    ])
  }

  return [
    {
      collection: 'findings',
      where
    }
  ]
})

export const listenHiScores = firestoreConnect((props) => {
  const year = props.year
  const where = []
  if (year !== 'all') {
    where.push(['year', '==', year])
  }
  return [
    {
      collection: 'hiscores',
      where
    }
  ]
})

export const listenLatestFindings = firestoreConnect((props) => {
  const year = props.year
  const where = []
  if (year !== 'all') {
    where.push(['year', '==', year])
  }
  return [
    {
      collection: 'latestFindings',
      where
    }
  ]
})

export const listenFriends = firestoreConnect((props) => {
  console.log('listenFriends', `users/${props.user.uid}/friends`)
  return [
    {
      collection: `users/${props.user.uid}/friends`
    }
  ]
})
