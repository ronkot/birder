import { firestoreConnect } from 'react-redux-firebase'

import { selectUser } from './selectors'
import { currentYear } from './utils'

export function listenFindings() {
  return firestoreConnect((props, store) => {
    const state = store.getState()
    const user = selectUser(state)
    return [
      {
        collection: 'findings',
        where: ['user', '==', user.uid]
      }
    ]
  })
}

export function listenHiScores() {
  return firestoreConnect([
    {
      collection: 'hiscores',
      where: ['year', '==', currentYear()]
    }
  ])
}
