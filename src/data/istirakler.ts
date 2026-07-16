export interface Istirak {
  ad: string;
  url?: string;
  /** public/ altındaki logo yolu; henüz yoksa kart, adla logo alanı gösterir */
  logo?: string;
}

export const istirakler: Istirak[] = [
  {
    ad: 'Bora Finansal',
    // logo bekleniyor: dosyayı public/istirakler/ altına koyup buraya yolunu yazın
  },
  {
    ad: 'Kartonsan',
    url: 'https://www.kartonsan.com.tr/tr/',
    logo: '/istirakler/kartonsan.jpg',
  },
  {
    ad: 'Pek Yatırım Menkul Değerler',
    url: 'https://pek-web.vercel.app/',
    logo: '/istirakler/pek-yatirim.svg',
  },
  {
    ad: 'Pek Portföy',
    url: 'https://pek-portfoy.vercel.app/',
    logo: '/istirakler/pek-portfoy.svg',
  },
];
