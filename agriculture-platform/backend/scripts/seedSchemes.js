import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Scheme } from '../models/Scheme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const findSeedFile = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../data/schemes.json'),
    path.resolve(process.cwd(), 'data/schemes.json'),
    path.resolve(process.cwd(), 'backend/data/schemes.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

export const seedSchemes = async () => {
  const filePath = findSeedFile();
  if (!filePath) {
    console.error('Error: schemes.json seed file not found! Please ensure backend/data/schemes.json exists.');
    process.exit(1);
  }

  console.log(`Reading schemes from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const schemes = JSON.parse(rawData);

  if (!Array.isArray(schemes) || schemes.length === 0) {
    console.error('Error: schemes.json is empty or invalid.');
    process.exit(1);
  }

  await connectDB();

  console.log(`Found ${schemes.length} schemes to seed...`);

  let upsertedCount = 0;
  for (const item of schemes) {
    if (!item.schemeCode) continue;

    await Scheme.findOneAndUpdate(
      { schemeCode: item.schemeCode },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upsertedCount++;
  }

  console.log(`Successfully seeded/updated ${upsertedCount} schemes in database.`);
};

// If run directly from terminal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedSchemes()
    .then(() => {
      console.log('Schemes seed complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed schemes:', err);
      process.exit(1);
    });
}
