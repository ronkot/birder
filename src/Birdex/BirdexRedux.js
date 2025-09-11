const SET_BIRDEX_SCROLL_POSITION = 'SET_BIRDEX_SCROLL_POSITION'
const SET_BIRDEX_SEARCH_TERM = 'SET_BIRDEX_SEARCH_TERM'
const SET_BIRDEX_VIEW_TYPE = 'SET_BIRDEX_VOEW_TYPE'
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'
const SET_SORT_BY = 'SET_SORT_BY'
const SET_SORT_ORDER = 'SET_SORT_ORDER'

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

export const setVisibilityFilter = (filter) => ({
  type: SET_VISIBILITY_FILTER,
  filter
})

export const visibilityFilter = (state = 'all', action) => {
  if (action.type === SET_VISIBILITY_FILTER) return action.filter
  else return state
}

export const setSortBy = (sortBy) => ({
  type: SET_SORT_BY,
  sortBy
})

export const sortBy = (state = 'name', action) => {
  if (action.type === SET_SORT_BY) return action.sortBy
  else return state
}

export const setSortOrder = (order) => ({
  type: SET_SORT_ORDER,
  order
})

export const sortOrder = (state = 'asc', action) => {
  if (action.type === SET_SORT_ORDER) return action.order
  else return state
}
