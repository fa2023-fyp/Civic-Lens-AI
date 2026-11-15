import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ui/ToastProvider/ToastProvider.jsx';
import { RouteView } from './routes.jsx';

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <RouteView />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
