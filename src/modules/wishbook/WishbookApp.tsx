import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home       = lazy(() => import('@/modules/wishbook/pages/Home'));
const AddWish    = lazy(() => import('@/modules/wishbook/pages/AddWish'));
const WishDetail = lazy(() => import('@/modules/wishbook/pages/WishDetail'));

function PageFallback() {
  return <div className="min-h-screen bg-cream" />;
}

export default function WishbookApp() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="add"            element={<AddWish />} />
        <Route path="wish/:id"       element={<WishDetail />} />
        <Route path="wish/:id/edit"  element={<AddWish />} />
      </Routes>
    </Suspense>
  );
}
