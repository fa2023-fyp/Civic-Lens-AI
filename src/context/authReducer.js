export const initialAuthState = {
  user: null,
  token: null,
  expiresAt: null,
  sessionExpired: false,
  expiredDialogDismissed: false,
  expiredPath: null,
  expiredRole: null,
  expiredUserId: null,
};

export function authReducer(state, action) {
  switch (action.type) {
    case 'session':
      return {
        ...initialAuthState,
        user: action.session.user,
        token: action.session.token,
        expiresAt: action.session.expiresAt,
      };
    case 'session-expired':
      return {
        ...initialAuthState,
        sessionExpired: true,
        expiredPath: action.path,
        expiredRole: action.role,
        expiredUserId: action.userId,
      };
    case 'dismiss-expired-dialog':
      return { ...state, expiredDialogDismissed: true };
    case 'logout':
      return initialAuthState;
    default:
      return state;
  }
}
