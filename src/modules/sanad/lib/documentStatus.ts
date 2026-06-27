import type { DocumentStatus } from '@/modules/sanad/types';

export function getDocumentStatus(expiry?: number): DocumentStatus {
  if (!expiry) return 'none';
  const daysLeft = (expiry - Date.now()) / 86400000;
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 90) return 'expiring_soon';
  return 'valid';
}
