import { CityConfig, CityId, Area, CityGridItem, HeroBannerConfig } from '../types';

export const DEFAULT_CITY_ID: CityId = 'chittoor';

export const SUPPORTED_CITY_IDS: CityId[] = ['chittoor', 'vellore', 'bengaluru'];

export function isCityId(value: unknown): value is CityId {
  return typeof value === 'string' && (value === 'chittoor' || value === 'vellore' || value === 'bengaluru');
}

// Chittoor Localities
export const CHITTOOR_AREAS_CONFIG: Area[] = [
  { id: 'all', cityId: 'chittoor', name: 'All Locations in Chittoor', landmark: 'Entire Chittoor & Surroundings' },
  { id: 'chittoor-town', cityId: 'chittoor', name: 'Chittoor Town', landmark: 'Clock Tower / Gandhi Road / Bazaar' },
  { id: 'gandhi-road', cityId: 'chittoor', name: 'Gandhi Road', landmark: 'Market Center / Clock Tower' },
  { id: 'church-street', cityId: 'chittoor', name: 'Church Street', landmark: 'Near St. John High School' },
  { id: 'kattamanchi', cityId: 'chittoor', name: 'Kattamanchi', landmark: 'Near Kattamanchi Overbridge' },
  { id: 'greamspet', cityId: 'chittoor', name: 'Greamspet', landmark: 'Near Railway Station / Old Town' },
  { id: 'murukambattu', cityId: 'chittoor', name: 'Murukambattu', landmark: 'Industrial & Mango Processing Zone' },
  { id: 'kongareddy-palle', cityId: 'chittoor', name: 'Kongareddy Palle', landmark: 'Residential Colony & Bypass' },
  { id: 'collectorate', cityId: 'chittoor', name: 'Collectorate / High Court Area', landmark: 'Near SP Office & District Courts' },
  { id: 'kanipakam', cityId: 'chittoor', name: 'Kanipakam', landmark: 'Sri Varasiddhi Vinayaka Temple Area' },
  { id: 'palamaner', cityId: 'chittoor', name: 'Palamaner', landmark: 'NH-69 Bangalore Corridor' },
  { id: 'madanapalle', cityId: 'chittoor', name: 'Madanapalle', landmark: 'Tomato Mandi & Horsley Hills Gateway' },
  { id: 'kuppam', cityId: 'chittoor', name: 'Kuppam', landmark: 'Granite & Tri-State Border' },
  { id: 'nagari', cityId: 'chittoor', name: 'Nagari', landmark: 'Nagari Hills & Powerloom Hub' },
  { id: 'puthalapattu', cityId: 'chittoor', name: 'Puthalapattu', landmark: 'Tirupati Highway Route' },
  { id: 'bangarupalem', cityId: 'chittoor', name: 'Bangarupalem', landmark: 'Chennai Highway Corridor' },
];

export const CHITTOOR_CITIES_GRID_CONFIG: CityGridItem[] = [
  {
    id: 'chittoor-town',
    name: 'Chittoor Town',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    count: 320,
    tagline: 'District Headquarters & Commercial Center',
  },
  {
    id: 'palamaner',
    name: 'Palamaner',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    count: 95,
    tagline: 'Bangalore Highway Hub & Cattle Market',
  },
  {
    id: 'kanipakam',
    name: 'Kanipakam',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    count: 65,
    tagline: 'Sri Varasiddhi Vinayaka Swamy Temple',
  },
  {
    id: 'madanapalle',
    name: 'Madanapalle',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    count: 140,
    tagline: 'Silk Weaving & Tomato Agricultural Mandis',
  },
  {
    id: 'kuppam',
    name: 'Kuppam',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    count: 82,
    tagline: 'Granite Industry & Tri-Junction Border',
  },
  {
    id: 'nagari',
    name: 'Nagari',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
    count: 58,
    tagline: 'Nagari Nose Rocks & Handloom Textiles',
  },
];

