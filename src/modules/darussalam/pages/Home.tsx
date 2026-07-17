import { useNavigate } from 'react-router-dom';
import { Bell, Lightbulb, ChevronRight, Clock, Heart, MoreVertical, TreePine } from 'lucide-react';
import { useRooms } from '@/modules/darussalam/features/rooms/hooks/useRooms';
import { useRecentIdeas } from '@/modules/darussalam/features/ideas/hooks/useIdeas';
import { getRoomIcon } from '@/modules/darussalam/lib/roomIcons';

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

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#CFE0D6] via-[#E7DCC4] to-darussalam-bg px-5 pt-4 pb-8">
        <TreePine size={120} className="absolute -right-4 -top-2 text-darussalam-green/20" strokeWidth={1} />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border-2 border-darussalam-green flex items-center justify-center text-darussalam-green">
              <TreePine size={18} />
            </div>
            <div>
              <div className="font-serif text-2xl text-darussalam-green leading-tight">Darussalam</div>
              <div className="text-[11px] text-text-muted tracking-wide leading-tight">»» Our Home, In Sha Allah ««</div>
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
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#D8CBA8] to-[#8FA37D] p-5 flex items-center justify-between gap-3 min-h-[110px]">
            <p className="text-sm font-medium text-white/95 leading-snug max-w-[60%]">
              Open spaces, natural light and greenery bring peace to the heart.
            </p>
            <button className="w-9 h-9 rounded-full bg-darussalam-green/80 flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </button>
          </div>
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
