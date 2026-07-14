import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Özel alan adı (www.aresholding.com.tr) bağlandığında burayı o adresle değiştirin
  site: 'https://1emrahbayram-creator.github.io',
  integrations: [sitemap()],
});
