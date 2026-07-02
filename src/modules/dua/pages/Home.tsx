import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Plus, Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useDuas } from '@/modules/dua/features/duas/hooks/useDuas';
import { DuaCard } from '@/modules/dua/features/duas/components/DuaCard';
import { CollectionCard } from '@/modules/dua/features/duas/components/CollectionCard';
import { EmptyState } from '@/modules/dua/shared/components/EmptyState';
import { Skeleton } from '@/modules/dua/shared/components/Skeleton';
import { categoryIcon, categoryColors, categoryLabel } from '@/modules/dua/lib/categories';
import type { DuaCategory } from '@/modules/dua/types';
import { formatDistanceToNowStrict } from 'date-fns';

const HOME_COLLECTIONS: { id: DuaCategory; description: string }[] = [
  { id: 'daily', description: 'Morning, Evening Adhkar & more' },
  { id: 'family', description: 'Duas for family, parents & children' },
  { id: 'travel', description: 'Duas for travel, journey & safety' },
  { id: 'provision', description: 'Rizq, sustenance & barakah' },
  { id: 'health', description: 'Healing, protection & wellbeing' },
  { id: 'ratib', description: 'Ratib al-Haddad & others' },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const { duas, favorites, continueReading, isLoading } = useDuas();

  return (
    <div className="min-h-screen bg-cream pb-40">
      <header className="px-4 pt-6 pb-1 flex items-center justify-between">
        <button onClick={() => navigate('/')} aria-label="Back to Safar" className="w-9 h-9 rounded-full flex items-center justify-center text-text-primary">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-page-title text-brown">Dua</h1>
        <button onClick={() => navigate('/dua/more')} aria-label="Reminders" className="w-9 h-9 rounded-full flex items-center justify-center text-text-primary">
          <Bell size={20} />
        </button>
      </header>

      <div className="flex items-center justify-center gap-2 pb-5 text-center">
        <span dir="rtl" lang="ar" className="font-arabic text-lg text-text-secondary">السلام عليكم</span>
        <span className="text-body text-text-primary font-medium">{firstName}</span>
        <Leaf size={15} className="text-accent-green-fg rotate-12" />
      </div>

      <section className="px-4 mb-6">
        <h2 className="text-home-section-heading text-text-primary mb-3">Collections</h2>
        <div className="grid grid-cols-2 gap-3">
          {HOME_COLLECTIONS.map(({ id, description }) => {
            const Icon = categoryIcon(id);
            const colors = categoryColors(id);
            return (
              <CollectionCard key={id} category={id} label={categoryLabel(id)} description={description} icon={Icon} bg={colors.bg} fg={colors.fg} />
            );
          })}
        </div>
        <div className="mt-3">
          <CollectionCard
            category="quran"
            label="Quranic Duas"
            description="Duas from the Quran"
            icon={categoryIcon('quran')}
            bg={categoryColors('quran').bg}
            fg={categoryColors('quran').fg}
            wide
          />
        </div>
      </section>

      {isLoading ? (
        <div className="px-4 space-y-3">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
        </div>
      ) : duas.length === 0 ? (
        <div className="px-4">
          <EmptyState
            title="Your library is empty"
            description="Add the first dua you want to keep close."
            action={
              <button onClick={() => navigate('/dua/dua/new')} className="bg-brown text-cream rounded-button px-5 py-2.5 text-caption-md font-semibold">
                Add your first dua
              </button>
            }
          />
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
            <section className="px-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-home-section-heading text-text-primary">Favorites</h2>
                <button onClick={() => navigate('/dua/duas?filter=favorites')} className="text-caption text-brown">View all</button>
              </div>
              <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border/60 overflow-hidden">
                {favorites.slice(0, 5).map((dua) => <DuaCard key={dua.id} dua={dua} />)}
              </div>
            </section>
          )}

          {continueReading.length > 0 && (
            <section className="px-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-home-section-heading text-text-primary">Recent</h2>
                <button onClick={() => navigate('/dua/duas?sort=recent')} className="text-caption text-brown">View all</button>
              </div>
              <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border/60 overflow-hidden">
                {continueReading.map((dua) => (
                  <DuaCard key={dua.id} dua={dua} meta={formatDistanceToNowStrict(dua.lastOpenedAt!, { addSuffix: true })} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <button
        onClick={() => navigate('/dua/dua/new')}
        aria-label="Add a new dua"
        className="fixed bottom-24 right-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-brown text-cream flex items-center justify-center shadow-button active:scale-[0.96] transition-transform duration-100"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
