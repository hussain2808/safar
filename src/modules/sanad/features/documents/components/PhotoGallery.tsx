import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { db } from '@/modules/sanad/db';
import { saveFile, deleteFile } from '@/modules/sanad/db/files';

interface PhotoGalleryProps {
  photoIds: string[];
  onChange: (photoIds: string[]) => void;
}

export function PhotoGallery({ photoIds, onChange }: PhotoGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  useEffect(() => {
    const revoke: string[] = [];
    (async () => {
      const entries = await Promise.all(
        photoIds.map(async (id) => {
          const photo = await db.files.get(id);
          if (!photo) return null;
          const url = URL.createObjectURL(photo.thumbnail ?? photo.blob);
          revoke.push(url);
          return [id, url] as const;
        }),
      );
      setUrls(Object.fromEntries(entries.filter(Boolean) as [string, string][]));
    })();
    return () => revoke.forEach((u) => URL.revokeObjectURL(u));
  }, [photoIds]);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    for (const file of files) {
      const result = await saveFile(file);
      if (result.ok) onChange([...photoIds, result.data.id]);
    }
  }

  async function handleRemove(id: string) {
    onChange(photoIds.filter((p) => p !== id));
    deleteFile(id).catch(console.error);
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {photoIds.map((id) => (
          <div key={id} className="relative aspect-square rounded-icon overflow-hidden bg-icon-bg">
            {urls[id] && (
              <img
                src={urls[id]}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setFullscreen(id)}
              />
            )}
            <button
              onClick={() => handleRemove(id)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <label className="aspect-square rounded-icon bg-icon-bg flex items-center justify-center text-text-secondary cursor-pointer">
          <Plus size={20} strokeWidth={1.5} />
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleAdd} />
        </label>
      </div>

      {fullscreen && urls[fullscreen] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setFullscreen(null)}
        >
          <img src={urls[fullscreen]} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  );
}
