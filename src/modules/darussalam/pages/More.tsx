import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileQuestion, FileStack, Search as SearchIcon, Settings as SettingsIcon,
  ChevronRight, Palette,
} from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';

const links = [
  { to: '/darussalam/vision', label: 'Vision Board', description: "The overall feel of your dream home", icon: Palette },
  { to: '/darussalam/decisions', label: 'Decisions', description: 'Every important choice, and why', icon: FileQuestion },
  { to: '/darussalam/wishlist', label: 'Wishlist', description: "Things you haven't decided on yet", icon: Sparkles },
  { to: '/darussalam/documents', label: 'Documents', description: 'Floor plans, sketches, mood boards', icon: FileStack },
  { to: '/darussalam/search', label: 'Search', description: 'Find anything, instantly', icon: SearchIcon },
  { to: '/darussalam/settings', label: 'Settings', description: 'House profile, units, backup', icon: SettingsIcon },
];

export default function DarussalamMore() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">More</h1>
      </div>

      <div className="px-5 mt-5 space-y-2.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-darussalam-tile flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-darussalam-green" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{link.label}</h3>
                <p className="text-xs text-text-muted">{link.description}</p>
              </div>
              <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
