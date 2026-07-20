export interface Hizmet {
  ad: string;
  detay: string;
}

export interface Sektor {
  slug: string;
  no: string;
  title: string;
  kisaAd: string;
  /** Bu alanı yürüten grup şirketi */
  firma: string;
  ozet: string;
  metaAciklama: string;
  manset: string;
  aciklama: string[];
  hizmetler: Hizmet[];
  ikon: string;
}

export const sektorler: Sektor[] = [
  {
    slug: 'yatirim',
    no: '01',
    title: 'Yatırım & Aracılık Hizmetleri',
    kisaAd: 'Yatırım',
    firma: 'Pek Yatırım Menkul Değerler',
    ozet: 'Sermaye piyasalarında alım-satım aracılığı, kurumsal finansman ve yatırım danışmanlığı.',
    metaAciklama:
      'Pek Yatırım Menkul Değerler ile sermaye piyasalarında alım-satım aracılığı, halka arz, kurumsal finansman ve yatırım danışmanlığı hizmetleri.',
    manset: 'Sermaye piyasalarında <em>güvenilir aracılık</em>.',
    aciklama: [
      'Pek Yatırım Menkul Değerler çatısı altında; pay senedi alım-satım aracılığından kurumsal finansmana uzanan geniş bir yelpazede sermaye piyasası hizmetleri sunuyoruz.',
      'Yerli ve yabancı yatırımcılara işlem platformları, halka arz süreçleri ve yatırım danışmanlığıyla uçtan uca eşlik ediyoruz.',
    ],
    hizmetler: [
      { ad: 'Alım-Satım Aracılığı', detay: 'Pay senedi ve sermaye piyasası araçlarında hızlı, güvenilir işlem aracılığı.' },
      { ad: 'Kurumsal Finansman & Halka Arz', detay: 'Halka arz, borçlanma araçları ihracı ve şirket finansmanı süreçlerinin yönetimi.' },
      { ad: 'Yatırım Danışmanlığı', detay: 'Yatırımcı profiline uygun strateji ve piyasa analizi desteği.' },
      { ad: 'Yurt Dışı Piyasalar', detay: 'Küresel borsalara erişim ve uluslararası işlem olanakları.' },
    ],
    ikon: '<path d="M6 40h36M10 34V22m9 12V14m9 20V26m9 8V10" stroke-linecap="round"/>',
  },
  {
    slug: 'portfoy',
    no: '02',
    title: 'Portföy Yönetimi',
    kisaAd: 'Portföy',
    firma: 'Pek Portföy',
    ozet: 'Kurumsal ve bireysel yatırımcılar için profesyonel portföy ve fon yönetimi.',
    metaAciklama:
      'Pek Portföy ile yatırım fonları yönetimi, özel portföy yönetimi ve varlık dağılımı stratejileri; disiplinli ve şeffaf süreçlerle.',
    manset: 'Birikimlere <em>profesyonel</em> yön.',
    aciklama: [
      'Pek Portföy ile kurumsal ve bireysel yatırımcıların birikimlerini; risk profillerine uygun, disiplinli ve şeffaf stratejilerle yönetiyoruz.',
      'Yatırım fonlarından özel portföy yönetimine, varlık dağılımından düzenli raporlamaya kadar tüm süreç profesyonel ekiplerce yürütülür.',
    ],
    hizmetler: [
      { ad: 'Yatırım Fonları Yönetimi', detay: 'Farklı risk ve getiri profillerine uygun fonların kurulması ve yönetimi.' },
      { ad: 'Özel Portföy Yönetimi', detay: 'Yatırımcıya özel hedeflerle oluşturulan kişiselleştirilmiş portföy stratejileri.' },
      { ad: 'Varlık Dağılımı Stratejileri', detay: 'Piyasa koşullarına göre dinamik varlık dağılımı ve risk yönetimi.' },
    ],
    ikon: '<circle cx="24" cy="24" r="17"/><path d="M24 24V7M24 24l12 12M24 24h17" stroke-linecap="round"/>',
  },
  {
    slug: 'denetim',
    no: '03',
    title: 'Bağımsız Denetim & Danışmanlık',
    kisaAd: 'Denetim',
    firma: 'Bora Finansal',
    ozet: 'Bağımsız denetim, finansal raporlama ve kurumsal danışmanlık hizmetleri.',
    metaAciklama:
      'Bora Finansal ile bağımsız denetim, finansal raporlama, vergi ve mevzuat danışmanlığı; işletmelere güven veren bağımsız bakış.',
    manset: 'Finansal güvenin <em>bağımsız</em> teminatı.',
    aciklama: [
      'Bora Finansal bünyesinde; bağımsız denetim, finansal raporlama ve kurumsal danışmanlık hizmetleriyle şirketlerin finansal güvenilirliğini güçlendiriyoruz.',
      'Vergi ve mevzuat uyumundan iç kontrol süreçlerine kadar, işletmelere karar süreçlerinde güven veren bağımsız bir bakış sunuyoruz.',
    ],
    hizmetler: [
      { ad: 'Bağımsız Denetim', detay: 'Finansal tabloların ulusal ve uluslararası standartlara uygun denetimi.' },
      { ad: 'Finansal Raporlama', detay: 'Güvenilir, karşılaştırılabilir ve mevzuata uyumlu raporlama süreçleri.' },
      { ad: 'Vergi & Mevzuat Danışmanlığı', detay: 'Vergi planlaması, uyum ve güncel mevzuat takibi.' },
    ],
    ikon: '<path d="M24 5 40 12v10c0 10-7.2 18-16 20.5C15.2 40 8 32 8 22V12Z" stroke-linejoin="round"/><path d="m17 24 5 5 9.5-11" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    slug: 'uretim',
    no: '04',
    title: 'Karton & Ambalaj Üretimi',
    kisaAd: 'Üretim',
    firma: 'Kartonsan',
    ozet: 'Kuşe karton üretiminde köklü sanayi birikimi ve sürdürülebilir üretim gücü.',
    metaAciklama:
      'Kartonsan iştirakiyle kuşe karton üretimi, ambalaj çözümleri ve sürdürülebilir sanayi üretimi; köklü birikim, güçlü dağıtım ağı.',
    manset: 'Sanayide <em>köklü</em> üretim gücü.',
    aciklama: [
      'Kartonsan iştirakimizle kuşe karton üretimindeki köklü sanayi birikimini grubumuza taşıyoruz.',
      'Ambalaj sektörüne yönelik yüksek kaliteli karton çözümleri; sürdürülebilir üretim anlayışı ve güçlü dağıtım ağıyla buluşuyor.',
    ],
    hizmetler: [
      { ad: 'Kuşe Karton Üretimi', detay: 'Yüksek kaliteli kuşe karton üretiminde köklü sanayi deneyimi.' },
      { ad: 'Ambalaj Çözümleri', detay: 'Farklı sektörlerin ihtiyaçlarına yönelik karton ve ambalaj uygulamaları.' },
      { ad: 'Sürdürülebilir Üretim', detay: 'Çevreye duyarlı süreçler ve geri dönüştürülebilir malzeme odağı.' },
    ],
    ikon: '<path d="M6 41V19l11 8v-8l11 8v-8l14 9v13H6Z" stroke-linejoin="round"/><path d="M34 19v-8h6v12" stroke-linejoin="round"/><path d="M12 34h4m6 0h4m6 0h4" stroke-linecap="round"/>',
  },
];
