export interface Istirak {
  ad: string;
  /** Resmî tam unvan (İştiraklerimiz sayfasında gösterilir) */
  tamAd?: string;
  aciklama: string;
  url?: string;
  /** public/ altındaki logo yolu; henüz yoksa kart, adla logo alanı gösterir */
  logo?: string;
}

export const istirakler: Istirak[] = [
  {
    ad: 'Pek Yatırım Menkul Değerler',
    aciklama:
      'Sermaye piyasalarında alım-satım aracılığı, halka arz ve kurumsal finansman hizmetleri sunan aracı kurumumuz; yerli ve yabancı yatırımcılara işlem platformları ve yatırım danışmanlığıyla uçtan uca eşlik eder.',
    url: 'https://pek-web.vercel.app/',
    logo: '/istirakler/pek-yatirim.svg',
  },
  {
    ad: 'Pek Portföy',
    aciklama:
      'Yatırım fonları ve özel portföy yönetimiyle kurumsal ve bireysel yatırımcılara profesyonel varlık yönetimi hizmeti verir; disiplinli, şeffaf ve düzenli raporlamaya dayalı süreçlerle çalışır.',
    url: 'https://pek-portfoy.vercel.app/',
    logo: '/istirakler/pek-portfoy.svg',
  },
  {
    ad: 'Bora Finansal',
    tamAd: 'Bora Finansal Teknoloji Yatırım Hizmetleri A.Ş.',
    aciklama:
      'Teknoloji odaklı yatırımlar ve finansal teknoloji çözümleri alanında faaliyet gösteren grup şirketimiz; potansiyeli yüksek girişimlere ve dijital dönüşüm projelerine sermaye ve strateji desteği sağlar.',
    // logo bekleniyor: dosyayı public/istirakler/ altına koyup buraya yolunu yazın
  },
  {
    ad: 'Kartonsan',
    aciklama:
      'Kuşe karton üretiminde köklü sanayi birikimine sahip iştirakimiz; gıda, ilaç, kozmetik ve tüketim ürünleri ambalajına yönelik yüksek kaliteli karton çözümleri üretir.',
    url: 'https://www.kartonsan.com.tr/tr/',
    logo: '/istirakler/kartonsan.jpg',
  },
];
