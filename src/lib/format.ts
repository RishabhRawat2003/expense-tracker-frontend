const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const compactCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
const shortMonth = new Intl.DateTimeFormat('en-IN', { month: 'short' });

export const formatCurrency = (n: number) => currency.format(n);
export const formatCompact = (n: number) => compactCurrency.format(n);

function localDate(iso: string) {
  const [y, m, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const formatDate = (iso: string) => shortDate.format(localDate(iso));
export const formatLongDate = (iso: string) => longDate.format(localDate(iso));
export const formatMonth = (yyyyMm: string) => monthLabel.format(localDate(yyyyMm));
export const formatShortMonth = (yyyyMm: string) => shortMonth.format(localDate(yyyyMm));

export function percentOf(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}
