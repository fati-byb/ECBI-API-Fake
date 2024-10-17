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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileUpload', // image model
},
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
