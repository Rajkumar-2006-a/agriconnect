import { Router } from 'express';
import { register, login, me, updateProfile, syncAdmin } from '../controllers/authController.js';
import * as c from '../controllers/crudController.js';
import * as a from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fertilizerRoutes from './fertilizers.js';
import schemeRoutes from './schemes.js';
import chatRoutes from './chat.js';

const r = Router();

// Auth and Profile
r.post('/auth/register', register);
r.post('/auth/login', login);
r.get('/auth/me', protect, me);
r.put('/users/profile', protect, upload.single('image'), updateProfile);
r.get('/auth/sync-admin', syncAdmin);
r.post('/auth/sync-admin', syncAdmin);

// Products
r.route('/products')
  .get(c.products)
  .post(protect, authorize('farmer'), upload.single('image'), c.createProduct);
r.route('/products/:id')
  .get(c.product)
  .put(protect, authorize('farmer', 'admin'), upload.single('image'), c.updateProduct)
  .delete(protect, authorize('farmer', 'admin'), c.deleteProduct);

// Equipment
r.route('/equipment')
  .get(c.equipment)
  .post(protect, authorize('rentalOwner'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'attachmentImages', maxCount: 8 }]), c.createEquipment);
r.route('/equipment/:id')
  .get(c.equipmentById)
  .put(protect, authorize('rentalOwner', 'admin'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'attachmentImages', maxCount: 8 }]), c.updateEquipment)
  .delete(protect, authorize('rentalOwner', 'admin'), c.deleteEquipment);

// Orders & Rentals
r.route('/orders')
  .get(protect, c.orders)
  .post(protect, authorize('buyer'), c.createOrder);
r.put('/orders/:id/status', protect, authorize('farmer', 'admin'), c.orderStatus);

r.route('/rentals')
  .get(protect, c.rentals)
  .post(protect, authorize('farmer'), c.createRental);
r.put('/rentals/:id/status', protect, authorize('rentalOwner', 'admin'), c.rentalStatus);

// Community Posts
r.route('/posts')
  .get(c.posts)
  .post(protect, authorize('farmer', 'admin'), upload.single('image'), c.createPost);
r.route('/posts/:id')
  .put(protect, upload.single('image'), c.updatePost)
  .delete(protect, c.deletePost);
r.route('/posts/:postId/comments')
  .get(c.comments)
  .post(protect, authorize('farmer', 'admin'), c.createComment);
r.delete('/comments/:id', protect, c.deleteComment);

// Fertilizer Prices
r.use('/fertilizers', fertilizerRoutes);

// Government Schemes & Subsidies
r.use('/schemes', schemeRoutes);

// AI Chatbot Assistant (AgriBot powered by Gemini)
r.use('/chat', chatRoutes);

// Agri Doctors & Admin
r.get('/agri-doctors', a.doctors);
r.get('/admin/stats', protect, authorize('admin'), a.stats);
r.get('/admin/users', protect, authorize('admin'), a.users);
r.delete('/admin/users/:id', protect, authorize('admin'), a.deleteUser);
r.get('/admin/products', protect, authorize('admin'), a.products);
r.delete('/admin/products/:id', protect, authorize('admin'), a.deleteProduct);
r.post('/admin/agri-doctors', protect, authorize('admin'), a.createDoctor);
r.delete('/admin/agri-doctors/:id', protect, authorize('admin'), a.deleteDoctor);
r.get('/admin/content', protect, authorize('admin'), a.content);

export default r;
