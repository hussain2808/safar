import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/done/db';
import { currentStreak, bestStreak } from '@/modules/done/lib/streak';
import { completionPercent, monthRange } from '@/modules/done/lib/stats';
import type { HabitRecord } from '@/modules/done/types';

export interface HabitWithStats extends HabitRecord {
  streak: number;
  best: number;
  monthPercent: number;
}

export function useHabits(opts: { includeArchived?: boolean } = {}) {
  const includeArchived = !!opts.includeArchived;
  const result = useLiveQuery(async () => {
    const [habits, completions] = await Promise.all([db.habits.toArray(), db.completions.toArray()]);
    return { habits, completions };
  });

  const habits = useMemo<HabitWithStats[]>(() => {
    if (!result) return [];
    const { habits: allHabits, completions } = result;
    const { from, to } = monthRange(new Date());
    return allHabits
      .filter((h) => (includeArchived ? true : !h.archived))
      .map((h) => ({
        ...h,
        streak: currentStreak(h, completions),
        best: bestStreak(h, completions),
        monthPercent: completionPercent(h, completions, from, to),
      }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt - b.createdAt);
  }, [result, includeArchived]);

  return { habits, completions: result?.completions ?? [], isLoading: result === undefined };
}
