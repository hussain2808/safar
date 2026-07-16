import type { HabitRecord, HabitCompletion } from '@/modules/done/types';
import { occurrencesBetween, dateKey } from './recurrence';
import { dayStatus } from './dayStatus';

export function currentStreak(habit: HabitRecord, completions: HabitCompletion[]): number {
  const doneDates = new Set(completions.filter((c) => c.habitId === habit.id).map((c) => c.date));
  const today = new Date();
  const occurrences = occurrencesBetween(habit.schedule, habit.startDate, new Date(habit.startDate), today)
    .sort((a, b) => b.getTime() - a.getTime());

  const todayKey = dateKey(today);
  let streak = 0;
  for (const occ of occurrences) {
    const key = dateKey(occ);
    if (doneDates.has(key)) {
      streak++;
    } else if (key === todayKey) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function bestStreak(habit: HabitRecord, completions: HabitCompletion[]): number {
  const doneDates = new Set(completions.filter((c) => c.habitId === habit.id).map((c) => c.date));
  const occurrences = occurrencesBetween(habit.schedule, habit.startDate, new Date(habit.startDate), new Date());
  let best = 0;
  let run = 0;
  for (const occ of occurrences) {
    if (doneDates.has(dateKey(occ))) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/** Aggregate streak across all habits: a day counts only if every habit due that day was completed. */
export function aggregateCurrentStreak(habits: HabitRecord[], completions: HabitCompletion[]): number {
  if (habits.length === 0) return 0;
  const earliest = Math.min(...habits.map((h) => h.startDate));
  const today = new Date();
  const todayKey = dateKey(today);
  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() >= earliest) {
    const status = dayStatus(habits, completions, cursor);
    if (status === 'none') {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const key = dateKey(cursor);
    if (status === 'done') {
      streak++;
    } else if (key === todayKey) {
      // today not finished yet — doesn't break the streak
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function aggregateBestStreak(habits: HabitRecord[], completions: HabitCompletion[]): number {
  if (habits.length === 0) return 0;
  const earliest = new Date(Math.min(...habits.map((h) => h.startDate)));
  earliest.setHours(0, 0, 0, 0);
  const today = new Date();
  let best = 0;
  let run = 0;
  const cursor = new Date(earliest);
  while (cursor.getTime() <= today.getTime()) {
    const status = dayStatus(habits, completions, cursor);
    if (status === 'done') {
      run++;
      best = Math.max(best, run);
    } else if (status === 'missed' || status === 'partial') {
      run = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return best;
}
