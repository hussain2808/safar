import type { WishPriority, WishStatus } from '@/modules/wishbook/types';

export function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' });
}

export function formatDateFull(ts: number) {
  return new Date(ts).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysRemaining(targetDate: number): number {
  return Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getTimeLeft(targetDate: number): { label: string; className: string } {
  const days = Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Overdue', className: 'bg-red-50 text-red-500' };
  if (days === 0) return { label: 'Today', className: 'bg-red-50 text-red-500' };
  if (days < 30) return { label: `${days}d left`, className: 'bg-red-50 text-red-500' };
  const months = Math.round(days / 30);
  if (months < 4) return { label: `${months} months left`, className: 'bg-accent-orange-bg text-accent-orange-fg' };
  return { label: `${months} months left`, className: 'bg-accent-green-bg text-accent-green-fg' };
}

export const PRIORITY_STYLE: Record<WishPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'text-accent-blue-fg' },
  medium: { label: 'Medium', color: 'text-accent-orange-fg' },
  high:   { label: 'High',   color: 'text-red-500' },
};

export const STATUS_STYLE: Record<WishStatus, { label: string; bg: string; fg: string }> = {
  dreaming:  { label: 'Dreaming',  bg: 'bg-badge-bg',         fg: 'text-text-secondary' },
  planning:  { label: 'Planning',  bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg' },
  saving:    { label: 'Saving',    bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg' },
  ready:     { label: 'Ready',     bg: 'bg-emerald-50',       fg: 'text-emerald-700' },
  purchased: { label: 'Purchased', bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',           fg: 'text-red-500' },
};
