import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, MoreHorizontal, Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { DuaForm, draftFromDua, type DuaDraft } from '@/modules/dua/features/duas/components/DuaForm';
import { DuaReader } from '@/modules/dua/features/duas/components/DuaReader';
import { ReaderToolbar } from '@/modules/dua/features/duas/components/ReaderToolbar';
import type { FontScale } from '@/modules/dua/features/duas/components/ContentBlockView';
import { useDua } from '@/modules/dua/features/duas/hooks/useDua';
import { createDua, updateDua, deleteDua, toggleFavorite, toggleArchived, markOpened } from '@/modules/dua/db/duas';
import { categoryLabel } from '@/modules/dua/lib/categories';

const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg'];

export default function DuaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { dua, isLoading } = useDua(isNew ? undefined : id);

  const [mode, setMode] = useState<'view' | 'edit'>(isNew ? 'edit' : 'view');
  const [draft, setDraft] = useState<DuaDraft>(() => draftFromDua(null));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fontScale, setFontScale] = useState<FontScale>('md');
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    if (!isNew && dua) setDraft(draftFromDua(dua));
  }, [isNew, dua]);

  useEffect(() => {
    if (!isNew && dua && id) markOpened(id).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, id, !!dua]);

  useEffect(() => {
    function onScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;
      setShowScrollHint(!nearBottom);
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [dua]);

  if (!isNew && isLoading) {
    return <div className="min-h-screen bg-cream" />;
  }

  if (!isNew && !isLoading && !dua) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-body text-text-secondary">Dua not found.</p>
      </div>
    );
  }

  async function handleSave() {
    if (!draft.title.trim()) return;
    setSaving(true);
    const payload = {
      title: draft.title.trim(),
      category: draft.category,
      contentBlocks: draft.contentBlocks,
      notes: draft.notes.trim() || undefined,
    };

    if (isNew) {
      const result = await createDua(payload);
      setSaving(false);
      if (result.ok) navigate(`/dua/dua/${result.data.id}`, { replace: true });
    } else if (id) {
      await updateDua(id, payload);
      setSaving(false);
      setMode('view');
    }
  }

  async function handleDelete() {
    if (!id) return;
    await deleteDua(id);
    navigate('/dua');
  }

  if (mode === 'edit') {
    return (
      <div className="min-h-screen bg-cream">
        <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
          <button
            onClick={() => (isNew ? navigate(-1) : setMode('view'))}
            className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          {!isNew && (
            <button onClick={() => setConfirmingDelete(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-accent-pink-fg active:bg-card-border transition-colors" aria-label="Delete dua">
              <Trash2 size={18} />
            </button>
          )}
        </header>

        <main className="px-4 pb-32">
          <DuaForm draft={draft} onChange={setDraft} />
        </main>

        <div className="fixed bottom-8 inset-x-4">
          <button
            onClick={handleSave}
            disabled={saving || !draft.title.trim()}
            className="w-full bg-brown text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Add Dua' : 'Save Changes'}
          </button>
        </div>

        {confirmingDelete && (
          <DeleteConfirm onCancel={() => setConfirmingDelete(false)} onConfirm={handleDelete} />
        )}
      </div>
    );
  }

  if (!dua) return null;

  const verses = dua.contentBlocks.reduce<{ number: number; preview: string }[]>((acc, block) => {
    if (block.type === 'arabic') acc.push({ number: acc.length + 1, preview: block.text?.slice(0, 40) ?? '' });
    return acc;
  }, []);

  function jumpToVerse(number: number) {
    document.getElementById(`verse-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cycleFontScale() {
    setFontScale((current) => FONT_SCALES[(FONT_SCALES.indexOf(current) + 1) % FONT_SCALES.length]);
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="px-2 pt-12 pb-2 flex items-center justify-between sticky top-0 bg-cream z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors" aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 bg-card-bg rounded-card shadow-card py-1 w-48 z-20">
                <button onClick={() => { setMenuOpen(false); setMode('edit'); }} className="w-full text-left px-4 py-2.5 text-caption-md text-text-primary flex items-center gap-2">
                  <Pencil size={14} />
                  Edit dua
                </button>
                <button
                  onClick={() => { setMenuOpen(false); toggleArchived(dua.id, !dua.archived); if (!dua.archived) navigate('/dua'); }}
                  className="w-full text-left px-4 py-2.5 text-caption-md text-text-primary flex items-center gap-2"
                >
                  {dua.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  {dua.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button onClick={() => { setMenuOpen(false); setConfirmingDelete(true); }} className="w-full text-left px-4 py-2.5 text-caption-md text-accent-pink-fg flex items-center gap-2">
                  <Trash2 size={14} />
                  Delete dua
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="px-5 pb-10">
        <div className="text-center mb-6">
          <h1 className="font-serif text-page-title text-text-primary leading-tight">{dua.title}</h1>
          <p className="text-caption text-text-secondary mt-1">{categoryLabel(dua.category)}</p>
        </div>

        {dua.contentBlocks.length === 0 ? (
          <p className="text-body text-text-secondary text-center py-8">No content yet. Tap edit to add words.</p>
        ) : (
          <DuaReader
            blocks={dua.contentBlocks}
            fontScale={fontScale}
            showTransliteration={showTransliteration}
            showTranslation={showTranslation}
          />
        )}

        {dua.notes && (
          <div className="mt-8">
            <h2 className="text-caption text-text-secondary uppercase tracking-wide mb-2">Notes</h2>
            <div className="bg-icon-bg/60 rounded-card p-4">
              <p className="text-body text-text-primary whitespace-pre-wrap">{dua.notes}</p>
            </div>
          </div>
        )}
      </main>

      {showScrollHint && dua.contentBlocks.length > 0 && (
        <button
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' })}
          aria-label="Scroll down"
          className="fixed bottom-24 right-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-card-bg shadow-card flex items-center justify-center text-text-secondary animate-bounce"
        >
          <ChevronDown size={18} />
        </button>
      )}

      <ReaderToolbar
        verses={verses}
        onJumpToVerse={jumpToVerse}
        favorite={dua.favorite}
        onToggleFavorite={() => toggleFavorite(dua.id, !dua.favorite)}
        fontScale={fontScale}
        onCycleFontScale={cycleFontScale}
        showTransliteration={showTransliteration}
        onToggleTransliteration={() => setShowTransliteration((v) => !v)}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation((v) => !v)}
      />

      {confirmingDelete && (
        <DeleteConfirm onCancel={() => setConfirmingDelete(false)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6" onClick={onCancel}>
      <div className="bg-card-bg rounded-card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <p className="text-body text-text-primary mb-1">Delete this dua?</p>
        <p className="text-caption text-text-secondary mb-4">This can't be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 bg-icon-bg text-text-primary rounded-button py-2.5 text-caption-md">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-accent-pink-bg text-accent-pink-fg rounded-button py-2.5 text-caption-md">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
