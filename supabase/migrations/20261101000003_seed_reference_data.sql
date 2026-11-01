-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- Migration 00003: Pure Reference Data (Cities & Categories Only)
-- Strictly Zero Fabricated Businesses, Zero Fabricated Reviews, Zero Mock Users.
-- Safe, Idempotent, and Production-Ready.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SEED CITIES REFERENCE DATA
-- -----------------------------------------------------------------------------
INSERT INTO public.cities (id, slug, name, state, brand_name, domain, code, status)
VALUES
    ('chittoor', 'chittoor', 'Chittoor', 'Andhra Pradesh', 'ChittoorAds', 'chittoorads.com', 'AP-03', 'active'),
    ('vellore', 'vellore', 'Vellore', 'Tamil Nadu', 'VelloreAds', 'velloreads.com', 'TN-23', 'active'),
    ('bengaluru', 'bengaluru', 'Bengaluru', 'Karnataka', 'BengaluruAds', 'bengaluruads.com', 'KA-01', 'active')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    brand_name = EXCLUDED.brand_name,
    domain = EXCLUDED.domain,
    code = EXCLUDED.code,
    status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 2. SEED BUSINESS CATEGORIES REFERENCE DATA
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, name_te, name_ta, name_kn, icon, description, sort_order)
VALUES
    ('restaurants', 'Restaurants & Tiffins', 'రెస్టారెంట్లు & టిఫిన్లు', 'உணவகங்கள் & சிற்றுண்டி', 'ಉಪಾಹಾರ ಗೃಹಗಳು & ತಿಂಡಿ', 'Utensils', 'Authentic Andhra meals, South Indian breakfast, biryani, and pure veg tiffins', 1),
    ('hotels-lodges', 'Hotels & Lodges', 'హోటళ్ళు & లాడ్జీలు', 'ஹோட்டல்கள் & தங்கும் விடுதிகள்', 'ಹೋಟೆಲ್‌ಗಳು & ವಸತಿಗೃಹಗಳು', 'Hotel', 'AC/Non-AC rooms, family suites, and temple transit stays', 2),
    ('hospitals', 'Hospitals & Clinics', 'ఆసుపత్రులు & క్లినిక్‌లు', 'மருத்துவமனைகள் & கிளினிக்குகள்', 'ಆಸ್ಪತ್ರೆಗಳು & ಚಿಕಿತ್ಸಾಲಯಗಳು', 'HeartPulse', '24/7 emergency care, multi-specialty hospitals, and pharmacies', 3),
    ('auto-services', 'Automobile & Mechanics', 'ఆటోమొబైల్ & మెకానిక్స్', 'ஆட்டோமொபைல் & மெக்கானிக்ஸ்', 'ಆಟೋಮೊಬೈಲ್ & ಮೆಕ್ಯಾನಿಕ್ಸ್', 'Wrench', 'Two-wheeler and four-wheeler service, puncture repair, and towing', 4),
    ('real-estate', 'Real Estate & Plots', 'రియల్ ఎస్టేట్ & ప్లాట్లు', 'ரியல் எஸ்டேட் & மனை', 'ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ನಿವೇಶನಗಳು', 'Home', 'Open residential plots, houses for rent, commercial shops, and farmland', 5),
    ('education', 'Schools & Coaching', 'పాఠశాలలు & కోచింగ్', 'பள்ளிகள் & பயிற்சி மையங்கள்', 'ಶಾಲೆಗಳು & ತರಬೇತಿ ಕೇಂದ್ರಗಳು', 'GraduationCap', 'CBSE/State schools, competitive coaching centers, and computer institutes', 6),
    ('shopping', 'Shopping & Textiles', 'షాపింగ్ & వస్త్రాలు', 'ஷாப்பிங் & ஜவுளி', 'ಶಾಪಿಂಗ್ & ಜವಳಿ', 'ShoppingBag', 'Silk sarees, ready-mades, gold jewelry, and grocery marts', 7),
    ('beauty-salons', 'Salons & Parlours', 'సెలూన్లు & బ్యూటీ పార్లర్లు', 'சலூன்கள் & அழகு நிலையங்கள்', 'ಸಲೂನ್‌ಗಳು & ಬ್ಯೂಟಿ ಪಾರ್ಲರ್‌ಗಳು', 'Scissors', 'Bridal makeup, herbal facial, haircuts, and grooming parlours', 8),
    ('electronics', 'Electronics & Mobiles', 'ఎలక్ట్రానిక్స్ & మొబైల్స్', 'எலக்ட்ரானிக்ஸ் & மொபைல்கள்', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ & ಮೊಬೈಲ್‌ಗಳು', 'Smartphone', 'Smartphones, TV repair, home appliances, and solar systems', 9),
    ('events', 'Function Halls & Catering', 'కళ్యాణ మండపాలు & క్యాటరింగ్', 'திருமண மண்டபங்கள் & கேட்டரிங்', 'ಕಲ್ಯಾಣ ಮಂಟಪಗಳು & ಕ್ಯಾಟರಿಂಗ್', 'PartyPopper', 'AC convention halls, wedding photography, and traditional catering', 10)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_te = EXCLUDED.name_te,
    name_ta = EXCLUDED.name_ta,
    name_kn = EXCLUDED.name_kn,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

