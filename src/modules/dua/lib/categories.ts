import {
  Sun, Users, Heart, Plane, HeartPulse, Wheat, HandHeart,
  BookOpen, Layers, ScrollText, MoreHorizontal,
} from 'lucide-react';
import type { DuaCategory } from '@/modules/dua/types';

export const CATEGORIES: { id: DuaCategory; label: string; icon: typeof Sun; bg: string; fg: string }[] = [
  { id: 'daily',       label: 'Daily',       icon: Sun,           bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { id: 'family',      label: 'Family',      icon: Users,         bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg' },
  { id: 'personal',    label: 'Personal',    icon: Heart,         bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg' },
  { id: 'travel',      label: 'Travel',      icon: Plane,         bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg' },
  { id: 'health',      label: 'Health',      icon: HeartPulse,    bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg' },
  { id: 'provision',   label: 'Provision',   icon: Wheat,         bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { id: 'forgiveness', label: 'Forgiveness', icon: HandHeart,     bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { id: 'quran',       label: 'Quran',       icon: BookOpen,      bg: 'bg-accent-green-bg',  fg: 'text-accent-green-fg' },
  { id: 'ratib',       label: 'Ratib',       icon: Layers,        bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { id: 'hizb',        label: 'Hizb',        icon: ScrollText,    bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg' },
  { id: 'other',       label: 'Other',       icon: MoreHorizontal, bg: 'bg-badge-bg',        fg: 'text-text-secondary' },
];

export function categoryLabel(category: DuaCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function categoryIcon(category: DuaCategory) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? MoreHorizontal;
}

export function categoryColors(category: DuaCategory) {
  const c = CATEGORIES.find((c) => c.id === category);
  return { bg: c?.bg ?? 'bg-badge-bg', fg: c?.fg ?? 'text-text-secondary' };
}
