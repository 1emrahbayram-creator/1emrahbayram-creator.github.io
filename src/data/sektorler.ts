export interface Hizmet {
  ad: string;
  detay: string;
}

export interface Sektor {
  slug: string;
  no: string;
  title: string;
  kisaAd: string;
  ozet: string;
  metaAciklama: string;
  manset: string;
  aciklama: string[];
  hizmetler: Hizmet[];
  ikon: string;
}

export const sektorler: Sektor[] = [
  {
    slug: 'finans',
    no: '01',
    title: 'Finans & Sermaye Piyasaları',
    kisaAd: 'Finans',
    ozet: 'Küresel piyasalarda finansal kaynak yaratma, yapılandırma ve yatırım yönetimi.',
    metaAciklama:
      'Ares Holding finans hizmetleri: küresel fon yönetimi, şirket birleşme ve satın almaları, melek yatırımcılık ve yurt dışı borsalarda stratejik operasyonlar.',
    manset: 'Sermayeye <em>küresel ölçekte</em> yön veriyoruz.',
    aciklama: [
      'Ares Holding, deneyimli fon yöneticilerinden oluşan kadrosuyla küresel finans piyasalarında uçtan uca çözümler sunar. Offshore bankacılık, yurt dışı fonları, yatırımlar ve hedge fon süreçlerini tek merkezden takip ederiz.',
      'Şirket satın almalarından ortaklık yapılarına, kredi çözümlerinden erken aşama girişim yatırımlarına kadar; her finansal kurguyu projeye özel tasarlar, hukuki ve finansal risk analizleriyle destekleriz.',
    ],
    hizmetler: [
      { ad: 'Küresel Fon Yönetimi', detay: 'Offshore bankacılık, yurt dışı fonları, yatırımlar ve hedge fon süreçlerinin deneyimli fon yöneticileriyle takibi.' },
      { ad: 'Şirket Evlilikleri & Ortaklıklar', detay: 'Şirket satın almaları, birleşmeler, ortaklık yapıları ve kredi çözümleri konusunda finansal kaynak danışmanlığı.' },
      { ad: 'Melek Yatırımcılık', detay: 'Potansiyeli yüksek yeni nesil girişimlere ve projelere erken aşama sermaye desteği.' },
      { ad: 'Yurt Dışı Borsalar', detay: 'Yabancı sermaye piyasalarında ürün geliştirme ve stratejik satın alma operasyonlarının yönetimi.' },
    ],
    ikon: '<path d="M6 40h36M10 34V22m9 12V14m9 20V26m9 8V10" stroke-linecap="round"/>',
  },
  {
    slug: 'gayrimenkul',
    no: '02',
    title: 'Gayrimenkul, İnşaat & Turizm',
    kisaAd: 'Gayrimenkul',
    ozet: 'Arsa temininden anahtar teslimine, tüm geliştirme süreçleri tek çatı altında.',
    metaAciklama:
      'Ares Holding gayrimenkul hizmetleri: kentsel dönüşüm, büyük ölçekli bina ve altyapı projeleri, konut geliştirme ve turizm tesisi yatırımları tek çatı altında.',
    manset: 'Şehirlere <em>kalıcı değer</em> inşa ediyoruz.',
    aciklama: [
      'Arsa temini, inşaat projelerinin yönetimi ve yeni konut projelerinin hayata geçirilmesine kadar tüm süreçleri kendi bünyemizde yürütürüz. Riskli yapıların yenilenmesinden büyük ölçekli altyapı projelerine uzanan geniş bir portföy yönetiyoruz.',
      'Turizm sektörüne yönelik otel ve tesis yatırımlarıyla gayrimenkul portföyümüzü çeşitlendiriyor; her projede modern yaşam standartlarını ve sürdürülebilir değer üretimini esas alıyoruz.',
    ],
    hizmetler: [
      { ad: 'Kentsel Dönüşüm', detay: 'Riskli yapıların yenilenmesi ve modern yaşam alanlarına dönüştürülmesi projeleri.' },
      { ad: 'Bina & Altyapı Projeleri', detay: 'Büyük ölçekli inşaatların ve konut projelerinin geliştirme ve yönetim süreçleri.' },
      { ad: 'Turizm Yatırımları', detay: 'Otel ve tesis yatırımlarıyla çeşitlendirilmiş gayrimenkul portföyü.' },
    ],
    ikon: '<path d="M8 42V18l10-8 10 8v24M28 42V26l12-6v22M4 42h40M14 26h4m-4 8h4" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    slug: 'teknoloji',
    no: '03',
    title: 'Teknoloji & Akıllı Kent Sistemleri',
    kisaAd: 'Teknoloji',
    ozet: 'Şehirlerin dijital dönüşümünü hızlandıran altyapı ve bilişim yatırımları.',
    metaAciklama:
      'Ares Holding teknoloji yatırımları: akıllı kent bilgi yönetimi, trafik ve güvenlik çözümleri, internet altyapıları ile yeni nesil medya ve bilişim projeleri.',
    manset: 'Geleceğin şehirlerini <em>bugünden</em> kuruyoruz.',
    aciklama: [
      'Şehirlerin dijitalleşmesini sağlayan veri yönetim sistemlerine yatırım yapıyor; şehir içi trafik akışını ve asayişi optimize eden akıllı güvenlik ve trafik sistemleri geliştiriyoruz.',
      'İnternet altyapıları, yeni nesil medya araçları ve bilişim teknolojileri sektöründeki projelere fon sağlayarak teknoloji ekosisteminin büyümesine katkıda bulunuyoruz.',
    ],
    hizmetler: [
      { ad: 'Akıllı Kent Bilgi Yönetimi', detay: 'Şehirlerin dijitalleşmesini sağlayan veri yönetim sistemlerine yatırım.' },
      { ad: 'Trafik & Güvenlik Çözümleri', detay: 'Şehir içi trafik akışını ve asayişi optimize eden akıllı güvenlik ve trafik sistemleri.' },
      { ad: 'Bilişim & Medya', detay: 'İnternet altyapıları, yeni nesil medya araçları ve bilişim teknolojisi projelerine fon sağlama.' },
    ],
    ikon: '<circle cx="24" cy="24" r="5"/><path d="M24 6v8m0 20v8M6 24h8m20 0h8M11 11l6 6m14 14 6 6M37 11l-6 6M17 31l-6 6" stroke-linecap="round"/>',
  },
  {
    slug: 'ticaret',
    no: '04',
    title: 'Uluslararası Ticaret & Hukuk',
    kisaAd: 'Ticaret',
    ozet: 'Küresel ticaret operasyonları ve hukuki güvence, tek elden.',
    metaAciklama:
      'Ares Holding uluslararası ticaret hizmetleri: ithalat-ihracat operasyonları, sözleşme hukuku danışmanlığı ve finansal risk analizi ile güvenli küresel ticaret.',
    manset: 'Sınırların ötesinde <em>güvenle</em> ticaret.',
    aciklama: [
      'Farklı sektörlerde ihracat ve ithalat operasyonlarını uçtan uca yönetiyoruz. Küresel tedarik ağımız ve saha deneyimimizle iş ortaklarımızın uluslararası pazarlara güvenle açılmasını sağlıyoruz.',
      'Uluslararası ticari anlaşmaların hukuki zeminini hazırlıyor, sözleşme hukuku danışmanlığı sunuyor ve finansal risk analizlerini tamamlayarak her operasyonu sağlam bir zemine oturtuyoruz.',
    ],
    hizmetler: [
      { ad: 'İthalat & İhracat', detay: 'Farklı sektörlerde uçtan uca küresel ticaret operasyonları.' },
      { ad: 'Sözleşme Hukuku Danışmanlığı', detay: 'Uluslararası ticari anlaşmaların hukuki zemini ve sözleşme danışmanlığı.' },
      { ad: 'Finansal Risk Analizi', detay: 'Ticari operasyonlar öncesi kapsamlı finansal risk değerlendirmesi.' },
    ],
    ikon: '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5 5 7.5 11 7.5 18S29 37 24 42c-5-5-7.5-11-7.5-18S19 11 24 6Z" stroke-linejoin="round"/>',
  },
];
