import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, LayoutGrid, Home as HomeIcon, Leaf, MoreHorizontal, ChevronRight, Plus, TreePine } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';
import type { RoomCategory } from '@/modules/darussalam/types';

const filters: { key: 'all' | RoomCategory; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'all', label: 'All Rooms', icon: LayoutGrid },
  { key: 'indoor', label: 'Indoor', icon: HomeIcon },
  { key: 'outdoor', label: 'Outdoor', icon: Leaf },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function DarussalamRooms() {
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<'all' | RoomCategory>('all');

  const visibleRooms = filter === 'all' ? rooms : rooms.filter((r) => r.category === filter);

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader
        showBack
        actions={
          <>
            <button className="text-darussalam-green"><Search size={20} /></button>
            <button className="text-darussalam-green"><MoreVertical size={20} /></button>
          </>
        }
      />

      <div className="relative overflow-hidden px-5 pt-2 pb-4">
        <TreePine size={110} className="absolute right-0 top-0 text-darussalam-green/10" strokeWidth={1} />
        <h1 className="font-serif text-3xl text-text-primary relative z-10">My House</h1>
        <p className="text-sm text-text-secondary mt-1 relative z-10">Every space, designed with purpose ♡</p>
      </div>

      <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm whitespace-nowrap ${
                active ? 'bg-accent-green-bg text-darussalam-green font-medium' : 'bg-card-bg text-text-secondary'
              }`}
            >
              <Icon size={14} /> {f.label}
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-4 space-y-3">
        {visibleRooms.map((room) => {
          const Icon = getRoomIcon(room.icon);
          return (
            <button
              key={room.id}
              onClick={() => navigate(`/darussalam/room/${room.id}`)}
              className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-darussalam-tile flex items-center justify-center flex-shrink-0">
                <Icon size={26} className="text-darussalam-green" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-text-primary leading-tight">{room.name}</h3>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{room.tagline}</p>
                <span className="inline-block mt-1.5 text-[11px] font-medium text-darussalam-green bg-accent-green-bg px-2.5 py-0.5 rounded-full">
                  {room.ideaCount} ideas
                </span>
              </div>
              <ChevronRight size={18} className="text-text-muted flex-shrink-0" />
            </button>
          );
        })}

        <button className="w-full border-2 border-dashed border-card-border rounded-card py-4 flex items-center justify-center gap-2 text-darussalam-green text-sm font-medium">
          <Plus size={16} /> Add New Room or Space
        </button>
      </div>
    </div>
  );
}
