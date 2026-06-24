import type { WarrantyStatus } from '@/modules/amaanat/types';

export function getWarrantyStatus(expiry?: number): WarrantyStatus {
  if (!expiry) return 'none';
  const daysLeft = (expiry - Date.now()) / 86400000;
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring_soon';
  return 'active';
}
