import { Flower2 } from 'lucide-react';
import { ContentBlockView, type FontScale } from '@/modules/dua/features/duas/components/ContentBlockView';
import type { ContentBlock } from '@/modules/dua/types';

interface DuaReaderProps {
  blocks: ContentBlock[];
  fontScale: FontScale;
  showTransliteration: boolean;
  showTranslation: boolean;
}

export function DuaReader({ blocks, fontScale, showTransliteration, showTranslation }: DuaReaderProps) {
  let verseNumber = 0;

  return (
    <div className="space-y-6">
      <BasmalaHeader />
      {blocks.map((block) => {
        if (block.type === 'transliteration' && !showTransliteration) return null;
        if (block.type === 'translation' && !showTranslation) return null;
        const isArabic = block.type === 'arabic';
        if (isArabic) verseNumber += 1;
        return (
          <div key={block.id} id={isArabic ? `verse-${verseNumber}` : undefined}>
            <ContentBlockView block={block} verseNumber={isArabic ? verseNumber : undefined} fontScale={fontScale} />
          </div>
        );
      })}
    </div>
  );
}

function BasmalaHeader() {
  return (
    <div className="flex flex-col items-center gap-2 pb-2">
      <p dir="rtl" lang="ar" className="font-arabic text-2xl text-brown text-center">
        بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ
      </p>
      <div className="flex items-center gap-2 w-24">
        <span className="h-px flex-1 bg-card-border" />
        <Flower2 size={12} className="text-text-muted" strokeWidth={1.5} />
        <span className="h-px flex-1 bg-card-border" />
      </div>
    </div>
  );
}
