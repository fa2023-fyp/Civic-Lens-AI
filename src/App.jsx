import { BrowserRouter, useLocation } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ui/ToastProvider/ToastProvider.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { AppRoutes } from './routes.jsx';

function RouteView() {
  const location = useLocation();

  return (
    <AppShell>
      <div key={location.pathname} className="route-view anim-fade-up">
        <AppRoutes />
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <RouteView />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
