export const initialDemoState = { toast: null };

export function demoReducer(state, action) {
  switch (action.type) {
    case 'toast':
      return { ...state, toast: action.message };
    case 'clear-toast':
      return { ...state, toast: null };
    default:
      return state;
  }
}
