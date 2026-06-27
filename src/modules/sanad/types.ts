export type DocumentCategory = 'identity' | 'family' | 'finance' | 'health' | 'other';

export interface DocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: number;
  expiryDate?: number;
  photoIds: string[];
  fileIds: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface DocumentFile {
  id: string;
  blob: Blob;
  thumbnail: Blob;
  mimeType: string;
  fileName: string;
  createdAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'document' | 'file';
  targetId: string;
  createdAt: number;
}

export type DocumentStatus = 'expired' | 'expiring_soon' | 'valid' | 'none';

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
