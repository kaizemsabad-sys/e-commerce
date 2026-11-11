const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1.']
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  }
}, 
{ _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true
  },
  cartItems: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  orderedOn: {
    type: Date,
    default: Date.now 
  }
}, 
{ timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
