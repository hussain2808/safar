import { useNavigate } from 'react-router-dom';
import { Bell, Lightbulb, ChevronRight, ChevronLeft, Clock, Heart, MoreVertical, TreePine } from 'lucide-react';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { useRecentIdeas, useInspirationIdeas } from '@/modules/darussalam/features/ideas/hooks/useIdeas';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';
import { useHouseSettings } from '@/modules/darussalam/features/settings/useHouseSettings';
import { IdeaThumb } from '@/modules/darussalam/shared/components/IdeaThumb';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diff < hr) return `${Math.max(1, Math.round(diff / min))}m ago`;
  if (diff < day) return `${Math.round(diff / hr)}h ago`;
  return `${Math.round(diff / day)}d ago`;
}

export default function DarussalamHome() {
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const { ideas } = useRecentIdeas(3);
  const settings = useHouseSettings();
  const inspirationIdeas = useInspirationIdeas();
  const todaysInspiration = inspirationIdeas[0];

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#CFE0D6] via-[#E7DCC4] to-darussalam-bg px-5 pt-4 pb-8">
        <TreePine size={120} className="absolute -right-4 -top-2 text-darussalam-green/20" strokeWidth={1} />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-start gap-2">
            <button
              onClick={() => navigate('/')}
              aria-label="Back to Safar"
              className="w-9 h-9 -ml-1.5 mt-0.5 rounded-full bg-white/70 shadow-card flex items-center justify-center text-darussalam-green active:bg-white/90 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl border-2 border-darussalam-green flex items-center justify-center text-darussalam-green">
              <TreePine size={18} />
            </div>
            <div>
              <div className="font-serif text-2xl text-darussalam-green leading-tight">{settings.houseName}</div>
              {settings.houseSubtitle && (
                <div className="text-[11px] text-text-muted tracking-wide leading-tight">»» {settings.houseSubtitle} ««</div>
              )}
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center text-darussalam-green relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-darussalam-green" />
          </button>
        </div>

        <div className="relative z-10 text-center mt-8">
          <p dir="rtl" className="font-arabic text-2xl text-darussalam-green mb-2">
            رَبِّ أَنزِلْنِي مَنزِلًا مُّبَارَكًا
          </p>
          <p className="text-sm text-text-secondary italic">"My Lord, let me land at a blessed home."</p>
          <p className="text-xs text-text-muted mt-1">(Qur'an 23:29)</p>
        </div>

        <button
          onClick={() => navigate('/darussalam/capture')}
          className="relative z-10 w-full mt-6 bg-darussalam-green text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-button active:scale-[0.98] transition-transform"
        >
          <Lightbulb size={18} />
          <span className="font-medium">Capture an Idea</span>
        </button>
        <p className="relative z-10 text-center text-xs text-text-muted mt-2">Save ideas, images, thoughts in seconds</p>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
              <span>My House</span>
            </div>
            <button onClick={() => navigate('/darussalam/rooms')} className="flex items-center gap-0.5 text-darussalam-green text-xs font-medium">
              View All Rooms <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
            {rooms.slice(0, 5).map((room) => {
              const Icon = getRoomIcon(room.icon);
              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/darussalam/room/${room.id}`)}
                  className="flex-shrink-0 w-24 bg-darussalam-tile rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center active:scale-[0.97] transition-transform"
                >
                  <Icon size={20} className="text-darussalam-green" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-primary leading-tight">{room.name}</span>
                  <span className="text-[10px] text-text-muted">{room.ideaCount} ideas</span>
                </button>
              );
            })}
            {rooms.length === 0 && (
              <button
                onClick={() => navigate('/darussalam/room/new')}
                className="flex-shrink-0 w-24 border-2 border-dashed border-card-border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center text-darussalam-green"
              >
                <span className="text-lg leading-none">+</span>
                <span className="text-[10px] font-medium">Add Space</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TreePine size={14} className="text-text-secondary" />
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Today's Inspiration</h2>
                <p className="text-[11px] text-text-muted">A little inspiration for your dream home</p>
              </div>
            </div>
          </div>
          {todaysInspiration ? (
            <button
              onClick={() => navigate(`/darussalam/idea/${todaysInspiration.id}`)}
              className="relative w-full rounded-2xl overflow-hidden flex items-center justify-between gap-3 min-h-[110px] text-left"
            >
              <div className="absolute inset-0"><IdeaThumb ideaId={todaysInspiration.id} /></div>
              <div className="absolute inset-0 bg-black/25" />
              <p className="relative z-10 p-5 text-sm font-medium text-white leading-snug max-w-[70%]">
                {todaysInspiration.title}
              </p>
              <Heart size={16} className="relative z-10 mr-5 text-white flex-shrink-0" fill="currentColor" />
            </button>
          ) : (
            <div className="rounded-2xl bg-darussalam-tile p-5 min-h-[110px] flex items-center justify-center">
              <p className="text-sm text-text-muted text-center">
                Mark an idea as inspiration to see it here.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
              <Clock size={14} className="text-text-secondary" />
              <span>Recent Ideas</span>
            </div>
            <button onClick={() => navigate('/darussalam/capture')} className="flex items-center gap-0.5 text-darussalam-green text-xs font-medium">
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-card-border">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => navigate(`/darussalam/idea/${idea.id}`)}
                className="w-full flex items-center gap-3 py-3 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-darussalam-tile flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={16} className="text-darussalam-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary line-clamp-1">{idea.title}</h3>
                  <p className="text-xs text-text-muted line-clamp-1">
                    {idea.roomName ?? 'Unsorted'}{idea.tag ? ` · ${idea.tag}` : ''}
                  </p>
                </div>
                <span className="text-[11px] text-text-muted whitespace-nowrap">{timeAgo(idea.createdAt)}</span>
                <MoreVertical size={16} className="text-text-muted" />
              </button>
            ))}
            {ideas.length === 0 && (
              <p className="text-sm text-text-muted py-4 text-center">No ideas captured yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
