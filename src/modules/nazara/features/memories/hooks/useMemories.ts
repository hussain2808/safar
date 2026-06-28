import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/nazara/db';
import type { MemoryRecord } from '@/modules/nazara/types';
import { isSameMonthDay, getDaysUntilNextAnniversary } from '@/modules/nazara/lib/utils';

export interface HomePageData {
  onDate: MemoryRecord[];
  upcoming: MemoryRecord[];
  nearby: { yesterday: MemoryRecord[]; tomorrow: MemoryRecord[] };
}

export function useMemories() {
  const memories = useLiveQuery(() => db.memories.toArray(), [], undefined);

  const sorted = useMemo(
    () => (memories ?? []).slice().sort((a, b) => b.date - a.date),
    [memories],
  );

  return { memories: sorted, isLoading: memories === undefined };
}

export function getHomePageData(memories: MemoryRecord[], viewDate: Date = new Date()): HomePageData {
  const yesterday = new Date(viewDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(viewDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const onDate = memories.filter((m) => isSameMonthDay(new Date(m.date), viewDate));
  const yesterdayMemories = memories.filter((m) => isSameMonthDay(new Date(m.date), yesterday));
  const tomorrowMemories = memories.filter((m) => isSameMonthDay(new Date(m.date), tomorrow));

  const upcoming = memories
    .filter((m) => m.notifyYearly && !isSameMonthDay(new Date(m.date), viewDate))
    .map((m) => ({ memory: m, daysUntil: getDaysUntilNextAnniversary(new Date(m.date)) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10)
    .map((entry) => entry.memory);

  return {
    onDate,
    upcoming,
    nearby: { yesterday: yesterdayMemories, tomorrow: tomorrowMemories },
  };
}

export function getRelatedMemories(memories: MemoryRecord[], memory: MemoryRecord, limit = 5): MemoryRecord[] {
  return memories
    .filter((m) => m.id !== memory.id)
    .filter((m) => m.category === memory.category || m.people.some((p) => memory.people.includes(p)))
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
}

export function getPeople(memories: MemoryRecord[]): string[] {
  const set = new Set<string>();
  for (const m of memories) {
    for (const p of m.people) set.add(p);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
