import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Plus, LayoutGrid } from 'lucide-react';

export function BottomBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isToday = pathname === '/done';
  const isAllHabits = pathname === '/done/habits' || pathname === '/done/progress';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-card-border z-40">
      <div className="flex items-center justify-between px-8 py-2">
        <Link
          to="/done"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 ${isToday ? 'text-accent-doneGreen-fg' : 'text-text-muted'}`}
        >
          <CalendarCheck size={20} />
          <span className="text-[10px]">Today</span>
        </Link>

        <button
          onClick={() => navigate('/done/add')}
          aria-label="Add habit"
          className="w-14 h-14 -mt-6 rounded-full bg-accent-doneGreen-fg text-cream flex items-center justify-center shadow-button active:scale-[0.96] transition-transform duration-100"
        >
          <Plus size={26} />
        </button>

        <Link
          to="/done/habits"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 ${isAllHabits ? 'text-accent-doneGreen-fg' : 'text-text-muted'}`}
        >
          <LayoutGrid size={20} />
          <span className="text-[10px]">All Habits</span>
        </Link>
      </div>
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 rounded-full bg-text-muted/40" />
      </div>
    </div>
  );
}
