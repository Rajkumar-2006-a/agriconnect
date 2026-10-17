import User from '../models/User.js';
import Product from '../models/Product.js';
import Equipment from '../models/Equipment.js';
import Order from '../models/Order.js';
import RentalRequest from '../models/RentalRequest.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import AgriDoctor from '../models/AgriDoctor.js';
import Scheme from '../models/Scheme.js';

export const stats = async (req, res, next) => {
  try {
    const [users, products, equipment, orders, rentals, posts, doctors, schemes] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Product.countDocuments().catch(() => 0),
      Equipment.countDocuments().catch(() => 0),
      Order.countDocuments().catch(() => 0),
      RentalRequest.countDocuments().catch(() => 0),
      Post.countDocuments().catch(() => 0),
      AgriDoctor.countDocuments().catch(() => 0),
      Scheme.countDocuments().catch(() => 0),
    ]);
    res.json({ users, products, equipment, orders, rentals, posts, doctors, schemes });
  } catch (e) {
    next(e);
  }
};

export const users = async (req, res, next) => {
  try {
    const list = await User.find().select('-password').sort('-createdAt');
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const products = async (req, res, next) => {
  try {
    const list = await Product.find().populate('farmer', 'name phone').sort('-createdAt');
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot remove your own admin account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (e) {
    next(e);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (e) {
    next(e);
  }
};

export const doctors = async (req, res, next) => {
  try {
    // Auto-seed sample doctors if collection is empty
    const count = await AgriDoctor.countDocuments().catch(() => 0);
    if (count === 0) {
      try {
        await AgriDoctor.insertMany([
          { name: 'Dr. K. Senthil Kumar (Agronomist)', phone: '9443123456', location: 'Coimbatore' },
          { name: 'Dr. R. Meenakshi (Pest & Soil Specialist)', phone: '9842234567', location: 'Thanjavur' },
          { name: 'Dr. M. Ramanathan (Horticulture Expert)', phone: '9789345678', location: 'Madurai' },
          { name: 'Dr. P. Arumugam (Crop Protection)', phone: '9486456789', location: 'Salem' },
          { name: 'Dr. V. Kavitha (Organic Farming)', phone: '9894567890', location: 'Tiruchirappalli' },
        ]);
      } catch (seedErr) {
        console.warn('Auto-seed doctors note:', seedErr.message);
      }
    }

    const q = {};
    if (req.query.location) q.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.search) {
      const s = { $regex: req.query.search, $options: 'i' };
      q.$or = [{ name: s }, { location: s }, { phone: s }];
    }
    const list = await AgriDoctor.find(q).sort('-createdAt');
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const doc = await AgriDoctor.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    await AgriDoctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed' });
  } catch (e) {
    next(e);
  }
};

export const content = async (req, res, next) => {
  try {
    const [posts, comments] = await Promise.all([
      Post.find().populate('author', 'name'),
      Comment.find().populate('user', 'name').populate('post', 'title'),
    ]);
    res.json({ posts, comments });
  } catch (e) {
    next(e);
  }
};
