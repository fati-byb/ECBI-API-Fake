// models/product.model.js
const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  libele: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,  // Can be an ID referencing a Category model if you have a separate Category collection
    required: true,
  },
  availability:{
    type:String,
    default:"available"
  },
  price: {
    type: Number,
    required: true,
    min: 0,  // Ensure price is positive
  },
  image: {
    type: String,  // URL or path to the image
    required: false,
  },
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
