const SET_BIRDEX_SCROLL_POSITION = 'SET_BIRDEX_SCROLL_POSITION'
const SET_BIRDEX_SEARCH_TERM = 'SET_BIRDEX_SEARCH_TERM'
const SET_BIRDEX_VIEW_TYPE = 'SET_BIRDEX_VOEW_TYPE'

export const setScrollPosition = (position) => ({
  type: SET_BIRDEX_SCROLL_POSITION,
  position
})

export const scrollPosition = (state = 0, action) => {
  if (action.type === SET_BIRDEX_SCROLL_POSITION) return action.position
  else return state
}

export const setSearchTerm = (term) => ({
  type: SET_BIRDEX_SEARCH_TERM,
  term
})

export const searchTerm = (state = '', action) => {
  if (action.type === SET_BIRDEX_SEARCH_TERM) return action.term
  else return state
}

export const setViewType = (view) => ({
  type: SET_BIRDEX_VIEW_TYPE,
  view
})

export const viewType = (state = 'grid', action) => {
  if (action.type === SET_BIRDEX_VIEW_TYPE) return action.view
  else return state
}
