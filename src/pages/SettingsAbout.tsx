import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Leaf } from 'lucide-react';

export default function SettingsAbout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-2 pt-12 pb-4 flex items-center gap-2">
        <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary">About Safar</h1>
      </header>

      <main className="px-4 pb-12 pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-icon-bg flex items-center justify-center text-brown mb-4">
          <Leaf size={28} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-section-heading text-text-primary">Safar</h2>
        <p className="text-caption text-text-secondary mt-1">Version 1.0.0</p>
        <p className="text-caption-md text-text-secondary mt-6 max-w-xs">
          Safar keeps your life organized — documents, finances, valuables and memories, all in one place.
        </p>
      </main>
    </div>
  );
}
