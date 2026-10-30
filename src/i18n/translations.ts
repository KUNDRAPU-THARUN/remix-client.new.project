export type SupportedLanguage = 'en' | 'te' | 'ta' | 'kn' | 'ur' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  regionNote: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    regionNote: 'Default Interface',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    regionNote: 'Primary Official Language',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    regionNote: 'Border Region (Vellore / Tiruttani)',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    regionNote: 'Western Border (Kuppam / Kolar)',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇮🇳',
    regionNote: 'Rayalaseema Regional Language',
    rtl: true,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    regionNote: 'National / Business Language',
  },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Top Bar
    chittoorDistrict: 'Chittoor District',
    borderAreasNote: 'AP-03 • Kanipakam, Murukambattu, Greamspet, Kattamanchi',
    emergencyHelplines: '24x7 Emergency Helplines',
    aiScout: 'AI Scout',
    selectLanguage: 'Language',
    
    // Tagline & Nav
    tagline: 'SEARCH LOCAL | GO DIGITAL',
    discoverTagline: 'Discover Chittoor in One Click',
    home: 'Home',
    categories: 'Categories',
    businesses: 'Businesses',
    classifieds: 'Classifieds',
    kanipakamTemple: 'Kanipakam Temple',
    myAds: 'My Ads',
    savedBookmarks: 'Saved Bookmarks',
    loginRegister: 'Login / Register',
    postAnAd: '+ Post an Ad',
    postFreeAd: 'Post Free Ad',

    // Hero Section
    topHeroBadge: "Chittoor's No.1 Local Search Platform",
    localInformationBadge: 'Chittoor Local Directory',
    heroHeadingMain: 'Find Everything in',
    heroHeadingHighlight: 'Chittoor',
    heroSubtitle: 'Search for businesses, services, jobs, property, education, healthcare and more – all in one place.',
    searchPlaceholder: 'What service or business are you looking for?',
    allAreas: '📍 All Areas (Chittoor)',
    allCategories: '🏷️ All Categories',
    searchButton: 'Search',
    popularSearches: 'Popular in Chittoor:',

    // Sections
    featuredCategoriesTitle: 'Featured Categories in Chittoor',
    featuredCategoriesSubtitle: 'Top local destinations with verified phone contacts & customer ratings',
    exploreCategoriesTitle: 'Explore Popular Categories',
    exploreCategoriesSubtitle: 'Browse verified local services, businesses, and classifieds in Chittoor',
    viewAllCategories: 'View All Categories →',
    featuredBusinessesTitle: 'Featured Businesses in Chittoor',
    featuredBusinessesSubtitle: "Chittoor's top-rated service providers, hospitals, restaurants, and local establishments",
    viewAll: 'View All',
    searchByCityTitle: 'Search by City / Area in Chittoor',
    searchByCitySubtitle: 'Discover verified businesses, services, and local ads across key municipal centers',
    viewAllAreas: 'View All Areas →',
    latestClassifiedsTitle: 'Latest Classified Ads',
    latestClassifiedsSubtitle: 'Used two-wheelers, house rentals, shops & electronics direct from owners',

    // Banner
    helpingEntrepreneurs: 'Helping Entrepreneurs Build & Grow',
    helpingSubtitle: 'Advertising | Branding | Company Registration | Design | Digital Marketing | E-Commerce | ISO Certification | Loans | Software | Trademark | Website Design & Development | Mobile App',
    advertiseYourBusiness: 'Advertise Your Business →',
    listForFree: 'List Your Business for Free',

    // Actions
    callNow: 'Call Now',
    whatsapp: 'WhatsApp',
    viewDetails: 'View Details',
    bookNow: 'Book Now →',
    exploreNow: 'Explore Now →',
    viewSchools: 'View Schools →',
    findHospitals: 'Find Hospitals →',

    // Category Results Page
    categoryDirectory: 'Category Directory',
    categoriesModules: 'Categories / Modules',
    filterResults: 'Filter Results',
    resetFilters: 'Reset',
    verifiedOnly: 'Verified Listings Only',
    minRating: 'Minimum Rating',
    allRatings: 'All Ratings',
    sortBy: 'Sort by:',
    topRated: 'Top Rated (Highest Stars)',
    mostReviewed: 'Most Reviewed',
    newlyListed: 'Newly Listed',
    noListingsFound: 'No listings found in this category',

    // Floating Chatbot
    chatTitle: 'ChittoorAds Q&A Support',
    chatSubtitle: 'Ask questions & search local FAQs',
    searchFaqs: 'Search FAQs...',
    poweredBy: 'POWERED BY RedbackAI',
  },

  te: {
    // Top Bar
    chittoorDistrict: 'చిత్తూరు జిల్లా',
    borderAreasNote: 'AP-03 • కాణిపాకం, మురుకంబట్టు, గ్రీమ్స్‌పేట, కట్టమంచి',
    emergencyHelplines: '24x7 అత్యవసర హెల్ప్‌లైన్లు',
    aiScout: 'AI స్కౌట్',
    selectLanguage: 'భాష',

    // Tagline & Nav
    tagline: 'స్థానికంగా వెతకండి | డిజిటల్ అవ్వండి',
    discoverTagline: 'ఒకే క్లిక్‌లో చిత్తూరు సమాచారం',
    home: 'హోమ్',
    categories: 'కేటగిరీలు',
    businesses: 'వ్యాపారాలు',
    classifieds: 'ప్రకటనలు',
    kanipakamTemple: 'కాణిపాకం ఆలయం',
    myAds: 'నా ప్రకటనలు',
    savedBookmarks: 'సేవ్ చేసినవి',
    loginRegister: 'లాగిన్ / రిజిస్టర్',
    postAnAd: '+ ప్రకటన ఇవ్వండి',
    postFreeAd: 'ఉచిత ప్రకటన ఇవ్వండి',

    // Hero Section
    topHeroBadge: "చిత్తూరు నెం.1 స్థానిక సెర్చ్ ప్లాట్‌ఫారమ్",
    localInformationBadge: 'చిత్తూరు స్థానిక డైరెక్టరీ',
    heroHeadingMain: 'అన్నీ ఒకే చోట కనుగొనండి -',
    heroHeadingHighlight: 'చిత్తూరు',
    heroSubtitle: 'వ్యాపారాలు, సేవలు, ఉద్యోగాలు, ఇళ్ళు, విద్య, వైద్యం మరియు మరిన్నింటిని ఒకే చోట సులభంగా వెతకండి.',
    searchPlaceholder: 'వ్యాపారాలు, సేవలు మరియు కేటగిరీల కోసం వెతకండి...',
    allAreas: '📍 అన్ని ప్రాంతాలు (చిత్తూరు)',
    allCategories: '🏷️ అన్ని విభాగాలు',
    searchButton: 'వెతకండి',
    popularSearches: 'చిత్తూరులో ప్రాచుర్యం పొందినవి:',

    // Sections
    featuredCategoriesTitle: 'చిత్తూరు ప్రముఖ విభాగాలు',
    featuredCategoriesSubtitle: 'ధృవీకరించబడిన ఫోన్ నంబర్లు & కస్టమర్ రేటింగులతో స్థానిక సేవలు',
    exploreCategoriesTitle: 'విభాగాల వారీగా అన్వేషించండి',
    exploreCategoriesSubtitle: 'చిత్తూరులోని ధృవీకరించబడిన స్థానిక దుకాణాలు, సేవలు మరియు ప్రకటనలు',
    viewAllCategories: 'అన్ని విభాగాలు చూడండి →',
    featuredBusinessesTitle: 'చిత్తూరు ప్రముఖ వ్యాపారాలు',
    featuredBusinessesSubtitle: 'చిత్తూరులోని ఉత్తమ రేటింగ్ పొందిన ఆసుపత్రులు, హోటళ్ళు మరియు సేవలు',
    viewAll: 'అన్నీ చూడండి',
    searchByCityTitle: 'పట్టణాలు & ప్రాంతాల వారీగా శోధించండి',
    searchByCitySubtitle: 'చిత్తూరు జిల్లాలోని ప్రధాన కేంద్రాల వారీగా సేవలను కనుగొనండి',
    viewAllAreas: 'అన్ని ప్రాంతాలు →',
    latestClassifiedsTitle: 'తాజా ఉచిత ప్రకటనలు',
    latestClassifiedsSubtitle: 'సెకండ్ హ్యాండ్ బైకులు, అద్దె ఇళ్ళు, దుకాణాలు & ఉత్పత్తులు నేరుగా యజమానుల నుండి',

    // Banner
    helpingEntrepreneurs: 'వ్యాపారాల అభివృద్ధికి మా డిజిటల్ చేయూత',
    helpingSubtitle: 'ప్రకటనలు | బ్రాండింగ్ | కంపెనీ రిజిస్ట్రేషన్ | డిజిటల్ మార్కెటింగ్ | లోన్లు | వెబ్‌సైట్ & మొబైల్ యాప్ డిజైన్',
    advertiseYourBusiness: 'మీ వ్యాపారాన్ని ప్రచారం చేసుకోండి →',
    listForFree: 'మీ వ్యాపారాన్ని ఉచితంగా నమోదు చేయండి',

    // Actions
    callNow: 'కాల్ చేయండి',
    whatsapp: 'వాట్సాప్',
    viewDetails: 'వివరాలు చూడండి',
    bookNow: 'బుక్ చేయండి →',
    exploreNow: 'అన్వేషించండి →',
    viewSchools: 'పాఠశాలలు చూడండి →',
    findHospitals: 'ఆసుపత్రులు వెతకండి →',

    // Category Results Page
    categoryDirectory: 'కేటగిరీ డైరెక్టరీ',
    categoriesModules: 'విభాగాలు / మాడ్యూల్స్',
    filterResults: 'ఫిల్టర్లు',
    resetFilters: 'రీసెట్',
    verifiedOnly: 'ధృవీకరించబడినవి మాత్రమే',
    minRating: 'కనీస రేటింగ్',
    allRatings: 'అన్ని రేటింగులు',
    sortBy: 'క్రమబద్ధీకరించండి:',
    topRated: 'టాప్ రేటెడ్ (అత్యధిక స్టార్స్)',
    mostReviewed: 'ఎక్కువ రివ్యూలు ఉన్నవి',
    newlyListed: 'తాజాగా చేర్చినవి',
    noListingsFound: 'ఈ విభాగంలో వివరాలు లభించలేదు',

    // Floating Chatbot
    chatTitle: 'చిత్తూరు యాడ్స్ సహాయ కేంద్రం',
    chatSubtitle: 'ప్రశ్నలు అడగండి & సమాధానాలు పొందండి',
    searchFaqs: 'తరచుగా అడిగే ప్రశ్నలను వెతకండి...',
    poweredBy: 'POWERED BY RedbackAI',
  },

  ta: {
    // Top Bar
    chittoorDistrict: 'சித்தூர் மாவட்டம்',
    borderAreasNote: 'AP-03 • காணிப்பாக்கம், முருகம்பட்டு, கிரீம்ஸ்பேட்டை, கட்டமஞ்சி',
    emergencyHelplines: '24x7 அவசர உதவி எண்கள்',
    aiScout: 'AI ஸ்கவுட்',
    selectLanguage: 'மொழி',

    // Tagline & Nav
    tagline: 'உள்ளூரில் தேடுங்கள் | டிஜிட்டல் ஆகுங்கள்',
    discoverTagline: 'ஒரே கிளிக்கில் சித்தூரை அறிந்திடுங்கள்',
    home: 'முகப்பு',
    categories: 'வகைகள்',
    businesses: 'வணிகங்கள்',
    classifieds: 'விளம்பரங்கள்',
    kanipakamTemple: 'காணிப்பாக்கம் கோவில்',
    myAds: 'எனது விளம்பரங்கள்',
    savedBookmarks: 'சேமிக்கப்பட்டவை',
    loginRegister: 'உள்நுழைக / பதிவு செய்க',
    postAnAd: '+ விளம்பரம் செய்க',
    postFreeAd: 'இலவச விளம்பரம் இடுக',

    // Hero Section
    topHeroBadge: "சித்தூரின் நம்பர் 1 உள்ளூர் தேடல் தளம்",
    localInformationBadge: 'சித்தூர் உள்ளூர் தகவல் தளம்',
    heroHeadingMain: 'அனைத்தையும் கண்டறியுங்கள் -',
    heroHeadingHighlight: 'சித்தூர்',
    heroSubtitle: 'வணிகங்கள், சேவைகள், வேலைகள், வீடுகள், கல்வி, மருத்துவம் அனைத்தையும் ஒரே இடத்தில் தேடுங்கள்.',
    searchPlaceholder: 'வணிகங்கள், சேவைகள் மற்றும் வகைகளைத் தேடுங்கள்...',
    allAreas: '📍 அனைத்து பகுதிகள் (சித்தூர்)',
    allCategories: '🏷️ அனைத்து வகைகள்',
    searchButton: 'தேடுங்கள்',
    popularSearches: 'சித்தூரில் பிரபலமானவை:',

    // Sections
    featuredCategoriesTitle: 'சித்தூரின் முக்கிய வகைகள்',
    featuredCategoriesSubtitle: 'சரிபார்க்கப்பட்ட தொலைபேசி எண்கள் & வாடிக்கையாளர் மதிப்பீடுகளுடன்',
    exploreCategoriesTitle: 'பிரபல வகைகளை ஆராயுங்கள்',
    exploreCategoriesSubtitle: 'சித்தூரின் உள்ளூர் கடைகள், சேவைகள் மற்றும் விளம்பரங்கள்',
    viewAllCategories: 'அனைத்து வகைகளையும் காண்க →',
    featuredBusinessesTitle: 'சித்தூரின் முன்னணி வணிகங்கள்',
    featuredBusinessesSubtitle: 'உயர்ந்த மதிப்பீடு பெற்ற மருத்துவமனைகள், உணவகங்கள் மற்றும் சேவைகள்',
    viewAll: 'அனைத்தும்',
    searchByCityTitle: 'நகரம் & பகுதி வாரியாக தேடுங்கள்',
    searchByCitySubtitle: 'சித்தூர் மாவட்டத்தின் முக்கிய பகுதிகளை ஆராயுங்கள்',
    viewAllAreas: 'அனைத்து பகுதிகள் →',
    latestClassifiedsTitle: 'சமீபத்திய இலவச விளம்பரங்கள்',
    latestClassifiedsSubtitle: 'இருசக்கர வாகனங்கள், வாடகை வீடுகள் மற்றும் கடைகள் நேரடியாக உரிமையாளர்களிடமிருந்து',

    // Banner
    helpingEntrepreneurs: 'தொழில்முனைவோரின் வளர்ச்சிக்கு டிஜிட்டல் ஆதரவு',
    helpingSubtitle: 'விளம்பரம் | பிராண்டிங் | நிறுவனப் பதிவு | டிஜிட்டல் மார்க்கெட்டிங் | கடன்கள் | இணையதளம் & மொபைல் ஆப்',
    advertiseYourBusiness: 'உங்கள் வணிகத்தை விளம்பரப்படுத்துங்கள் →',
    listForFree: 'உங்கள் வணிகத்தை இலவசமாக பட்டியலிடுங்கள்',

    // Actions
    callNow: 'அழைக்க',
    whatsapp: 'வாட்ஸ்அப்',
    viewDetails: 'விவரங்களை காண்க',
    bookNow: 'முன்பதிவு →',
    exploreNow: 'ஆராய்க →',
    viewSchools: 'பள்ளிகளை காண்க →',
    findHospitals: 'மருத்துவமனைகளை தேடுங்கள் →',

    // Category Results Page
    categoryDirectory: 'வகை அடைவு',
    categoriesModules: 'வகைகள் / தொகுதிகள்',
    filterResults: 'வடிகட்டிகள்',
    resetFilters: 'மீட்டமைக்க',
    verifiedOnly: 'சரிபார்க்கப்பட்டவை மட்டும்',
    minRating: 'குறைந்தபட்ச மதிப்பீடு',
    allRatings: 'அனைத்து மதிப்பீடுகள்',
    sortBy: 'வரிசைப்படுத்து:',
    topRated: 'உயர் மதிப்பீடு',
    mostReviewed: 'அதிக கருத்துகள்',
    newlyListed: 'புதியவை',
    noListingsFound: 'இந்த வகையில் விவரங்கள் இல்லை',

    // Floating Chatbot
    chatTitle: 'சித்தூர் விளம்பரங்கள் உதவி மையம்',
    chatSubtitle: 'கேள்விகள் கேட்டு உடனடி விடை பெறுங்கள்',
    searchFaqs: 'அடிக்கடி கேட்கப்படும் கேள்விகளைத் தேடுங்கள்...',
    poweredBy: 'POWERED BY RedbackAI',
  },

  kn: {
    // Top Bar
    chittoorDistrict: 'ಚಿತ್ತೂರು ಜಿಲ್ಲೆ',
    borderAreasNote: 'AP-03 • ಕಾಣಿಪಾಕಂ, ಮುರುಕಂಬಟ್ಟು, ಗ್ರೀಮ್ಸ್‌ಪೇಟ್, ಕಟ್ಟಮಂಚಿ',
    emergencyHelplines: '24x7 ತುರ್ತು ಸಹಾಯವಾಣಿ',
    aiScout: 'AI ಸ್ಕೌಟ್',
    selectLanguage: 'ಭಾಷೆ',

    // Tagline & Nav
    tagline: 'ಸ್ಥಳೀಯವಾಗಿ ಹುಡುಕಿ | ಡಿಜಿಟಲ್ ಆಗಿ',
    discoverTagline: 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಚಿತ್ತೂರನ್ನು ಅನ್ವೇಷಿಸಿ',
    home: 'ಮುಖಪುಟ',
    categories: 'ವರ್ಗಗಳು',
    businesses: 'ವ್ಯವಹಾರಗಳು',
    classifieds: 'ಜಾಹೀರಾತುಗಳು',
    kanipakamTemple: 'ಕಾಣಿಪಾಕಂ ದೇವಾಲಯ',
    myAds: 'ನನ್ನ ಜಾಹೀರಾತುಗಳು',
    savedBookmarks: 'ಉಳಿಸಿದವುಗಳು',
    loginRegister: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',
    postAnAd: '+ ಜಾಹೀರಾತು ನೀಡಿ',
    postFreeAd: 'ಉಚಿತ ಜಾಹೀರಾತು ನೀಡಿ',

    // Hero Section
    topHeroBadge: "ಚಿತ್ತೂರಿನ ನಂ.1 ಸ್ಥಳೀಯ ಹುಡುಕಾಟ ವೇದಿಕೆ",
    localInformationBadge: 'ಚಿತ್ತೂರು ಸ್ಥಳೀಯ ಮಾಹಿತಿ ಕೋಶ',
    heroHeadingMain: 'ಎಲ್ಲವನ್ನೂ ಹುಡುಕಿ -',
    heroHeadingHighlight: 'ಚಿತ್ತೂರು',
    heroSubtitle: 'ವ್ಯವಹಾರಗಳು, ಸೇವೆಗಳು, ಉದ್ಯೋಗಗಳು, ಆಸ್ತಿ, ಶಿಕ್ಷಣ, ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಎಲ್ಲವನ್ನೂ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಹುಡುಕಿ.',
    searchPlaceholder: 'ವ್ಯಾಪಾರಗಳು, ಸೇವೆಗಳು ಮತ್ತು ವರ್ಗಗಳನ್ನು ಹುಡುಕಿ...',
    allAreas: '📍 ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು (ಚಿತ್ತೂರು)',
    allCategories: '🏷️ ಎಲ್ಲಾ ವರ್ಗಗಳು',
    searchButton: 'ಹುಡುಕಿ',
    popularSearches: 'ಚಿತ್ತೂರಿನಲ್ಲಿ ಜನಪ್ರಿಯ:',

    // Sections
    featuredCategoriesTitle: 'ಚಿತ್ತೂರಿನ ಪ್ರಮುಖ ವರ್ಗಗಳು',
    featuredCategoriesSubtitle: 'ದೃಢೀಕೃತ ಫೋನ್ ಸಂಪರ್ಕಗಳು ಮತ್ತು ಗ್ರಾಹಕರ ರೇಟಿಂಗ್‌ಗಳೊಂದಿಗೆ',
    exploreCategoriesTitle: 'ಜನಪ್ರಿಯ ವರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    exploreCategoriesSubtitle: 'ಚಿತ್ತೂರಿನ ದೃಢೀಕೃತ ಸ್ಥಳೀಯ ಅಂಗಡಿಗಳು, ಸೇವೆಗಳು ಮತ್ತು ಜಾಹೀರಾತುಗಳು',
    viewAllCategories: 'ಎಲ್ಲಾ ವರ್ಗಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',
    featuredBusinessesTitle: 'ಚಿತ್ತೂರಿನ ಪ್ರಮುಖ ವ್ಯವಹಾರಗಳು',
    featuredBusinessesSubtitle: 'ಹೆಚ್ಚು ರೇಟಿಂಗ್ ಪಡೆದ ಆಸ್ಪತ್ರೆಗಳು, ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ಮತ್ತು ಸೇವೆಗಳು',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    searchByCityTitle: 'ನಗರ & ಪ್ರದೇಶವಾರು ಹುಡುಕಾಟ',
    searchByCitySubtitle: 'ಚಿತ್ತೂರು ಜಿಲ್ಲೆಯ ಪ್ರಮುಖ ಕೇಂದ್ರಗಳಲ್ಲಿ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    viewAllAreas: 'ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು →',
    latestClassifiedsTitle: 'ಇತ್ತೀಚಿನ ಉಚಿತ ಜಾಹೀರಾತುಗಳು',
    latestClassifiedsSubtitle: 'ದ್ವಿಚಕ್ರ ವಾಹನಗಳು, ಬಾಡಿಗೆ ಮನೆಗಳು ಮತ್ತು ಅಂಗಡಿಗಳು ನೇರವಾಗಿ ಮಾಲೀಕರಿಂದ',

    // Banner
    helpingEntrepreneurs: 'ಉದ್ಯಮಿಗಳ ಬೆಳವಣಿಗೆಗೆ ನಮ್ಮ ಡಿಜಿಟಲ್ ಬೆಂಬಲ',
    helpingSubtitle: 'ಜಾಹೀರಾತು | ಬ್ರ್ಯಾಂಡಿಂಗ್ | ಕಂಪನಿ ನೋಂದಣಿ | ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ | ಸಾಲಗಳು | ವೆಬ್‌ಸೈಟ್ & ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್',
    advertiseYourBusiness: 'ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಪ್ರಚಾರ ಮಾಡಿ →',
    listForFree: 'ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಉಚಿತವಾಗಿ ನೋಂದಾಯಿಸಿ',

    // Actions
    callNow: 'ಕರೆ ಮಾಡಿ',
    whatsapp: 'ವಾಟ್ಸಾಪ್',
    viewDetails: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    bookNow: 'ಬುಕ್ ಮಾಡಿ →',
    exploreNow: 'ಅನ್ವೇಷಿಸಿ →',
    viewSchools: 'ಶಾಲೆಗಳನ್ನು ನೋಡಿ →',
    findHospitals: 'ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ →',

    // Category Results Page
    categoryDirectory: 'ವರ್ಗ ಕೋಶ',
    categoriesModules: 'ವರ್ಗಗಳು / ಮಾಡ್ಯೂಲ್‌ಗಳು',
    filterResults: 'ಫಿಲ್ಟರ್‌ಗಳು',
    resetFilters: 'ಮರುಹೊಂದಿಸಿ',
    verifiedOnly: 'ದೃಢೀಕೃತ ಮಾತ್ರ',
    minRating: 'ಕನಿಷ್ಠ ರೇಟಿಂಗ್',
    allRatings: 'ಎಲ್ಲಾ ರೇಟಿಂಗ್‌ಗಳು',
    sortBy: 'ವಿಂಗಡಿಸಿ:',
    topRated: 'ಅತ್ಯುತ್ತಮ ರೇಟಿಂಗ್',
    mostReviewed: 'ಹೆಚ್ಚು ವಿಮರ್ಶೆಗಳು',
    newlyListed: 'ಹೊಸದಾಗಿ ಸೇರಿಸಲಾದವು',
    noListingsFound: 'ಈ ವರ್ಗದಲ್ಲಿ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ',

    // Floating Chatbot
    chatTitle: 'ಚಿತ್ತೂರು ಜಾಹೀರಾತುಗಳ ಸಹಾಯವಾಣಿ',
    chatSubtitle: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ',
    searchFaqs: 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಡುಕಿ...',
    poweredBy: 'POWERED BY RedbackAI',
  },

  ur: {
    // Top Bar
    chittoorDistrict: 'ضلع چتور',
    borderAreasNote: 'AP-03 • کانی پاکم، مروکمبٹو، گریمس پیٹ، کٹامانچی',
    emergencyHelplines: '24x7 ایمرجنسی ہیلپ لائنز',
    aiScout: 'AI اسکاؤٹ',
    selectLanguage: 'زبان',

    // Tagline & Nav
    tagline: 'مقامی طور پر تلاش کریں | ڈیجیٹل بنیں',
    discoverTagline: 'ایک کلک میں چتور دریافت کریں',
    home: 'ہوم',
    categories: 'زمرہ جات',
    businesses: 'کاروبار',
    classifieds: 'اشتہارات',
    kanipakamTemple: 'کانی پاکم مندر',
    myAds: 'میرے اشتہارات',
    savedBookmarks: 'محفوظ شدہ',
    loginRegister: 'لاگ ان / رجسٹر',
    postAnAd: '+ اشتہار پوسٹ کریں',
    postFreeAd: 'مفت اشتہار پوسٹ کریں',

    // Hero Section
    topHeroBadge: "چتور کا نمبر 1 مقامی سرچ پلیٹ فارم",
    localInformationBadge: 'چتور لوکل ڈائریکٹری',
    heroHeadingMain: 'سب کچھ تلاش کریں -',
    heroHeadingHighlight: 'چتور',
    heroSubtitle: 'کاروبار، خدمات، نوکریاں، جائیداد، تعلیم، اور صحت کی دیکھ بھال ایک ہی جگہ پر تلاش کریں۔',
    searchPlaceholder: 'کاروبار، خدمات اور زمرہ جات تلاش کریں...',
    allAreas: '📍 تمام علاقے (چتور)',
    allCategories: '🏷️ تمام زمرہ جات',
    searchButton: 'تلاش کریں',
    popularSearches: 'چتور میں مقبول:',

    // Sections
    featuredCategoriesTitle: 'چتور کے نمایاں زمرہ جات',
    featuredCategoriesSubtitle: 'تصدیق شدہ فون رابطوں اور کسٹمر ریٹنگز کے ساتھ',
    exploreCategoriesTitle: 'مقبول زمرہ جات دریافت کریں',
    exploreCategoriesSubtitle: 'چتور کے تصدیق شدہ مقامی کاروبار، خدمات اور اشتہارات',
    viewAllCategories: 'تمام زمرہ جات دیکھیں →',
    featuredBusinessesTitle: 'چتور کے نمایاں کاروبار',
    featuredBusinessesSubtitle: 'اعلیٰ ریٹنگ والے ہسپتال، ریستوراں اور خدمات',
    viewAll: 'سب دیکھیں',
    searchByCityTitle: 'شہر اور علاقے کے لحاظ سے تلاش کریں',
    searchByCitySubtitle: 'ضلع چتور کے اہم مراکز میں خدمات دریافت کریں',
    viewAllAreas: 'تمام علاقے →',
    latestClassifiedsTitle: 'تازہ ترین مفت اشتہارات',
    latestClassifiedsSubtitle: 'سیکنڈ ہینڈ بائیکس، کرایہ کے مکانات اور دکانیں براہ راست مالکان سے',

    // Banner
    helpingEntrepreneurs: 'کاروباریوں کی ترقی کے لیے ہماری ڈیجیٹل مدد',
    helpingSubtitle: 'اشتہارات | برانڈنگ | کمپنی رجسٹریشن | ڈیجیٹل مارکیٹنگ | قرضے | ویب سائٹ اور موبائل ایپ',
    advertiseYourBusiness: 'اپنے کاروبار کی تشہیر کریں →',
    listForFree: 'اپنا کاروبار مفت درج کریں',

    // Actions
    callNow: 'کال کریں',
    whatsapp: 'واٹس ایپ',
    viewDetails: 'تفصیلات دیکھیں',
    bookNow: 'بک کریں →',
    exploreNow: 'دریافت کریں →',
    viewSchools: 'اسکول دیکھیں →',
    findHospitals: 'ہسپتال تلاش کریں →',

    // Category Results Page
    categoryDirectory: 'زمرہ ڈائریکٹری',
    categoriesModules: 'زمرہ جات / ماڈیولز',
    filterResults: 'فلٹرز',
    resetFilters: 'دوبارہ ترتیب دیں',
    verifiedOnly: 'صرف تصدیق شدہ',
    minRating: 'کم از کم ریٹنگ',
    allRatings: 'تمام ریٹنگز',
    sortBy: 'ترتیب دیں:',
    topRated: 'سب سے زیادہ ریٹنگ',
    mostReviewed: 'سب سے زیادہ جائزے',
    newlyListed: 'نئے شامل کردہ',
    noListingsFound: 'اس زمرے میں کوئی معلومات نہیں ملیں',

    // Floating Chatbot
    chatTitle: 'چتور ایڈز سپورٹ سینٹر',
    chatSubtitle: 'سوالات پوچھیں اور فوری جوابات حاصل کریں',
    searchFaqs: 'اکثر پوچھے جانے والے سوالات تلاش کریں...',
    poweredBy: 'POWERED BY RedbackAI',
  },

  hi: {
    // Top Bar
    chittoorDistrict: 'चित्तूर जिला',
    borderAreasNote: 'AP-03 • काणिपाकम्, मुरुकाम्बट्टु, ग्रीम्सपेट, कट्टामंची',
    emergencyHelplines: '24x7 आपातकालीन हेल्पलाइन',
    aiScout: 'AI स्काउट',
    selectLanguage: 'भाषा',

    // Tagline & Nav
    tagline: 'स्थानीय खोजें | डिजिटल बनें',
    discoverTagline: 'एक क्लिक में चित्तूर खोजें',
    home: 'होम',
    categories: 'श्रेणियां',
    businesses: 'व्यवसाय',
    classifieds: 'क्लासिफाइड विज्ञापन',
    kanipakamTemple: 'काणिपाकम् मंदिर',
    myAds: 'मेरे विज्ञापन',
    savedBookmarks: 'सहेजे गए',
    loginRegister: 'लॉगिन / पंजीकरण',
    postAnAd: '+ विज्ञापन पोस्ट करें',
    postFreeAd: 'मुफ्त विज्ञापन पोस्ट करें',

    // Hero Section
    topHeroBadge: "चित्तूर का नंबर 1 स्थानीय सर्च प्लेटफॉर्म",
    localInformationBadge: 'चित्तूर स्थानीय डायरेक्टरी',
    heroHeadingMain: 'सब कुछ खोजें -',
    heroHeadingHighlight: 'चित्तूर',
    heroSubtitle: 'व्यवसाय, सेवाएं, नौकरियां, संपत्ति, शिक्षा, और स्वास्थ्य देखभाल सभी एक ही स्थान पर खोजें।',
    searchPlaceholder: 'व्यापार, सेवाओं और श्रेणियों की खोज करें...',
    allAreas: '📍 सभी क्षेत्र (चित्तूर)',
    allCategories: '🏷️ सभी श्रेणियां',
    searchButton: 'खोजें',
    popularSearches: 'चित्तूर में लोकप्रिय:',

    // Sections
    featuredCategoriesTitle: 'चित्तूर की प्रमुख श्रेणियां',
    featuredCategoriesSubtitle: 'सत्यापित फोन नंबर और ग्राहक रेटिंग के साथ स्थानीय सेवाएं',
    exploreCategoriesTitle: 'लोकप्रिय श्रेणियां देखें',
    exploreCategoriesSubtitle: 'चित्तूर के सत्यापित स्थानीय स्टोर, सेवाएं और विज्ञापन',
    viewAllCategories: 'सभी श्रेणियां देखें →',
    featuredBusinessesTitle: 'चित्तूर के प्रमुख व्यवसाय',
    featuredBusinessesSubtitle: 'शीर्ष रेटेड अस्पताल, रेस्तरां और आवश्यक स्थानीय सेवाएं',
    viewAll: 'सभी देखें',
    searchByCityTitle: 'शहर व क्षेत्र अनुसार खोजें',
    searchByCitySubtitle: 'चित्तूर जिले के प्रमुख केंद्रों में सेवाएं खोजें',
    viewAllAreas: 'सभी क्षेत्र →',
    latestClassifiedsTitle: 'नवीनतम मुफ्त विज्ञापन',
    latestClassifiedsSubtitle: 'उपयोग किए गए दोपहिया वाहन, किराए के मकान व दुकानें सीधे मालिकों से',

    // Banner
    helpingEntrepreneurs: 'व्यवसायों के विकास में हमारा डिजिटल सहयोग',
    helpingSubtitle: 'विज्ञापन | ब्रांडिंग | कंपनी पंजीकरण | डिजिटल मार्केटिंग | ऋण | वेबसाइट और मोबाइल ऐप निर्माण',
    advertiseYourBusiness: 'अपने व्यवसाय का प्रचार करें →',
    listForFree: 'अपना व्यवसाय निःशुल्क सूचीबद्ध करें',

    // Actions
    callNow: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',
    viewDetails: 'विवरण देखें',
    bookNow: 'बुक करें →',
    exploreNow: 'अन्वेषण करें →',
    viewSchools: 'स्कूल देखें →',
    findHospitals: 'अस्पताल खोजें →',

    // Category Results Page
    categoryDirectory: 'श्रेणी डायरेक्टरी',
    categoriesModules: 'श्रेणियां / मॉड्यूल',
    filterResults: 'फ़िल्टर',
    resetFilters: 'रीसेट',
    verifiedOnly: 'केवल सत्यापित',
    minRating: 'न्यूनतम रेटिंग',
    allRatings: 'सभी रेटिंग',
    sortBy: 'क्रमबद्ध करें:',
    topRated: 'शीर्ष रेटेड',
    mostReviewed: 'सर्वाधिक समीक्षाएं',
    newlyListed: 'नए जोड़े गए',
    noListingsFound: 'इस श्रेणी में कोई परिणाम नहीं मिला',

    // Floating Chatbot
    chatTitle: 'चित्तूर ऐड्स सहायता केंद्र',
    chatSubtitle: 'प्रश्न पूछें और त्वरित उत्तर पाएं',
    searchFaqs: 'अक्सर पूछे जाने वाले प्रश्न खोजें...',
    poweredBy: 'POWERED BY RedbackAI',
  },
};
