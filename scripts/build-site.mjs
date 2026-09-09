import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const productionPages = [
  'index.html',
  'services.html',
  'portfolio.html',
  'team.html',
  'licenses.html',
  'faq.html',
  'privacy.html'
];
const staticFiles = ['robots.txt', 'sitemap.xml', '.nojekyll'];
const siteOrigin = 'https://xn--b1afaaqoiohmdkeb.xn--p1ai';

const normalizeWebPath = (value) => value.split(path.sep).join('/');
const digest = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function flattenCss(filePath, ancestry = new Set()) {
  const absolutePath = path.resolve(filePath);
  if (ancestry.has(absolutePath)) {
    throw new Error(`Обнаружен циклический CSS import: ${absolutePath}`);
  }

  const nextAncestry = new Set(ancestry).add(absolutePath);
  const source = await readFile(absolutePath, 'utf8');
  const importPattern = /@import\s+url\(["']([^"']+)["']\)\s*;/g;
  let result = '';
  let cursor = 0;

  for (const match of source.matchAll(importPattern)) {
    result += source.slice(cursor, match.index);
    const importedPath = match[1].split('?')[0];
    const importedAbsolute = path.resolve(path.dirname(absolutePath), importedPath);
    result += `\n/* ${normalizeWebPath(path.relative(projectRoot, importedAbsolute))} */\n`;
    result += await flattenCss(importedAbsolute, nextAncestry);
    cursor = match.index + match[0].length;
  }

  return `${result}${source.slice(cursor)}`;
}

async function emitCssBundle(entryHref) {
  const cleanHref = entryHref.split('?')[0];
  const sourcePath = path.join(projectRoot, cleanHref);
  const css = (await flattenCss(sourcePath)).replace(/\r\n/g, '\n').trim() + '\n';
  const baseName = path.basename(cleanHref, '.css');
  const outputHref = `css/${baseName}.${digest(css)}.css`;
  const outputPath = path.join(outputRoot, outputHref);
  await ensureParent(outputPath);
  await writeFile(outputPath, css, 'utf8');
  return outputHref;
}

async function emitHashedScript(scriptSrc) {
  const cleanSrc = scriptSrc.split('?')[0];
  const sourcePath = path.join(projectRoot, cleanSrc);
  const source = await readFile(sourcePath, 'utf8');
  const extension = path.extname(cleanSrc);
  const baseName = path.basename(cleanSrc, extension);
  const directory = path.dirname(cleanSrc);
  const outputSrc = normalizeWebPath(path.join(directory, `${baseName}.${digest(source)}${extension}`));
  const outputPath = path.join(outputRoot, outputSrc);
  await ensureParent(outputPath);
  await writeFile(outputPath, source, 'utf8');
  return outputSrc;
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function createStructuredData(pageName, html) {
  const pageUrl = `${siteOrigin}/${pageName === 'index.html' ? '' : pageName}`;
  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${siteOrigin}/` }
    ]
  };

  const pageData = {
    'services.html': {
      '@type': 'Service',
      name: 'Монтаж и обслуживание систем отопления',
      url: pageUrl,
      areaServed: { '@type': 'City', name: 'Казань' },
      provider: { '@type': 'Organization', name: 'ООО «ТеплоРемСервис»', url: `${siteOrigin}/` }
    },
    'portfolio.html': {
      '@type': 'CollectionPage',
      name: 'Выполненные проекты ТеплоРемСервис',
      url: pageUrl,
      inLanguage: 'ru-RU'
    },
    'licenses.html': {
      '@type': 'CollectionPage',
      name: 'Допуски и сертификаты ТеплоРемСервис',
      url: pageUrl,
      inLanguage: 'ru-RU'
    }
  }[pageName];

  if (pageName === 'faq.html') {
    const mainEntity = [...html.matchAll(/<details class="faq-item">[\s\S]*?<summary class="faq-question">([\s\S]*?)<\/summary>[\s\S]*?<div class="faq-answer">([\s\S]*?)<\/div>[\s\S]*?<\/details>/g)]
      .map((match) => ({
        '@type': 'Question',
        name: plainText(match[1]),
        acceptedAnswer: { '@type': 'Answer', text: plainText(match[2]) }
      }));

    if (!mainEntity.length) throw new Error('Не удалось сформировать FAQPage JSON-LD');
    return { '@context': 'https://schema.org', '@type': 'FAQPage', url: pageUrl, mainEntity };
  }

  if (!pageData) return null;
  const names = {
    'services.html': 'Услуги',
    'portfolio.html': 'Портфолио',
    'licenses.html': 'Допуски и сертификаты'
  };
  breadcrumbs.itemListElement.push({ '@type': 'ListItem', position: 2, name: names[pageName], item: pageUrl });
  return { '@context': 'https://schema.org', '@graph': [pageData, breadcrumbs] };
}

async function buildPage(pageName) {
  const sourcePath = path.join(projectRoot, pageName);
  let html = await readFile(sourcePath, 'utf8');

  html = html.replace(/<svg\b(?=[^>]*aria-hidden)[^>]*>\s*<symbol[\s\S]*?<\/svg>\s*/i, '');
  html = html.replace(/(<use\b[^>]*\bhref=)"#([^"]+)"/g, '$1"assets/icons/sprite.svg#$2"');

  const stylesheetMatches = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="(css\/pages\/[^"]+\.css(?:\?[^"]*)?)">/g)];
  for (const match of stylesheetMatches) {
    const outputHref = await emitCssBundle(match[1]);
    html = html.replace(match[0], `<link rel="stylesheet" href="${outputHref}">`);
  }

  const scriptMatches = [...html.matchAll(/<script\s+defer\s+src="(js\/[^"]+\.js(?:\?[^"]*)?)"><\/script>/g)];
  for (const match of scriptMatches) {
    const outputSrc = await emitHashedScript(match[1]);
    html = html.replace(match[0], `<script defer src="${outputSrc}"></script>`);
  }

  const structuredData = createStructuredData(pageName, html);
  if (structuredData) {
    const json = JSON.stringify(structuredData).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script type="application/ld+json">${json}</script>\n</head>`);
  }

  await writeFile(path.join(outputRoot, pageName), html, 'utf8');
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(path.join(projectRoot, 'assets'), path.join(outputRoot, 'assets'), { recursive: true });
await cp(path.join(projectRoot, 'js'), path.join(outputRoot, 'js'), { recursive: true });

for (const fileName of staticFiles) {
  await cp(path.join(projectRoot, fileName), path.join(outputRoot, fileName));
}

for (const pageName of productionPages) {
  await buildPage(pageName);
}

for (const pageName of productionPages) {
  const html = await readFile(path.join(outputRoot, pageName), 'utf8');
  if (/localhost(?::\d+)?/i.test(html)) throw new Error(`${pageName}: localhost попал в production`);

  for (const match of html.matchAll(/(?:href|src)="((?:css|js|assets)\/[^"?#]+)/g)) {
    try {
      await readFile(path.join(outputRoot, match[1]));
    } catch {
      throw new Error(`${pageName}: отсутствует production-ресурс ${match[1]}`);
    }
  }
}

const outputEntries = await readdir(outputRoot);
const unexpectedHtml = outputEntries.filter((name) => name.endsWith('.html') && !productionPages.includes(name));
if (unexpectedHtml.length) {
  throw new Error(`В production попали служебные страницы: ${unexpectedHtml.join(', ')}`);
}

console.log(`Production-сборка создана: ${productionPages.length} страниц, каталог dist/`);
