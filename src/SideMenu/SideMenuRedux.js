const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'

export function isMenuOpen(state = false, action) {
  if (action.type === OPEN_MENU) return true
  else if (action.type === CLOSE_MENU) return false
  else return state
}

export function openMenu() {
  return {
    type: OPEN_MENU
  }
}

export function closeMenu() {
  return {
    type: CLOSE_MENU
  }
}
