import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import AgriDoctor from '../models/AgriDoctor.js';

dotenv.config();
await connectDB();

const email = process.env.ADMIN_EMAIL || 'admin@agriconnect.com';
const password = process.env.ADMIN_PASSWORD || 'admin@123';
const phone = process.env.ADMIN_PHONE || '9876543210';

let admin = await User.findOne({ email }).select('+password');
if (admin) {
  admin.name = 'Platform Administrator';
  admin.role = 'admin';
  admin.phone = phone;
  admin.location = admin.location || 'Chennai';
  admin.password = password; // triggers bcrypt hash via pre('save') hook
  await admin.save();
  console.log(`✅ Admin account updated successfully! Email: ${email} | Password: ${password}`);
} else {
  admin = await User.create({
    name: 'Platform Administrator',
    email,
    phone,
    password,
    role: 'admin',
    location: 'Chennai'
  });
  console.log(`✅ Admin account created successfully! Email: ${email} | Password: ${password}`);
}

if ((await AgriDoctor.countDocuments()) === 0) {
  await AgriDoctor.create([
    { name: 'Dr. K. Senthil Kumar (Agronomist)', phone: '9443123456', location: 'Coimbatore' },
    { name: 'Dr. R. Meenakshi (Pest & Soil Specialist)', phone: '9842234567', location: 'Thanjavur' },
    { name: 'Dr. M. Ramanathan (Horticulture Expert)', phone: '9789345678', location: 'Madurai' },
    { name: 'Dr. P. Arumugam (Crop Protection)', phone: '9486456789', location: 'Salem' },
    { name: 'Dr. V. Kavitha (Organic Farming)', phone: '9894567890', location: 'Tiruchirappalli' }
  ]);
  console.log('Sample Tamil Nadu Agri Doctors seeded');
}

process.exit();
