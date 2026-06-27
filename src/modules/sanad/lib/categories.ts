import { Fingerprint, Users, Landmark, HeartPulse, MoreHorizontal } from 'lucide-react';
import type { DocumentCategory } from '@/modules/sanad/types';

export const CATEGORIES: { id: DocumentCategory; label: string; icon: typeof Fingerprint; bg: string; fg: string }[] = [
  { id: 'identity', label: 'Identity',        icon: Fingerprint,    bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg' },
  { id: 'family',   label: 'Family',          icon: Users,          bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg' },
  { id: 'finance',  label: 'Finance & Legal', icon: Landmark,       bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { id: 'health',   label: 'Health',          icon: HeartPulse,     bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg' },
  { id: 'other',    label: 'Other',           icon: MoreHorizontal, bg: 'bg-badge-bg',         fg: 'text-text-secondary' },
];

export function categoryLabel(category: DocumentCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function categoryIcon(category: DocumentCategory) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? MoreHorizontal;
}

export function categoryColors(category: DocumentCategory) {
  const c = CATEGORIES.find((c) => c.id === category);
  return { bg: c?.bg ?? 'bg-badge-bg', fg: c?.fg ?? 'text-text-secondary' };
}
