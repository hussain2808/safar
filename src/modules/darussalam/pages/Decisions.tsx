import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileQuestion, Trash2, Plus } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { Linkify } from '@/modules/darussalam/shared/components/Linkify';
import { useDecisions, addDecision, deleteDecision, restoreDecision } from '@/modules/darussalam/features/decisions/useDecisions';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { useUndoToast } from '@/modules/darussalam/shared/store/useUndoToast';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DarussalamDecisions() {
  const [params] = useSearchParams();
  const roomId = params.get('room');
  const decisions = useDecisions(roomId);
  const { rooms } = useRooms();
  const roomName = (id?: string | null) => rooms.find((r) => r.id === id)?.name;
  const showUndo = useUndoToast((s) => s.showUndo);

  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [decisionMaker, setDecisionMaker] = useState('');

  async function handleAdd() {
    if (!title.trim()) return;
    await addDecision({ title, reason, alternatives, decisionMaker, roomId });
    setTitle(''); setReason(''); setAlternatives(''); setDecisionMaker('');
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Decisions</h1>
        <p className="text-sm text-text-secondary mt-1">
          {roomId ? `Decisions for ${roomName(roomId) ?? 'this room'}` : 'Every important decision, and why you made it.'}
        </p>
      </div>

      <div className="px-5 mt-5 space-y-2.5">
        {decisions.map((d) => (
          <div key={d.id} className="bg-card-bg rounded-card shadow-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileQuestion size={16} className="text-darussalam-green flex-shrink-0" />
                <h3 className="text-sm font-semibold text-text-primary">{d.title}</h3>
              </div>
              <button
                onClick={async () => { const deleted = await deleteDecision(d.id); if (deleted) showUndo('Decision deleted', () => restoreDecision(deleted)); }}
                className="text-text-muted flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {d.reason && <p className="text-xs text-text-secondary mt-1.5">Reason: <Linkify text={d.reason} /></p>}
            {d.alternatives && <p className="text-xs text-text-muted mt-1">Considered: <Linkify text={d.alternatives} /></p>}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
              <span>{formatDate(d.date)}</span>
              {d.decisionMaker && <span>· {d.decisionMaker}</span>}
              {!roomId && roomName(d.roomId) && <span>· {roomName(d.roomId)}</span>}
            </div>
          </div>
        ))}
        {decisions.length === 0 && <p className="text-sm text-text-muted text-center py-4">No decisions logged yet.</p>}

        <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Log a decision</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='e.g. "No bathtub in master bathroom"'
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <input value={alternatives} onChange={(e) => setAlternatives(e.target.value)} placeholder="Alternatives considered (optional)"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <input value={decisionMaker} onChange={(e) => setDecisionMaker(e.target.value)} placeholder="Decided by (optional)"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none" />
          <button onClick={handleAdd} className="w-full bg-darussalam-green text-white rounded-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
            <Plus size={16} /> Save Decision
          </button>
        </div>
      </div>
    </div>
  );
}
