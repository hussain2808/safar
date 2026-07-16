import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home as HomeIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function DarussalamHeader({ showBack = false, actions }: { showBack?: boolean; actions?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="mr-1 text-darussalam-green" aria-label="Back">
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="w-9 h-9 rounded-xl border-2 border-darussalam-green flex items-center justify-center text-darussalam-green">
          <HomeIcon size={18} />
        </div>
        <div>
          <div className="font-serif text-lg text-darussalam-green leading-tight">Darussalam</div>
          <div className="text-[10px] text-text-muted tracking-wide leading-tight">Our Home, In Sha Allah</div>
        </div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}
