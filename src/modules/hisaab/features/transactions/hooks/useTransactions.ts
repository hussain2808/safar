import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/hisaab/db';
import { calculateBalance } from '@/modules/hisaab/lib/balance';
import type { Transaction } from '@/modules/hisaab/types';

export function useTransactions(bookId: string) {
  const result = useLiveQuery(
    () => db.transactions.where('[bookId+date]').between([bookId, -Infinity], [bookId, Infinity]).reverse().sortBy('date'),
    [bookId],
  );

  const transactions: Transaction[] = useMemo(() => result ?? [], [result]);
  const balance = useMemo(() => calculateBalance(transactions), [transactions]);

  return {
    transactions,
    balance,
    isLoading: result === undefined,
  };
}
