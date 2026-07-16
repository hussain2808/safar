import type { Schedule } from '@/modules/done/types';

function startOfDay(ms: number): Date {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isDueOn(schedule: Schedule, startDate: number, date: Date): boolean {
  const day = startOfDay(date.getTime());
  const start = startOfDay(startDate);
  if (day < start) return false;
  switch (schedule.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return schedule.weekdays.includes(day.getDay());
    case 'monthly':
      return day.getDate() === schedule.dayOfMonth;
    case 'yearly':
      return day.getMonth() + 1 === schedule.month && day.getDate() === schedule.day;
    default:
      return false;
  }
}

export function occurrencesBetween(schedule: Schedule, startDate: number, from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const cursor = startOfDay(from.getTime());
  const end = startOfDay(to.getTime());
  while (cursor.getTime() <= end.getTime()) {
    if (isDueOn(schedule, startDate, cursor)) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function frequencyLabel(schedule: Schedule): string {
  switch (schedule.frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly': {
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (schedule.weekdays.length === 1) return `Every ${names[schedule.weekdays[0]]}day`.replace('SunSunday', 'Sunday');
      return `Weekly • ${schedule.weekdays.map((w) => names[w]).join(', ')}`;
    }
    case 'monthly':
      return `Monthly • Day ${schedule.dayOfMonth}`;
    case 'yearly': {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Yearly • ${schedule.day} ${months[schedule.month - 1]}`;
    }
    default:
      return '';
  }
}
