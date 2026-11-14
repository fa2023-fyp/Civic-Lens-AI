export function themeReducer(state, action) {
  return action.type === 'set-theme' ? action.theme : state;
}