export const CHITTOOR_HERO_BANNERS_CONFIG: HeroBannerConfig[] = [
  {
    id: 'ch-banner-1',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=80',
    title: 'Royal Rayalaseema Ruchulu',
    tag: '⚡ Authentic Spicy Biryani & Karam Dosa • Gandhi Road',
    category: 'restaurants',
  },
  {
    id: 'ch-banner-2',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    title: 'Grand Chittoor Residency & Lodging',
    tag: '⚡ Special Pilgrim AC Rooms for Kanipakam Visitors',
    category: 'hotels-lodges',
  },
  {
    id: 'ch-banner-3',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    title: 'Sri Balaji Multi-Speciality Hospital',
    tag: '⚡ 24x7 Emergency Trauma Care & Arogyasri Empanelled • Kattamanchi',
    category: 'healthcare',
  },
  {
    id: 'ch-banner-4',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    title: 'Green Valley International School',
    tag: '⚡ Admissions Open 2026-27 • CBSE Digital Campus',
    category: 'education',
  },
  {
    id: 'ch-banner-5',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    title: 'Royal Handlooms & Bridal Silks',
    tag: '⚡ Pure Kuppadam & Kanchi Border Silk Sarees • High Court Road',
    category: 'silks-textiles',
  },
  {
    id: 'ch-banner-6',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1600&q=80',
    title: 'Chittoor Mango & Agro Mandi',
    tag: '⚡ Totapuri Pulp & Fresh Banganapalli Wholesale • Murukambattu',
    category: 'mango-agro',
  },
];

// Vellore Localities
export const VELLORE_AREAS_CONFIG: Area[] = [
  { id: 'all', cityId: 'vellore', name: 'All Locations in Vellore', landmark: 'Entire Vellore Corporation & NH-48 Corridor' },
  { id: 'katpadi', cityId: 'vellore', name: 'Katpadi', landmark: 'VIT University & Railway Junction Hub' },
  { id: 'sathuvachari', cityId: 'vellore', name: 'Sathuvachari', landmark: 'District Collectorate & NH-48 Bypass' },
  { id: 'bagayam', cityId: 'vellore', name: 'Bagayam', landmark: 'CMC Bagayam Campus & Sripuram Road' },
  { id: 'fort-city', cityId: 'vellore', name: 'Fort City / Bazaar', landmark: 'Vellore Fort, Clock Tower & Long Bazaar' },
  { id: 'thottapalayam', cityId: 'vellore', name: 'Thottapalayam', landmark: 'Old Bus Stand & Commercial Complex' },
  { id: 'gandhinagar', cityId: 'vellore', name: 'Gandhinagar', landmark: 'Katpadi Road Residential Colony' },
  { id: 'rangapuram', cityId: 'vellore', name: 'Rangapuram', landmark: 'Chennai Highway Junction' },
  { id: 'shenbakkam', cityId: 'vellore', name: 'Shenbakkam', landmark: 'Navagraha Temple & Bangalore Highway' },
  { id: 'ranipet-road', cityId: 'vellore', name: 'Ranipet Road', landmark: 'Industrial Estate & Leather Corridor' },
  { id: 'gudiyatham-road', cityId: 'vellore', name: 'Gudiyatham Road', landmark: 'Handloom & Match Industries' },
];

export const VELLORE_CITIES_GRID_CONFIG: CityGridItem[] = [
  {
    id: 'katpadi',
    name: 'Katpadi',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    count: 180,
    tagline: 'VIT University Campus & Railway Junction Corridor',
  },
  {
    id: 'sathuvachari',
    name: 'Sathuvachari',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    count: 145,
    tagline: 'District Administrative Hub & NH-48 Business Park',
  },
  {
    id: 'bagayam',
    name: 'Bagayam',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    count: 92,
    tagline: 'CMC Medical College Hospital & Sripuram Route',
  },
  {
    id: 'fort-city',
    name: 'Fort City & Bazaar',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    count: 160,
    tagline: 'Historic Vellore Fort, Jalakandeswarar & Long Bazaar',
  },
  {
    id: 'ranipet-road',
    name: 'Ranipet Corridor',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    count: 75,
    tagline: 'Export Leather Manufacturing & Industrial Zone',
  },
  {
    id: 'gudiyatham-road',
    name: 'Gudiyatham Hub',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    count: 50,
    tagline: 'Traditional Powerlooms, Textiles & Match Factories',
  },
];

export const VELLORE_HERO_BANNERS_CONFIG: HeroBannerConfig[] = [
  {
    id: 'vel-banner-1',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    title: 'CMC & Multispeciality Healthcare Network',
    tag: '⚡ World-Class Medical Specialists & Diagnostic Care • Ida Scudder Road',
    category: 'healthcare',
  },
  {
    id: 'vel-banner-2',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80',
    title: 'Katpadi Student Accommodations & Hostels',
    tag: '⚡ Verified AC Student PGs near VIT University Junction',
    category: 'pg-hostels',
  },
  {
    id: 'vel-banner-3',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=80',
    title: 'Authentic Vellore & Ambur Star Biryani',
    tag: '⚡ Famous Seeraga Samba Dum Biryani • Arcot Road & Fort Hub',
    category: 'restaurants',
  },
  {
    id: 'vel-banner-4',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    title: 'Sripuram Golden Temple Pilgrim Lodges',
    tag: '⚡ Comfortable AC Family Transit Stays • Bagayam Road',
    category: 'hotels-lodges',
  },
];

