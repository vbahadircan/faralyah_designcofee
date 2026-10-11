/**
 * SAMPLE DATA taken from the owner-review mock-up. Package names, prices and descriptions are
 * NOT confirmed by the cafe (TODO(owner)). This shape is what the future `campaigns` API returns,
 * so the page can switch to real data without changes to the components.
 */
export type PackageTag = { label: string; tone: 'soft' | 'dark' };
export type PackageFact = { icon: 'palette' | 'timer'; text: string };

export type CampaignPackage = {
  id: string;
  tags: PackageTag[];
  title: string;
  description: string;
  /** Prices in integer kuruş. */
  priceKurus: number;
  oldPriceKurus?: number;
  /** Small label above the price, e.g. "AVANTAJLI". */
  priceLabel?: string;
  facts: PackageFact[];
  cta: 'select' | 'details';
};

export const SAMPLE_PACKAGES: CampaignPackage[] = [
  {
    id: 'tuval-filtre',
    tags: [
      { label: 'SANAT & KAHVE (6-18 YAŞ VE YETİŞKİN)', tone: 'soft' },
      { label: 'ÖZEL KOMBİN', tone: 'dark' },
    ],
    title: 'Tuval Boyama & Filtre Kahve',
    description:
      '30x40 cm kaliteli pamuklu tuval, şövale, zengin akrilik boya seti ve fırçalar eşliğinde özgür boyama + Single origin taze demlenmiş Filtre Kahve ikramı.',
    priceKurus: 50000,
    oldPriceKurus: 65000,
    facts: [
      { icon: 'palette', text: 'Tuval & Tüm Malzemeler Dahil' },
      { icon: 'timer', text: '75-90 Dakika' },
    ],
    cta: 'select',
  },
  {
    id: 'figur-kahve',
    tags: [
      { label: 'EBEVEYN + ÇOCUK (6-14 YAŞ)', tone: 'soft' },
      { label: 'ÇOK SATAN', tone: 'dark' },
    ],
    title: 'Kahve & Figür Boyama Deneyimi',
    description:
      '1 Adet dilediğiniz Filtre / Latte kahve + Çocuklar için alçı/seramik figür & akrilik boya seti + Eğitmen rehberliği.',
    priceKurus: 49000,
    oldPriceKurus: 62000,
    facts: [{ icon: 'timer', text: '60-75 Dakika' }],
    cta: 'select',
  },
  {
    id: 'seramik-barista',
    tags: [{ label: 'GENÇ ATÖLYE (7-18 YAŞ)', tone: 'soft' }],
    title: 'Seramik Çömlek & Barista İkramı',
    description:
      'El yapımı fincan seramik atölyesi (90 dk) + Sıcak Belçika Çikolatası ve taze tereyağlı kruvasan ikramı.',
    priceKurus: 75000,
    priceLabel: 'AVANTAJLI',
    facts: [{ icon: 'palette', text: 'Fırınlama Dahil' }],
    cta: 'details',
  },
];
