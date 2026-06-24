import {
  FileText,
  Shield,
  TrendingUp,
  Box,
  Camera,
  Coins,
  Image,
  Plane,
  Wallet,
  MapPin,
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
  wallet: Wallet,
  mapPin: MapPin,
} as const;

export type IconKey = keyof typeof iconMap;
