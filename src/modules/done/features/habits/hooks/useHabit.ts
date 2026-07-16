import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/done/db';
import { currentStreak, bestStreak } from '@/modules/done/lib/streak';
import { completionPercent, totalCompleted, monthRange } from '@/modules/done/lib/stats';
import { dateKey } from '@/modules/done/lib/recurrence';

export function useHabit(habitId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!habitId) return null;
    const [habit, completions] = await Promise.all([
      db.habits.get(habitId),
      db.completions.where('habitId').equals(habitId).toArray(),
    ]);
    return habit ? { habit, completions } : null;
  }, [habitId]);

  const stats = useMemo(() => {
    if (!result) return null;
    const { habit, completions } = result;
    const { from, to } = monthRange(new Date());
    const todayKey = dateKey(new Date());
    return {
      streak: currentStreak(habit, completions),
      best: bestStreak(habit, completions),
      monthPercent: completionPercent(habit, completions, from, to),
      total: totalCompleted(habit, completions),
      isDoneToday: completions.some((c) => c.date === todayKey),
    };
  }, [result]);

  return {
    habit: result?.habit ?? null,
    completions: result?.completions ?? [],
    stats,
    isLoading: result === undefined,
  };
}
