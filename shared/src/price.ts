/** Prices are stored as integer kuruş (1 ₺ = 100 kuruş) and formatted only at the edge. */
export function formatPrice(kurus: number): string {
  if (!Number.isInteger(kurus) || kurus < 0) {
    throw new RangeError(`Price must be a non-negative integer of kuruş, got ${kurus}`);
  }
  const lira = kurus / 100;
  const whole = kurus % 100 === 0;
  const number = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(lira);
  return `${number}\u00A0₺`;
}

/**
 * Parses what staff type into a price field ("120", "42,50", "42.5", "1.250") into kuruş.
 * Returns null for anything that is not a non-negative amount with at most two decimals.
 */
export function parsePriceInput(input: string): number | null {
  const text = input.replace(/\s|₺|TL/gi, '');
  if (text === '') return null;
  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) {
    // Turkish grouping: 1.250 or 1.250,50
    normalized = text.replace(/\./g, '').replace(',', '.');
  } else if (/^\d+([.,]\d{1,2})?$/.test(text)) {
    normalized = text.replace(',', '.');
  } else {
    return null;
  }
  return Math.round(Number(normalized) * 100);
}
