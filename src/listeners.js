import {firestoreConnect} from 'react-redux-firebase'

import {selectUser} from './selectors'

export const listenFindings = firestoreConnect((props, store) => {
  const year = props.year
  const nextYear = year + 1
  const user = selectUser(store.getState())
  const where = [['user', '==', user.uid]]
  if (year !== 'all') {
    where.push(['date', '>=', `${year}-01-01`])
    where.push(['date', '<', `${nextYear}-01-01`])
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
