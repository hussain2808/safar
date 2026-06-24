import { formatWithCurrency, DEFAULT_CURRENCY } from './currencies';

export function formatAmount(paise: number, currency = DEFAULT_CURRENCY): string {
  return formatWithCurrency(paise, currency);
}

export function formatAmountRaw(paise: number): string {
  return new Intl.NumberFormat('en-IN').format(paise / 100);
}

export function parseAmountToPaise(value: string): number {
  const num = parseFloat(value.replace(/,/g, ''));
  return isNaN(num) ? 0 : Math.round(num * 100);
}
