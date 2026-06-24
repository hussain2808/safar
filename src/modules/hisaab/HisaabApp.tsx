import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/modules/hisaab/shared/components/ErrorBoundary';
import { BookCardSkeleton } from '@/modules/hisaab/shared/components/Skeleton';
import { AddTransactionSheet } from '@/modules/hisaab/features/transactions/components/AddTransactionSheet';
import { TransactionDetailSheet } from '@/modules/hisaab/features/transactions/components/TransactionDetailSheet';
import { UpdateBanner } from '@/modules/hisaab/shared/components/UpdateBanner';

const Home       = lazy(() => import('@/modules/hisaab/pages/Home'));
const BookDetail = lazy(() => import('@/modules/hisaab/pages/BookDetail'));
const Search     = lazy(() => import('@/modules/hisaab/pages/Search'));
const Settings   = lazy(() => import('@/modules/hisaab/pages/Settings'));

function PageFallback() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
    </div>
  );
}

export default function HisaabApp() {
  return (
    <div className="hisaab-root">
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="book/:id"  element={<BookDetail />} />
            <Route path="search"    element={<Search />} />
            <Route path="settings"  element={<Settings />} />
          </Routes>
        </Suspense>
        <AddTransactionSheet />
        <TransactionDetailSheet />
        <UpdateBanner />
      </ErrorBoundary>
    </div>
  );
}
