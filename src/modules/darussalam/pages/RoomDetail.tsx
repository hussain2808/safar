import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil, MoreVertical, Lightbulb, Ruler, StickyNote, MoreHorizontal,
  Leaf, Sparkles, SquareCheckBig, Bookmark, Plus, X, Check, Trash2,
  Scale, FileQuestion, FileStack, Search as SearchIcon,
} from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { IdeaThumb } from '@/modules/darussalam/shared/components/IdeaThumb';
import { IdeaListRow } from '@/modules/darussalam/shared/components/IdeaListRow';
import { TagEditor } from '@/modules/darussalam/shared/components/TagEditor';
import { Linkify } from '@/modules/darussalam/shared/components/Linkify';
import {
  useRoom, useRoomTopIdeas, useRoomStats, updateRoom, deleteRoom, restoreRoom,
  addRoomRequirement, toggleRoomRequirement, removeRoomRequirement,
  addRoomMoodTag, removeRoomMoodTag, addRoomColor, removeRoomColor,
  addRoomMaterial, removeRoomMaterial,
} from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { useRoomMeasurements, addMeasurement, deleteMeasurement, restoreMeasurement } from '@/modules/darussalam/features/rooms/hooks/useRoomMeasurements';
import { useRoomNotes, addRoomNote, deleteRoomNote, restoreRoomNote } from '@/modules/darussalam/features/rooms/hooks/useRoomNotes';
import { useInspirationIdeas } from '@/modules/darussalam/features/ideas/hooks/useIdeas';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';
import { useUndoToast } from '@/modules/darussalam/shared/store/useUndoToast';

type Tab = 'overview' | 'ideas' | 'inspiration' | 'measurements' | 'notes' | 'more';

const tabs: { key: Tab; label: string; icon: typeof Lightbulb }[] = [
  { key: 'overview', label: 'Overview', icon: Leaf },
  { key: 'ideas', label: 'Ideas', icon: Lightbulb },
  { key: 'inspiration', label: 'Inspiration', icon: Sparkles },
  { key: 'measurements', label: 'Measurements', icon: Ruler },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'more', label: 'More', icon: MoreHorizontal },
];

