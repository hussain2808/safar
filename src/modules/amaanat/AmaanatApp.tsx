import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/amaanat/shared/components/ErrorBoundary';
import { ItemCardSkeleton } from '@/modules/amaanat/shared/components/Skeleton';
import { SyncStatusBanner } from '@/modules/amaanat/shared/components/SyncStatusBanner';

const Home       = lazy(() => import('@/modules/amaanat/pages/Home'));
const ItemDetail = lazy(() => import('@/modules/amaanat/pages/ItemDetail'));
const Search     = lazy(() => import('@/modules/amaanat/pages/Search'));

function PageFallback() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)}
    </div>
  );
}

export default function AmaanatApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="item/:id"   element={<ItemDetail />} />
          <Route path="search"     element={<Search />} />
        </Routes>
      </Suspense>
      <SyncStatusBanner />
    </ErrorBoundary>
  );
}
