import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DarussalamBottomNav } from '@/modules/darussalam/shared/components/BottomNav';
import { seedDarussalamIfEmpty } from '@/modules/darussalam/lib/seed';

const Home       = lazy(() => import('@/modules/darussalam/pages/Home'));
const Rooms      = lazy(() => import('@/modules/darussalam/pages/Rooms'));
const RoomDetail = lazy(() => import('@/modules/darussalam/pages/RoomDetail'));
const Capture    = lazy(() => import('@/modules/darussalam/pages/Capture'));
const IdeaDetail = lazy(() => import('@/modules/darussalam/pages/IdeaDetail'));
const ComingSoon = lazy(() => import('@/modules/darussalam/pages/ComingSoon'));

function PageFallback() {
  return <div className="min-h-screen bg-darussalam-bg" />;
}

export default function DarussalamApp() {
  useEffect(() => {
    seedDarussalamIfEmpty();
  }, []);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="room/:roomId" element={<RoomDetail />} />
        <Route path="capture" element={<Capture />} />
        <Route path="idea/:ideaId" element={<IdeaDetail />} />
        <Route path="inspiration" element={<ComingSoon title="Inspiration Board" />} />
        <Route path="more" element={<ComingSoon title="More" />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Routes>
      <DarussalamBottomNav />
    </Suspense>
  );
}
