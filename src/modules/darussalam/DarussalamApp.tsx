import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DarussalamBottomNav } from '@/modules/darussalam/shared/components/BottomNav';
import { cleanupLegacySeedData } from '@/modules/darussalam/lib/cleanupLegacySeed';

const Home             = lazy(() => import('@/modules/darussalam/pages/Home'));
const Rooms            = lazy(() => import('@/modules/darussalam/pages/Rooms'));
const AddRoom           = lazy(() => import('@/modules/darussalam/pages/AddRoom'));
const RoomDetail       = lazy(() => import('@/modules/darussalam/pages/RoomDetail'));
const Capture          = lazy(() => import('@/modules/darussalam/pages/Capture'));
const IdeaDetail       = lazy(() => import('@/modules/darussalam/pages/IdeaDetail'));
const InspirationBoard = lazy(() => import('@/modules/darussalam/pages/InspirationBoard'));
const VisionBoard      = lazy(() => import('@/modules/darussalam/pages/VisionBoard'));
const Decisions        = lazy(() => import('@/modules/darussalam/pages/Decisions'));
const Wishlist         = lazy(() => import('@/modules/darussalam/pages/Wishlist'));
const Documents        = lazy(() => import('@/modules/darussalam/pages/Documents'));
const Search           = lazy(() => import('@/modules/darussalam/pages/Search'));
const Settings         = lazy(() => import('@/modules/darussalam/pages/Settings'));
const More             = lazy(() => import('@/modules/darussalam/pages/More'));

function PageFallback() {
  return <div className="min-h-screen bg-darussalam-bg" />;
}

export default function DarussalamApp() {
  useEffect(() => {
    cleanupLegacySeedData();
  }, []);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="room/new" element={<AddRoom />} />
        <Route path="room/:roomId" element={<RoomDetail />} />
        <Route path="capture" element={<Capture />} />
        <Route path="idea/:ideaId" element={<IdeaDetail />} />
        <Route path="inspiration" element={<InspirationBoard />} />
        <Route path="vision" element={<VisionBoard />} />
        <Route path="decisions" element={<Decisions />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="documents" element={<Documents />} />
        <Route path="search" element={<Search />} />
        <Route path="settings" element={<Settings />} />
        <Route path="more" element={<More />} />
      </Routes>
      <DarussalamBottomNav />
    </Suspense>
  );
}
