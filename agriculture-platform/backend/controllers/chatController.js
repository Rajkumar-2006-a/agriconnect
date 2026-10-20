import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_PROMPT = `
You are "AgriBot", the intelligent, friendly, and expert agricultural AI assistant embedded within AgriConnect (Integrated Digital Agriculture Platform for Tamil Nadu).
Your mission is to empower farmers, agricultural produce buyers, and equipment rental owners with practical advice, website guidance, and technical farming know-how.

Key Platform Knowledge:
1. Marketplace & Selling:
   - Farmers list agricultural produce (cereals, fruits, vegetables, pulses, commercial crops) with images, quantity, pricing, and phone numbers. Zero middlemen.
   - Buyers search products, add items to Cart, place direct orders, and track purchase status under 'My Purchases'.
2. Equipment Rental:
   - Rental owners list tractors, tillers, harvesters, sprayers, and rotavators with hourly/daily rates.
   - Farmers filter by district (all 38 Tamil Nadu districts) and book machinery with acres and dates.
3. Community & Collaboration:
   - Farmers share photos, ask crop advice, and interact with peers.
4. Agri Doctors Directory:
   - Regional directory of verified Tamil Nadu agricultural scientists with 1-click Call and WhatsApp links.
5. Fertilizer Price Tracker:
   - Live Agrisnet government maximum retail prices for fertilizers (Urea ₹266.50, DAP ₹1,350, Potash, Complex) across Tamil Nadu.
6. Government Schemes & Subsidies:
   - PMKSY Micro-Irrigation: 100% subsidy for small/marginal farmers, 75% for others on drip/sprinkler.
   - PM-KISAN: ₹6,000/year direct bank transfer.
   - SMAM Machinery Subsidy: 40% to 50% subsidy on tractors and power tillers.
   - PMFBY: Crop insurance at 1.5% to 2% premium.
   - PM-KUSUM: Up to 70% subsidy for solar pumps (3 to 7.5 HP).
   - CM Uzhavar Pathukappu Thittam: Accident relief, educational aid, pensions.
   - Free farm electricity (TANGEDCO).
   - Kisan Credit Card (KCC): 4% subsidized crop loan.
`.trim();

/**
 * Robust Intelligent Response Engine in English and Tamil
 */
