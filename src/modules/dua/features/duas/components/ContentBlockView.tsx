import { Sparkles, Flower2 } from 'lucide-react';
import { cn } from '@/modules/dua/lib/utils';
import type { ContentBlock } from '@/modules/dua/types';

export type FontScale = 'sm' | 'md' | 'lg';

const ARABIC_SIZE: Record<FontScale, string> = {
  sm: 'text-xl',
  md: 'text-[26px]',
  lg: 'text-3xl',
};

interface ContentBlockViewProps {
  block: ContentBlock;
  verseNumber?: number;
  fontScale?: FontScale;
}

export function ContentBlockView({ block, verseNumber, fontScale = 'md' }: ContentBlockViewProps) {
  switch (block.type) {
    case 'arabic':
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          {verseNumber !== undefined && (
            <span className="w-7 h-7 rounded-full bg-icon-bg text-text-secondary text-caption flex items-center justify-center">
              {verseNumber}
            </span>
          )}
          <p dir="rtl" lang="ar" className={cn('font-arabic leading-[2] text-text-primary', ARABIC_SIZE[fontScale])}>
            {block.text}
          </p>
          <Sparkles size={14} className="text-gold" strokeWidth={1.5} />
        </div>
      );
    case 'transliteration':
      return (
        <p className="text-body text-accent-green-fg italic text-center leading-relaxed">
          {block.text}
        </p>
      );
    case 'translation':
      return (
        <p className="text-body text-text-secondary text-center leading-relaxed">
          {block.text}
        </p>
      );
    case 'reflection':
      return (
        <p className="text-caption-md text-brown bg-icon-bg/60 rounded-icon px-3.5 py-2.5 leading-relaxed">
          {block.text}
        </p>
      );
    case 'divider':
      return (
        <div className="flex items-center justify-center gap-2 py-1 text-text-muted">
          <span className="h-px flex-1 bg-card-border" />
          <Flower2 size={14} strokeWidth={1.5} />
          <span className="h-px flex-1 bg-card-border" />
        </div>
      );
    default:
      return null;
  }
}
