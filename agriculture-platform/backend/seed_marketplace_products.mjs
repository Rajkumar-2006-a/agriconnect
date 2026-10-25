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

// Remove tender coconut completely
await Product.deleteMany({
  $or: [
    { productName: { $regex: /tender coconut|இளநீர்/i } },
    { description: { $regex: /tender coconut/i } }
  ]
});

// Remove any old product names that had brackets or place names
await Product.deleteMany({
  productName: {
    $regex: /\(|\)/
  }
});

// Reset any existing sold test product if present
await Product.updateMany(
  { productName: 'Tomato' },
  {
    $set: {
      productName: 'Country Tomatoes',
      productNameTa: 'நாட்டு தக்காளி',
      isSold: false,
      price: 40,
      quantity: 150,
      description: 'Fresh, juicy, pesticide-free country tomatoes directly harvested from our farm.'
    }
  }
);

const sampleProducts = [
  {
    productName: 'Fresh Country Tomatoes',
    productNameTa: 'நாட்டு தக்காளி',
    description: 'Farm-fresh, naturally ripened country tomatoes harvested daily from local farms. Rich in flavor and vitamins.',
    category: 'Vegetables',
    price: 40,
    quantity: 180,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Organic Ponni Raw Rice',
    productNameTa: 'பொன்னி அரிசி',
    description: 'Pesticide-free organic Ponni rice, traditional river delta harvest. Aromatic and high-fiber.',
    category: 'Grains & Cereals',
    price: 68,
    quantity: 450,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Fresh Red Carrots',
    productNameTa: 'கேரட்',
    description: 'Crisp, naturally sweet hill carrots grown in cool climate. Washed and packed directly on farm.',
    category: 'Vegetables',
    price: 55,
    quantity: 130,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Pure Organic Turmeric',
    productNameTa: 'மஞ்சள்',
    description: 'High-curcumin farm-processed pure organic turmeric fingers and powder. Traditional sunlight curing.',
    category: 'Spices',
    price: 160,
    quantity: 90,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Malgova Mangoes',
    productNameTa: 'மாம்பழம்',
    description: 'Naturally carbide-free tree-ripened juicy Malgova mangoes. Rich golden pulp with heavenly fragrance.',
    category: 'Fruits',
    price: 120,
    quantity: 95,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Small Shallots / Sambar Onion',
    productNameTa: 'சின்ன வெங்காயம்',
    description: 'High-pungency small onions (shallots), cleaned, cured and sun-dried for long kitchen shelf life.',
    category: 'Vegetables',
    price: 70,
    quantity: 300,
    isSold: false,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    farmer: farmer._id
  },
  {
    productName: 'Black Pepper',
    productNameTa: 'கருப்பு மிளகு',
    description: 'Bold-grade mountain shade dried whole black pepper from tribal farmers cooperative.',
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
    existing.productNameTa = p.productNameTa;
    existing.isSold = false;
    existing.price = p.price;
    existing.quantity = p.quantity;
    existing.image = p.image;
    existing.description = p.description;
    await existing.save();
    console.log(`Updated product: ${p.productName} (Ta: ${p.productNameTa})`);
  } else {
    await Product.create(p);
    console.log(`Created product: ${p.productName} (Ta: ${p.productNameTa})`);
  }
}

console.log('Product seeding completed successfully!');
process.exit(0);
