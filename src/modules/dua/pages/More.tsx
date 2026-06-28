import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Archive, Bell, BookMarked, Users } from 'lucide-react';
import { db } from '@/modules/dua/db';

export default function More() {
  const navigate = useNavigate();
  const archivedCount = useLiveQuery(() => db.duas.filter((d) => d.archived).count(), [], 0);

  return (
    <div className="min-h-screen bg-cream pb-32">
      <header className="px-5 pt-6 pb-4 flex items-center gap-2">
        <button onClick={() => navigate('/dua')} className="w-9 h-9 -ml-1.5 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary active:bg-card-border transition-colors flex-shrink-0" aria-label="Back to Dua">
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary leading-tight">More</h1>
      </header>

      <main className="px-4 space-y-6">
        <section className="bg-card-bg rounded-card shadow-card divide-y divide-card-border/60 overflow-hidden">
          <Row icon={Archive} label="Archived" trailing={archivedCount ? String(archivedCount) : undefined} onClick={() => navigate('/dua/duas?filter=archived')} />
        </section>

        <section>
          <h2 className="text-caption text-text-secondary uppercase tracking-wide mb-2 px-1">Coming Soon</h2>
          <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border/60 overflow-hidden opacity-70">
            <Row icon={Bell} label="Reminders" description="Every morning, evening, or Friday" />
            <Row icon={BookMarked} label="Reading Position" description="Pick up long ratibs where you left off" />
            <Row icon={Users} label="Family Sharing" description="Share selected duas with family" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Row({
  icon: Icon, label, description, trailing, onClick,
}: { icon: typeof Archive; label: string; description?: string; trailing?: string; onClick?: () => void }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-icon-bg/60 transition-colors">
      <div className="w-9 h-9 rounded-icon bg-icon-bg flex items-center justify-center flex-shrink-0 text-text-secondary">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption-md text-text-primary">{label}</p>
        {description && <p className="text-[11px] text-text-secondary mt-0.5">{description}</p>}
      </div>
      {trailing && <span className="text-caption text-text-secondary">{trailing}</span>}
      {onClick && <ChevronRight size={16} className="text-text-secondary flex-shrink-0" />}
    </Wrapper>
  );
}