const getLocalSmartResponse = (query, isTa) => {
  const raw = (query || '').toLowerCase().trim();

  // 1. Greetings / வணக்கம்
  if (
    /^(hi|hello|hey|vanakkam|vanakam|namaste|good\s+morning|good\s+evening)\b/i.test(raw) ||
    raw.includes('வணக்கம்') ||
    raw.includes('வாழ்க') ||
    raw === 'hi' ||
    raw === 'hello'
  ) {
    if (isTa) {
      return `🌾 **வணக்கம்! நான் உங்கள் AgriBot — வேளாண் AI உதவியாளர்.**\n\nநான் உங்களுக்கு பின்வரும் தகவல்களில் உதவ முடியும்:\n\n1. 🏛️ **அரசு மானியங்கள்:** 100% சொட்டு நீர் பாசனம், PM-KISAN, டிராக்டர் மானியம்\n2. 🚜 **இயந்திர வாடகை:** டிராக்டர், பவர் டில்லர் வாடகைக்கு எடுத்தல்\n3. 🌾 **விளைபொருள் வர்த்தகம்:** பயிர்களை நேரடியாக சந்தையில் விற்றல் மற்றும் வாங்குதல்\n4. 🌱 **உர விலைகள்:** யூரியா, DAP நேரடி Agrisnet விலை நிலவரம்\n5. 👨‍⚕️ **வேளாண் மருத்துவர்:** பயிர் நோய் & பூச்சி தாக்குதல் ஆலோசனைகள்\n\nஉங்களுக்கு என்ன தகவல் தேவை என்பதை கீழே தட்டச்சு செய்யவும் அல்லது விரைவு வினாக்களில் கிளிக் செய்யவும்!`;
    }
    return `🌾 **Hello! I am AgriBot — your AgriConnect AI farming assistant.**\n\nI can help you with:\n\n1. 🏛️ **Government Subsidies:** 100% Drip Irrigation, PM-KISAN, SMAM Tractor Subsidies\n2. 🚜 **Equipment Rental:** Finding & booking Tractors, Tillers & Harvesters across TN\n3. 🌾 **Produce Marketplace:** Listing crops and direct farm-to-table buying with zero middlemen\n4. 🌱 **Fertilizer Price Tracker:** Official Agrisnet retail prices for Urea, DAP, Potash\n5. 👨‍⚕️ **Agri Doctors:** Instant consultation for crop diseases and pest control\n\nFeel free to type your question below or click any suggested prompt!`;
  }

  // 2. Fertilizer Prices / உரங்கள் & விலை நிலவரம் (Check before equipment to avoid "current" matching "rent")
  if (
    raw.includes('fertilizer') ||
    raw.includes('urea') ||
    raw.includes('dap') ||
    raw.includes('potash') ||
    raw.includes('mop') ||
    raw.includes('complex') ||
    raw.includes('உரம்') ||
    raw.includes('உரங்கள்') ||
    raw.includes('யூரியா') ||
    raw.includes('டி.ஏ.பி') ||
    raw.includes('பொட்டாஷ்')
  ) {
    if (isTa) {
      return `🌱 **தமிழ்நாடு அரசு Agrisnet நேரடி உர விலைகள்:**\n\nஅக்ரிகனெக்ட் தளம் உழவர் நலத்துறையின் அதிகாரப்பூர்வ உரக் கட்டுப்பாட்டு விலைகளை வழங்குகிறது:\n\n- **யூரியா (Urea 45 கிலோ மூட்டை):** அரசு மானிய விலை **₹266.50**\n- **டி.ஏ.பி (DAP 50 கிலோ மூட்டை):** மானிய விலை **₹1,350.00**\n- **பொட்டாஷ் (MOP 50 கிலோ மூட்டை):** **₹1,650.00 – ₹1,700.00**\n- **காம்ப்ளக்ஸ் 20:20:0:13 (50 கிலோ):** **₹1,200.00 – ₹1,300.00**\n- **வேப்பம் புண்ணாக்கு / இயற்கை உரம்:** கிலோ **₹25 – ₹40**\n\n👉 மேலும் அனைத்து நிறுவன (SPIC, IFFCO, KRIBHCO, MFL) உரங்களின் நேரடி விலைகளை காண மேல் மெனுவில் **'Fertilizer Prices'** பக்கத்திற்குச் செல்லவும்!`;
    }
    return `🌱 **Tamil Nadu Agrisnet Official Fertilizer Retail Prices:**\n\nAgriConnect tracks subsidized ceiling prices set by the Department of Agriculture:\n\n- **Neem Coated Urea (45 kg bag):** Subsidized price **₹266.50**\n- **DAP (50 kg bag):** Subsidized MRP **₹1,350.00**\n- **MOP / Potash (50 kg bag):** **₹1,650.00 – ₹1,700.00**\n- **NPK Complex 20:20:0:13 (50 kg):** **₹1,200.00 – ₹1,300.00**\n- **Bio-Compost / Organic Fertilizer:** **₹20 – ₹35 / kg**\n\n👉 Click **'Fertilizer Prices'** in the navigation bar to inspect company-wise breakdowns (SPIC, IFFCO, MFL, KRIBHCO) in English & Tamil!`;
  }

  // 3. Government Schemes & Subsidies / அரசு மானியங்கள் & நலத்திட்டங்கள்
  if (
    raw.includes('scheme') ||
    raw.includes('subsidy') ||
    raw.includes('subsidies') ||
    raw.includes('pm kisan') ||
    raw.includes('pmksy') ||
    raw.includes('drip') ||
    raw.includes('sprinkler') ||
    raw.includes('insurance') ||
    raw.includes('pmfby') ||
    raw.includes('kusum') ||
    raw.includes('solar pump') ||
    raw.includes('மானியம்') ||
    raw.includes('திட்டம்') ||
    raw.includes('சொட்டு நீர்') ||
    raw.includes('காப்பீடு') ||
    raw.includes('இலவச மின்சாரம்') ||
    raw.includes('சோலார்')
  ) {
    if (isTa) {
      return `🏛️ **விவசாயிகளுக்கான முக்கிய அரசு மானியங்கள் & நலத்திட்டங்கள்:**\n\n1. **100% சொட்டு நீர் பாசன மானியம் (PMKSY):** சிறு மற்றும் குறு விவசாயிகளுக்கு (5 ஏக்கருக்குள்) **100% முழு இலவச மானியம்**; இதர விவசாயிகளுக்கு **75% மானியம்**.\n2. **PM-KISAN திட்டம்:** ஆண்டுக்கு **₹6,000** நேரடி வங்கிப் பரிமாற்றம் (4 மாதங்களுக்கு ஒருமுறை ₹2,000 வீதம் 3 தவணைகள்).\n3. **வேளாண் இயந்திரங்கள் மானியம் (SMAM):** டிராக்டர், பவர் டில்லர், ரோட்டவேட்டர் வாங்க **40% முதல் 50% வரை மானியம்**.\n4. **பயிர் காப்பீடு (PMFBY):** இயற்கை பேரிடர் மற்றும் வறட்சியினால் ஏற்படும் இழப்பிற்கு மிகக் குறைந்த பிரீமியத்தில் (1.5% - 2%) முழு இழப்பீடு.\n5. **சோலார் பம்புசெட் மானியம் (PM-KUSUM):** 3 HP முதல் 7.5 HP வரையிலான சூரிய ஒளி பம்புசெட்டுகளுக்கு **70% வரை மானியம்**.\n6. **முதலமைச்சர் உழவர் பாதுகாப்பு திட்டம்:** விபத்து நிவாரணம், கல்வி உதவித்தொகை மற்றும் முதியோர் ஓய்வூதியம்.\n\n👉 தேவையான ஆவணங்கள் மற்றும் விண்ணப்பிக்கும் முறையை அறிய **'Govt Schemes'** பக்கத்தை பார்க்கவும்!`;
    }
    return `🏛️ **Major Government Agricultural Schemes & Subsidies:**\n\n1. **Micro-Irrigation (PMKSY):** **100% Full Subsidy** for Small & Marginal farmers (< 5 acres) and **75% Subsidy** for other farmers for Drip and Sprinkler irrigation.\n2. **PM-KISAN:** **₹6,000 annually** directly deposited into farmer bank accounts in 3 installments of ₹2,000.\n3. **Farm Mechanization Subsidy (SMAM):** **40% to 50% capital subsidy** on purchasing Tractors, Power Tillers, and Rotavators through authorized dealers.\n4. **Pradhan Mantri Fasal Bima Yojana (PMFBY):** Comprehensive crop insurance covering drought, flood, and pests at nominal 1.5%–2% premium.\n5. **PM-KUSUM Solar Pumps:** Up to **70% subsidy** (30% Central + 40% Tamil Nadu State) for 3 HP, 5 HP, and 7.5 HP standalone solar pump sets.\n6. **TANGEDCO Free Farm Electricity:** Continuous free power supply for registered agricultural service connections.\n\n👉 Head over to the **'Govt Schemes'** page on AgriConnect to view full eligibility criteria and required documents!`;
  }

  // 4. Equipment & Machinery Rental / டிராக்டர் & இயந்திர வாடகை (Use word boundaries for rent)
  if (
    raw.includes('tractor') ||
    raw.includes('machinery') ||
    raw.includes('equipment') ||
    raw.includes('harvester') ||
    raw.includes('tiller') ||
    raw.includes('rotavator') ||
    /\b(rent|rental|renting|hire)\b/i.test(raw) ||
    raw.includes('டிராக்டர்') ||
    raw.includes('இயந்திரம்') ||
    raw.includes('வாடகை') ||
    raw.includes('உழவு') ||
    raw.includes('அறுவடை')
  ) {
    if (isTa) {
      return `🚜 **வேளாண் இயந்திரங்களை வாடகைக்கு எடுப்பது எப்படி?**\n\n1. உங்கள் டாஷ்போர்டில் **'Rent Equipment'** அல்லது மேல் மெனுவில் **'Equipment'** பகுதிக்குச் செல்லவும்.\n2. உங்கள் மாவட்டத்தை (எ.கா: கோயம்புத்தூர், தஞ்சாவூர், மதுரை, சேலம்) தேர்வு செய்து, அருகிலுள்ள டிராக்டர்கள் மற்றும் பவர் டில்லர்களை கண்டறியவும்.\n3. மணிநேர வாடகை மற்றும் இயந்திர விவரங்களை பார்த்து **'View & Book'** கிளிக் செய்யவும்.\n4. உங்கள் நிலப்பரப்பு (Acres) மற்றும் வாடகை தேதியை உள்ளிட்டால், உரிமையாளருக்கு உடனடியாக தகவல் சென்று முன்பதிவு உறுதி செய்யப்படும்!`;
    }
    return `🚜 **How to Rent Farm Machinery on AgriConnect:**\n\n1. Navigate to **'Equipment'** in the navigation bar or click **'Rent Equipment'** from your dashboard.\n2. Filter machinery by your district in Tamil Nadu (e.g. Coimbatore, Thanjavur, Madurai, Salem).\n3. Compare hourly rental rates for Tractors, Harvesters, Power Tillers, and Rotavators.\n4. Click **'View & Book'**, enter your farm acreage and preferred dates, and submit. The rental owner will contact you directly to confirm schedule!`;
  }

  // 5. Selling Crops / Marketplace / விளைபொருள் விற்பனை
  if (
    raw.includes('sell') ||
    raw.includes('selling') ||
    raw.includes('listing') ||
    raw.includes('produce') ||
    raw.includes('harvest') ||
    raw.includes('விற்பனை') ||
    raw.includes('விற்க') ||
    raw.includes('விளைபொருள்') ||
    raw.includes('சந்தை') ||
    raw.includes('பயிர் விற்பனை')
  ) {
    if (isTa) {
      return `🌾 **விளைபொருட்களை இடைத்தரகர் இன்றி நேரடியாக விற்பனை செய்ய:**\n\n1. விவசாயி டாஷ்போர்டில் **'My Products'** பகுதிக்குச் செல்லவும்.\n2. **'Add New Product'** பொத்தானை கிளிக் செய்யவும்.\n3. பயிர் பெயர் (எ.கா: நாட்டு தக்காளி, பொன்னி அரிசி), வகை, உங்கள் நியாயமான விலை (₹/கிலோ), மொத்த இருப்பு மற்றும் புகைப்படத்தை பதிவேற்றவும்.\n4. சேமித்தவுடன் உங்கள் விளைபொருள் வாங்குபவர்கள் சந்தையில் (Marketplace) உடனடியாக தோன்றும்.\n5. வாங்குபவர்கள் ஆர்டர் செய்ததும் உங்கள் **'Orders'** பகுதியில் சரிபார்த்து உறுதி செய்யலாம்!`;
    }
    return `🌾 **How to List & Sell Farm Produce with Zero Commission:**\n\n1. Open your **Farmer Dashboard** and select **'My Products'**.\n2. Click the **'Add New Product'** button.\n3. Enter the crop name, category (Vegetables, Fruits, Grains, Spices), price per kg/unit, available quantity, and upload a photo.\n4. Once published, your listing goes live immediately on the **Fresh Marketplace** for verified buyers.\n5. When buyers purchase, you receive direct notifications under your **'Orders'** tab to accept and dispatch!`;
  }

  // 6. Buying Crops / Marketplace / விளைபொருள் வாங்குதல்
  if (
    raw.includes('buy') ||
    raw.includes('purchase') ||
    raw.includes('order') ||
    raw.includes('cart') ||
    raw.includes('வாங்குவது') ||
    raw.includes('ஆர்டர்') ||
    raw.includes('கார்ட்') ||
    raw.includes('வாங்குதல்')
  ) {
    if (isTa) {
      return `🛒 **புதிய விளைபொருட்களை வாங்குவது எப்படி?**\n\n1. மேல் மெனுவில் உள்ள **'Fresh Marketplace'** பகுதிக்குச் செல்லவும்.\n2. காய்கறிகள், பழங்கள், பாரம்பரிய அரிசி, மசாலா பொருட்கள் போன்ற வகைகளை வடிகட்டவும்.\n3. விவசாயியின் பெயர், இருப்பிடம் மற்றும் விலையை சரிபார்த்து **'Add to Cart'** அல்லது **'Buy Now'** கிளிக் செய்யவும்.\n4. உங்கள் **'Cart'** பக்கத்தில் அளவுகளை சரிபார்த்து ஆர்டரை உறுதி செய்யவும்.\n5. உங்கள் ஆர்டரின் நிலையை **'My Purchases'** பக்கத்தில் நிகழ்நேரத்தில் கண்காணிக்கலாம்!`;
    }
    return `🛒 **How to Buy Farm-Fresh Produce on AgriConnect:**\n\n1. Go to the **'Fresh Marketplace'** in the navigation bar.\n2. Filter by category (Vegetables, Fruits, Grains & Cereals, Spices) or search for specific crops.\n3. Check farmer verification details, farm location, and price per kg/unit.\n4. Click **'Add to Cart'** or use **'Buy Now'** for instant direct ordering.\n5. Review your cart and confirm order. Track approval and fulfillment under **'My Purchases'**!`;
  }

  // 7. Crop Diseases, Pests & Agri Doctors / பயிர் நோய்கள் & மருத்துவர் உதவி
  if (
    raw.includes('doctor') ||
    raw.includes('disease') ||
    raw.includes('pest') ||
    raw.includes('fungus') ||
    raw.includes('virus') ||
    raw.includes('leaf curl') ||
    raw.includes('blight') ||
    raw.includes('insect') ||
    raw.includes('spray') ||
    raw.includes('மருத்துவர்') ||
    raw.includes('நோய்') ||
    raw.includes('பூச்சி') ||
    raw.includes('மருந்து') ||
    raw.includes('இலை சுருட்டை') ||
    raw.includes('வாடல்') ||
    raw.includes('புழு') ||
    raw.includes('கட்டுப்பாடு')
  ) {
    if (isTa) {
      return `👨‍⚕️ **பயிர் நோய் & பூச்சி மேலாண்மை வழிகாட்டல்:**\n\n- **தக்காளி இலை சுருட்டை நோய்:** வெள்ளை ஈக்களால் பரவுகிறது. வேப்பெண்ணெய் கரைசல் 3% (லிட்டருக்கு 30ml) அல்லது மஞ்சள் நிற ஒட்டும் பொறிகளை ஏக்கருக்கு 12 பயன்படுத்தவும்.\n- **வேர் அழுகல் / வாடல் நோய்:** டிரைக்கோடெர்மா விரிடி (Trichoderma viride) உயிரி பூஞ்சாணக்கொல்லியை 1 கிலோ / 100 கிலோ மக்கிய எருவுடன் கலந்து மண்ணில் இடவும்.\n- **சாம்பல் நோய் / இலைப்புள்ளி:** சூடோமோனாஸ் (Pseudomonas fluorescens) லிட்டருக்கு 10 கிராம் தெளிக்கவும்.\n\n📞 **நேரடி வேளாண் மருத்துவர் ஆலோசனைக்கு:**\nடாஷ்போர்டில் **'Agri Doctors'** பகுதிக்குச் சென்று உங்கள் மாவட்ட வேளாண்மை விஞ்ஞானிகளை **Call** அல்லது **WhatsApp** மூலம் தொடர்பு கொண்டு இலவச ஆலோசனை பெறலாம்!`;
    }
    return `👨‍⚕️ **Crop Disease, Pest Management & Doctor Consultation:**\n\n- **Tomato Leaf Curl:** Transmitted by whiteflies. Spray Neem oil formulation (3%) or install 12 yellow sticky traps per acre to intercept vector insects.\n- **Root Rot / Fusarium Wilt:** Apply Trichoderma viride bio-fungicide (2.5 kg/ha mixed with farmyard manure) around root zones.\n- **Blight / Leaf Spot:** Foliar spray of Pseudomonas fluorescens at 10 g/litre of water or appropriate copper oxychloride.\n\n📞 **Consult a Certified Agri Doctor:**\nGo to the **'Agri Doctors'** section in your dashboard to find agronomists in your district and get direct guidance via phone or WhatsApp!`;
  }

  // 8. Sowing Seasons, Seeds & Organic Farming / சாகுபடி பட்டங்கள் & இயற்கை விவசாயம்
  if (
    raw.includes('season') ||
    raw.includes('sowing') ||
    raw.includes('seed') ||
    raw.includes('organic') ||
    raw.includes('compost') ||
    raw.includes('paddy') ||
    raw.includes('விதை') ||
    raw.includes('பட்டம்') ||
    raw.includes('சாகுபடி') ||
    raw.includes('குறுவை') ||
    raw.includes('சம்பா') ||
    raw.includes('இயற்கை உரம்') ||
    raw.includes('பஞ்சகாவ்யா')
  ) {
    if (isTa) {
      return `🌾 **தமிழ்நாடு நெல் & பயிர் சாகுபடி பட்டங்கள்:**\n\n1. **குறுவை பட்டம் (ஜூன் - ஜூலை):** குறுகிய கால நெல் ரகங்கள் (ADT 36, ASD 16, TPS 5).\n2. **சம்பா / தாளடி பட்டம் (ஆகஸ்ட் - அக்டோபர்):** நடுத்தர & நீண்ட கால ரகங்கள் (CR 1009, CO 43, BPT 5204 - ஆந்திரா பொன்னி).\n3. **நவரை பட்டம் (டிசம்பர் - ஜனவரி):** குறுகிய கால நெல் மற்றும் பயறு வகைகள்.\n\n🌱 **விதை நேர்த்தி:** 1 கிலோ விதைக்கு 10 கிராம் சூடோமோனாஸ் அல்லது அசோஸ்பைரில்லம் கலந்து நிழலில் உலர்த்தி விதைக்கவும். இது முளைப்பு திறனை அதிகரித்து ஆரம்பகால வேர் நோய்களை தடுக்கும்.`;
    }
    return `🌾 **Tamil Nadu Sowing Seasons & Best Cultivation Practices:**\n\n1. **Kuruvai Season (June – July):** Short-duration paddy varieties (ADT 36, ASD 16, TPS 5) with high tillering.\n2. **Samba / Thaladi Season (August – October):** Medium to long duration varieties (CR 1009, CO 43, BPT 5204 Ponni).\n3. **Navarai Season (December – January):** Short duration crops and pulses.\n\n🌱 **Seed Inoculation:** Treat seeds with Azospirillum and Phosphobacteria (200 g / 10 kg seeds) to boost root development and save up to 25% chemical nitrogen requirements!`;
  }

  // 9. Crop Loans & Credit / விவசாய கடன்கள் & கிசான் கிரெடிட் கார்டு
  if (
    raw.includes('loan') ||
    raw.includes('credit') ||
    raw.includes('kcc') ||
    raw.includes('bank') ||
    raw.includes('finance') ||
    raw.includes('கடன்') ||
    raw.includes('வங்கி') ||
    raw.includes('கிசான் கிரெடிட்')
  ) {
    if (isTa) {
      return `💳 **விவசாய கடன் & கிசான் கிரெடிட் கார்டு (KCC):**\n\n- **குறைந்த வட்டி பயிர் கடன்:** KCC அட்டை மூலம் ₹3 லட்சம் வரை **4% குறைந்த வட்டியில்** வங்கிகள் மூலம் பயிர் கடன் பெறலாம் (சரியான நேரத்தில் திரும்பச் செலுத்தினால் 3% வட்டி தள்ளுபடி உண்டு).\n- **தேவையான ஆவணங்கள்:** நில ஆவணங்கள் (பட்டா, சிட்டா, அடங்கல்), ஆதார் அட்டை, பான் கார்டு மற்றும் வங்கிக் கணக்கு புத்தகம்.\n- அருகிலுள்ள தொடக்க வேளாண்மை கூட்டுறவு சங்கம் (PACCS) அல்லது தேசியமயமாக்கப்பட்ட வங்கிகளில் விண்ணப்பிக்கலாம்.`;
    }
    return `💳 **Agricultural Loans & Kisan Credit Card (KCC):**\n\n- **Low Interest Crop Loans:** Avail up to ₹3,00,000 credit at an effective subsidized interest rate of **4%** under KCC (with 3% prompt repayment incentive).\n- **Required Documents:** Land records (Patta, Chitta, Adangal), Aadhaar, PAN card, and active bank passbook.\n- Apply directly at your nearest Primary Agricultural Cooperative Credit Society (PACCS) or nationalized commercial bank.`;
  }

  // 10. General / Comprehensive Fallback
  if (isTa) {
    return `🌾 **வணக்கம்! நான் உங்கள் AgriBot — வேளாண் AI உதவியாளர்.**\n\nஉங்கள் கேள்விக்கு உதவ நான் தயார். பின்வரும் தலைப்புகளில் எதைப்பற்றி அறிய விரும்புகிறீர்கள்?\n\n- 🏛️ **அரசு மானியங்கள்:** 100% சொட்டு நீர் பாசனம், PM-KISAN, டிராக்டர் மானியம்\n- 🚜 **இயந்திர வாடகை:** டிராக்டர், பவர் டில்லர் வாடகை முன்பதிவு\n- 🌾 **சந்தை விற்பனை:** விளைபொருட்களை இடைத்தரகர் இன்றி விற்றல்\n- 🌱 **உர விலை:** யூரியா, DAP நேரடி Agrisnet விலைகள்\n- 👨‍⚕️ **வேளாண் மருத்துவர்:** பயிர் நோய் & பூச்சி மேலாண்மை ஆலோசனைகள்\n\nதயவுசெய்து உங்கள் கேள்வியை இன்னும் தெளிவாக தட்டச்சு செய்யவும்!`;
  }

  return `🌾 **Hello! I am AgriBot — your AgriConnect AI farming assistant.**\n\nI am ready to help you with:\n- 🏛️ **Government Subsidies:** 100% Drip Irrigation, PM-KISAN, Tractor SMAM Subsidies\n- 🚜 **Equipment Rental:** Finding Tractors, Tillers & Harvesters across Tamil Nadu\n- 🌾 **Produce Marketplace:** Selling your harvest directly or buying fresh crops\n- 🌱 **Fertilizer Prices:** Official Agrisnet rates for Urea, DAP, Potash\n- 👨‍⚕️ **Agri Doctors:** Instant consultation for crop diseases and pest control\n\nWhat would you like to know more about?`;
};

