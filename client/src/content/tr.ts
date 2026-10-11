/** All user-facing Turkish strings. No string literals for UI copy in components. */
export const tr = {
  brand: {
    name: 'Faralyah Design / Coffee',
    short: 'Faralyah',
  },
  nav: {
    skipToContent: 'İçeriğe geç',
    home: 'Ana sayfa',
  },
  welcome: {
    title: 'Hoş Geldiniz',
    subtitle: 'Kahve, tatlı ve çocuklar için yaratıcı atölyeler.',
    sectionsNav: 'Bölümler',
    cards: {
      menu: {
        title: 'Menü',
        description: 'Sıcak ve soğuk içecekler, sandviçler ve tatlılar.',
      },
      activities: {
        title: 'Atölyeler & Etkinlikler',
        description: 'Resim, seramik, puzzle ve kutu oyunları. 6–18 yaş.',
      },
      campaigns: {
        title: 'Kampanyalar',
        description: 'Güncel kampanyalar ve fırsatlar.',
      },
    },
  },
  /** Strings for the /onizleme landing variant (design preview for the cafe owners). */
  welcomeAlt: {
    topBar: {
      brand: 'Faralyah',
      tagline: 'KAFE & ATÖLYE',
      qrLabel: 'QR MENÜ',
      qrTitle: 'Karşılama',
    },
    eyebrow: 'DESIGN / COFFEE',
    title: "Faralyah'a Hoş Geldiniz",
    subtitle: 'Kahve kokusu, taze lezzetler ve çocuk/genç sanat atölyelerinin buluşma noktası.',
    sectionsNav: 'Bölümler',
    wifi: { label: 'Wi-Fi Şifresi', copy: 'Şifreyi kopyala', copied: 'Kopyalandı' },
    cards: {
      menu: {
        badge: 'SICAK & SOĞUK LEZZETLER',
        eyebrow: 'FARALYAH KAFE',
        title: 'Kafeterya Menüsü',
        description: 'Sıcak ve soğuk içecekler, sandviçler ve tatlılar.',
        chips: ['İçecekler', 'Sandviçler', 'Tatlılar'],
      },
      activities: {
        badge: 'RESİM · SERAMİK · PUZZLE',
        eyebrow: '6–18 YAŞ DENEYİMİ',
        title: 'Çocuk & Genç Atölyeleri',
        description: 'Resim, seramik, puzzle ve kutu oyunları.',
        chips: ['Resim & Seramik', 'Puzzle & Kutu Oyunları'],
      },
    },
    updatesLink: 'Etkinlikler / Kampanyalar',
  },
  menu: {
    title: 'Menü',
    categoriesNav: 'Menü kategorileri',
    loading: 'Menü yükleniyor',
    loadError: 'Menü şu an yüklenemedi.',
    retry: 'Tekrar dene',
    empty: 'Şu an burada bir şey yok.',
  },
  activities: {
    title: 'Atölyeler & Etkinlikler',
  },
  campaigns: {
    title: 'Kampanyalar',
  },
  updates: {
    title: 'Etkinlikler / Kampanyalar',
  },
  offers: {
    eyebrow: 'KOMBİNE DENEYİM',
    title: 'Günün Öne Çıkan Kampanyaları',
    subtitle:
      'Sizin için taze kahve aroması, çocuklarınız için yaratıcı üretim deneyimi bir arada sunulur.',
    select: 'Paketi Seç',
    details: 'İncele',
    note: 'Bu paket için lütfen personele söyleyin.',
    oldPrice: 'Eski fiyat',
    price: 'Kampanya fiyatı',
  },
  comingSoon: 'Çok yakında burada olacak.',
  notFound: {
    title: 'Sayfa bulunamadı',
    back: 'Ana sayfaya dön',
  },
  footer: {
    allergy: 'Alerjiniz varsa lütfen personele söyleyin.',
  },
} as const;
