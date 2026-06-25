export interface Book {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface Transaction {
  id: string;
  bookId: string;
  type: 'in' | 'out';
  amount: number;       // stored in paise (integer)
  remark: string;
  category?: string;
  photoId?: string;
  date: number;         // user-selected date timestamp
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

export interface Category {
  id: string;
  bookId: string;
  label: string;
  icon: string;
  createdAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'book' | 'transaction' | 'category';
  targetId: string;
  bookId?: string;
  createdAt: number;
}

export type TransactionType = Transaction['type'];

export interface BookWithStats extends Book {
  balance: number;
  transactionCount: number;
  hasPendingSync: boolean;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
