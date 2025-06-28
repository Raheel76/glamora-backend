const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: ['Men', 'Women', 'Kids'] },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  sizes: [{ type: String, required: true }],
  images: [{ type: String, required: true }],
  fitType: { type: String, required: true },
  stretch: { type: String, required: true },
  transparency: { type: String, required: true },
  handFeel: { type: String, required: true },
  lining: { type: String, required: true },
  material: { type: String, required: true },
  occasion: { type: String, required: true },
  designDetails: { type: String, required: true },
  note: { type: String, required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
  justOne: false
});

module.exports = mongoose.model('Product', productSchema);