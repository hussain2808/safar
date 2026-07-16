import {
  FileText,
  FileCheck2,
  Shield,
  TrendingUp,
  Box,
  Camera,
  Coins,
  Image,
  Plane,
  Wallet,
  MapPin,
  BookOpen,
  Star,
  Leaf,
} from 'lucide-react';

export const iconMap = {
  passport: Plane,
  shield: Shield,
  trend: TrendingUp,
  box: Box,
  file: FileText,
  fileCheck: FileCheck2,
  camera: Camera,
  coins: Coins,
  memory: Image,
  wallet: Wallet,
  mapPin: MapPin,
  bookOpen: BookOpen,
  star: Star,
  leaf: Leaf,
} as const;

export type IconKey = keyof typeof iconMap;
