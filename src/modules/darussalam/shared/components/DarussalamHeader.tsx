import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home as HomeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useHouseSettings } from '@/modules/darussalam/features/settings/useHouseSettings';

export function DarussalamHeader({ showBack = false, actions }: { showBack?: boolean; actions?: ReactNode }) {
  const navigate = useNavigate();
  const settings = useHouseSettings();
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
          <div className="font-serif text-lg text-darussalam-green leading-tight">{settings.houseName}</div>
          {settings.houseSubtitle && (
            <div className="text-[10px] text-text-muted tracking-wide leading-tight">{settings.houseSubtitle}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}
