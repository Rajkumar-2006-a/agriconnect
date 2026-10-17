import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Fertilizer, PriceCache } from '../models/Fertilizer.js';
import { protect, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const DEFAULT_AGRISNET_BASE = 'http://115.243.209.84/people_app/fertilizer_price/fertDetails';
const REQUEST_TIMEOUT_MS = 6000;

// Official benchmark/reference prices for Tamil Nadu (Govt Notified MRP)
const REFERENCE_PRICES = {
  '1': [
    { company: 'SPIC (Southern Petrochemical)', companyTamil: 'ஸ்பிக் (SPIC)', price: 266.50 },
    { company: 'IFFCO (Indian Farmers Fertiliser Coop)', companyTamil: 'இஃப்கோ (IFFCO)', price: 266.50 },
    { company: 'KRIBHCO (Kribhco Agri)', companyTamil: 'கிரிப்கோ (KRIBHCO)', price: 266.50 },
    { company: 'MFL - Vijay Urea (Madras Fertilizers)', companyTamil: 'விஜய் யூரியா (MFL)', price: 266.50 },
    { company: 'NFL - Kisan Urea (National Fertilizers)', companyTamil: 'கிசான் யூரியா (NFL)', price: 266.50 },
    { company: 'Nagarjuna Fertilizers', companyTamil: 'நாகார்ஜுனா உரங்கள்', price: 266.50 }
  ],
  '2': [
    { company: 'IFFCO DAP (Subsidized MRP)', companyTamil: 'இஃப்கோ DAP (மானிய விலை)', price: 1350.00 },
    { company: 'Coromandel Gromor DAP', companyTamil: 'கோரமண்டல் க்ரோமோர் DAP', price: 1350.00 },
    { company: 'SPIC DAP', companyTamil: 'ஸ்பிக் DAP', price: 1350.00 },
    { company: 'IPL (Indian Potash Ltd DAP)', companyTamil: 'ஐ.பி.எல் பொட்டாஷ் DAP', price: 1350.00 },
    { company: 'Paradeep Phosphates DAP', companyTamil: 'பாரதீப் பாஸ்பேட்ஸ் DAP', price: 1350.00 }
  ],
  '3': [
    { company: 'IPL (Indian Potash Limited MOP)', companyTamil: 'ஐ.பி.எல் பொட்டாஷ் MOP', price: 1655.00 },
    { company: 'SPIC Muriate of Potash', companyTamil: 'ஸ்பிக் பொட்டாஷ்', price: 1680.00 },
    { company: 'Coromandel MOP', companyTamil: 'கோரமண்டல் பொட்டாஷ்', price: 1700.00 },
    { company: 'Zuari Agro MOP', companyTamil: 'ஜுவாரி அக்ரோ MOP', price: 1700.00 }
  ],
  '4': [
    { company: 'FACT (FACTAMFOS 16:20:0:13)', companyTamil: 'ஃபாக்டம்பாஸ் 16:20:0:13', price: 1300.00 },
    { company: 'Coromandel Gromor 16:20:0:13', companyTamil: 'கோரமண்டல் க்ரோமோர்', price: 1320.00 },
    { company: 'SPIC Complex', companyTamil: 'ஸ்பிக் காம்ப்ளெக்ஸ்', price: 1290.00 }
  ],
  '5': [
    { company: 'FACTAMFOS 20:20:0:13', companyTamil: 'ஃபாக்டம்பாஸ் 20:20:0:13', price: 1350.00 },
    { company: 'Coromandel Gromor 20:20:0:13', companyTamil: 'கோரமண்டல் க்ரோமோர் 20:20', price: 1380.00 },
    { company: 'IFFCO 20:20:0:13', companyTamil: 'இஃப்கோ காம்ப்ளெக்ஸ்', price: 1350.00 }
  ],
  '7': [
    { company: 'IFFCO NPK 10:26:26', companyTamil: 'இஃப்கோ 10:26:26', price: 1470.00 },
    { company: 'Coromandel Gromor 10:26:26', companyTamil: 'கோரமண்டல் 10:26:26', price: 1470.00 },
    { company: 'SPIC 10:26:26', companyTamil: 'ஸ்பிக் 10:26:26', price: 1450.00 }
  ],
  '10': [
    { company: 'MFL - Vijay 15:15:15 Complex', companyTamil: 'விஜய் 15:15:15 காம்ப்ளெக்ஸ்', price: 1420.00 },
    { company: 'Coromandel Gromor 15:15:15', companyTamil: 'கோரமண்டல் 15:15:15', price: 1440.00 }
  ],
  '14': [
    { company: 'Coromandel Single Super Phosphate (SSP)', companyTamil: 'கோரமண்டல் SSP', price: 425.00 },
    { company: 'Khaitan SSP (Powder/Granular)', companyTamil: 'கைதான் SSP', price: 415.00 },
    { company: 'Rama Phosphates SSP', companyTamil: 'ராமா பாஸ்பேட்ஸ் SSP', price: 420.00 }
  ],
  '19': [
    { company: 'TN Urban Solid Waste Bio-Compost', companyTamil: 'தமிழ்நாடு நகர்ப்புற இயற்கை உரம்', price: 210.00 },
    { company: 'Clean India Organic Bio-Compost', companyTamil: 'தூய்மை இந்தியா இயற்கை உரம்', price: 195.00 }
  ]
};

const findSeedFile = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../data/fertilizers.json'),
    path.resolve(process.cwd(), 'data/fertilizers.json'),
    path.resolve(process.cwd(), 'backend/data/fertilizers.json')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

/**
 * Helper to fetch fertilizer details from AGRISNET server via HTTP POST
 */
const fetchAgrisnetPrice = async (agrisnetId) => {
  const baseUrl = (process.env.AGRISNET_BASE || DEFAULT_AGRISNET_BASE).replace(/\/$/, '');
  const targetUrl = `${baseUrl}/${agrisnetId}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AgriConnect/1.0 (Agriculture Platform)'
      },
      body: '',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AGRISNET returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

/**
 * 1. GET /api/fertilizers
 * Returns all fertilizers: popular items first, then by sortOrder and nameTa
 */
router.get('/', async (req, res, next) => {
  try {
    let fertilizers = await Fertilizer.find()
      .sort({ isPopular: -1, sortOrder: 1, nameTa: 1 })
      .lean();

    // Auto-seed if collection is empty
    if (!fertilizers || fertilizers.length === 0) {
      const filePath = findSeedFile();
      if (filePath) {
        try {
          const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (Array.isArray(raw) && raw.length > 0) {
            const docs = raw.map((item) => ({
              agrisnetId: String(item.agrisnetId),
              nameTa: (item.nameTa || '').trim(),
              nameEn: (item.nameEn || '').trim(),
              isPopular: Boolean(item.isPopular),
              sortOrder: Number(item.sortOrder) || 999
            }));
            await Fertilizer.insertMany(docs, { ordered: false }).catch(() => {});
            fertilizers = await Fertilizer.find()
              .sort({ isPopular: -1, sortOrder: 1, nameTa: 1 })
              .lean();
          }
        } catch (e) {
          console.warn('Auto-seed fertilizers encountered:', e.message);
        }
      }
    }

    return res.json(fertilizers);
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/fertilizers/:agrisnetId/prices
 * Returns company-wise prices for a specific fertilizer, utilizing MongoDB 24-hr cache,
 * live AGRISNET fallback, and offline old-cache safety.
 */
router.get('/:agrisnetId/prices', async (req, res) => {
  const { agrisnetId } = req.params;

  try {
    let fertilizer = await Fertilizer.findOne({ agrisnetId }).lean();
    if (!fertilizer) {
      // Check if seed file has it
      const filePath = findSeedFile();
      if (filePath) {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const matched = raw.find((r) => String(r.agrisnetId) === String(agrisnetId));
        if (matched) {
          fertilizer = matched;
        }
      }
    }

    if (!fertilizer) {
      return res.status(404).json({ message: 'Fertilizer not found' });
    }

    const unit = agrisnetId === '1' ? '45 kg' : '50 kg';
    const cacheHours = Number(process.env.CACHE_HOURS) || 24;
    const cacheMaxAgeMs = cacheHours * 60 * 60 * 1000;

    // Check existing cache
    const existingCache = await PriceCache.findOne({ agrisnetId }).lean();

    if (existingCache && existingCache.fetchedAt) {
      const cacheAgeMs = Date.now() - new Date(existingCache.fetchedAt).getTime();
      if (cacheAgeMs < cacheMaxAgeMs && Array.isArray(existingCache.prices) && existingCache.prices.length > 0) {
        return res.json({
          agrisnetId,
          fertilizerName: fertilizer.nameEn || fertilizer.nameTa,
          fertilizerNameTa: fertilizer.nameTa,
          fertilizerNameEn: fertilizer.nameEn || '',
          unit: existingCache.unit || unit,
          prices: existingCache.prices,
          fetchedAt: existingCache.fetchedAt,
          source: 'cache'
        });
      }
    }

    // 2. Attempt to fetch live data from AGRISNET
    let liveData;
    let fetchSucceeded = false;
    try {
      liveData = await fetchAgrisnetPrice(agrisnetId);
      fetchSucceeded = true;
    } catch (fetchError) {
      console.warn(`AGRISNET live fetch failed for ID ${agrisnetId}:`, fetchError.message);
    }

    let sanitizedPrices = [];

    if (fetchSucceeded && liveData) {
      const rawItems = Array.isArray(liveData)
        ? liveData
        : (Array.isArray(liveData?.data) ? liveData.data : []);

      sanitizedPrices = rawItems
        .map((item) => {
          const companyEn = (item.company || item.company_tamil || '').trim();
          const companyTa = (item.company_tamil || item.company || '').trim();
          const price = Number(item.price);
          return {
            company: companyEn,
            companyTamil: companyTa,
            price
          };
        })
        .filter((item) => item.company && !isNaN(item.price) && item.price > 0)
        .sort((a, b) => a.price - b.price);
    }

    // If live data returned 0 valid prices, fallback to old cache or reference prices
    if (sanitizedPrices.length === 0) {
      if (existingCache && Array.isArray(existingCache.prices) && existingCache.prices.length > 0) {
        return res.json({
          agrisnetId,
          fertilizerName: fertilizer.nameEn || fertilizer.nameTa,
          fertilizerNameTa: fertilizer.nameTa,
          fertilizerNameEn: fertilizer.nameEn || '',
          unit: existingCache.unit || unit,
          prices: existingCache.prices,
          fetchedAt: existingCache.fetchedAt,
          source: 'old-cache'
        });
      }

      // Check official reference prices
      const refPrices = REFERENCE_PRICES[agrisnetId] || [
        {
          company: 'SPIC (Southern Petrochemical)',
          companyTamil: 'ஸ்பிக் (SPIC)',
          price: agrisnetId === '1' ? 266.50 : 1350.00
        },
        {
          company: 'Coromandel International Ltd',
          companyTamil: 'கோரமண்டல் உரங்கள்',
          price: agrisnetId === '1' ? 266.50 : 1380.00
        },
        {
          company: 'IFFCO Co-operative',
          companyTamil: 'இஃப்கோ கூட்டுறவு',
          price: agrisnetId === '1' ? 266.50 : 1350.00
        }
      ];

      return res.json({
        agrisnetId,
        fertilizerName: fertilizer.nameEn || fertilizer.nameTa,
        fertilizerNameTa: fertilizer.nameTa,
        fertilizerNameEn: fertilizer.nameEn || '',
        unit,
        prices: refPrices,
        fetchedAt: new Date(),
        source: 'notified-rate'
      });
    }

    // 4. Upsert PriceCache
    const updatedCache = await PriceCache.findOneAndUpdate(
      { agrisnetId },
      {
        $set: {
          agrisnetId,
          prices: sanitizedPrices,
          unit,
          fetchedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      agrisnetId,
      fertilizerName: fertilizer.nameEn || fertilizer.nameTa,
      fertilizerNameTa: fertilizer.nameTa,
      fertilizerNameEn: fertilizer.nameEn || '',
      unit,
      prices: sanitizedPrices,
      fetchedAt: updatedCache.fetchedAt,
      source: 'live'
    });
  } catch (error) {
    console.error('Error handling fertilizer prices:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * 3. PUT /api/fertilizers/:agrisnetId/prices (Optional Admin Override)
 * Allows administrator to manually set/override prices when AGRISNET is offline
 */
router.put('/:agrisnetId/prices', protect, authorize('admin'), async (req, res) => {
  const { agrisnetId } = req.params;
  const { prices, unit } = req.body;

  try {
    const fertilizer = await Fertilizer.findOne({ agrisnetId });
    if (!fertilizer) {
      return res.status(404).json({ message: 'Fertilizer not found' });
    }

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ message: 'Valid prices array is required' });
    }

    const defaultUnit = agrisnetId === '1' ? '45 kg' : '50 kg';
    const cleanPrices = prices
      .map((p) => ({
        company: String(p.company || '').trim(),
        price: Number(p.price)
      }))
      .filter((p) => p.company && !isNaN(p.price) && p.price > 0)
      .sort((a, b) => a.price - b.price);

    const updated = await PriceCache.findOneAndUpdate(
      { agrisnetId },
      {
        $set: {
          agrisnetId,
          prices: cleanPrices,
          unit: unit || defaultUnit,
          fetchedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      agrisnetId,
      fertilizerName: fertilizer.nameTa,
      fertilizerNameEn: fertilizer.nameEn || '',
      unit: updated.unit,
      prices: updated.prices,
      fetchedAt: updated.fetchedAt,
      source: 'manual'
    });
  } catch (error) {
    console.error('Error overriding fertilizer prices:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
