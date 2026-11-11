const mongoose = require('mongoose');

const productOrderedSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Links items to your Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
}, 
{ _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productsOrdered: [productOrderedSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  orderedOn: {
    type: Date,
    default: Date.now 
  },
  status: {
    type: String,
    default: 'Pending' 
  }
}, 
{ timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

