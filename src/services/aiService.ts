/**
 * AI Service Integration Layer for KAARYAN Multi-City Regional Portals
 * (Chittoor Ads, Vellore Ads, Bengaluru Ads)
 * 
 * SECURITY DIRECTIVE:
 * Private AI credentials (e.g. GEMINI_API_KEY) must never be bundled into client-side JavaScript.
 * Deterministic local directory knowledge bases are curated per city.
 */

import { CityId } from '../types';

export interface AIServiceClient {
  askAssistant(query: string, language?: string): Promise<string>;
  generateAd(data: {
    title: string;
    category: string;
    area: string;
    highlights: string;
    phone: string;
    cityName?: string;
    cityCode?: string;
  }): Promise<string>;
}

export async function askCityScout(
  cityId: CityId,
  query: string,
  language: string = 'en'
): Promise<string> {
  const q = query.toLowerCase().trim();

  // 1. VELLORE CITY SCOUT
  if (cityId === 'vellore') {
    if (q.includes('hospital') || q.includes('doctor') || q.includes('emergency') || q.includes('medical') || q.includes('clinic') || q.includes('cmc')) {
      return `For premier medical care in Vellore (TN-23):
1. Christian Medical College & Hospital (CMC) on Ida Scudder Road - International tertiary referral center (Phone: 0416-2281000).
2. Government Vellore Medical College Hospital at Adukkamparai for 24x7 government casualty & trauma ward (Phone: 0416-2260900).
3. Naruvi Multispeciality Hospital on Bangalore-Chennai National Highway.
4. For immediate ambulance emergency anywhere across Vellore, dial 108.`;
    }

    if (q.includes('temple') || q.includes('fort') || q.includes('golden temple') || q.includes('sripuram') || q.includes('tourist') || q.includes('place')) {
      return `Key historical and spiritual attractions in Vellore:
- Vellore Fort: 16th-century granite fort surrounded by a wide moat, housing the exquisite Jalakandeswarar Temple and Government Museum.
- Sripuram Sri Lakshmi Narayani Golden Temple: Located 8 km from town, layered with 1,500 kg of pure gold foil inside a star-shaped path. Open 8:00 AM - 8:00 PM.
- Jalakandeswarar Temple: Renowned for intricate Vijayanagara stone carvings and Gopuram inside the Fort.`;
    }

    if (q.includes('vit') || q.includes('college') || q.includes('university') || q.includes('hostel') || q.includes('pg') || q.includes('student')) {
      return `Vellore is an educational hub with thousands of students:
- VIT University: Located in Katpadi near the railway junction. For verified student PGs with AC, Wi-Fi, and mess food along Katpadi Main Road, browse our Student PGs category.
- CMC Medical College Bagayam campus: Located on Bagayam Road.
- Voorhees College & Auxilium College: Historic institutions in the heart of Vellore.`;
    }

    if (q.includes('biryani') || q.includes('food') || q.includes('restaurant') || q.includes('ambur') || q.includes('eat')) {
      return `Vellore is famous for its distinct culinary heritage:
- Authentic Ambur Biryani: Prepared with Seeraga Samba rice and traditional spices, served with sour brinjal kathirikai curry and raita. Star Biryani and Fort city eateries are renowned.
- Vegetarian Tiffin: Traditional South Indian filter coffee and ghee roast dosas around Officers Line and Long Bazaar.`;
    }

    if (q.includes('theatre') || q.includes('movie') || q.includes('cinema')) {
      return `Popular cinema multiplexes in Vellore:
- Balaji Cinemas (Katpadi)
- Vishnu Cinemas (Fort Area)
- Lakshmi Multiplex (Officers Line)
- Alankar Theatre (Old Bus Stand)
Browse our "Theatres & Cinema Multiplex" section for local showtime inquiries!`;
    }

    return `Welcome to Vellore Ads (TN-23 Fort City Directory)!
Vellore is a historic and medical landmark in Tamil Nadu. Explore verified local services for:
- CMC & Multispeciality Hospitals (Ida Scudder Road & Adukkamparai)
- Student PGs & Hostels (VIT Katpadi & CMC Bagayam)
- Authentic Ambur Biryani & Dining (Fort City & Arcot Road)
- Vellore Fort & Sripuram Golden Temple Lodges
- Ranipet Leather & Footwear Manufacturing
- House Rentals & Real Estate across Katpadi, Sathuvachari, and Gandhi Nagar.

Use the search bar above or tap "Post Free Ad" to list your Vellore business for free!`;
  }

  // 2. BENGALURU CITY SCOUT
  if (cityId === 'bengaluru') {
    if (q.includes('coworking') || q.includes('office') || q.includes('desk') || q.includes('startup') || q.includes('tech')) {
      return `Bengaluru is India's Silicon Valley. Top commercial and startup zones:
- Indiranagar: 100ft Road and CMH Road premier flexible coworking desks and enterprise boutique offices.
- Koramangala & HSR Layout: Startup incubators, seed-stage hubs, and tech campuses.
- Whitefield & Electronic City: ITPL and tech park corporate enterprise towers.`;
    }

    if (q.includes('pg') || q.includes('hostel') || q.includes('coliving') || q.includes('rent') || q.includes('flat')) {
      return `Bengaluru Co-Living & Accommodations:
- Managed PGs with high-speed fiber Wi-Fi, food, housekeeping & power backup in HSR Layout, Koramangala, and BTM Layout.
- Gated community 2BHK/3BHK flats along Outer Ring Road and Whitefield.`;
    }

    if (q.includes('food') || q.includes('coffee') || q.includes('dosa') || q.includes('brewery') || q.includes('pub') || q.includes('cafe')) {
      return `Bengaluru Culinary Highlights:
- Crispy butter benne masala dosa and degree filter coffee in Jayanagar, Malleshwaram, and Basavanagudi.
- Global craft microbreweries, open-air cafes, and culinary hubs across Indiranagar, Koramangala, and Lavelle Road.`;
    }

    if (q.includes('hospital') || q.includes('doctor') || q.includes('emergency')) {
      return `Super-Speciality Healthcare in Bengaluru:
- Manipal Hospitals, Aster CMI, Fortis, and Apollo multi-speciality network.
- Apex government hospitals: Victoria Hospital and Bowring & Lady Curzon Hospital (24x7 casualty).
- For immediate ambulance dispatch, dial 108. Police: 112.`;
    }

    return `Welcome to Bengaluru Ads (KA-01 Silicon City Directory)!
Discover verified services across Greater Bengaluru:
- Coworking spaces & private cabins (Indiranagar, HSR, Koramangala)
- Managed tech PGs & co-living rentals
- Iconic South dining, filter coffee & craft breweries
- Multispeciality hospitals & diagnostic networks
- Residential properties & commercial leasing.

Search above or tap "+ Post Free Ad" to feature your Bengaluru business!`;
  }

  // 3. CHITTOOR CITY SCOUT (Default)
  if (q.includes('hospital') || q.includes('doctor') || q.includes('emergency') || q.includes('medical') || q.includes('clinic')) {
    return `For medical care in Chittoor, the major 24x7 centers are:
1. Sri Balaji Multi-Speciality Hospital & Trauma Care on Gandhi Road (near Clock Tower) - Phone: +91 94402 18456.
2. District Government General Hospital (GGH) on Collectorate Road for specialized casualty and Arogyasri facilities (Phone: 08572-225225).
3. For immediate medical emergencies anywhere in Chittoor or on the highways, call 108 Ambulance service.`;
  }

  if (q.includes('kanipakam') || q.includes('temple') || q.includes('vinayaka') || q.includes('darshan') || q.includes('taxi') || q.includes('cab')) {
    return `Kanipakam Sri Varasiddhi Vinayaka Temple is located just 11 km from Chittoor town (approx. 20-25 mins via Kanipakam Road):
- Morning Suprabhata Seva begins at 4:00 AM, Sarva Darshanam is open till 9:30 PM.
- For verified cabs and pilgrim packages from Chittoor railway station or bus stand, contact 'Kanipakam Sri Varasiddhi Travels' (+91 97008 34112). They provide clean AC sedans and Innovas with pickup right at your doorstep.`;
  }

  if (q.includes('mango') || q.includes('totapuri') || q.includes('pulp') || q.includes('mandi') || q.includes('jaggery')) {
    return `Chittoor is the largest mango processing hub in India, especially famous for Totapuri mango pulp and fresh Banganapalli:
- The premier processing & wholesale cluster is located at the Murukambattu Industrial Estate along Chittoor bypass.
- For bulk aseptic drums, table fruit wholesale, or jaggery blocks, you can contact Murukambattu Mango Pulp Traders (+91 98490 55219) or visit the APMC Santhapet wholesale mandi.`;
  }

  if (q.includes('saree') || q.includes('silk') || q.includes('cloth') || q.includes('pattu')) {
    return `Chittoor is renowned for handloom silk heritage and proximity to master weavers:
- For authentic Kuppadam handlooms, pure Dharmavaram silk, and Kanchipuram wedding sarees, visit Lakshmi Silks & Handloom Heritage Emporium on Church Street (near Old Bus Stand) - Phone: +91 85722 31980.
- All genuine stores on ChittoorAds are Silk Mark certified.`;
  }

  if (q.includes('food') || q.includes('dosa') || q.includes('restaurant') || q.includes('biryani') || q.includes('eat')) {
    return `Chittoor is famous for its fiery Rayalaseema culinary flavors:
- Must-try: Authentic Chittoor Ghee Karam Dosa and morning tiffins at Royal Rayalaseema Ruchulu on Gandhi Road (Opp. Head Post Office).
- For traditional spicy Naatu Kodi Pulusu with Ragi Mudda or dum biryani, local family restaurants around Gandhi Road and High Court Junction are top rated.`;
  }

  if (language === 'te') {
    return `చిత్తూరుఆడ్స్ (ChittoorAds) కి స్వాగతం!
మా ధృవీకరించబడిన స్థానిక డైరెక్టరీలో మీరు కనుగొనవచ్చు:
- అత్యవసర ఆసుపత్రులు (గాంధీ రోడ్ & కలెక్టరేట్)
- కాణిపాకం యాత్రా క్యాబ్‌లు (పట్టణానికి 11 కి.మీ.)
- మామిడి గుజ్జు మార్కెట్లు & పరిశ్రమలు (మురుకంబట్టు)
- పట్టు చీరలు & వస్త్ర వ్యాపారం (చర్చ్ స్ట్రీట్ & బజార్)
- రియల్ ఎస్టేట్, అద్దె ఇళ్ళు మరియు స్థానిక మెకానిక్స్.

మీరు పైన ఉన్న శోధన పట్టీని ఉపయోగించి వివరాలు పొందవచ్చు లేదా మీ స్వంత వ్యాపారాన్ని ఉచితంగా ప్రచురించడానికి "+ Post Free Ad" ని ఎంచుకోండి!`;
  }

  return `Welcome to ChittoorAds! Chittoor is a vibrant hub connecting Andhra Pradesh, Tamil Nadu, and Karnataka. 
Explore our verified local directory for:
- Healthcare & Emergency (Gandhi Road & Collectorate)
- Kanipakam Pilgrimage & Travels (11 km from town)
- Mango Pulp Mandis & Agro industries (Murukambattu)
- Silk Sarees & Boutiques (Church Street & Bazaar)
- Real Estate, House Rentals & Local Mechanics across Kattamanchi, Greamspet, and Kongareddy Palle.

You can browse any category using the search bar above or tap "Post Free Ad" to list your own local business for free!`;
}

