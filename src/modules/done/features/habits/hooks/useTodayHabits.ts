import { useMemo } from 'react';
import { useHabits } from './useHabits';
import { isDueOn, dateKey } from '@/modules/done/lib/recurrence';

export function useTodayHabits() {
  const { habits, completions, isLoading } = useHabits();

  const todayHabits = useMemo(() => {
    const today = new Date();
    const key = dateKey(today);
    return habits
      .filter((h) => isDueOn(h.schedule, h.startDate, today))
      .map((h) => ({ ...h, isDone: completions.some((c) => c.habitId === h.id && c.date === key) }))
      .sort((a, b) => Number(a.isDone) - Number(b.isDone));
  }, [habits, completions]);

  return { todayHabits, isLoading };
}
