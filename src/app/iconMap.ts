import {
  FileText,
  Shield,
  TrendingUp,
  Box,
  Camera,
  Coins,
  Image,
  Plane,
} from 'lucide-react';

export const iconMap = {
  passport: Plane,
  shield: Shield,
  trend: TrendingUp,
  box: Box,
  file: FileText,
  camera: Camera,
  coins: Coins,
  memory: Image,
} as const;

export type IconKey = keyof typeof iconMap;
