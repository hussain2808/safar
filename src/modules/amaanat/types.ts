export type ItemCategory = 'electronics' | 'valuables' | 'vehicles' | 'property' | 'records';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  merchant?: string;
  purchaseDate?: number;
  purchasePrice?: number;
  currency?: string;
  photoIds: string[];
  documentIds: string[];
  serialNumber?: string;
  warrantyProvider?: string;
  warrantyExpiry?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface Photo {
  id: string;
  blob: Blob;
  thumbnail: Blob;
  createdAt: number;
  pendingSync?: boolean;
}

export interface Document {
  id: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
  createdAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'item' | 'photo' | 'document';
  targetId: string;
  createdAt: number;
}

export type WarrantyStatus = 'expired' | 'expiring_soon' | 'active' | 'none';

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
