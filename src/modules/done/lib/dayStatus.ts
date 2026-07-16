import type { HabitRecord, HabitCompletion } from '@/modules/done/types';
import { isDueOn, dateKey } from './recurrence';

export type DayStatus = 'done' | 'partial' | 'missed' | 'future' | 'none';

export function dayStatus(habits: HabitRecord[], completions: HabitCompletion[], date: Date): DayStatus {
  const key = dateKey(date);
  const todayKey = dateKey(new Date());
  const due = habits.filter((h) => isDueOn(h.schedule, h.startDate, date));
  if (due.length === 0) return 'none';
  if (key > todayKey) return 'future';
  const doneCount = due.filter((h) => completions.some((c) => c.habitId === h.id && c.date === key)).length;
  if (doneCount === 0) return 'missed';
  if (doneCount === due.length) return 'done';
  return 'partial';
}
