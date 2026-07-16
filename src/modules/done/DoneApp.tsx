import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/done/shared/components/ErrorBoundary';
import { Skeleton } from '@/modules/done/shared/components/Skeleton';
import { SyncStatusBanner } from '@/modules/done/shared/components/SyncStatusBanner';

const Home = lazy(() => import('@/modules/done/pages/Home'));
const AllHabits = lazy(() => import('@/modules/done/pages/AllHabits'));
const Progress = lazy(() => import('@/modules/done/pages/Progress'));
const AddHabit = lazy(() => import('@/modules/done/pages/AddHabit'));
const HabitDetail = lazy(() => import('@/modules/done/pages/HabitDetail'));
const Archive = lazy(() => import('@/modules/done/pages/Archive'));
const Search = lazy(() => import('@/modules/done/pages/Search'));

function PageFallback() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
    </div>
  );
}

export default function DoneApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="habits" element={<AllHabits />} />
          <Route path="progress" element={<Progress />} />
          <Route path="add" element={<AddHabit />} />
          <Route path="habit/:id" element={<HabitDetail />} />
          <Route path="habit/:id/edit" element={<AddHabit />} />
          <Route path="archive" element={<Archive />} />
          <Route path="search" element={<Search />} />
        </Routes>
      </Suspense>
      <SyncStatusBanner />
    </ErrorBoundary>
  );
}
