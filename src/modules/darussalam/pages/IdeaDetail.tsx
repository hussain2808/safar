import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil, Bookmark, Home as HomeIcon, Calendar, User, Heart,
  Ruler, Tag, SquareCheckBig, Palette, Link2, Paperclip, ChevronRight, ChevronDown,
  Share2, Plus, Trash2,
} from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { Linkify } from '@/modules/darussalam/shared/components/Linkify';
import { useIdea, toggleIdeaFavorite, toggleIdeaInspiration, addIdeaNote, toggleIdeaRequirement, deleteIdea, moveIdeaToRoom } from '@/modules/darussalam/features/ideas/hooks/useIdeas';
import { getCategoryIcon } from '@/modules/darussalam/lib/categoryIcons';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type SectionKey = 'measurements' | 'notes' | 'requirements' | 'materials' | 'links' | 'files';

function Row({
  icon: Icon, label, count, expanded, onToggle,
}: { icon: typeof Ruler; label: string; count: number | string; expanded: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 py-3.5 border-b border-card-border last:border-b-0 text-left">
      <Icon size={17} className="text-text-secondary flex-shrink-0" />
      <span className="flex-1 text-[15px] text-text-primary">{label}</span>
      <span className="text-sm text-text-muted">{count}</span>
      {expanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
    </button>
  );
}

export default function DarussalamIdeaDetail() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const { idea, roomName, files } = useIdea(ideaId);
  const { rooms } = useRooms();
  const [expanded, setExpanded] = useState<SectionKey | null>(null);
  const [noteText, setNoteText] = useState('');
  const [slide, setSlide] = useState(0);
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f.blob));
    setMediaUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const slideCount = mediaUrls.length || idea?.mediaCount || 0;

  if (!idea) {
    return (
      <div className="min-h-screen bg-darussalam-bg pb-28">
        <DarussalamHeader showBack />
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(idea.category);

  async function handleShare() {
    const text = `${idea!.title}${idea!.description ? ` — ${idea!.description}` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: idea!.title, text }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  function toggle(key: SectionKey) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  async function handleDelete() {
    if (!ideaId) return;
    if (window.confirm(`Delete "${idea!.title}"? This can't be undone.`)) {
      await deleteIdea(ideaId);
      navigate(-1);
    }
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader
        showBack
        actions={
          <>
            <button className="text-darussalam-green"><Pencil size={18} /></button>
            <button onClick={() => toggleIdeaFavorite(idea)} className={idea.favorite ? 'text-darussalam-green' : 'text-text-muted'}>
              <Bookmark size={19} fill={idea.favorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleDelete} className="text-text-muted" aria-label="Delete idea"><Trash2 size={19} /></button>
          </>
        }
      />

      <div className="px-5">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <h1 className="font-serif text-[26px] leading-tight text-text-primary">{idea.title}</h1>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setShowRoomPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-darussalam-tile px-3 py-1.5 rounded-full"
            >
              <HomeIcon size={13} /> {roomName ?? 'Unsorted'}
            </button>
            {idea.category && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-darussalam-tile px-3 py-1.5 rounded-full">
                <CategoryIcon size={13} /> {idea.category}
              </span>
            )}
          </div>

          {showRoomPicker && (
            <div className="flex flex-wrap gap-2 mt-3 bg-darussalam-bg rounded-xl p-2.5">
              <button
                onClick={async () => { await moveIdeaToRoom(idea, null); setShowRoomPicker(false); }}
                className={`px-3 py-1.5 rounded-full text-xs ${!idea.roomId ? 'bg-darussalam-green text-white' : 'bg-card-bg text-text-secondary'}`}
              >
                Unsorted
              </button>
              {rooms.map((room) => {
                const RoomIcon = getRoomIcon(room.icon);
                const active = idea.roomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={async () => { await moveIdeaToRoom(idea, room.id); setShowRoomPicker(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${active ? 'bg-darussalam-green text-white' : 'bg-card-bg text-text-secondary'}`}
                  >
                    <RoomIcon size={12} /> {room.name}
                  </button>
                );
              })}
            </div>
          )}

          {idea.linkUrl && (
            <a
              href={idea.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 mt-3 text-sm text-darussalam-green bg-darussalam-tile rounded-lg px-3 py-2 break-all"
            >
              <Link2 size={14} className="flex-shrink-0" /> {idea.linkUrl}
            </a>
          )}

          {idea.description && (
            <p className="text-sm text-text-secondary leading-relaxed mt-3">
              <Linkify text={idea.description} />
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-card-border text-xs text-text-muted">
            <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(idea.createdAt)}</span>
            {idea.createdBy && <span className="flex items-center gap-1.5"><User size={13} /> {idea.createdBy}</span>}
          </div>

          {slideCount > 0 && (
            <div className="mt-3">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-darussalam-tile flex items-center justify-center">
                {mediaUrls[slide] ? (
                  <img src={mediaUrls[slide]} alt={idea.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#8FA37D] to-[#D8CBA8] flex items-center justify-center">
                    <CategoryIcon size={32} className="text-white/80" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`w-1.5 h-1.5 rounded-full ${i === slide ? 'bg-darussalam-green' : 'bg-text-muted/40'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-muted bg-darussalam-tile px-2 py-0.5 rounded-full">{slide + 1} / {slideCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {idea.whyILoveThis && (
        <div className="px-5 mt-4">
          <div className="bg-card-bg rounded-card shadow-card p-4">
            <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-darussalam-green">
              <Heart size={15} /> Why I love this
            </div>
            <p className="text-sm text-text-secondary leading-relaxed"><Linkify text={idea.whyILoveThis} /></p>
          </div>
        </div>
      )}

      <div className="px-5 mt-4">
        <div className="bg-card-bg rounded-card shadow-card px-4">
          <Row icon={Ruler} label="Measurements" count={idea.measurements ?? '—'} expanded={expanded === 'measurements'} onToggle={() => toggle('measurements')} />
          {expanded === 'measurements' && (
            <div className="pb-3 -mt-1 text-sm text-text-secondary">{idea.measurements ?? 'No measurements added yet.'}</div>
          )}

          <Row icon={Tag} label="Notes" count={`${idea.notesList?.length ?? 0} notes`} expanded={expanded === 'notes'} onToggle={() => toggle('notes')} />
          {expanded === 'notes' && (
            <div className="pb-3 -mt-1 space-y-2">
              {(idea.notesList ?? []).map((n) => (
                <p key={n.id} className="text-sm text-text-secondary bg-darussalam-tile rounded-lg px-3 py-2"><Linkify text={n.text} /></p>
              ))}
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note…"
                  className="flex-1 min-w-0 bg-darussalam-tile rounded-full px-3 py-1.5 text-sm outline-none"
                />
                <button
                  onClick={async () => { if (!noteText.trim()) return; await addIdeaNote(idea, noteText); setNoteText(''); }}
                  className="text-darussalam-green text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <Row icon={SquareCheckBig} label="Key Requirements" count={`${idea.requirements?.length ?? 0} items`} expanded={expanded === 'requirements'} onToggle={() => toggle('requirements')} />
          {expanded === 'requirements' && (
            <div className="pb-3 -mt-1 space-y-1.5">
              {(idea.requirements ?? []).map((r) => (
                <button key={r.id} onClick={() => toggleIdeaRequirement(idea, r.id)} className="w-full flex items-center gap-2 text-sm text-left">
                  <span className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center ${r.done ? 'bg-darussalam-green' : 'border border-text-muted'}`}>
                    {r.done && <SquareCheckBig size={9} className="text-white" />}
                  </span>
                  <span className={r.done ? 'text-text-primary' : 'text-text-muted'}>{r.label}</span>
                </button>
              ))}
              {(!idea.requirements || idea.requirements.length === 0) && <p className="text-sm text-text-muted">No requirements yet.</p>}
            </div>
          )}

          <Row icon={Palette} label="Materials & Finishes" count={`${idea.materials?.length ?? 0} items`} expanded={expanded === 'materials'} onToggle={() => toggle('materials')} />
          {expanded === 'materials' && (
            <div className="pb-3 -mt-1 flex flex-wrap gap-2">
              {(idea.materials ?? []).map((m) => (
                <span key={m} className="text-xs bg-darussalam-tile text-text-secondary px-2.5 py-1 rounded-full">{m}</span>
              ))}
              {(!idea.materials || idea.materials.length === 0) && <p className="text-sm text-text-muted">No materials added yet.</p>}
            </div>
          )}

          <Row icon={Link2} label="Source & Links" count={`${idea.links?.length ?? 0} links`} expanded={expanded === 'links'} onToggle={() => toggle('links')} />
          {expanded === 'links' && (
            <div className="pb-3 -mt-1 space-y-1.5">
              {(idea.links ?? []).map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block text-sm text-darussalam-green underline underline-offset-2">
                  {l.label}
                </a>
              ))}
              {idea.linkUrl && (
                <a href={idea.linkUrl} target="_blank" rel="noreferrer" className="block text-sm text-darussalam-green underline underline-offset-2">
                  {idea.linkUrl}
                </a>
              )}
              {(!idea.links || idea.links.length === 0) && !idea.linkUrl && <p className="text-sm text-text-muted">No links yet.</p>}
            </div>
          )}

          <Row icon={Paperclip} label="Files & Attachments" count={`${files.length} files`} expanded={expanded === 'files'} onToggle={() => toggle('files')} />
          {expanded === 'files' && (
            <div className="pb-3 -mt-1 space-y-2.5">
              {files.map((f, i) => (
                <div key={f.id}>
                  {f.mimeType.startsWith('audio/') && mediaUrls[i] && (
                    <audio controls src={mediaUrls[i]} className="w-full h-10" />
                  )}
                  {f.mimeType.startsWith('video/') && mediaUrls[i] && (
                    <video controls src={mediaUrls[i]} className="w-full rounded-lg" />
                  )}
                  {!f.mimeType.startsWith('audio/') && !f.mimeType.startsWith('video/') && (
                    <p className="text-sm text-text-secondary">{f.mimeType} attachment</p>
                  )}
                  {f.durationSeconds != null && (
                    <p className="text-xs text-text-muted mt-1">{f.durationSeconds}s</p>
                  )}
                </div>
              ))}
              {files.length === 0 && <p className="text-sm text-text-muted">No files attached yet.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-3">
        <button onClick={handleShare} className="flex-1 bg-darussalam-tile rounded-2xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-text-primary">
          <Share2 size={16} /> Share
        </button>
        <button
          onClick={() => toggleIdeaInspiration(idea)}
          className={`flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 text-sm font-medium ${
            idea.inInspiration ? 'bg-darussalam-green text-white' : 'bg-darussalam-tile text-darussalam-green'
          }`}
        >
          <Plus size={16} /> {idea.inInspiration ? 'In Inspiration' : 'Add to Inspiration'}
        </button>
      </div>
    </div>
  );
}
