// Agricultural English to Tamil Dictionary & Auto-translator

const AGRI_TAMIL_DICT = {
  // Vegetables
  'tomato': 'தக்காளி',
  'tomatoes': 'தக்காளி',
  'country tomato': 'நாட்டு தக்காளி',
  'country tomatoes': 'நாட்டு தக்காளி',
  'potato': 'உருளைக்கிழங்கு',
  'potatoes': 'உருளைக்கிழங்கு',
  'onion': 'வெங்காயம்',
  'onions': 'வெங்காயம்',
  'shallot': 'சின்ன வெங்காயம்',
  'shallots': 'சின்ன வெங்காயம்',
  'sambar onion': 'சின்ன வெங்காயம்',
  'garlic': 'பூண்டு',
  'ginger': 'இஞ்சி',
  'chilli': 'மிளகாய்',
  'chillies': 'மிளகாய்',
  'green chilli': 'பச்சை மிளகாய்',
  'red chilli': 'வரமிளகாய்',
  'carrot': 'கேரட்',
  'carrots': 'கேரட்',
  'beetroot': 'பீட்ரூட்',
  'radish': 'முள்ளங்கி',
  'cabbage': 'முட்டைக்கோஸ்',
  'cauliflower': 'காலிஃபிளவர்',
  'brinjal': 'கத்தரிக்காய்',
  'eggplant': 'கத்தரிக்காய்',
  'okra': 'வெண்டைக்காய்',
  'lady finger': 'வெண்டைக்காய்',
  'ladyfinger': 'வெண்டைக்காய்',
  'drumstick': 'முருங்கைக்காய்',
  'moringa': 'முருங்கைக்காய்',
  'bitter gourd': 'பாகற்காய்',
  'bottle gourd': 'சுரைக்காய்',
  'ridge gourd': 'பீர்க்கங்காய்',
  'snake gourd': 'புடலங்காய்',
  'ash gourd': 'பூசணிக்காய்',
  'pumpkin': 'பரங்கிக்காய்',
  'cucumber': 'வெள்ளரிக்காய்',
  'beans': 'பீன்ஸ்',
  'peas': 'பட்டாணி',
  'green peas': 'பச்சை பட்டாணி',
  'broad beans': 'அவரைக்காய்',
  'cluster beans': 'கொத்தவரங்காய்',
  'spinach': 'கீரை',
  'mushroom': 'காளான்',
  'plantain': 'வாழைக்காய்',
  'raw banana': 'வாழைக்காய்',

  // Fruits
  'banana': 'வாழைப்பழம்',
  'bananas': 'வாழைப்பழம்',
  'mango': 'மாம்பழம்',
  'mangoes': 'மாம்பழம்',
  'malgova': 'மல்கோவா மாம்பழம்',
  'apple': 'ஆப்பிள்',
  'apples': 'ஆப்பிள்',
  'orange': 'ஆரஞ்சு',
  'lemon': 'எலுமிச்சை',
  'lime': 'எலுமிச்சை',
  'pomegranate': 'மாதுளை',
  'guava': 'கொய்யா',
  'papaya': 'பப்பாளி',
  'watermelon': 'தர்பூசணி',
  'muskmelon': 'முலாம்பழம்',
  'grapes': 'திராட்சை',
  'pineapple': 'அன்னாசி',
  'coconut': 'தேங்காய்',
  'jackfruit': 'பலாப்பழம்',
  'sapota': 'சப்போட்டா',
  'chikoo': 'சப்போட்டா',

  // Grains & Cereals
  'rice': 'அரிசி',
  'paddy': 'நெல்',
  'ponni rice': 'பொன்னி அரிசி',
  'basmati': 'பாசுமதி அரிசி',
  'raw rice': 'பச்சரிசி',
  'boiled rice': 'புழுங்கல் அரிசி',
  'wheat': 'கோதுமை',
  'ragi': 'கேழ்வரகு / ராகி',
  'finger millet': 'கேழ்வரகு',
  'pearl millet': 'கம்பு',
  'bajra': 'கம்பு',
  'foxtail millet': 'தினை',
  'little millet': 'சாமை',
  'kodo millet': 'வரகு',
  'barnyard millet': 'குதிரைவாலி',
  'corn': 'மக்காச்சோளம்',
  'maize': 'மக்காச்சோளம்',
  'sorghum': 'சோளம்',

  // Pulses & Legumes
  'toor dal': 'துவரம் பருப்பு',
  'red gram': 'துவரம் பருப்பு',
  'urad dal': 'உளுத்தம் பருப்பு',
  'black gram': 'உளுத்தம் பருப்பு',
  'moong dal': 'பாசிப்பருப்பு',
  'green gram': 'பச்சைப்பயறு',
  'chana dal': 'கடலைப் பருப்பு',
  'chickpea': 'கொண்டைக்கடலை',
  'chickpeas': 'கொண்டைக்கடலை',
  'groundnut': 'நிலக்கடலை',
  'peanut': 'நிலக்கடலை',
  'sesame': 'எள்ளு',
  'gingelly': 'எள்ளு',

  // Spices & Herbs
  'turmeric': 'மஞ்சள்',
  'organic turmeric': 'இயற்கை மஞ்சள்',
  'black pepper': 'கருப்பு மிளகு',
  'pepper': 'மிளகு',
  'cardamom': 'ஏலக்காய்',
  'clove': 'கிராம்பு',
  'cinnamon': 'இலவங்கப்பட்டை',
  'coriander': 'கொத்தமல்லி',
  'cilantro': 'கொத்தமல்லி',
  'mint': 'புதினா',
  'curry leaves': 'கறிவேப்பிலை',
  'mustard': 'கடுகு',
  'cumin': 'சீரகம்',
  'fenugreek': 'வெந்தயம்',
  'tamarind': 'புளி',
  'asafoetida': 'பெருங்காயம்',

  // Commercial / Other
  'sugarcane': 'கரும்பு',
  'cotton': 'பருத்தி',
  'tea': 'தேயிலை',
  'coffee': 'காபி',
  'honey': 'தேன்',
  'milk': 'பால்',
  'ghee': 'நெய்'
};

/**
 * Automatically translates or resolves the Tamil name for any agricultural product.
 * @param {string} text
 * @returns {Promise<string>} Tamil product name
 */
export async function translateToTamil(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();

  // 1. If text already contains Tamil characters, return as is
  if (/[\u0B80-\u0BFF]/.test(trimmed)) {
    return trimmed;
  }

  // Clean brackets and extra words like "Fresh", "Organic", "Pure", "Local"
  const cleanLower = trimmed
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .trim();

  // 2. Direct exact match in agricultural dictionary
  if (AGRI_TAMIL_DICT[cleanLower]) {
    return AGRI_TAMIL_DICT[cleanLower];
  }

  // 3. Substring match (e.g. "Fresh Country Tomatoes" -> matches "country tomatoes" or "tomato")
  // Sort keys by length descending to match longest phrases first
  const keys = Object.keys(AGRI_TAMIL_DICT).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (cleanLower.includes(k)) {
      return AGRI_TAMIL_DICT[k];
    }
  }

  // 4. Try online translation API as dynamic fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|ta`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && /[\u0B80-\u0BFF]/.test(translated)) {
        return translated.replace(/[()]/g, '').trim();
      }
    }
  } catch {
    // network timeout or abort, fall through
  }

  // 5. If everything fails, return the trimmed name
  return trimmed;
}

export default {
  translateToTamil,
  AGRI_TAMIL_DICT
};
