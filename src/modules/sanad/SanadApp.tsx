import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/sanad/shared/components/ErrorBoundary';
import { Skeleton } from '@/modules/sanad/shared/components/Skeleton';

const Home           = lazy(() => import('@/modules/sanad/pages/Home'));
const Documents      = lazy(() => import('@/modules/sanad/pages/Documents'));
const Search         = lazy(() => import('@/modules/sanad/pages/Search'));
const DocumentDetail = lazy(() => import('@/modules/sanad/pages/DocumentDetail'));

function PageFallback() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
    </div>
  );
}

export default function SanadApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="documents" element={<Documents />} />
          <Route path="search" element={<Search />} />
          <Route path="document/:id" element={<DocumentDetail />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
