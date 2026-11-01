/**
 * AI Service Integration Layer for ChittoorAds & Regional Portals
 * 
 * SECURITY DIRECTIVE (Phase 2A):
 * Private AI credentials (e.g. GEMINI_API_KEY) must never be bundled into client-side JavaScript.
 * Direct browser client SDK calls have been removed to prevent credential leakage and abuse.
 * 
 * Future production architecture:
 * In Phase 2B, all generative AI calls are routed through an authenticated backend proxy:
 * POST /api/ai/scout
 * POST /api/ai/generate-ad
 * 
 * Until the backend proxy is provisioned, this service runs the safe, deterministic local
 * directory knowledge base and structured template generator.
 */

export interface AIServiceClient {
  askAssistant(query: string, language?: 'en' | 'te'): Promise<string>;
  generateAd(data: {
    title: string;
    category: string;
    area: string;
    highlights: string;
    phone: string;
  }): Promise<string>;
}

export async function askChittoorScout(query: string, language: 'en' | 'te' = 'en'): Promise<string> {
  // Check if a secure backend API proxy is available in the deployment environment
  // (In Phase 2A prototype, default safely to the local curated knowledge base)
  const q = query.toLowerCase().trim();

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

export async function generateAdCopy(data: {
  title: string;
  category: string;
  area: string;
  highlights: string;
  phone: string;
}): Promise<string> {
  // Secure client-side formatted ad template (backend proxy scheduled for Phase 2B)
  const cleanTitle = data.title.trim().toUpperCase();
  const cleanArea = data.area.trim();
  const cleanCategory = data.category.trim();
  const cleanPhone = data.phone.trim();
  const cleanHighlights = data.highlights.trim() || 'Prompt service, verified quality, affordable pricing in Chittoor';

  return `🌟 *${cleanTitle} - CHITTOOR* 🌟
📍 *Location:* ${cleanArea}, Chittoor

Looking for trusted ${cleanCategory} in Chittoor? We provide top-notch service with complete customer satisfaction!

✅ *Why Choose Us:*
• ${cleanHighlights}
• Best competitive prices in Chittoor district
• Fast doorstep & prompt assistance
• Trusted by local families across AP-03

📞 *Call / WhatsApp Today:* ${cleanPhone}
🌐 *Find us on ChittoorAds:* Local verified portal

_చిత్తూరు ప్రజల ఆదరణ పొందిన నమ్మకమైన సేవలు!_`;
}
