import type { RoomCategory } from '@/modules/darussalam/types';
import type { RoomIconKey } from '@/modules/darussalam/lib/roomIcons';

export interface RoomTemplate {
  name: string;
  icon: RoomIconKey;
  category: RoomCategory;
}

export const roomTemplates: RoomTemplate[] = [
  { name: 'Entrance', icon: 'entrance', category: 'indoor' },
  { name: 'Porch', icon: 'entrance', category: 'outdoor' },
  { name: 'Garage', icon: 'garage', category: 'other' },
  { name: 'Living Room', icon: 'livingRoom', category: 'indoor' },
  { name: 'Dining', icon: 'livingRoom', category: 'indoor' },
  { name: 'Kitchen', icon: 'kitchen', category: 'indoor' },
  { name: 'Pantry', icon: 'store', category: 'indoor' },
  { name: 'Laundry', icon: 'store', category: 'indoor' },
  { name: 'Staircase', icon: 'staircase', category: 'indoor' },
  { name: 'Prayer Room', icon: 'prayerRoom', category: 'indoor' },
  { name: 'Master Bedroom', icon: 'bedroom', category: 'indoor' },
  { name: 'Master Bathroom', icon: 'bathroom', category: 'indoor' },
  { name: 'Bedroom', icon: 'bedroom', category: 'indoor' },
  { name: 'Guest Bedroom', icon: 'bedroom', category: 'indoor' },
  { name: 'Common Bathroom', icon: 'bathroom', category: 'indoor' },
  { name: 'Office', icon: 'office', category: 'indoor' },
  { name: 'Library', icon: 'library', category: 'indoor' },
  { name: 'Balcony', icon: 'terrace', category: 'outdoor' },
  { name: 'Terrace', icon: 'terrace', category: 'outdoor' },
  { name: 'Garden', icon: 'garden', category: 'outdoor' },
  { name: 'Roof', icon: 'terrace', category: 'outdoor' },
  { name: 'Store Room', icon: 'store', category: 'other' },
  { name: 'Utility', icon: 'store', category: 'other' },
];
