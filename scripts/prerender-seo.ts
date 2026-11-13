import fs from 'fs';
import path from 'path';
import { PUBLISHED_VELLORE_ATTRACTIONS } from '../src/data/velloreTourismData';

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
  {
    cityId: 'vellore',
    subpath: 'community',
    title: 'Vellore Community Noticeboard - Public Announcements & Civic Updates (TN-23)',
    description: 'Local public announcements, civic initiatives, student updates, and non-commercial community notices in Vellore (TN-23).',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/community',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'events',
    title: 'Vellore Local Events Calendar - Conferences, Concerts & Workshops (TN-23)',
    description: 'Discover upcoming conferences, cultural evenings, academic workshops, sports tournaments, and festivals in Vellore (TN-23).',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/events',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism',
    title: 'Vellore Heritage & Tourism Guide - Fort, Golden Temple & Sights (TN-23)',
    description: 'Explore the top heritage landmarks, historic forts, golden temples, scenic viewpoints, and cultural attractions across Vellore (TN-23).',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/vellore-fort-and-moat',
    title: 'Vellore Fort & Moat (வேலூர் கோட்டை) - 16th Century Vijayanagara Ramparts (TN-23)',
    description: 'Explore Vellore Fort & Moat, a 16th-century granite fort built by Chinna Bommi Nayaka with double bastions, deep moat, Tipu Mahal, and 1806 Sepoy Mutiny grounds.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/vellore-fort-and-moat',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/sripuram-golden-temple',
    title: 'Sri Lakshmi Narayani Golden Temple (ஸ்ரீபுரம் பொற்கோயில்) - Sripuram Vellore (TN-23)',
    description: 'Visit Sripuram Golden Temple in Thirumalaikodi, Vellore. Adorned in 1,500 kg pure gold leaf with a 1.8 km star-shaped spiritual pathway (Sri Chakra) and eco-park.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/sripuram-golden-temple',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/jalakandeswarar-temple',
    title: 'Jalakandeswarar Temple (ஜலகண்டேஸ்வரர் கோவில்) - Fort Vellore (TN-23)',
    description: 'Discover Jalakandeswarar Temple inside Vellore Fort, famous for its 100-pillar monolithic Kalyana Mandapam, intricate Vijayanagara carvings, and Shaivite heritage.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/jalakandeswarar-temple',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/cmc-heritage-campus',
    title: 'CMC Hospital Heritage Campus (சி.எம்.சி பாரம்பரிய வளாகம்) - Dr. Ida Scudder (TN-23)',
    description: 'Historical heritage campus of Christian Medical College Vellore founded in 1900 by Dr. Ida S. Scudder. Preserving the historic chapel and archives. Clinical areas strictly private.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/cmc-heritage-campus',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/palamathi-hills-otteri-viewpoint',
    title: 'Palamathi Hills & Otteri Viewpoint (பாலமதி மலை காட்சிமுனை) - Vellore (TN-23)',
    description: 'Panoramic Eastern Ghats viewpoint rising over 450 meters elevation near Otteri, offering 360-degree views of Vellore town, fresh hill breezes, and nature trails.',
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/palamathi-hills-otteri-viewpoint',
    territoryCode: 'TN-23',
  },
  {
    cityId: 'vellore',
    subpath: 'tourism/st-johns-church-fort',
    title: "St. John's Church (Fort Vellore) - Historic 1846 Garrison Sanctuary (TN-23)",
    description: "Built in 1846 by the East India Company inside Vellore Fort, St. John's Church features colonial architecture, memorial plaques honoring soldiers of the 1806 Mutiny, and quiet sanctuary.",
    canonicalUrl: 'https://remix-client-new-project.vercel.app/city/vellore/tourism/st-johns-church-fort',
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
    let subSeoTags = `    <link rel="canonical" href="${sub.canonicalUrl}" />\n` +
      `    <meta property="og:url" content="${sub.canonicalUrl}" />\n` +
      `    <meta name="city" content="${sub.cityId}" />\n` +
      `    <meta name="territory-code" content="${sub.territoryCode}" />\n`;

    // 6. If attraction detail page, inject Schema.org JSON-LD and crawlable noscript content
    if (sub.subpath.startsWith('tourism/') && sub.subpath !== 'tourism') {
      const attractionSlug = sub.subpath.replace('tourism/', '');
      const attraction = PUBLISHED_VELLORE_ATTRACTIONS.find((a) => a.slug === attractionSlug);

      if (attraction) {
        const postalCode = attraction.location.address?.match(/\b(\d{6})\b/)?.[1] || '632004';
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: attraction.title,
          alternateName: attraction.nameNative,
          description: attraction.shortDescription,
          image: attraction.heroImage,
          url: sub.canonicalUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: attraction.location.address || attraction.location.locality,
            addressLocality: attraction.location.locality,
            addressRegion: 'Tamil Nadu',
            postalCode,
            addressCountry: 'IN',
          },
          geo:
            attraction.location.latitude && attraction.location.longitude
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: attraction.location.latitude,
                  longitude: attraction.location.longitude,
                }
              : undefined,
          isAccessibleForFree: attraction.visitorInformation.entryFeeType === 'free',
          publicAccess: true,
        };

        subSeoTags += `    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>\n`;

        // Inject semantic crawlable HTML inside <body> for search engines without JS
        const noscriptHtml = `\n  <noscript>
    <div style="max-width:800px;margin:24px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1e293b;">
      <p><a href="/city/vellore/tourism" style="color:#176AC4;font-weight:bold;">← Return to Vellore Tourism Directory</a></p>
      <h1>${attraction.title} (${attraction.nameNative})</h1>
      <p><strong>Category:</strong> ${attraction.category.replace('_', ' ')} | <strong>Territory:</strong> Vellore, Tamil Nadu (TN-23)</p>
      <p><strong>Location:</strong> ${attraction.location.locality} - ${attraction.location.address || ''}</p>
      <p>${attraction.shortDescription}</p>
      <p>${attraction.fullDescription}</p>
      <h2>Visitor Guidelines</h2>
      <ul>
        <li><strong>Opening Hours:</strong> ${attraction.visitorInformation.timings}</li>
        <li><strong>Entry Policy:</strong> ${attraction.visitorInformation.entryFeeType} ${attraction.visitorInformation.entryFeeDetails ? `(${attraction.visitorInformation.entryFeeDetails})` : ''}</li>
        <li><strong>Photography:</strong> ${attraction.visitorInformation.photographyRules || 'Allowed'}</li>
        <li><strong>Parking:</strong> ${attraction.visitorInformation.parkingAvailable || 'Available'}</li>
      </ul>
      ${attraction.clinicalVisitorNotice ? `<div style="background:#fffbeb;border:1px solid #fde68a;padding:12px;border-radius:8px;margin-top:16px;"><strong>Regulatory Clinical Notice:</strong> ${attraction.clinicalVisitorNotice}</div>` : ''}
    </div>
  </noscript>\n`;

        subHtml = subHtml.replace('</body>', `${noscriptHtml}</body>`);
      }
    } else if (sub.subpath === 'tourism') {
      // Inject directory noscript index
      const noscriptDir = `\n  <noscript>
    <div style="max-width:800px;margin:24px auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1e293b;">
      <h1>Vellore Heritage & Tourism Guide (TN-23)</h1>
      <p>Explore verified cultural landmarks, historic monuments, and pilgrimage destinations in Vellore, Tamil Nadu.</p>
      <h2>Published Destinations</h2>
      <ul>
        ${PUBLISHED_VELLORE_ATTRACTIONS.map(
          (a) => `<li><a href="/city/vellore/tourism/${a.slug}" style="color:#176AC4;font-weight:bold;">${a.title} (${a.nameNative})</a> - ${a.shortDescription}</li>`
        ).join('\n        ')}
      </ul>
    </div>
  </noscript>\n`;

      subHtml = subHtml.replace('</body>', `${noscriptDir}</body>`);
    }

    subHtml = subHtml.replace('</head>', `${subSeoTags}  </head>`);

    const subIndexPath = path.join(subDir, 'index.html');
    fs.writeFileSync(subIndexPath, subHtml, 'utf-8');
    console.log(`✅ Generated prerendered SEO HTML for ${sub.cityId}/${sub.subpath} (${sub.territoryCode}) -> dist/city/${sub.cityId}/${sub.subpath}/index.html`);
  }

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

