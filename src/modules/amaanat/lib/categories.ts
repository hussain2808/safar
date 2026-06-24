import { Smartphone, Gem, Car, Home, FileText } from 'lucide-react';
import type { ItemCategory } from '@/modules/amaanat/types';

export const CATEGORIES: { id: ItemCategory; label: string; icon: typeof Smartphone }[] = [
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'valuables', label: 'Valuables', icon: Gem },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'records', label: 'Records', icon: FileText },
];

export function categoryLabel(category: ItemCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function categoryIcon(category: ItemCategory) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? FileText;
}
