const VIEW_FRIEND = 'VIEW_FRIEND'
const VIEW_OWN = 'VIEW_OWN'

export const ViewStates = {
  own: 'own',
  friends: 'friends'
}

const initialState = {
  view: ViewStates.own,
  friendId: null
}

export function appReducer(state = initialState, action) {
  if (action.type === VIEW_FRIEND) {
    return {
      view: ViewStates.friends,
      friendId: action.payload.friendId
    }
  } else if (action.type === VIEW_OWN) {
    return {
      view: ViewStates.own
    }
  }
  return state
}

export const viewFriend = (friendId, history) => (dispatch) => {
  document.documentElement.style.setProperty('--color-background', '#cacf7b')
  dispatch({
    type: VIEW_FRIEND,
    payload: {
      friendId
    }
  })
  history.push('/birdex')
}

export function viewOwn() {
  document.documentElement.style.setProperty('--color-background', '#80bd9e')
  return {
    type: VIEW_OWN
  }
}