/**
 * Call Google Gemini API with explicit language instruction
 */
const callGeminiAPI = async (message, history = [], apiKey, isTa = false) => {
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  const languagePrompt = isTa
    ? 'CRITICAL MANDATORY INSTRUCTION: You MUST respond entirely and fluently in TAMIL (தமிழ்) language using proper Tamil Unicode script. Under no circumstances should you respond in English.'
    : 'Respond in clear, professional English.';

  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${languagePrompt}`;

  const contents = [];

  // Include up to 6 past conversation turns
  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      if (!h.text) continue;
      contents.push({
        role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.text) }]
      });
    }
  }

  // Current message with language reinforcement if Tamil
  const userText = isTa
    ? `${message}\n\n(தயவுசெய்து தமிழில் விரிவாக பதிலளிக்கவும் / Please reply strictly in Tamil)`
    : message;

  contents.push({
    role: 'user',
    parts: [{ text: userText }]
  });

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: fullSystemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 900
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim()) {
          return candidateText.trim();
        }
      } else {
        const errBody = await response.text();
        console.warn(`Gemini model ${model} HTTP ${response.status}:`, errBody);
      }
    } catch (err) {
      console.warn(`Gemini API call failed for ${model}:`, err.message);
    }
  }

  throw new Error('All Gemini model calls failed or timed out');
};

/**
 * Controller: Handle chat request
 * POST /api/chat
 */
export const handleChat = async (req, res) => {
  const { message, history = [], language = 'en' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // Determine if Tamil is requested (by parameter OR Tamil Unicode characters in message)
  const isTa =
    language === 'ta' ||
    String(language).toLowerCase().startsWith('ta') ||
    /[\u0B80-\u0BFF]/.test(message);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const reply = await callGeminiAPI(message, history, apiKey, isTa);
      return res.json({
        reply,
        source: 'gemini',
        language: isTa ? 'ta' : 'en'
      });
    } catch (err) {
      console.warn('Gemini request failed, providing local smart answer:', err.message);
    }
  }

  // Fallback to domain-specific knowledge base
  const localReply = getLocalSmartResponse(message, isTa);
  return res.json({
    reply: localReply,
    source: 'local_knowledge_base',
    language: isTa ? 'ta' : 'en'
  });
};
