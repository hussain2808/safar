import { Camera, Leaf, Car, Gem, Plane, BookOpen, Home, Moon, Heart, Package } from 'lucide-react';
import type { WishCategoryId } from '@/modules/wishbook/types';

export const WISH_CATEGORIES: {
  id: WishCategoryId;
  label: string;
  icon: typeof Camera;
  bg: string;
  fg: string;
}[] = [
  { id: 'electronics', label: 'Electronics',      icon: Camera,   bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { id: 'plants',      label: 'Plants & Garden',   icon: Leaf,     bg: 'bg-[#FFF3DC]',        fg: 'text-[#C8922E]' },
  { id: 'vehicles',    label: 'Vehicles',           icon: Car,      bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { id: 'jewelry',     label: 'Gifts & Jewelry',    icon: Gem,      bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg' },
  { id: 'travel',      label: 'Travel',             icon: Plane,    bg: 'bg-accent-blue-bg',   fg: 'text-accent-blue-fg' },
  { id: 'education',   label: 'Education',          icon: BookOpen, bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
  { id: 'home',        label: 'Home',               icon: Home,     bg: 'bg-[#FFF3DC]',        fg: 'text-[#C8922E]' },
  { id: 'islamic',     label: 'Islamic',            icon: Moon,     bg: 'bg-[#FFF3DC]',        fg: 'text-[#C8922E]' },
  { id: 'health',      label: 'Health',             icon: Heart,    bg: 'bg-accent-pink-bg',   fg: 'text-accent-pink-fg' },
  { id: 'other',       label: 'Other',              icon: Package,  bg: 'bg-icon-bg',          fg: 'text-text-secondary' },
];

export function getCategoryById(id: WishCategoryId) {
  return WISH_CATEGORIES.find((c) => c.id === id) ?? WISH_CATEGORIES[WISH_CATEGORIES.length - 1];
}