Sitemap: https://remix-client-new-project.vercel.app/sitemap.xml
`;

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('✅ Generated robots.txt');

  // Generate sitemap.xml with canonical routes, strictly excluding draft backlog items
  const sitemapUrls = [
    'https://remix-client-new-project.vercel.app/',
    'https://remix-client-new-project.vercel.app/city/vellore',
    'https://remix-client-new-project.vercel.app/city/vellore/about',
    'https://remix-client-new-project.vercel.app/city/vellore/contact',
    'https://remix-client-new-project.vercel.app/city/vellore/community',
    'https://remix-client-new-project.vercel.app/city/vellore/events',
    'https://remix-client-new-project.vercel.app/city/vellore/tourism',
    ...PUBLISHED_VELLORE_ATTRACTIONS.map(
      (a) => `https://remix-client-new-project.vercel.app/city/vellore/tourism/${a.slug}`
    ),
    'https://remix-client-new-project.vercel.app/city/chittoor',
    'https://remix-client-new-project.vercel.app/city/bengaluru',
  ];

  const currentDate = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.includes('/tourism') ? 'weekly' : 'daily'}</changefreq>
    <priority>${url === 'https://remix-client-new-project.vercel.app/' ? '1.0' : url.includes('/tourism') ? '0.8' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`✅ Generated sitemap.xml with ${sitemapUrls.length} verified canonical routes (draft items excluded)`);

  console.log('✅ All city and subpage SEO entrypoints prerendered successfully.\n');
}

prerender();


