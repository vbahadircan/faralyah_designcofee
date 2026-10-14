import { Baby, Frame, Gem, Palette, Shapes } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { campaignIcon } from './campaign-icon';

describe('campaignIcon', () => {
  it('maps Turkish title keywords to icons, including capitalised İ/Ç forms', () => {
    expect(campaignIcon('Figür Boyama + Kahve')).toBe(Shapes);
    expect(campaignIcon('Taşlı Boyama')).toBe(Gem);
    expect(campaignIcon('TUVAL BOYAMA')).toBe(Frame);
    expect(campaignIcon('ÇOCUK Boyama')).toBe(Baby);
  });

  it('falls back to the palette', () => {
    expect(campaignIcon('Örnek Kampanya')).toBe(Palette);
  });
});
