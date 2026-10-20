import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';

await connectDB();

const farmer = await User.findOne({ role: 'farmer' });
if (!farmer) {
  console.error('No farmer found in DB! Please make sure at least one farmer user exists.');
  process.exit(1);
}

// Reset any existing sold test product if present
await Product.updateMany({ productName: 'Tomato' }, { $set: { isSold: false, price: 40, quantity: 150, description: 'Fresh, juicy, pesticide-free country tomatoes directly harvested from our farm in Salem.' } });

const sampleProducts = [
  {
    productName: 'Fresh Country Tomatoes (நாட்டு தக்காளி)',
    description: 'Farm-fresh, naturally ripened country tomatoes harvested daily from Salem farms. Rich in flavor and vitamins.',
    category: 'Vegetables',
    price: 40,
    quantity: 180,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Organic Ponni Raw Rice (பொன்னி அரிசி)',
    description: 'Pesticide-free organic Ponni rice, traditional Cauvery delta harvest from Thanjavur. Aromatic and high-fiber.',
    category: 'Grains & Cereals',
    price: 68,
    quantity: 450,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Pollachi Tender Coconuts (இளநீர்)',
    description: 'Fresh and sweet Pollachi tender coconuts with refreshing, nutrient-rich coconut water and tender pulp.',
    category: 'Fruits',
    price: 45,
    quantity: 220,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Ooty Fresh Red Carrots (ஊட்டி கேரட்)',
    description: 'Crisp, naturally sweet hill carrots grown in the cool climate of Nilgiris. Washed and packed directly on farm.',
    category: 'Vegetables',
    price: 55,
    quantity: 130,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Erode Pure Organic Turmeric (ஈரோடு மஞ்சள்)',
    description: 'High-curcumin farm-processed pure organic turmeric fingers and powder from Erode. Traditional sunlight curing.',
    category: 'Spices',
    price: 160,
    quantity: 90,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Salem Malgova Mangoes (சேலம் மாம்பழம்)',
    description: 'Naturally carbide-free tree-ripened juicy Salem Malgova mangoes. Rich golden pulp with heavenly fragrance.',
    category: 'Fruits',
    price: 120,
    quantity: 95,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Small Shallots / Sambar Onion (சின்ன வெங்காயம்)',
    description: 'High-pungency Perambalur small onions (shallots), cleaned, cured and sun-dried for long kitchen shelf life.',
    category: 'Vegetables',
    price: 70,
    quantity: 300,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Kolli Hills Black Pepper (கருப்பு மிளகு)',
    description: 'Bold-grade mountain shade dried whole black pepper from Kolli Hills tribal farmers cooperative.',
    category: 'Spices',
    price: 480,
    quantity: 60,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  }
];

for (const p of sampleProducts) {
  const existing = await Product.findOne({ productName: p.productName });
  if (existing) {
    existing.isSold = false;
    existing.price = p.price;
    existing.quantity = p.quantity;
    existing.image = p.image;
    existing.description = p.description;
    await existing.save();
    console.log(`Updated product: ${p.productName}`);
  } else {
    await Product.create(p);
    console.log(`Created product: ${p.productName}`);
  }
}

console.log('Product seeding completed successfully!');
process.exit(0);
