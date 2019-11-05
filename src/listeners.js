import {firestoreConnect} from 'react-redux-firebase'

import {selectUser} from './selectors'

export const listenFindings = firestoreConnect((props, store) => {
  const state = store.getState()
  const year = state.year
  const nextYear = year + 1
  const user = selectUser(state)
  console.log('listenFindings', year, user.uid)
  return [
    {
      collection: 'findings',
      where: [
        ['user', '==', user.uid],
        ['date', '>=', `${year}-01-01`],
        ['date', '<', `${nextYear}-01-01`]
      ]
    }
  ]
})

export const listenHiScores = firestoreConnect((props, store) => {
  const state = store.getState()
  const year = state.year
  return [
    {
      collection: 'hiscores',
      where: ['year', '==', year]
    }
  ]
})
