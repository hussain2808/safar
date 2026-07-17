import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useIdeaFirstFile } from '@/modules/darussalam/features/ideas/hooks/useIdeas';

export function IdeaThumb({ ideaId, className }: { ideaId: string; className?: string }) {
  const file = useIdeaFirstFile(ideaId);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const objUrl = URL.createObjectURL(file.blob);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  if (url && file?.mimeType.startsWith('image/')) {
    return <img src={url} alt="" className={className ?? 'w-full h-full object-cover'} />;
  }

  return (
    <div className={`${className ?? 'w-full h-full'} bg-gradient-to-br from-[#8FA37D] to-[#D8CBA8] flex items-center justify-center`}>
      <Lightbulb size={22} className="text-white/80" />
    </div>
  );
}
