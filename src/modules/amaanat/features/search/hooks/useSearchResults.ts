import Fuse, { type FuseResultMatch } from 'fuse.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/amaanat/db';
import { categoryLabel } from '@/modules/amaanat/lib/categories';
import type { Item } from '@/modules/amaanat/types';

interface SearchableItem {
  item: Item;
  name: string;
  categoryLabel: string;
  merchant: string;
  serialNumber: string;
  notes: string;
}

export interface SearchMatch {
  item: Item;
  matches: readonly FuseResultMatch[];
}

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<SearchableItem>>[1] = {
  keys: ['name', 'categoryLabel', 'merchant', 'serialNumber', 'notes'],
  includeMatches: true,
  threshold: 0.35,
  ignoreLocation: true,
};

export function useSearchResults(query: string) {
  const data = useLiveQuery(() => db.items.toArray());

  const searchable = useMemo<SearchableItem[]>(() => {
    if (!data) return [];
    return data.map((item) => ({
      item,
      name: item.name,
      categoryLabel: categoryLabel(item.category),
      merchant: item.merchant ?? '',
      serialNumber: item.serialNumber ?? '',
      notes: item.notes ?? '',
    }));
  }, [data]);

  const fuse = useMemo(() => new Fuse(searchable, FUSE_OPTIONS), [searchable]);

  const results = useMemo<SearchMatch[]>(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).map((hit) => ({ item: hit.item.item, matches: hit.matches ?? [] }));
  }, [fuse, query]);

  return { results, isLoading: data === undefined };
}
