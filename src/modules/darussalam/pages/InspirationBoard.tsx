import { useNavigate } from 'react-router-dom';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { IdeaThumb } from '@/modules/darussalam/shared/components/IdeaThumb';
import { useInspirationIdeas } from '@/modules/darussalam/features/ideas/hooks/useIdeas';

export default function DarussalamInspirationBoard() {
  const navigate = useNavigate();
  const ideas = useInspirationIdeas();

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Inspiration Board</h1>
        <p className="text-sm text-text-secondary mt-1">Everything you've saved for later, in one place.</p>
      </div>

      <div className="px-5 mt-5">
        {ideas.length === 0 ? (
          <div className="bg-card-bg rounded-card shadow-card p-6 text-center">
            <p className="text-sm text-text-muted">
              Nothing here yet. Open any idea and tap "Add to Inspiration" to start your board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => navigate(`/darussalam/idea/${idea.id}`)}
                className="aspect-square rounded-2xl overflow-hidden bg-darussalam-tile relative"
              >
                <IdeaThumb ideaId={idea.id} />
                <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1.5 line-clamp-1 text-left">
                  {idea.title}
                </span>
                {idea.roomName && (
                  <span className="absolute top-1.5 left-1.5 bg-white/85 text-[10px] text-text-secondary px-2 py-0.5 rounded-full">
                    {idea.roomName}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
