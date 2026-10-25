import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    productNameTa: { type: String, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    isSold: { type: Boolean, default: false },
    image: String,
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Product', schema);