// Backward-compatible alias for existing callers
export async function askChittoorScout(query: string, language: 'en' | 'te' = 'en'): Promise<string> {
  return askCityScout('chittoor', query, language);
}

export async function generateAdCopy(data: {
  title: string;
  category: string;
  area: string;
  highlights: string;
  phone: string;
  cityName?: string;
  cityCode?: string;
}): Promise<string> {
  const cleanTitle = data.title.trim().toUpperCase();
  const cleanArea = data.area.trim();
  const cleanCategory = data.category.trim();
  const cleanPhone = data.phone.trim();
  const city = data.cityName || 'Local';
  const code = data.cityCode || 'City';
  const cleanHighlights = data.highlights.trim() || `Prompt service, verified quality, affordable pricing in ${city}`;

  return `🌟 *${cleanTitle} - ${city.toUpperCase()}* 🌟
📍 *Location:* ${cleanArea}, ${city}

Looking for trusted ${cleanCategory} in ${city}? We provide top-notch service with complete customer satisfaction!

✅ *Why Choose Us:*
• ${cleanHighlights}
• Best competitive prices in ${city}
• Fast doorstep & prompt assistance
• Trusted by local families across ${code}

📞 *Call / WhatsApp Today:* ${cleanPhone}
🌐 *Find us on Local Discovery Portal*`;
}
