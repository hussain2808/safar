import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/nazara/shared/components/ErrorBoundary';
import { Skeleton } from '@/modules/nazara/shared/components/Skeleton';
import { SyncStatusBanner } from '@/modules/nazara/shared/components/SyncStatusBanner';
import './nazara.css';

const Home          = lazy(() => import('@/modules/nazara/pages/Home'));
const Timeline       = lazy(() => import('@/modules/nazara/pages/Timeline'));
const MemoryDetail  = lazy(() => import('@/modules/nazara/pages/MemoryDetail'));
const AddMemory      = lazy(() => import('@/modules/nazara/pages/AddMemory'));
const EditMemory     = lazy(() => import('@/modules/nazara/pages/EditMemory'));

function PageFallback() {
  return (
    <div style={{ padding: 24 }}>
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl mb-3" />)}
    </div>
  );
}

export default function NazaraApp() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#3D2E1F' }}>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="memory/:id" element={<MemoryDetail />} />
            <Route path="add" element={<AddMemory />} />
            <Route path="edit/:id" element={<EditMemory />} />
          </Routes>
        </Suspense>
        <SyncStatusBanner />
      </ErrorBoundary>
    </div>
  );
}
