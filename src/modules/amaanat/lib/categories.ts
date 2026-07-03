import { Laptop, Gem, Car, Building2, FileText, Coins, CircleDot } from 'lucide-react';
import type { ItemCategory } from '@/modules/amaanat/types';

export const CATEGORIES: { id: ItemCategory; label: string; icon: typeof Laptop }[] = [
  { id: 'electronics', label: 'Electronics', icon: Laptop },
  { id: 'valuables', label: 'Valuables', icon: Gem },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'property', label: 'Home & Assets', icon: Building2 },
  { id: 'gold',     label: 'Gold',          icon: Coins },
  { id: 'silver',   label: 'Silver',        icon: CircleDot },
  { id: 'records',  label: 'Other',         icon: FileText },
];

export function categoryLabel(category: ItemCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function categoryIcon(category: ItemCategory) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? FileText;
}
