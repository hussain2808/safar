import type { Relationship } from '@/family/types';

export const RELATIONSHIPS: { id: Relationship; label: string }[] = [
  { id: 'spouse', label: 'Spouse' },
  { id: 'child', label: 'Child' },
  { id: 'parent', label: 'Parent' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'other', label: 'Other' },
];

export function relationshipLabel(relationship: Relationship): string {
  if (relationship === 'self') return 'Me';
  return RELATIONSHIPS.find((r) => r.id === relationship)?.label ?? relationship;
}
