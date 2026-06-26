import { Home, Plane, Car, ShoppingBag, Briefcase, Utensils, Heart, BookOpen, Landmark, Leaf, Hammer, Pill, Target, User, Wallet, type LucideIcon } from 'lucide-react';

export const BOOK_ICON_MAP: Record<string, LucideIcon> = {
  wallet:    Wallet,
  home:      Home,
  briefcase: Briefcase,
  shopping:  ShoppingBag,
  car:       Car,
  plane:     Plane,
  landmark:  Landmark,
  utensils:  Utensils,
  heart:     Heart,
  book:      BookOpen,
  leaf:      Leaf,
  hammer:    Hammer,
  pill:      Pill,
  target:    Target,
  user:      User,
};

export function BookIcon({ iconId, size = 18 }: { iconId?: string; size?: number }) {
  const Icon = (iconId && BOOK_ICON_MAP[iconId]) || Wallet;
  return <Icon size={size} strokeWidth={1.5} />;
}

const BOOK_COLOR_PALETTE = [
  { bg: 'bg-accent-pink-bg', fg: 'text-accent-pink-fg' },
  { bg: 'bg-accent-green-bg', fg: 'text-accent-green-fg' },
  { bg: 'bg-accent-purple-bg', fg: 'text-accent-purple-fg' },
  { bg: 'bg-accent-blue-bg', fg: 'text-accent-blue-fg' },
  { bg: 'bg-accent-orange-bg', fg: 'text-accent-orange-fg' },
];

export function getBookColor(index: number) {
  return BOOK_COLOR_PALETTE[index % BOOK_COLOR_PALETTE.length];
}
