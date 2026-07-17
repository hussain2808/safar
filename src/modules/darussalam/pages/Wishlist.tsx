import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Trash2, Plus, Check } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { Linkify } from '@/modules/darussalam/shared/components/Linkify';
import { useWishlist, addWishlistItem, toggleWishlistResolved, deleteWishlistItem } from '@/modules/darussalam/features/wishlist/useWishlist';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import type { WishlistCategory } from '@/modules/darussalam/types';

const categories: WishlistCategory[] = ['fixtures', 'materials', 'furniture', 'lighting', 'other'];

export default function DarussalamWishlist() {
  const [params] = useSearchParams();
  const roomId = params.get('room');
  const items = useWishlist(roomId);
  const { rooms } = useRooms();
  const roomName = (id?: string | null) => rooms.find((r) => r.id === id)?.name;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WishlistCategory>('other');
  const [notes, setNotes] = useState('');

  async function handleAdd() {
    if (!title.trim()) return;
    await addWishlistItem({ title, category, notes, roomId });
    setTitle(''); setNotes('');
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Wishlist</h1>
        <p className="text-sm text-text-secondary mt-1">
          {roomId ? `Undecided for ${roomName(roomId) ?? 'this room'}` : "Things you haven't decided on yet."}
        </p>
      </div>

      <div className="px-5 mt-5 space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 bg-card-bg rounded-card shadow-card p-3.5">
            <button
              onClick={() => toggleWishlistResolved(item)}
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${item.resolved ? 'bg-darussalam-green' : 'border border-text-muted'}`}
            >
              {item.resolved && <Check size={11} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${item.resolved ? 'text-text-muted line-through' : 'text-text-primary'}`}>{item.title}</h3>
              {item.notes && <p className="text-xs text-text-muted mt-0.5"><Linkify text={item.notes} /></p>}
              <div className="flex items-center gap-2 mt-1">
                {item.category && <span className="text-[10px] bg-darussalam-tile text-text-secondary px-2 py-0.5 rounded-full capitalize">{item.category}</span>}
                {!roomId && roomName(item.roomId) && <span className="text-[10px] text-text-muted">{roomName(item.roomId)}</span>}
              </div>
            </div>
            <button onClick={() => deleteWishlistItem(item.id)} className="text-text-muted flex-shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-text-muted text-center py-4">Nothing on the wishlist yet.</p>}

        <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-1">
            <Sparkles size={14} className="text-text-secondary" /> Add to wishlist
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='e.g. "Kitchen sink" or "Door handles"'
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize ${category === c ? 'bg-accent-green-bg text-darussalam-green font-medium' : 'bg-darussalam-tile text-text-secondary'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <button onClick={handleAdd} className="w-full bg-darussalam-green text-white rounded-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
