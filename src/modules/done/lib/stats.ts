import type { HabitRecord, HabitCompletion } from '@/modules/done/types';
import { occurrencesBetween, dateKey } from './recurrence';

export function completionPercent(
  habit: HabitRecord,
  completions: HabitCompletion[],
  from: Date,
  to: Date,
): number {
  const occurrences = occurrencesBetween(habit.schedule, habit.startDate, from, to);
  if (occurrences.length === 0) return 0;
  const doneDates = new Set(completions.filter((c) => c.habitId === habit.id).map((c) => c.date));
  const done = occurrences.filter((o) => doneDates.has(dateKey(o))).length;
  return Math.round((done / occurrences.length) * 100);
}

export function totalCompleted(habit: HabitRecord, completions: HabitCompletion[]): number {
  return completions.filter((c) => c.habitId === habit.id).length;
}

export function totalMissed(habit: HabitRecord, completions: HabitCompletion[], asOf: Date = new Date()): number {
  const occurrences = occurrencesBetween(habit.schedule, habit.startDate, new Date(habit.startDate), asOf);
  const doneDates = new Set(completions.filter((c) => c.habitId === habit.id).map((c) => c.date));
  const todayKey = dateKey(asOf);
  return occurrences.filter((o) => dateKey(o) !== todayKey && !doneDates.has(dateKey(o))).length;
}

export function monthRange(date: Date): { from: Date; to: Date } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from, to };
}

export function yearRange(date: Date): { from: Date; to: Date } {
  const from = new Date(date.getFullYear(), 0, 1);
  const to = new Date(date.getFullYear(), 11, 31);
  return { from, to };
}

export function aggregateCompletionPercent(
  habits: HabitRecord[],
  completions: HabitCompletion[],
  from: Date,
  to: Date,
): number {
  let totalDue = 0;
  let totalDone = 0;
  habits.forEach((h) => {
    const occurrences = occurrencesBetween(h.schedule, h.startDate, from, to);
    totalDue += occurrences.length;
    const doneDates = new Set(completions.filter((c) => c.habitId === h.id).map((c) => c.date));
    totalDone += occurrences.filter((o) => doneDates.has(dateKey(o))).length;
  });
  if (totalDue === 0) return 0;
  return Math.round((totalDone / totalDue) * 100);
}
