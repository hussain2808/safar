import type { Book, Transaction } from '@/modules/hisaab/types';

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportBookToCsv(book: Book, transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => a.date - b.date);

  let balance = 0;
  const rows = sorted.map((tx) => {
    const cashIn  = tx.type === 'in'  ? (tx.amount / 100).toFixed(2) : '';
    const cashOut = tx.type === 'out' ? (tx.amount / 100).toFixed(2) : '';
    balance += tx.type === 'in' ? tx.amount : -tx.amount;
    const date = new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return [date, escapeCell(tx.remark ?? ''), cashIn, cashOut, (balance / 100).toFixed(2)].join(',');
  });

  const header = 'Date,Remark,Cash In,Cash Out,Balance';
  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${book.name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
