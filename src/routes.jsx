import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BrandedLoader } from './components/ui/BrandedLoader.jsx';

const TokenPreview = lazy(() => import('./pages/dev/TokenPreview.jsx'));

export function AppRoutes() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dev/tokens" replace />} />
        <Route path="/dev/tokens" element={<TokenPreview />} />
        <Route path="*" element={<Navigate to="/dev/tokens" replace />} />
      </Routes>
    </Suspense>
  );
}