// Bengaluru Localities
export const BENGALURU_AREAS_CONFIG: Area[] = [
  { id: 'all', cityId: 'bengaluru', name: 'All Locations in Bengaluru', landmark: 'Greater Bengaluru Metropolitan Area' },
  { id: 'indiranagar', cityId: 'bengaluru', name: 'Indiranagar', landmark: '100ft Road & CMH Road Commercial Hub' },
  { id: 'koramangala', cityId: 'bengaluru', name: 'Koramangala', landmark: 'Sony World Junction & Startup Hub' },
  { id: 'whitefield', cityId: 'bengaluru', name: 'Whitefield', landmark: 'ITPL & Outer Ring Road Tech Parks' },
  { id: 'hsr-layout', cityId: 'bengaluru', name: 'HSR Layout', landmark: '27th Main Commercial High Street' },
  { id: 'jayanagar', cityId: 'bengaluru', name: 'Jayanagar', landmark: '4th Block Complex & Ashoka Pillar' },
  { id: 'electronic-city', cityId: 'bengaluru', name: 'Electronic City', landmark: 'Phase 1 & Phase 2 Tech Campuses' },
  { id: 'malleshwaram', cityId: 'bengaluru', name: 'Malleshwaram', landmark: 'Sampige Road & Margosa Road' },
  { id: 'marathahalli', cityId: 'bengaluru', name: 'Marathahalli', landmark: 'ORR Multiplex & Bridge Hub' },
  { id: 'btm-layout', cityId: 'bengaluru', name: 'BTM Layout', landmark: 'Udupi Garden & Ring Road Corridor' },
  { id: 'hebbal', cityId: 'bengaluru', name: 'Hebbal', landmark: 'Airport Road Flyover & Manyata Tech Park' },
  { id: 'yelahanka', cityId: 'bengaluru', name: 'Yelahanka', landmark: 'New Town Commercial & Air Force Base' },
];

export const BENGALURU_CITIES_GRID_CONFIG: CityGridItem[] = [
  {
    id: 'indiranagar',
    name: 'Indiranagar',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    count: 480,
    tagline: '100ft Road Boutiques, Cafes & Premier Lifestyle',
  },
  {
    id: 'koramangala',
    name: 'Koramangala',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    count: 420,
    tagline: 'Startup Incubators, Co-working & Dining Hub',
  },
  {
    id: 'whitefield',
    name: 'Whitefield',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    count: 360,
    tagline: 'ITPL Tech Corridor & Luxury High-Rise Living',
  },
  {
    id: 'hsr-layout',
    name: 'HSR Layout',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
    count: 310,
    tagline: 'Modern Tech Hub, Co-Living & High Streets',
  },
  {
    id: 'jayanagar',
    name: 'Jayanagar',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    count: 240,
    tagline: 'South Bangalore Heritage & 4th Block Shopping',
  },
  {
    id: 'electronic-city',
    name: 'Electronic City',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
    count: 220,
    tagline: 'Global IT Campuses & Elevated Expressway',
  },
];

export const BENGALURU_HERO_BANNERS_CONFIG: HeroBannerConfig[] = [
  {
    id: 'blr-banner-1',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    title: 'Silicon City Co-Working & Enterprise Spaces',
    tag: '⚡ Flexible Desks, Private Cabins & Startup Hubs • Indiranagar & HSR',
    category: 'real-estate',
  },
  {
    id: 'blr-banner-2',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80',
    title: 'Premium Co-Living PGs & Managed Rentals',
    tag: '⚡ High-Speed Wi-Fi, Food & Housekeeping • Koramangala & Whitefield',
    category: 'pg-hostels',
  },
  {
    id: 'blr-banner-3',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    title: 'Iconic Bangalore South Indian Cafes & Dining',
    tag: '⚡ Filter Coffee, Benne Dosa & Global Craft Breweries',
    category: 'restaurants',
  },
  {
    id: 'blr-banner-4',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    title: 'Super-Speciality Healthcare & Diagnostic Labs',
    tag: '⚡ Multi-Speciality Robotic Surgery & Emergency Network',
    category: 'healthcare',
  },
];

