import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Home as HomeIcon, Leaf, MoreHorizontal } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';
import { roomTemplates } from '@/modules/darussalam/lib/roomTemplates';
import { createRoom } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import type { RoomCategory } from '@/modules/darussalam/types';

const categoryIcons: Record<RoomCategory, typeof HomeIcon> = {
  indoor: HomeIcon,
  outdoor: Leaf,
  other: MoreHorizontal,
};

export default function DarussalamAddRoom() {
  const navigate = useNavigate();
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<RoomCategory>('indoor');
  const [saving, setSaving] = useState(false);

  async function pickTemplate(name: string, icon: string, category: RoomCategory) {
    if (saving) return;
    setSaving(true);
    const room = await createRoom({ name, icon, category });
    navigate(`/darussalam/room/${room.id}`, { replace: true });
  }

  async function handleCustomSave() {
    if (!customName.trim() || saving) return;
    setSaving(true);
    const room = await createRoom({ name: customName, icon: 'entrance', category: customCategory });
    navigate(`/darussalam/room/${room.id}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Add a Space</h1>
        <p className="text-sm text-text-secondary mt-1">Pick a space, or create your own.</p>
      </div>

      <div className="px-5 mt-5 grid grid-cols-3 gap-3">
        {roomTemplates.map((t) => {
          const Icon = getRoomIcon(t.icon);
          return (
            <button
              key={t.name}
              disabled={saving}
              onClick={() => pickTemplate(t.name, t.icon, t.category)}
              className="bg-card-bg rounded-2xl shadow-card py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              <Icon size={22} className="text-darussalam-green" strokeWidth={1.5} />
              <span className="text-xs text-text-primary text-center leading-tight px-1">{t.name}</span>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Or create a custom space</h2>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Space name (e.g. Home Theatre)"
            className="w-full bg-darussalam-tile rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="flex gap-2 mt-3">
            {(['indoor', 'outdoor', 'other'] as RoomCategory[]).map((c) => {
              const Icon = categoryIcons[c];
              const active = customCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setCustomCategory(c)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm capitalize ${
                    active ? 'bg-accent-green-bg text-darussalam-green font-medium' : 'bg-darussalam-tile text-text-secondary'
                  }`}
                >
                  <Icon size={14} /> {c}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleCustomSave}
            disabled={!customName.trim() || saving}
            className="w-full mt-3 bg-darussalam-green text-white rounded-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <Plus size={16} /> Create Space
          </button>
        </div>
      </div>
    </div>
  );
}
