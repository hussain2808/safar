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
