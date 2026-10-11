import type { PublicMenu } from '@faralyah/shared';

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
