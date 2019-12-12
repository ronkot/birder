import {combineReducers} from 'redux'
import {firebaseReducer} from 'react-redux-firebase'
import {firestoreReducer} from 'redux-firestore'

import birds from './birds'
import {scrollPosition, searchTerm, viewType} from './Birdex/BirdexRedux'
import {isMenuOpen} from './SideMenu/SideMenuRedux'
import {currentYear} from './utils'

export const initialState = {
  birds,

  // ui
  birdexScrollPosition: 0,
  birdexSearchTerm: '',
  birdexViewType: 'grid', // [list, grid]
  isMenuOpen: false,
  year: currentYear(),
}

export default combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  birds: (state = birds) => state,
  birdexScrollPosition: scrollPosition,
  birdexSearchTerm: searchTerm,
  birdexViewType: viewType,
  isMenuOpen,
  year,
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
    year: year === 'all' ? 'all' : +year,
  }
}
