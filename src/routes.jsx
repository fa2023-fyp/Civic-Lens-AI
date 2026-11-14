import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BrandLoader } from './components/ui/BrandLoader/BrandLoader.jsx';

const TokenPreview = lazy(() => import('./pages/dev/TokenPreview.jsx'));
const UIGallery = import.meta.env.DEV ? lazy(() => import('./pages/dev/UIGallery.jsx')) : null;

export function AppRoutes() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dev/tokens" replace />} />
        <Route path="/dev/tokens" element={<TokenPreview />} />
        {import.meta.env.DEV && UIGallery ? <Route path="/dev/ui" element={<UIGallery />} /> : null}
        <Route path="*" element={<Navigate to="/dev/tokens" replace />} />
      </Routes>
    </Suspense>
  );
}
