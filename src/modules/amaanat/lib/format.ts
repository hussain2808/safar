export function formatAmount(amount: number, currency = 'AED'): string {
  return `${currency} ${new Intl.NumberFormat('en-IN').format(amount)}`;
}

export function parseAmount(value: string): number {
  const num = parseFloat(value.replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}