export default function DarussalamRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room } = useRoom(roomId);
  const topIdeas = useRoomTopIdeas(roomId, 3);
  const allRoomIdeas = useRoomTopIdeas(roomId, 200);
  const stats = useRoomStats(roomId);
  const measurements = useRoomMeasurements(roomId);
  const notes = useRoomNotes(roomId);
  const inspirationIdeas = useInspirationIdeas(roomId);
  const [tab, setTab] = useState<Tab>('overview');
  const showUndo = useUndoToast((s) => s.showUndo);
  const [editing, setEditing] = useState(false);
  const [measureLabel, setMeasureLabel] = useState('');
  const [measureValue, setMeasureValue] = useState('');
  const [measureUnit, setMeasureUnit] = useState('cm');
  const [noteText, setNoteText] = useState('');
  const [requirementText, setRequirementText] = useState('');

  if (!room) {
    return (
      <div className="min-h-screen bg-darussalam-bg pb-28">
        <DarussalamHeader showBack />
      </div>
    );
  }

  const Icon = getRoomIcon(room.icon);

  async function handleDeleteRoom() {
    if (!room) return;
    const deletedRoom = await deleteRoom(room.id);
    navigate('/darussalam/rooms', { replace: true });
    if (deletedRoom) showUndo(`"${deletedRoom.name}" deleted`, () => restoreRoom(deletedRoom));
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader
        showBack
        actions={
          <>
            <button onClick={() => setEditing((v) => !v)} className={editing ? 'text-darussalam-green' : 'text-text-secondary'}>
              {editing ? <Check size={19} /> : <Pencil size={18} />}
            </button>
            <button onClick={handleDeleteRoom} className="text-text-secondary"><MoreVertical size={20} /></button>
          </>
        }
      />

      <div className="relative mx-5 rounded-3xl overflow-hidden bg-gradient-to-br from-[#8FA37D] to-[#D8CBA8] p-5 min-h-[190px] flex flex-col justify-end">
        <div className="absolute top-4 left-4 w-14 h-14 rounded-2xl bg-white/85 flex items-center justify-center">
          <Icon size={24} className="text-darussalam-green" strokeWidth={1.5} />
        </div>
        {editing ? (
          <div className="mt-16 space-y-2">
            <input
              defaultValue={room.name}
              onBlur={(e) => updateRoom(room.id, { name: e.target.value })}
              className="w-full bg-white/90 rounded-lg px-3 py-1.5 font-serif text-xl text-text-primary outline-none"
            />
            <input
              defaultValue={room.tagline ?? ''}
              onBlur={(e) => updateRoom(room.id, { tagline: e.target.value })}
              placeholder="A short tagline for this room"
              className="w-full bg-white/80 rounded-lg px-3 py-1 text-sm text-text-primary outline-none"
            />
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-white mt-16">{room.name}</h1>
            {room.tagline && <p className="text-sm text-white/90 mt-0.5">{room.tagline}</p>}
          </>
        )}
        <div className="flex gap-5 mt-3 text-white flex-wrap">
          <div className="flex items-center gap-1.5 text-sm"><Lightbulb size={14} /> {stats.ideaCount} <span className="text-white/70 text-xs">Ideas</span></div>
          <div className="flex items-center gap-1.5 text-sm"><Ruler size={14} /> {stats.measurementCount} <span className="text-white/70 text-xs">Measurements</span></div>
          <div className="flex items-center gap-1.5 text-sm"><StickyNote size={14} /> {stats.noteCount} <span className="text-white/70 text-xs">Notes</span></div>
        </div>
      </div>

      <div className="flex gap-4 px-5 mt-4 overflow-x-auto no-scrollbar border-b border-card-border">
        {tabs.map((t) => {
          const TIcon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 pb-2.5 text-sm whitespace-nowrap border-b-2 ${
                active ? 'border-darussalam-green text-darussalam-green font-medium' : 'border-transparent text-text-muted'
              }`}
            >
              <TIcon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="px-5 mt-4 space-y-4">
          <div className="bg-card-bg rounded-card shadow-card p-4">
            <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
              <Leaf size={14} className="text-text-secondary" /> About this room
            </div>
            {editing ? (
              <textarea
                defaultValue={room.description ?? ''}
                onBlur={(e) => updateRoom(room.id, { description: e.target.value })}
                placeholder="What's this room for? What matters most here?"
                rows={3}
                className="w-full bg-darussalam-tile rounded-lg px-3 py-2 text-sm text-text-primary outline-none resize-none"
              />
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed">
                {room.description ? <Linkify text={room.description} /> : 'No description yet. Tap edit to add one.'}
              </p>
            )}
            <div className="mt-3">
              {editing ? (
                <TagEditor
                  tags={room.moodTags ?? []}
                  onAdd={(v) => addRoomMoodTag(room, v)}
                  onRemove={(v) => removeRoomMoodTag(room, v)}
                  placeholder="Add a mood word (e.g. Warm)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(room.moodTags ?? []).map((tag) => (
                    <span key={tag} className="text-xs bg-darussalam-tile text-text-secondary px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card-bg rounded-card shadow-card p-4">
              <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
                <Sparkles size={14} className="text-text-secondary" /> Mood &amp; Style
              </div>
              {editing ? (
                <input
                  defaultValue={room.moodStyle ?? ''}
                  onBlur={(e) => updateRoom(room.id, { moodStyle: e.target.value })}
                  placeholder="Style name (e.g. Tropical Modern)"
                  className="w-full bg-darussalam-tile rounded-lg px-2.5 py-1.5 text-xs mb-2 outline-none"
                />
              ) : room.moodStyle ? (
                <p className="text-xs text-text-secondary mb-2">{room.moodStyle}</p>
              ) : null}

              <div className="flex gap-2 flex-wrap items-center">
                {(room.colorPalette ?? []).map((hex) => (
                  <button
                    key={hex}
                    onClick={() => editing && removeRoomColor(room, hex)}
                    className="w-7 h-7 rounded-full border border-card-border relative"
                    style={{ background: hex }}
                  >
                    {editing && <X size={9} className="absolute inset-0 m-auto text-white drop-shadow" />}
                  </button>
                ))}
                {editing && (
                  <input
                    type="color"
                    onChange={(e) => addRoomColor(room, e.target.value)}
                    className="w-7 h-7 rounded-full border border-dashed border-text-muted cursor-pointer bg-transparent"
                  />
                )}
              </div>

              <div className="mt-2">
                {editing ? (
                  <TagEditor
                    tags={room.materials ?? []}
                    onAdd={(v) => addRoomMaterial(room, v)}
                    onRemove={(v) => removeRoomMaterial(room, v)}
                    placeholder="Add a material"
                  />
                ) : (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {(room.materials ?? []).map((m) => (
                      <span key={m} className="text-[10px] bg-darussalam-tile text-text-secondary px-2 py-0.5 rounded-md">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card-bg rounded-card shadow-card p-4">
              <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
                <SquareCheckBig size={14} className="text-text-secondary" /> Key Requirements
              </div>
              <div className="space-y-1.5">
                {(room.requirements ?? []).map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => toggleRoomRequirement(room, req.id)}
                      className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center ${req.done ? 'bg-darussalam-green' : 'border border-text-muted'}`}
                    >
                      {req.done && <Check size={9} className="text-white" />}
                    </button>
                    <span className={`flex-1 ${req.done ? 'text-text-primary' : 'text-text-muted'}`}>{req.label}</span>
                    {editing && (
                      <button onClick={() => removeRoomRequirement(room, req.id)} className="text-text-muted">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ))}
                {(!room.requirements || room.requirements.length === 0) && (
                  <p className="text-xs text-text-muted">No requirements yet.</p>
                )}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={requirementText}
                    onChange={(e) => setRequirementText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && requirementText.trim()) { addRoomRequirement(room, requirementText); setRequirementText(''); } }}
                    placeholder="Add a requirement"
                    className="flex-1 min-w-0 bg-darussalam-tile rounded-full px-3 py-1.5 text-xs outline-none"
                  />
                  <button
                    onClick={() => { if (requirementText.trim()) { addRoomRequirement(room, requirementText); setRequirementText(''); } }}
                    className="text-darussalam-green text-xs font-medium px-1"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card-bg rounded-card shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                <Lightbulb size={14} className="text-text-secondary" /> Top Ideas
              </div>
              <button onClick={() => setTab('ideas')} className="text-xs text-darussalam-green font-medium">View All</button>
            </div>
            <div className="flex gap-3 mb-3">
              {topIdeas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => navigate(`/darussalam/idea/${idea.id}`)}
                  className="relative w-1/3 aspect-square rounded-xl overflow-hidden bg-darussalam-tile flex items-center justify-center"
                >
                  <IdeaThumb ideaId={idea.id} />
                  {idea.favorite && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                      <Bookmark size={10} className="text-darussalam-green" />
                    </span>
                  )}
                </button>
              ))}
              {topIdeas.length === 0 && <p className="text-xs text-text-muted">No ideas yet.</p>}
            </div>
            <button
              onClick={() => navigate(`/darussalam/capture?room=${room.id}`)}
              className="w-full border-2 border-dashed border-card-border rounded-xl py-2.5 flex items-center justify-center gap-2 text-darussalam-green text-sm font-medium"
            >
              <Plus size={15} /> Add Idea
            </button>
          </div>
        </div>
      )}

      {tab === 'ideas' && (
        <div className="px-5 mt-4 space-y-2.5">
          {allRoomIdeas.length === 0 && <p className="text-sm text-text-muted text-center py-8">No ideas captured for this room yet.</p>}
          {allRoomIdeas.map((idea) => (
            <div key={idea.id} className="bg-card-bg rounded-card shadow-card px-3">
              <IdeaListRow
                ideaId={idea.id}
                title={idea.title}
                onOpen={() => navigate(`/darussalam/idea/${idea.id}`)}
                subtitle={idea.description ? <p className="text-xs text-text-muted line-clamp-1">{idea.description}</p> : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'inspiration' && (
        <div className="px-5 mt-4">
          {inspirationIdeas.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              No ideas marked as inspiration yet. Open an idea and tap "Add to Inspiration".
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {inspirationIdeas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => navigate(`/darussalam/idea/${idea.id}`)}
                  className="aspect-square rounded-2xl overflow-hidden bg-darussalam-tile relative"
                >
                  <IdeaThumb ideaId={idea.id} />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1.5 line-clamp-1 text-left">
                    {idea.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'measurements' && (
        <div className="px-5 mt-4 space-y-2.5">
          {measurements.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3">
              <Scale size={16} className="text-darussalam-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary">{m.label}</h3>
              </div>
              <span className="text-sm text-text-secondary">{m.value}{m.unit ? ` ${m.unit}` : ''}</span>
              <button
                onClick={async () => { const deleted = await deleteMeasurement(m.id); if (deleted) showUndo('Measurement deleted', () => restoreMeasurement(deleted)); }}
                className="text-text-muted"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {measurements.length === 0 && <p className="text-sm text-text-muted text-center py-4">No measurements saved yet.</p>}

          <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
            <input
              value={measureLabel}
              onChange={(e) => setMeasureLabel(e.target.value)}
              placeholder="What are you measuring? (e.g. Window width)"
              className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none"
            />
            <div className="flex gap-2">
              <input
                value={measureValue}
                onChange={(e) => setMeasureValue(e.target.value)}
                placeholder="Value (e.g. 120)"
                className="flex-1 min-w-0 bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none"
              />
              <input
                value={measureUnit}
                onChange={(e) => setMeasureUnit(e.target.value)}
                placeholder="Unit"
                className="w-20 bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none"
              />
            </div>
            <button
              onClick={async () => {
                if (!measureLabel.trim() || !measureValue.trim() || !roomId) return;
                await addMeasurement(roomId, { label: measureLabel, value: measureValue, unit: measureUnit });
                setMeasureLabel(''); setMeasureValue('');
              }}
              className="w-full bg-darussalam-green text-white rounded-full py-2 text-sm font-medium"
            >
              Add Measurement
            </button>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="px-5 mt-4 space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-3 bg-card-bg rounded-card shadow-card p-3">
              <StickyNote size={16} className="text-darussalam-green flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm text-text-secondary"><Linkify text={n.text} /></p>
              <button
                onClick={async () => { const deleted = await deleteRoomNote(n.id); if (deleted) showUndo('Note deleted', () => restoreRoomNote(deleted)); }}
                className="text-text-muted"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-text-muted text-center py-4">No notes yet.</p>}

          <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Jot something down about this room…"
              rows={2}
              className="w-full bg-darussalam-tile rounded-lg px-3 py-2 text-sm outline-none resize-none"
            />
            <button
              onClick={async () => {
                if (!noteText.trim() || !roomId) return;
                await addRoomNote(roomId, noteText);
                setNoteText('');
              }}
              className="w-full bg-darussalam-green text-white rounded-full py-2 text-sm font-medium"
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {tab === 'more' && (
        <div className="px-5 mt-4 space-y-2.5">
          <button
            onClick={() => navigate(`/darussalam/decisions?room=${room.id}`)}
            className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5 text-left"
          >
            <FileQuestion size={17} className="text-darussalam-green" />
            <span className="flex-1 text-sm font-medium text-text-primary">Decisions for this room</span>
          </button>
          <button
            onClick={() => navigate(`/darussalam/wishlist?room=${room.id}`)}
            className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5 text-left"
          >
            <Sparkles size={17} className="text-darussalam-green" />
            <span className="flex-1 text-sm font-medium text-text-primary">Wishlist for this room</span>
          </button>
          <button
            onClick={() => navigate(`/darussalam/documents?room=${room.id}`)}
            className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5 text-left"
          >
            <FileStack size={17} className="text-darussalam-green" />
            <span className="flex-1 text-sm font-medium text-text-primary">Documents for this room</span>
          </button>
          <button
            onClick={() => navigate('/darussalam/search')}
            className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5 text-left"
          >
            <SearchIcon size={17} className="text-darussalam-green" />
            <span className="flex-1 text-sm font-medium text-text-primary">Search everything</span>
          </button>
          <button
            onClick={handleDeleteRoom}
            className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3.5 text-left text-red-600"
          >
            <Trash2 size={17} />
            <span className="flex-1 text-sm font-medium">Delete this room</span>
          </button>
        </div>
      )}
    </div>
  );
}
