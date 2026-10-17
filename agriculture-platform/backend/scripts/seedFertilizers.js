import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Fertilizer } from '../models/Fertilizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const findSeedFile = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../data/fertilizers.json'),
    path.resolve(process.cwd(), 'data/fertilizers.json'),
    path.resolve(process.cwd(), 'backend/data/fertilizers.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

export const seedFertilizers = async () => {
  const filePath = findSeedFile();
  if (!filePath) {
    console.error('Error: fertilizers.json seed file not found! Please ensure backend/data/fertilizers.json exists.');
    process.exit(1);
  }

  console.log(`Reading fertilizers from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const fertilizers = JSON.parse(rawData);

  if (!Array.isArray(fertilizers) || fertilizers.length === 0) {
    console.error('Error: fertilizers.json is empty or invalid.');
    process.exit(1);
  }

  await connectDB();

  // Deduplicate entries by agrisnetId
  const seenIds = new Set();
  const uniqueFertilizers = [];

  for (const item of fertilizers) {
    const id = String(item.agrisnetId || '').trim();
    if (!id || seenIds.has(id)) {
      continue;
    }
    seenIds.add(id);

    // Ensure known popular items have nameEn and isPopular flag
    let nameEn = item.nameEn || '';
    let isPopular = Boolean(item.isPopular);
    let sortOrder = item.sortOrder || 999;

    if (id === '1') {
      nameEn = nameEn || 'Urea';
      isPopular = true;
      sortOrder = 1;
    } else if (id === '2') {
      nameEn = nameEn || 'DAP';
      isPopular = true;
      sortOrder = 2;
    } else if (id === '3') {
      nameEn = nameEn || 'Potash (MOP)';
      isPopular = true;
      sortOrder = 3;
    }

    uniqueFertilizers.push({
      agrisnetId: id,
      nameTa: item.nameTa.trim(),
      nameEn: nameEn.trim(),
      isPopular,
      sortOrder
    });
  }

  console.log(`Found ${uniqueFertilizers.length} unique fertilizer entries to upsert...`);

  let upsertCount = 0;
  for (const fert of uniqueFertilizers) {
    await Fertilizer.findOneAndUpdate(
      { agrisnetId: fert.agrisnetId },
      { $set: fert },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upsertCount++;
  }

  console.log(`Successfully upserted ${upsertCount} fertilizers into MongoDB.`);
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedFertilizers.js')) {
  seedFertilizers()
    .then(() => {
      console.log('Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
