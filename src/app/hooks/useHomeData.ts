import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db as hisaabDb } from '@/modules/hisaab/db';
import { db as sanadDb } from '@/modules/sanad/db';
import { db as amaanatDb } from '@/modules/amaanat/db';
import { db as nazaraDb } from '@/modules/nazara/db';
import { formatAmount } from '@/modules/hisaab/lib/format';
import { getDocumentStatus } from '@/modules/sanad/lib/documentStatus';
import type { IconKey } from '../iconMap';

export interface AttentionItem {
  id: string;
  icon: IconKey;
  iconBg: string;
  iconFg: string;
  label: string;
  value: string;
  valueColor: string;
  route: string;
}

export interface SnapshotItem {
  id: string;
  icon: IconKey;
  iconBg: string;
  iconFg: string;
  value: string;
  label: string;
}

export interface ActivityItem {
  id: string;
  icon: IconKey;
  iconBg: string;
  iconFg: string;
  title: string;
  subtitle: string;
  amount: string;
  amountColor: string;
  route: string;
}

function getWarrantyDaysLeft(expiry?: number): number | null {
  if (!expiry) return null;
  return Math.floor((expiry - Date.now()) / 86400000);
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useHomeData() {
  const result = useLiveQuery(async () => {
    const [books, transactions, documents, items, memories] = await Promise.all([
      hisaabDb.books.toArray(),
      hisaabDb.transactions.toArray(),
      sanadDb.documents.toArray(),
      amaanatDb.items.toArray(),
      nazaraDb.memories.toArray(),
    ]);

    const activeBooks = books.filter((b) => !b.archived);
    const txByBook = new Map<string, typeof transactions>();
    for (const tx of transactions) {
      const list = txByBook.get(tx.bookId) ?? [];
      list.push(tx);
      txByBook.set(tx.bookId, list);
    }

    const attentionItems: AttentionItem[] = [];

    for (const doc of documents) {
      const status = getDocumentStatus(doc.expiryDate);
      if (status !== 'expired' && status !== 'expiring_soon') continue;
      const daysLeft = Math.floor((doc.expiryDate! - Date.now()) / 86400000);
      attentionItems.push({
        id: `sanad-${doc.id}`,
        icon: 'fileCheck',
        iconBg: 'bg-accent-blue-bg',
        iconFg: 'text-accent-blue-fg',
        label: status === 'expired' ? `${doc.name} expired` : `${doc.name} expires in`,
        value: status === 'expired' ? `${Math.abs(daysLeft)}d ago` : `${daysLeft} days`,
        valueColor: status === 'expired' ? 'text-accent-pink-fg' : 'text-accent-orange-fg',
        route: `/sanad/document/${doc.id}`,
      });
    }

    for (const item of items) {
      const daysLeft = getWarrantyDaysLeft(item.warrantyExpiry);
      if (daysLeft === null || daysLeft > 90) continue;
      attentionItems.push({
        id: `amaanat-${item.id}`,
        icon: 'shield',
        iconBg: 'bg-accent-purple-bg',
        iconFg: 'text-accent-purple-fg',
        label: daysLeft < 0 ? `${item.name} warranty expired` : `${item.name} warranty ends in`,
        value: daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft} days`,
        valueColor: daysLeft < 0 ? 'text-accent-pink-fg' : 'text-accent-orange-fg',
        route: `/amaanat/item/${item.id}`,
      });
    }

    attentionItems.sort((a, b) => {
      const aDays = parseInt(a.value) || 0;
      const bDays = parseInt(b.value) || 0;
      return aDays - bDays;
    });

    const snapshot: SnapshotItem[] = [
      { id: 'books', icon: 'wallet', iconBg: 'bg-accent-green-bg', iconFg: 'text-accent-green-fg', value: String(activeBooks.length), label: 'Hisaab Books' },
      { id: 'assets', icon: 'box', iconBg: 'bg-accent-purple-bg', iconFg: 'text-accent-purple-fg', value: String(items.length), label: 'Assets' },
      { id: 'documents', icon: 'file', iconBg: 'bg-accent-orange-bg', iconFg: 'text-accent-orange-fg', value: String(documents.length), label: 'Documents' },
      { id: 'memories', icon: 'camera', iconBg: 'bg-accent-pink-bg', iconFg: 'text-accent-pink-fg', value: String(memories.length), label: 'Memories' },
    ];

    const activity: (ActivityItem & { ts: number })[] = [];

    for (const book of activeBooks) {
      const txs = txByBook.get(book.id) ?? [];
      if (!txs.length) continue;
      const latest = txs.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
      activity.push({
        id: `hisaab-${latest.id}`,
        icon: 'coins',
        iconBg: 'bg-accent-green-bg',
        iconFg: 'text-accent-green-fg',
        title: latest.remark || 'Untitled',
        subtitle: `${book.name} · ${timeAgo(latest.createdAt)}`,
        amount: `${latest.type === 'in' ? '+' : '-'} ${formatAmount(latest.amount, book.currency)}`,
        amountColor: latest.type === 'in' ? 'text-accent-green-fg' : 'text-accent-pink-fg',
        route: `/hisaab/book/${book.id}`,
        ts: latest.createdAt,
      });
    }

    for (const doc of documents) {
      activity.push({
        id: `sanad-${doc.id}`,
        icon: 'file',
        iconBg: 'bg-accent-blue-bg',
        iconFg: 'text-accent-blue-fg',
        title: doc.name,
        subtitle: `Document · ${timeAgo(doc.updatedAt)}`,
        amount: '',
        amountColor: '',
        route: `/sanad/document/${doc.id}`,
        ts: doc.updatedAt,
      });
    }

    for (const item of items) {
      activity.push({
        id: `amaanat-${item.id}`,
        icon: 'box',
        iconBg: 'bg-accent-purple-bg',
        iconFg: 'text-accent-purple-fg',
        title: item.name,
        subtitle: `Asset · ${timeAgo(item.updatedAt)}`,
        amount: '',
        amountColor: '',
        route: `/amaanat/item/${item.id}`,
        ts: item.updatedAt,
      });
    }

    for (const memory of memories) {
      activity.push({
        id: `nazara-${memory.id}`,
        icon: 'memory',
        iconBg: 'bg-accent-pink-bg',
        iconFg: 'text-accent-pink-fg',
        title: memory.title,
        subtitle: `Memory · ${timeAgo(memory.updatedAt)}`,
        amount: '',
        amountColor: '',
        route: `/nazara/memory/${memory.id}`,
        ts: memory.updatedAt,
      });
    }

    activity.sort((a, b) => b.ts - a.ts);

    return {
      attentionItems: attentionItems.slice(0, 5),
      snapshot,
      recentActivity: activity.slice(0, 5).map(({ ts, ...rest }) => rest),
    };
  });

  return useMemo(
    () => result ?? { attentionItems: [], snapshot: [], recentActivity: [] },
    [result],
  );
}
