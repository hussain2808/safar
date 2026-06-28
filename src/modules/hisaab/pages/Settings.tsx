import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/modules/hisaab/store/ui';

export default function Settings() {
  const navigate = useNavigate();
  const maskAmounts = useUIStore((s) => s.maskAmounts);
  const toggleMaskAmounts = useUIStore((s) => s.toggleMaskAmounts);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-bg-card shadow-card flex items-center justify-center text-hisaabText-secondary active:bg-bg-hover transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-page-title text-hisaabText-primary font-serif">Settings</h1>
      </header>

      <main className="px-4 space-y-6 pt-2">
        {/* Privacy */}
        <section>
          <p className="text-caption text-hisaabText-secondary uppercase tracking-wide px-1 mb-2">Privacy</p>
          <div className="bg-bg-card rounded-2xl shadow-card px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-body text-hisaabText-primary">Mask amounts</p>
              <p className="text-caption text-hisaabText-secondary mt-0.5">Hide book balances on Home. Double-tap to reveal.</p>
            </div>
            <button
              role="switch"
              aria-checked={maskAmounts}
              onClick={toggleMaskAmounts}
              className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${maskAmounts ? 'bg-hisaabAccent-button' : 'bg-bg-hover'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maskAmounts ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
