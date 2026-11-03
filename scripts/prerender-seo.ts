import fs from 'fs';
import path from 'path';

interface CitySEO {
  id: string;
  name: string;
  code: string;
  title: string;
  description: string;
  canonicalUrl: string;
}

const CITY_SEO_DATA: CitySEO[] = [
  {
    id: 'chittoor',
    name: 'Chittoor',
    code: 'AP-03',
    title: 'ChittoorAds - Discover Chittoor in One Click | Business Directory & Classifieds (AP-03)',
    description: "Chittoor's premier local business discovery, classifieds, mango mandis, and emergency helpline portal. Find verified local services in Chittoor, Kanipakam, and Palamaner.",
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/chittoor',
  },
  {
    id: 'vellore',
    name: 'Vellore',
    code: 'TN-23',
    title: 'VelloreAds - Discover Vellore in One Click | Business Directory & Theatres (TN-23)',
    description: "Vellore's premier local business directory, Fort City cinema theatres, heritage attractions, and 24x7 emergency helpline portal (TN-23).",
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    code: 'KA-01',
    title: 'BengaluruAds - Discover Bengaluru in One Click | Business Directory & Tech Hub (KA-01)',
    description: "Bengaluru's tech-enabled local business discovery, coworking, co-living, and commercial enterprise directory (KA-01).",
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/bengaluru',
  },
];

function prerender() {
  const distDir = path.join(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Cannot prerender: dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  console.log('---------------------------------------------------------');
  console.log('KAARYAN LABS — PRERENDERING CITY SEO STATIC HTML FILES');
  console.log('---------------------------------------------------------');

  for (const city of CITY_SEO_DATA) {
    const cityDir = path.join(distDir, 'city', city.id);
    if (!fs.existsSync(cityDir)) {
      fs.mkdirSync(cityDir, { recursive: true });
    }

    let cityHtml = baseHtml;

    // 1. Title replacement
    cityHtml = cityHtml.replace(
      /<title>.*?<\/title>/is,
      `<title>${city.title}</title>`
    );

    // 2. Meta description replacement
    cityHtml = cityHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/is,
      `<meta name="description" content="${city.description}" />`
    );

    // 3. OpenGraph Title replacement
    cityHtml = cityHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/is,
      `<meta property="og:title" content="${city.title}" />`
    );

    // 4. OpenGraph Description replacement
    cityHtml = cityHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/is,
      `<meta property="og:description" content="${city.description}" />`
    );

    // 5. Inject Canonical URL & OG URL before </head>
    const seoTags = `    <link rel="canonical" href="${city.canonicalUrl}" />\n` +
      `    <meta property="og:url" content="${city.canonicalUrl}" />\n` +
      `    <meta name="city" content="${city.id}" />\n` +
      `    <meta name="territory-code" content="${city.code}" />\n  `;

    cityHtml = cityHtml.replace('</head>', `${seoTags}</head>`);

    const cityIndexPath = path.join(cityDir, 'index.html');
    fs.writeFileSync(cityIndexPath, cityHtml, 'utf-8');
    console.log(`✅ Generated prerendered SEO HTML for ${city.name} (${city.code}) -> dist/city/${city.id}/index.html`);
  }

  console.log('✅ All 3 city SEO entrypoints prerendered successfully.\n');
}

prerender();

