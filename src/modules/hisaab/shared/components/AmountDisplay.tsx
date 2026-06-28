import { useState } from 'react';
import { cn } from '@/modules/hisaab/lib/utils';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { useUIStore } from '@/modules/hisaab/store/ui';

interface AmountDisplayProps {
  paise: number;
  currency?: string;
  size?: 'lg' | 'md' | 'sm';
  showSign?: boolean;
  className?: string;
  maskable?: boolean;
  forceReveal?: boolean;
}

export function AmountDisplay({ paise, currency, size = 'md', showSign = false, className, maskable = false, forceReveal = false }: AmountDisplayProps) {
  const maskAmounts = useUIStore((s) => s.maskAmounts);
  const [revealed, setRevealed] = useState(false);
  const isNegative = paise < 0;
  const sizeClass = size === 'lg' ? 'text-amount-lg' : size === 'md' ? 'text-amount-md' : 'text-amount-sm';
  const colorClass = paise === 0 ? 'text-hisaabText-primary' : isNegative ? 'text-hisaabAccent-negative' : 'text-hisaabAccent-positive';
  const masked = maskable && maskAmounts && !revealed && !forceReveal;

  return (
    <span
      onDoubleClick={maskable && maskAmounts ? (e) => { e.stopPropagation(); setRevealed((r) => !r); } : undefined}
      className={cn('font-sans tabular-nums', sizeClass, colorClass, className)}
    >
      {masked ? '••••••' : (
        <>
          {isNegative ? '-' : showSign && paise > 0 ? '+' : ''}
          {formatAmount(Math.abs(paise), currency)}
        </>
      )}
    </span>
  );
}
