import {
  ChefHat, Sofa, DoorOpen, BedDouble, Trees, Car,
  Home, Bath, Briefcase, BookOpen, Sun, Warehouse, DoorClosed,
} from 'lucide-react';

export const roomIconMap = {
  kitchen: ChefHat,
  livingRoom: Sofa,
  prayerRoom: DoorOpen,
  bedroom: BedDouble,
  garden: Trees,
  garage: Car,
  entrance: Home,
  staircase: DoorClosed,
  bathroom: Bath,
  office: Briefcase,
  library: BookOpen,
  terrace: Sun,
  store: Warehouse,
} as const;

export type RoomIconKey = keyof typeof roomIconMap;

export function getRoomIcon(key: string) {
  return roomIconMap[key as RoomIconKey] ?? Home;
}
