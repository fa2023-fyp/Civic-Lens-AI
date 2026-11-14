export const initialAuthState = { session: null };

export function authReducer(state, action) {
  switch (action.type) {
    case 'session':
      return { ...state, session: action.session };
    case 'logout':
      return { ...state, session: null };
    default:
      return state;
  }
}
