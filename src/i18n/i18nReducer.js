export const initialI18nState = { language: 'en', direction: 'ltr' };

export function i18nReducer(state, action) {
  switch (action.type) {
    case 'language':
      return { ...state, language: action.language, direction: action.direction };
    case 'direction':
      return { ...state, direction: action.direction };
    default:
      return state;
  }
}
