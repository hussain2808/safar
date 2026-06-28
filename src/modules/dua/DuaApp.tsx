import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/dua/shared/components/ErrorBoundary';
import { Skeleton } from '@/modules/dua/shared/components/Skeleton';
import { SyncStatusBanner } from '@/modules/dua/shared/components/SyncStatusBanner';
import { BottomNav } from '@/modules/dua/shared/components/BottomNav';

const Home      = lazy(() => import('@/modules/dua/pages/Home'));
const MyDuas    = lazy(() => import('@/modules/dua/pages/MyDuas'));
const Search    = lazy(() => import('@/modules/dua/pages/Search'));
const More      = lazy(() => import('@/modules/dua/pages/More'));
const DuaDetail = lazy(() => import('@/modules/dua/pages/DuaDetail'));

function PageFallback() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
    </div>
  );
}

const NAV_PATHS = ['/dua', '/dua/duas', '/dua/search', '/dua/more'];

function DuaBottomNav() {
  const { pathname } = useLocation();
  if (!NAV_PATHS.includes(pathname)) return null;
  return <BottomNav />;
}

export default function DuaApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="duas" element={<MyDuas />} />
          <Route path="search" element={<Search />} />
          <Route path="more" element={<More />} />
          <Route path="dua/:id" element={<DuaDetail />} />
        </Routes>
      </Suspense>
      <DuaBottomNav />
      <SyncStatusBanner />
    </ErrorBoundary>
  );
}
