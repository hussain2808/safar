import { Banknote, Tag, RotateCcw, Home, TrendingUp, UtensilsCrossed, ShoppingBag, Fuel, Receipt, Plane, Stethoscope, GraduationCap, Hammer, Wheat, TrendingDown, MoreHorizontal, type LucideIcon } from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  banknote:        Banknote,
  tag:             Tag,
  'rotate-ccw':    RotateCcw,
  home:            Home,
  'trending-up':   TrendingUp,
  utensils:        UtensilsCrossed,
  'shopping-bag':  ShoppingBag,
  fuel:            Fuel,
  receipt:         Receipt,
  plane:           Plane,
  stethoscope:     Stethoscope,
  'graduation-cap': GraduationCap,
  hammer:          Hammer,
  wheat:           Wheat,
  'trending-down': TrendingDown,
  'more-horizontal': MoreHorizontal,
};

export const CATEGORY_ICON_IDS = Object.keys(CATEGORY_ICON_MAP);

export function CategoryIcon({ iconId, size = 14 }: { iconId?: string; size?: number }) {
  const Icon = (iconId && CATEGORY_ICON_MAP[iconId]) || MoreHorizontal;
  return <Icon size={size} strokeWidth={1.5} />;
}
