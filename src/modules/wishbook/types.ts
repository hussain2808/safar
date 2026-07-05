export type WishCategoryId =
  | 'electronics'
  | 'plants'
  | 'vehicles'
  | 'jewelry'
  | 'travel'
  | 'education'
  | 'home'
  | 'islamic'
  | 'health'
  | 'other';

export type WishPriority = 'low' | 'medium' | 'high';

export type WishStatus =
  | 'dreaming'
  | 'planning'
  | 'saving'
  | 'ready'
  | 'purchased'
  | 'cancelled';

export interface WishLink {
  id: string;
  label: string;
  url: string;
}

export interface Wish {
  id: string;
  title: string;
  categoryId: WishCategoryId;
  assignedToId: string;
  targetDate?: number;
  estimatedCost?: number;
  currency: string;
  priority: WishPriority;
  status: WishStatus;
  notes?: string;
  whyIWantThis?: string;
  links?: WishLink[];
  purchasedAt?: number;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface PendingDelete {
  id: string;
  kind: 'wish';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
