import { Banknote, CreditCard, Landmark, Smartphone, MoreHorizontal, type LucideIcon } from 'lucide-react';

export const PAYMENT_METHOD_MAP: Record<string, LucideIcon> = {
  cash:  Banknote,
  card:  CreditCard,
  bank:  Landmark,
  upi:   Smartphone,
  other: MoreHorizontal,
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:  'Cash',
  card:  'Card',
  bank:  'Bank Transfer',
  upi:   'UPI',
  other: 'Other',
};

export const PAYMENT_METHOD_IDS = Object.keys(PAYMENT_METHOD_MAP);

export function PaymentMethodIcon({ methodId, size = 14 }: { methodId?: string; size?: number }) {
  const Icon = (methodId && PAYMENT_METHOD_MAP[methodId]) || MoreHorizontal;
  return <Icon size={size} strokeWidth={1.5} />;
}
