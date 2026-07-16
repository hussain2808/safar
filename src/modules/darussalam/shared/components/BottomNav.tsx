import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building2, Plus, Image, MoreHorizontal } from 'lucide-react';

const items = [
  { key: 'home', label: 'Home', path: '/darussalam', icon: Home },
  { key: 'house', label: 'House', path: '/darussalam/rooms', icon: Building2 },
  { key: 'inspiration', label: 'Inspiration', path: '/darussalam/inspiration', icon: Image },
  { key: 'more', label: 'More', path: '/darussalam/more', icon: MoreHorizontal },
] as const;

export function DarussalamBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-card-border z-30">
      <div className="flex items-center justify-between px-2 py-2">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 flex-1 ${active ? 'text-darussalam-green' : 'text-text-muted'}`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => navigate('/darussalam/capture')}
          className="flex-1 flex items-center justify-center"
          aria-label="Capture an idea"
        >
          <span className="w-12 h-12 rounded-full bg-darussalam-green flex items-center justify-center shadow-button -mt-4">
            <Plus size={22} className="text-white" />
          </span>
        </button>

        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 flex-1 ${active ? 'text-darussalam-green' : 'text-text-muted'}`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
