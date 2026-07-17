import { Box, Lightbulb, PaintRoller, LayoutGrid, Leaf, Tag } from 'lucide-react';

export const categoryIconMap: Record<string, typeof Tag> = {
  Storage: Box,
  Lighting: Lightbulb,
  Wall: PaintRoller,
  Layout: LayoutGrid,
  Garden: Leaf,
};

export function getCategoryIcon(category?: string) {
  if (!category) return Tag;
  return categoryIconMap[category] ?? Tag;
}
