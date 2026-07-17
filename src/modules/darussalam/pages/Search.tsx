import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Lightbulb, Home as HomeIcon, FileQuestion, Sparkles, FileStack } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { db } from '@/modules/darussalam/db';
import type { Room, Idea, Decision, WishlistItem, DocumentRecord } from '@/modules/darussalam/types';

interface SearchResults {
  rooms: Room[];
  ideas: Idea[];
  decisions: Decision[];
  wishlistItems: WishlistItem[];
  documents: DocumentRecord[];
}

const empty: SearchResults = { rooms: [], ideas: [], decisions: [], wishlistItems: [], documents: [] };

export default function DarussalamSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(empty);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults(empty); return; }
    let cancelled = false;

    (async () => {
      const [rooms, ideas, decisions, wishlistItems, documents] = await Promise.all([
        db.rooms.toArray(),
        db.ideas.toArray(),
        db.decisions.toArray(),
        db.wishlistItems.toArray(),
        db.documents.toArray(),
      ]);
      if (cancelled) return;
      setResults({
        rooms: rooms.filter((r) => r.name.toLowerCase().includes(q) || r.tagline?.toLowerCase().includes(q)),
        ideas: ideas.filter((i) => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tag?.toLowerCase().includes(q)),
        decisions: decisions.filter((d) => d.title.toLowerCase().includes(q) || d.reason?.toLowerCase().includes(q)),
        wishlistItems: wishlistItems.filter((w) => w.title.toLowerCase().includes(q)),
        documents: documents.filter((d) => d.name.toLowerCase().includes(q)),
      });
    })();

    return () => { cancelled = true; };
  }, [query]);

  const hasResults = results.rooms.length + results.ideas.length + results.decisions.length + results.wishlistItems.length + results.documents.length > 0;

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <div className="flex items-center gap-2 bg-card-bg rounded-full px-4 py-2.5 shadow-card">
          <SearchIcon size={16} className="text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms, ideas, decisions, documents…"
            className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {!query.trim() && <p className="text-sm text-text-muted text-center py-8">Start typing to search everything in Darussalam.</p>}
        {query.trim() && !hasResults && <p className="text-sm text-text-muted text-center py-8">No results for "{query}".</p>}

        {results.rooms.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Rooms</h2>
            <div className="space-y-2">
              {results.rooms.map((r) => (
                <button key={r.id} onClick={() => navigate(`/darussalam/room/${r.id}`)} className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left">
                  <HomeIcon size={16} className="text-darussalam-green" />
                  <span className="text-sm text-text-primary">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results.ideas.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Ideas</h2>
            <div className="space-y-2">
              {results.ideas.map((i) => (
                <button key={i.id} onClick={() => navigate(`/darussalam/idea/${i.id}`)} className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left">
                  <Lightbulb size={16} className="text-darussalam-green" />
                  <span className="text-sm text-text-primary line-clamp-1">{i.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results.decisions.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Decisions</h2>
            <div className="space-y-2">
              {results.decisions.map((d) => (
                <button key={d.id} onClick={() => navigate('/darussalam/decisions')} className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left">
                  <FileQuestion size={16} className="text-darussalam-green" />
                  <span className="text-sm text-text-primary line-clamp-1">{d.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results.wishlistItems.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Wishlist</h2>
            <div className="space-y-2">
              {results.wishlistItems.map((w) => (
                <button key={w.id} onClick={() => navigate('/darussalam/wishlist')} className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left">
                  <Sparkles size={16} className="text-darussalam-green" />
                  <span className="text-sm text-text-primary line-clamp-1">{w.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results.documents.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Documents</h2>
            <div className="space-y-2">
              {results.documents.map((d) => (
                <button key={d.id} onClick={() => navigate('/darussalam/documents')} className="w-full flex items-center gap-3 bg-card-bg rounded-card shadow-card p-3 text-left">
                  <FileStack size={16} className="text-darussalam-green" />
                  <span className="text-sm text-text-primary line-clamp-1">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
