import {combineReducers} from 'redux'
import {firebaseReducer} from 'react-redux-firebase'
import {firestoreReducer} from 'redux-firestore'

import birds from './birds'
import {scrollPosition, searchTerm, viewType} from './Birdex/BirdexRedux'
import {isMenuOpen} from './SideMenu/SideMenuRedux'

export const initialState = {
  birds,

  // ui
  birdexScrollPosition: 0,
  birdexSearchTerm: '',
  birdexViewType: 'grid', // [list, grid]
  isMenuOpen: false
}

export default combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  birds: (state = birds) => state,
  birdexScrollPosition: scrollPosition,
  birdexSearchTerm: searchTerm,
  birdexViewType: viewType,
  isMenuOpen
})
