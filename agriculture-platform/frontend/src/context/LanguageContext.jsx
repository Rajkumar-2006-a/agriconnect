import React, { createContext, useContext, useEffect, useState } from 'react';

// Comprehensive Agricultural & Platform English to Tamil dictionary
export const DICTIONARY = {
  // Navigation & Header
  'freshMarketplace': 'புதிய வேளாண் சந்தை',
  'myPurchases': 'என் வாங்குதல்கள்',
  'cart': 'கூடை',
  'machineryDashboard': 'இயந்திரங்கள் கட்டுப்பாட்டு அறை',
  'adminPanel': 'நிர்வாகக் குழு',
  'farmerDashboard': 'விவசாயி கட்டுப்பாட்டு அறை',
  'marketplace': 'சந்தை',
  'login': 'உள்நுழைக',
  'signIn': 'உள்நுழைக',
  'register': 'தொடங்குங்கள்',
  'getStarted': 'பதிவு செய்க',
  'logout': 'வெளியேறு',
  'language': 'மொழி',
  'english': 'English',
  'tamil': 'தமிழ்',

  // Roles
  'buyer': 'வாங்குபவர் (Buyer)',
  'farmer': 'விவசாயி (Farmer)',
  'rentalOwner': 'இயந்திர உரிமையாளர் (Rental Owner)',
  'admin': 'நிர்வாகி (Admin)',

  // Farmer Dashboard Tabs
  'tab_products': 'என் விளைபொருட்கள்',
  'tab_orders': 'ஆர்டர் கோரிக்கைகள்',
  'tab_equipment': 'இயந்திரங்கள் & வாடகை',
  'tab_doctors': 'வேளாண் மருத்துவர்கள்',
  'tab_collaboration': 'விவசாயிகள் சமூகம்',
  'tab_schemes': 'அரசு நலத்திட்டங்கள்',
  'tab_fertilizers': 'உரங்கள் விலை நிலவரம்',
  'tab_profile': 'விவசாயி சுயவிவரம்',

  // Actions
  'buyNow': 'இப்போதே வாங்கு',
  'addToCart': 'கூடையில் சேர்',
  'viewDetails': 'விவரங்களைக் காண்க',
  'accept': 'ஏற்றுக்கொள்',
  'reject': 'நிராகரி',
  'placeOrder': 'ஆர்டர் செய்க',
  'confirm': 'உறுதி செய்',
  'cancel': 'ரத்து செய்',
  'save': 'சேமி',
  'delete': 'நீக்கு',
  'edit': 'திருத்து',
  'search': 'தேடுக...',
  'filter': 'வடிகட்டு',
  'all': 'அனைத்தும்',
  'contact': 'தொடர்புகொள்ள',
  'call': 'அழைக்க',
  'select': 'தேர்ந்தெடு',
  'close': 'மூடு',
  'clear': 'அழி',

  // Marketplace & Inventory
  'available': 'கையிருப்பில் உள்ளது',
  'outOfStock': 'கையிருப்பு இல்லை',
  'soldOut': 'விற்றுத் தீர்ந்தது',
  'unitsAvailable': 'அலகுகள் கையிருப்பு',
  'min50kg': 'குறைந்தபட்சம் 50 கிலோ',
  'minOrderQty': 'குறைந்தபட்ச ஆர்டர் அளவு 50 கிலோ',
  'minListingQty': 'குறைந்தபட்ச பட்டியல் அளவு 50 கிலோ',
  'perKg': 'கிலோவுக்கு',
  'quantity': 'அளவு',
  'price': 'விலை',
  'total': 'மொத்தம்',
  'category': 'பிரிவு',
  'description': 'விளக்கம்',
  'seller': 'விற்பனையாளர்',
  'location': 'இடம்',
  'phone': 'தொலைபேசி',

  // Categories
  'Vegetables': 'காய்கறிகள்',
  'Fruits': 'பழங்கள்',
  'Grains': 'தானியங்கள்',
  'Pulses': 'பருப்பு வகைகள்',
  'Spices': 'நறுமணப் பொருட்கள்',
  'Dairy': 'பால் பொருட்கள்',
  'Others': 'மற்றவை',

  // Common Vegetables & Crops
  'tomato': 'தக்காளி',
  'country tomato': 'நாட்டு தக்காளி',
  'potato': 'உருளைக்கிழங்கு',
  'onion': 'வெங்காயம்',
  'shallot': 'சின்ன வெங்காயம்',
  'garlic': 'பூண்டு',
  'ginger': 'இஞ்சி',
  'chilli': 'மிளகாய்',
  'green chilli': 'பச்சை மிளகாய்',
  'carrot': 'கேரட்',
  'brinjal': 'கத்தரிக்காய்',
  'okra': 'வெண்டைக்காய்',
  'drumstick': 'முருங்கைக்காய்',
  'cucumber': 'வெள்ளரிக்காய்',
  'cabbage': 'முட்டைக்கோஸ்',
  'banana': 'வாழைப்பழம்',
  'mango': 'மாம்பழம்',
  'apple': 'ஆப்பிள்',
  'rice': 'அரிசி',
  'paddy': 'நெல்',
  'wheat': 'கோதுமை',
  'ragi': 'கேழ்வரகு / ராகி',
  'corn': 'மக்காச்சோளம்',
  'turmeric': 'மஞ்சள்',
  'coconut': 'தேங்காய்',
  'sugarcane': 'கரும்பு',

  // Equipment
  'tractor': 'டிராக்டர் (Tractor)',
  'harvester': 'அறுவடை இயந்திரம் (Harvester)',
  'powerTiller': 'பவர் டில்லர் (Power Tiller)',
  'rotavator': 'ரோட்டவேட்டர் (Rotavator)',
  'drone': 'விவசாய ட்ரோன் (Agri Drone)',
  'waterPump': 'தண்ணீர் பம்ப் (Water Pump)',

  // Order Statuses
  'pending': 'நிலுவையில் உள்ளது',
  'confirmed': 'உறுதி செய்யப்பட்டது',
  'cancelled': 'ரத்து செய்யப்பட்டது',
  'completed': 'நிறைவடைந்தது',

  // Footer & Notices
  'tagline': 'தமிழ்நாடு முழுவதும் விவசாயிகள் மற்றும் வாங்குபவர்களை நேரடி நியாய விலை வர்த்தகத்தில் இணைக்கும் தளம்.',
  'rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  'mailSentToBuyer': 'வாங்குபவருக்கு உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்பட்டது'
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export function applyGoogleTranslateCookie(lang) {
  try {
    const host = window.location.hostname;
    const cookieVal = `/en/${lang}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; domain=${host}; path=/;`;
    if (host.includes('.')) {
      const parts = host.split('.');
      if (parts.length > 1) {
        document.cookie = `googtrans=${cookieVal}; domain=.${parts.slice(-2).join('.')}; path=/;`;
      }
    }

    // Direct interaction with Google Translate element combo if injected
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    }
  } catch (err) {
    console.error('Google Translate Switch Error:', err);
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agri_lang') || 'en';
  });

  const isTa = language === 'ta';

  useEffect(() => {
    // Sync Google translate cookie on mount
    applyGoogleTranslateCookie(language);
  }, [language]);

  const toggleLanguage = (targetLang) => {
    const newLang = targetLang || (language === 'en' ? 'ta' : 'en');
    setLanguageState(newLang);
    localStorage.setItem('agri_lang', newLang);
    localStorage.setItem('marketplace_lang', newLang);
    localStorage.setItem('agribot_lang', newLang);

    // Apply Google Translate
    applyGoogleTranslateCookie(newLang);

    // If Google Translate combo is not ready yet, reload so the cookie translates immediately
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  };

  /**
   * Translates key or returns fallback.
   * If language is 'ta', looks up key in DICTIONARY.
   */
  const t = (key, fallback) => {
    if (isTa) {
      if (DICTIONARY[key]) return DICTIONARY[key];
      const lower = String(key || '').toLowerCase().trim();
      if (DICTIONARY[lower]) return DICTIONARY[lower];
    }
    return fallback !== undefined ? fallback : key;
  };

  /**
   * Agricultural crop name resolver
   */
  const translateProduct = (prodName, prodNameTa) => {
    if (isTa) {
      if (prodNameTa) return prodNameTa;
      const lower = String(prodName || '').toLowerCase().trim();
      if (DICTIONARY[lower]) return DICTIONARY[lower];
    }
    return prodName;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isTa,
        toggleLanguage,
        setLanguage: toggleLanguage,
        t,
        translateProduct,
        dictionary: DICTIONARY
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;
