import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'services.html', 'portfolio.html', 'team.html', 'licenses.html', 'faq.html', 'privacy.html'];
const expectedOrigin = 'https://xn--b1afaaqoiohmdkeb.xn--p1ai';
const errors = [];

for (const page of pages) {
  const html = await readFile(path.join(projectRoot, page), 'utf8');

  if (/localhost(?::\d+)?/i.test(html)) errors.push(`${page}: найден localhost`);
  if (!html.includes('<link rel="canonical"')) errors.push(`${page}: отсутствует canonical`);
  if (!html.includes('<meta property="og:url"')) errors.push(`${page}: отсутствует og:url`);
  if (!html.includes(`${expectedOrigin}/assets/images/og-cover.png`)) errors.push(`${page}: og:image не является абсолютным PNG`);
  if (!html.includes('class="no-js"')) errors.push(`${page}: отсутствует no-js контракт`);
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) errors.push(`${page}: осталась внешняя загрузка шрифта`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch {
      errors.push(`${page}: некорректный JSON-LD`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="((?:css|js|assets)\/[^"?#]+)/g)) {
    try {
      await access(path.join(projectRoot, match[1]));
    } catch {
      errors.push(`${page}: не найден локальный ресурс ${match[1]}`);
    }
  }
}

const robots = await readFile(path.join(projectRoot, 'robots.txt'), 'utf8');
const sitemap = await readFile(path.join(projectRoot, 'sitemap.xml'), 'utf8');
await access(path.join(projectRoot, 'assets/images/og-cover.png')).catch(() => errors.push('отсутствует assets/images/og-cover.png'));
if (!robots.includes(`${expectedOrigin}/sitemap.xml`)) errors.push('robots.txt: неверный Sitemap');
if (sitemap.includes('vacbanned2314.github.io')) errors.push('sitemap.xml: остался временный домен');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Проверено страниц: ${pages.length}. Критических статических ошибок нет.`);
}
