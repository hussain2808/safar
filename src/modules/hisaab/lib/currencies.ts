export interface Currency {
  code: string;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee',        locale: 'en-IN' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham',        locale: 'en-AE' },
  { code: 'USD', symbol: '$',  label: 'US Dollar',          locale: 'en-US' },
  { code: 'EUR', symbol: '€',  label: 'Euro',               locale: 'de-DE' },
  { code: 'GBP', symbol: '£',  label: 'British Pound',      locale: 'en-GB' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal',       locale: 'ar-SA' },
  { code: 'KWD', symbol: 'KD', label: 'Kuwaiti Dinar',      locale: 'ar-KW' },
  { code: 'QAR', symbol: 'QR', label: 'Qatari Riyal',       locale: 'ar-QA' },
  { code: 'BDT', symbol: '৳',  label: 'Bangladeshi Taka',   locale: 'bn-BD' },
  { code: 'NPR', symbol: 'रु', label: 'Nepalese Rupee',     locale: 'ne-NP' },
  { code: 'LKR', symbol: '₨',  label: 'Sri Lankan Rupee',   locale: 'si-LK' },
];

export const DEFAULT_CURRENCY = 'INR';

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatWithCurrency(paise: number, currencyCode: string): string {
  const key = currencyCode;
  if (!formatterCache.has(key)) {
    const cur = getCurrency(currencyCode);
    formatterCache.set(
      key,
      new Intl.NumberFormat(cur.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(key)!.format(paise / 100);
}
