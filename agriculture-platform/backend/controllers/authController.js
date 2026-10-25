import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'agriconnect-jwt-fallback-secret-key-2025';

const token = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const safe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  location: u.location || '',
  profileImage: u.profileImage,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, location } = req.body;
    if (!name || !email || !phone || !password || !location) {
      return res.status(400).json({ message: 'Name, email, phone number, location and password are required' });
    }
    if (!['farmer', 'buyer', 'rentalOwner'].includes(role)) {
      return res.status(400).json({ message: 'Choose a valid account role' });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    const user = await User.create({ name, email, phone, password, role, location });
    res.status(201).json({ token: token(user._id), user: safe(user) });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: token(user._id), user: safe(user) });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res) => res.json({ user: safe(req.user) });

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (location) req.user.location = location;
    if (req.file) {
      req.user.profileImage =
        req.file.secure_url ||
        (req.file.path?.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`);
    }
    await req.user.save();
    res.json({ user: safe(req.user) });
  } catch (e) {
    next(e);
  }
};
