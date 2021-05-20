import {combineReducers} from 'redux'
import {firebaseReducer} from 'react-redux-firebase'
import {firestoreReducer} from 'redux-firestore'

import birds from './birds'
import {
  scrollPosition,
  searchTerm,
  viewType,
  visibilityFilter
} from './Birdex/BirdexRedux'
import {isMenuOpen} from './SideMenu/SideMenuRedux'
import {currentYear} from './utils'
import {appReducer} from './AppRedux'

export const initialState = {
  birds,

  // ui
  birdexScrollPosition: 0,
  birdexSearchTerm: '',
  birdexViewType: 'grid', // [list, grid]
  birdexVisibilityFilter: 'all', // [seen, unseen]
  isMenuOpen: false,
  year: currentYear()
}

export default combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  birds: (state = birds) => state, // TODO: Move birds to firestore
  birdexScrollPosition: scrollPosition,
  birdexSearchTerm: searchTerm,
  birdexViewType: viewType,
  birdexVisibilityFilter: visibilityFilter,
  isMenuOpen,
  year,
  app: appReducer
})

// TODO: Move to own file
export const SET_YEAR = 'SET_YEAR'
function year(state = currentYear(), action) {
  switch (action.type) {
    case SET_YEAR:
      return action.year
    default:
      return state
  }
}
export function setYear(year) {
  return {
    type: SET_YEAR,
    year: year === 'all' ? 'all' : +year
  }
}
