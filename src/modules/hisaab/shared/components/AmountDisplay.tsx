import { cn } from '@/modules/hisaab/lib/utils';
import { formatAmount } from '@/modules/hisaab/lib/format';

interface AmountDisplayProps {
  paise: number;
  currency?: string;
  size?: 'lg' | 'md' | 'sm';
  showSign?: boolean;
  className?: string;
}

export function AmountDisplay({ paise, currency, size = 'md', showSign = false, className }: AmountDisplayProps) {
  const isNegative = paise < 0;
  const sizeClass = size === 'lg' ? 'text-amount-lg' : size === 'md' ? 'text-amount-md' : 'text-amount-sm';
  const colorClass = paise === 0 ? 'text-hisaabText-primary' : isNegative ? 'text-hisaabAccent-negative' : 'text-hisaabAccent-positive';

  return (
    <span className={cn('font-sans tabular-nums', sizeClass, colorClass, className)}>
      {isNegative ? '-' : showSign && paise > 0 ? '+' : ''}
      {formatAmount(Math.abs(paise), currency)}
    </span>
  );
}
