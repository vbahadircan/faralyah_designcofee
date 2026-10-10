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
