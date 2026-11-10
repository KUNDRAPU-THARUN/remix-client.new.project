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

interface SubPageSEO {
  cityId: string;
  subpath: string;
  title: string;
  description: string;
  canonicalUrl: string;
  territoryCode: string;
}

const SUBPAGE_SEO_DATA: SubPageSEO[] = [
  {
    cityId: 'vellore',
    subpath: 'about',
    title: 'About Vellore Ads - Fort City Business Directory & Classifieds (TN-23)',
    description: 'Discover Vellore Ads, the premier local business directory, CMC hospital corridor, student life, and classifieds portal for Vellore (TN-23).',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/about',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'contact',
    title: 'Contact Vellore Ads - Office & Support Helpline (TN-23)',
    description: 'Get in touch with Vellore Ads regional office in Vellore. Phone: +91 81899 85559. Office: Katpadi Main Road, Near VIT Junction, Vellore - 632014, Tamil Nadu.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/contact',
    territoryCode: 'TN-23',
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

  // Sub-pages prerendering (About, Contact)
  for (const sub of SUBPAGE_SEO_DATA) {
    const subDir = path.join(distDir, 'city', sub.cityId, sub.subpath);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    let subHtml = baseHtml;

    // 1. Title replacement
    subHtml = subHtml.replace(
      /<title>.*?<\/title>/is,
      `<title>${sub.title}</title>`
    );

    // 2. Meta description replacement
    subHtml = subHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/is,
      `<meta name="description" content="${sub.description}" />`
    );

    // 3. OpenGraph Title replacement
    subHtml = subHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/is,
      `<meta property="og:title" content="${sub.title}" />`
    );

    // 4. OpenGraph Description replacement
    subHtml = subHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/is,
      `<meta property="og:description" content="${sub.description}" />`
    );

    // 5. Inject Canonical URL & OG URL before </head>
    const subSeoTags = `    <link rel="canonical" href="${sub.canonicalUrl}" />\n` +
      `    <meta property="og:url" content="${sub.canonicalUrl}" />\n` +
      `    <meta name="city" content="${sub.cityId}" />\n` +
      `    <meta name="territory-code" content="${sub.territoryCode}" />\n  `;

    subHtml = subHtml.replace('</head>', `${subSeoTags}</head>`);

    const subIndexPath = path.join(subDir, 'index.html');
    fs.writeFileSync(subIndexPath, subHtml, 'utf-8');
    console.log(`✅ Generated prerendered SEO HTML for ${sub.cityId}/${sub.subpath} (${sub.territoryCode}) -> dist/city/${sub.cityId}/${sub.subpath}/index.html`);
  }

  console.log('✅ All city and subpage SEO entrypoints prerendered successfully.\n');
}

prerender();