export const CITIES: Record<CityId, CityConfig> = {
  chittoor: {
    id: 'chittoor',
    name: 'Chittoor',
    nameNative: 'చిత్తూరు',
    brandName: 'Chittoor Ads',
    brandSuffix: 'Ads',
    code: 'AP-03',
    tagline: 'Search Local | Go Digital',
    state: 'Andhra Pradesh',
    domain: 'chittoorads.com',
    primaryLanguage: 'te',
    supportedLanguages: ['en', 'te', 'ta', 'kn', 'ur', 'hi'],
    theme: {
      primaryColor: '#E51E31',
      secondaryColor: '#176AC4',
      accentColor: '#15995F',
      badgeBg: 'bg-red-50 border-red-200',
      badgeText: 'text-[#E51E31]',
    },
    localities: CHITTOOR_AREAS_CONFIG,
    cityGrid: CHITTOOR_CITIES_GRID_CONFIG,
    heroBanners: CHITTOOR_HERO_BANNERS_CONFIG,
    contact: {
      address: 'Gandhi Road Center, Chittoor - 517001, Andhra Pradesh',
      phone: '+91 94402 18456',
      email: 'support@chittoorads.com',
    },
    seo: {
      title: 'Chittoor Ads - Local Business Directory & Classifieds (AP-03)',
      description: 'Discover verified local businesses, hospitals, restaurants, schools, and classifieds across Chittoor district and Kanipakam.',
    },
    features: {
      hasKanipakamSpecial: true,
      landmark: 'Sri Varasiddhi Vinayaka Swamy Temple & Mango Mandis',
      heroHeadingMain: 'Find Everything in',
      heroHeadingHighlight: 'Chittoor',
    },
    stats: {
      totalListingsCount: 320,
      activeLocalitiesCount: 16,
    },
  },

  vellore: {
    id: 'vellore',
    name: 'Vellore',
    nameNative: 'வேலூர்',
    brandName: 'Vellore Ads',
    brandSuffix: 'Ads',
    code: 'TN-23',
    tagline: 'Search Local | Fort City Directory',
    state: 'Tamil Nadu',
    domain: 'velloreads.com',
    primaryLanguage: 'ta',
    supportedLanguages: ['en', 'ta', 'te', 'kn', 'hi', 'ur'],
    theme: {
      primaryColor: '#176AC4',
      secondaryColor: '#E51E31',
      accentColor: '#15995F',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-[#176AC4]',
    },
    localities: VELLORE_AREAS_CONFIG,
    cityGrid: VELLORE_CITIES_GRID_CONFIG,
    heroBanners: VELLORE_HERO_BANNERS_CONFIG,
    contact: {
      address: 'Katpadi Main Road, Near VIT Junction, Vellore - 632014, Tamil Nadu',
      phone: '+91 94402 18456',
      email: 'vellore@chittoorads.com',
    },
    seo: {
      title: 'Vellore Ads - Local Business Directory & Services (TN-23)',
      description: 'Discover verified local businesses, CMC medical specialists, student PGs, hotels, and classifieds across Vellore.',
    },
    features: {
      hasKanipakamSpecial: false,
      landmark: 'Historic Vellore Fort, Golden Temple & CMC Hospital Hub',
      heroHeadingMain: 'Find Everything in',
      heroHeadingHighlight: 'Vellore',
    },
    stats: {
      totalListingsCount: 180,
      activeLocalitiesCount: 11,
    },
  },

  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    nameNative: 'ಬೆಂಗಳೂರು',
    brandName: 'Bengaluru Ads',
    brandSuffix: 'Ads',
    code: 'KA-01',
    tagline: 'Search Local | Silicon City Hub',
    state: 'Karnataka',
    domain: 'bengaluruads.com',
    primaryLanguage: 'kn',
    supportedLanguages: ['en', 'kn', 'te', 'ta', 'hi', 'ur'],
    theme: {
      primaryColor: '#15995F',
      secondaryColor: '#176AC4',
      accentColor: '#F5C325',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-[#15995F]',
    },
    localities: BENGALURU_AREAS_CONFIG,
    cityGrid: BENGALURU_CITIES_GRID_CONFIG,
    heroBanners: BENGALURU_HERO_BANNERS_CONFIG,
    contact: {
      address: '100ft Road, Indiranagar, Bengaluru - 560038, Karnataka',
      phone: '+91 94402 18456',
      email: 'bengaluru@chittoorads.com',
    },
    seo: {
      title: 'Bengaluru Ads - Local Business Discovery & Services (KA-01)',
      description: 'Discover verified local services, tech consultants, co-living PGs, restaurants, and classifieds across Bengaluru.',
    },
    features: {
      hasKanipakamSpecial: false,
      landmark: 'Silicon City Tech Hub, Metro Corridors & Innovation Clusters',
      heroHeadingMain: 'Find Everything in',
      heroHeadingHighlight: 'Bengaluru',
    },
    stats: {
      totalListingsCount: 480,
      activeLocalitiesCount: 12,
    },
  },
};

