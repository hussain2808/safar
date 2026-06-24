import { nanoid } from 'nanoid';
import type { Book, Transaction, Category } from '@/modules/hisaab/types';

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[",\s]/g, '');
  if (!cleaned) return 0;
  return Math.round(parseFloat(cleaned) * 100);
}

function parseDate(dateStr: string): number {
  const d = new Date(dateStr.trim());
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export interface ImportResult {
  book: Book;
  transactions: Transaction[];
  categories: Category[];
}

export function parseCashbookCsv(csvText: string, fileName: string): ImportResult {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error('CSV has no data rows');

  const bookName = fileName.replace(/\.csv$/i, '').split(/[_@]/)[0] || 'Imported Book';

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const dateIdx     = header.findIndex((h) => h === 'date');
  const remarkIdx   = header.findIndex((h) => h === 'remark');
  const categoryIdx = header.findIndex((h) => h === 'category');
  const cashInIdx   = header.findIndex((h) => h.includes('cash in') || h === 'in');
  const cashOutIdx  = header.findIndex((h) => h.includes('cash out') || h === 'out');

  if (dateIdx === -1 || cashInIdx === -1 || cashOutIdx === -1) {
    throw new Error('Unrecognised CSV format — expected Date, Cash In, Cash Out columns');
  }

  const now = Date.now();
  const bookId = nanoid();
  const book: Book = {
    id: bookId,
    name: bookName.charAt(0).toUpperCase() + bookName.slice(1),
    emoji: '📒',
    currency: 'INR',
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  const categoryMap = new Map<string, Category>();
  if (categoryIdx !== -1) {
    for (let i = 1; i < rows.length; i++) {
      const label = (rows[i][categoryIdx] ?? '').trim();
      if (!label) continue;
      const key = label.toLowerCase();
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          id: nanoid(),
          bookId,
          label,
          icon: 'more-horizontal',
          createdAt: now,
        });
      }
    }
  }

  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every((c) => !c.trim())) continue;

    const cashIn  = parseAmount(row[cashInIdx]  ?? '');
    const cashOut = parseAmount(row[cashOutIdx] ?? '');

    if (cashIn === 0 && cashOut === 0) continue;

    const txDate = parseDate(row[dateIdx] ?? '');
    const remark = (row[remarkIdx] ?? '').trim();

    const categoryLabel = categoryIdx !== -1 ? (row[categoryIdx] ?? '').trim() : '';
    const category = categoryLabel
      ? categoryMap.get(categoryLabel.toLowerCase())?.id
      : undefined;

    transactions.push({
      id: nanoid(),
      bookId,
      type: cashIn > 0 ? 'in' : 'out',
      amount: cashIn > 0 ? cashIn : cashOut,
      remark,
      category,
      date: txDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { book, transactions, categories: Array.from(categoryMap.values()) };
}
