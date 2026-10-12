import type { PublicCampaignList, PublicMenu } from '@faralyah/shared';

export const sampleMenu: PublicMenu = {
  categories: [
    {
      id: 'sicak',
      name: 'Sıcak İçecekler',
      items: [
        { id: 'a', name: 'Latte', priceKurus: 13500 },
        { id: 'b', name: 'Türk Kahvesi', priceKurus: 9500, description: 'Sade, orta veya şekerli' },
      ],
    },
    {
      id: 'tatli',
      name: 'Tatlılar',
      items: [{ id: 'c', name: 'Fıstıklı Sütlaç', priceKurus: 12050 }],
    },
  ],
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const sampleCampaigns: PublicCampaignList = {
  campaigns: [
    {
      id: 'k1',
      title: 'Figür Boyama + Kahve',
      priceKurus: 40000,
      imageUrl: '/uploads/campaigns/figur.webp',
    },
    { id: 'k2', title: 'Tuval Boyama + Kahve', priceKurus: 35000, description: 'Örnek açıklama' },
  ],
};
