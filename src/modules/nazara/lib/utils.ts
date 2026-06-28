export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getTimeSince(date: Date): { years: number; months: number; days: number } {
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();
  let days = now.getDate() - date.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export function getYearsAgo(date: Date): number {
  const now = new Date();
  return now.getFullYear() - date.getFullYear();
}

export function getAgeAtEvent(birthDate: Date, eventDate: Date): number {
  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getDaysUntilNextAnniversary(date: Date): number {
  const now = new Date();
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, date.getMonth(), date.getDate());

  if (next <= now) {
    next = new Date(thisYear + 1, date.getMonth(), date.getDate());
  }

  const diff = next.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getNextAnniversaryDate(date: Date): Date {
  const now = new Date();
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, date.getMonth(), date.getDate());

  if (next <= now) {
    next = new Date(thisYear + 1, date.getMonth(), date.getDate());
  }

  return next;
}

export function isSameMonthDay(date1: Date, date2: Date): boolean {
  return date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

export function groupByYear<T extends { date: Date }>(items: T[]): Record<number, T[]> {
  const groups: Record<number, T[]> = {};
  for (const item of items) {
    const year = item.date.getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  }
  return groups;
}

export function formatTodayHeader(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
