import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 bg-bg-card shadow-button rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4">
      <p className="text-caption text-hisaabText-primary">New version available</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="text-caption font-semibold text-hisaabAccent-button shrink-0"
      >
        Update now
      </button>
    </div>
  );
}
