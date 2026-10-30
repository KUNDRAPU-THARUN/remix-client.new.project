import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client if API key is present in environment
const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
               (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || 
               '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Could not initialize GoogleGenAI client:', e);
  }
}

export async function askChittoorScout(query: string, language: 'en' | 'te' = 'en'): Promise<string> {
  const prompt = `You are "Chittoor Smart Scout", the premier local AI guide for Chittoor District (Andhra Pradesh, India), covering Chittoor town, Kanipakam, Murukambattu, Bangarupalem, and surrounding areas.
A local citizen or visitor asks: "${query}"

Provide a warm, highly helpful, accurate response with local references (mentioning popular areas like Gandhi Road, Church Street, Kattamanchi, Murukambattu, Kanipakam temple road, etc.).
Keep the answer concise (2-3 paragraphs max), actionable, with phone/service guidance if applicable.
Response language: ${language === 'te' ? 'Telugu (తెలుగు)' : 'English (with common Telugu local terminology where helpful)'}.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local smart directory engine:', err);
    }
  }

  // Smart local heuristic fallback
  const q = query.toLowerCase();
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
  const prompt = `You are a digital marketing specialist creating a compelling local business advertisement for WhatsApp and ChittoorAds classifieds.
Business Name: ${data.title}
Category: ${data.category}
Location in Chittoor: ${data.area}
Key Highlights / Offers: ${data.highlights}
Contact Number: ${data.phone}

Create an attractive, high-converting ad copy formatted for WhatsApp and classified listings.
Include:
- Catchy headline with emojis
- 3-4 bullet points highlighting trust, quality & fast response in Chittoor
- Clear Call to Action with the phone number
- Short Telugu tag line at the bottom for local connection (e.g., "చిత్తూరు ప్రజల విశ్వసనీయ ఎంపిక!").`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('Gemini ad copy failed, using template:', e);
    }
  }

  return `🌟 *${data.title.toUpperCase()} - CHITTOOR* 🌟
📍 *Location:* ${data.area}, Chittoor

Looking for trusted ${data.category} in Chittoor? We provide top-notch service with complete customer satisfaction!

✅ *Why Choose Us:*
• ${data.highlights || 'Verified quality & experienced local professionals'}
• Best competitive prices in Chittoor district
• Fast doorstep & prompt assistance
• Trusted by hundreds of happy local families

📞 *Call / WhatsApp Today:* ${data.phone}
🌐 *Find us on ChittoorAds:* Local verified portal

_చిత్తూరు ప్రజల ఆదరణ పొందిన నమ్మకమైన సేవలు!_`;
}
