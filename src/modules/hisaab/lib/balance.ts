import type { Transaction } from '@/modules/hisaab/types';

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((bal, tx) => (tx.type === 'in' ? bal + tx.amount : bal - tx.amount), 0);
}
