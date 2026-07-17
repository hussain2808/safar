import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil, MoreVertical, Lightbulb, Ruler, FileText, StickyNote, MoreHorizontal,
  Leaf, Sparkles, CheckSquare, Bookmark, Clock, Plus,
} from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { useRoom, useRoomTopIdeas } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';

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
  const [tab, setTab] = useState<Tab>('overview');

  if (!room) {
    return (
      <div className="min-h-screen bg-darussalam-bg pb-28">
        <DarussalamHeader showBack />
      </div>
    );
  }

  const Icon = getRoomIcon(room.icon);
  const progress = room.progress;
  const percent = progress ? Math.round((progress.ideas.current / progress.ideas.target) * 100) : 0;

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack actions={<><button className="text-darussalam-green"><Pencil size={18} /></button><button className="text-darussalam-green"><MoreVertical size={20} /></button></>} />

      <div className="relative mx-5 rounded-3xl overflow-hidden bg-gradient-to-br from-[#8FA37D] to-[#D8CBA8] p-5 min-h-[190px] flex flex-col justify-end">
        <div className="absolute top-4 left-4 w-14 h-14 rounded-2xl bg-white/85 flex items-center justify-center">
          <Icon size={24} className="text-darussalam-green" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl text-white mt-16">{room.name}</h1>
        <p className="text-sm text-white/90 mt-0.5">{room.tagline} ♥</p>
        <div className="flex gap-5 mt-3 text-white">
          <div className="flex items-center gap-1.5 text-sm"><Lightbulb size={14} /> {room.ideaCount} <span className="text-white/70 text-xs">Ideas</span></div>
          <div className="flex items-center gap-1.5 text-sm"><Ruler size={14} /> {room.measurementsCount} <span className="text-white/70 text-xs">Measurements</span></div>
          <div className="flex items-center gap-1.5 text-sm"><FileText size={14} /> {room.documentsCount} <span className="text-white/70 text-xs">Documents</span></div>
          <div className="flex items-center gap-1.5 text-sm"><StickyNote size={14} /> {room.notesCount} <span className="text-white/70 text-xs">Notes</span></div>
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
          {room.description && (
            <div className="bg-card-bg rounded-card shadow-card p-4">
              <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
                <Leaf size={14} className="text-text-secondary" /> About this room
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{room.description}</p>
              {room.moodTags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {room.moodTags.map((tag) => (
                    <span key={tag} className="text-xs bg-darussalam-tile text-text-secondary px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {room.colorPalette && (
              <div className="bg-card-bg rounded-card shadow-card p-4">
                <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
                  <Sparkles size={14} className="text-text-secondary" /> Mood &amp; Style
                </div>
                {room.moodStyle && <p className="text-xs text-text-secondary mb-2">{room.moodStyle}</p>}
                <div className="flex gap-2">
                  {room.colorPalette.map((hex) => (
                    <span key={hex} className="w-7 h-7 rounded-full border border-card-border" style={{ background: hex }} />
                  ))}
                </div>
                {room.materials && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {room.materials.map((m) => (
                      <span key={m} className="text-[10px] bg-darussalam-tile text-text-secondary px-2 py-0.5 rounded-md">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {room.requirements && (
              <div className="bg-card-bg rounded-card shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                    <CheckSquare size={14} className="text-text-secondary" /> Key Requirements
                  </div>
                </div>
                <div className="space-y-1.5">
                  {room.requirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center ${req.done ? 'bg-darussalam-green' : 'border border-text-muted'}`}>
                        {req.done && <CheckSquare size={9} className="text-white" />}
                      </span>
                      <span className={req.done ? 'text-text-primary' : 'text-text-muted'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  className="relative w-1/3 aspect-square rounded-xl bg-darussalam-tile flex items-center justify-center"
                >
                  <Lightbulb size={20} className="text-darussalam-green" />
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                    <Bookmark size={10} className="text-darussalam-green" />
                  </span>
                </button>
              ))}
              {topIdeas.length === 0 && <p className="text-xs text-text-muted">No ideas yet.</p>}
            </div>
            <button
              onClick={() => navigate('/darussalam/capture')}
              className="w-full border-2 border-dashed border-card-border rounded-xl py-2.5 flex items-center justify-center gap-2 text-darussalam-green text-sm font-medium"
            >
              <Plus size={15} /> Add Idea
            </button>
          </div>

          {progress && (
            <div className="bg-card-bg rounded-card shadow-card p-4">
              <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-text-primary">
                <Clock size={14} className="text-text-secondary" /> Room Progress
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#EFEAE0" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="16" fill="none" stroke="#2F4A32" strokeWidth="3"
                      strokeDasharray={`${percent} 100`} strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-serif text-lg text-text-primary">{percent}%</span>
                </div>
                <div className="flex-1 space-y-2">
                  {(Object.keys(progress) as (keyof typeof progress)[]).map((key) => {
                    const p = progress[key];
                    const pct = Math.round((p.current / p.target) * 100);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] text-text-secondary capitalize">
                          <span>{key}</span><span>{p.current} / {p.target}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-darussalam-tile mt-0.5">
                          <div className="h-1.5 rounded-full bg-darussalam-green" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="w-full mt-3 border border-card-border rounded-xl py-2.5 flex items-center justify-center gap-2 text-darussalam-green text-sm font-medium">
                <Bookmark size={15} /> Inspiration Board
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'ideas' && (
        <div className="px-5 mt-4 space-y-2.5">
          {allRoomIdeas.length === 0 && <p className="text-sm text-text-muted text-center py-8">No ideas captured for this room yet.</p>}
          {allRoomIdeas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => navigate(`/darussalam/idea/${idea.id}`)}
              className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-darussalam-tile flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} className="text-darussalam-green" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary line-clamp-1">{idea.title}</h3>
                {idea.description && <p className="text-xs text-text-muted line-clamp-1">{idea.description}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {(tab === 'inspiration' || tab === 'measurements' || tab === 'notes' || tab === 'more') && (
        <div className="px-5 mt-10 text-center">
          <p className="text-sm text-text-muted">This section is being designed. In sha Allah, coming soon.</p>
        </div>
      )}
    </div>
  );
}
