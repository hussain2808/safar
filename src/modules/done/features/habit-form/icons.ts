import {
  BookOpen, Hand, PersonStanding, Dumbbell, Heart, Droplet,
  Phone, NotebookPen, Pencil, MoonStar, CalendarDays, Sparkles,
  type LucideIcon,
} from 'lucide-react';

export const HABIT_ICONS: { key: string; icon: LucideIcon }[] = [
  { key: 'book', icon: BookOpen },
  { key: 'hands', icon: Hand },
  { key: 'walk', icon: PersonStanding },
  { key: 'dumbbell', icon: Dumbbell },
  { key: 'heart', icon: Heart },
  { key: 'droplet', icon: Droplet },
  { key: 'phone', icon: Phone },
  { key: 'notebook', icon: NotebookPen },
  { key: 'pencil', icon: Pencil },
  { key: 'moon', icon: MoonStar },
  { key: 'calendar', icon: CalendarDays },
  { key: 'sparkles', icon: Sparkles },
];

const iconMap = new Map(HABIT_ICONS.map((i) => [i.key, i.icon]));

export function habitIcon(key: string): LucideIcon {
  return iconMap.get(key) ?? Sparkles;
}
