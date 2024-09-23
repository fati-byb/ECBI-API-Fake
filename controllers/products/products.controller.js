// controllers/product.controller.js
const Product = require('../../models/product.model');
const multer = require('multer');
const path = require('path');

const productController = {};

 productController.getProducts = async (req, res) => {
  try {
    console.log('Fetching all products');
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json({ error: 'Failed to fetch products' });
  }
};

 productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product by ID' });
  }
};


productController.createProduct = async (req, res) => {
  console.log('request body', req.body);
  console.log('file', req.file);

  try {
    const { libele, category, price } = req.body;
    if (!libele || !category || !price || !req.file) {
      return res.status(400).json({ error: "All fields are required, including the image." });
    }

    const imagePath = req.file ? req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '') : null;
    const newProduct = new Product({
      libele,
      category,
      price,
      image: imagePath // Save the file path to the database
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};


// Update a product by ID
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find product by ID and update it with new data
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.json({ error: 'Failed to update product' });
  }
};

// Delete a product by ID
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.json({ message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.json({ error: 'Failed to delete product' });
  }
};

module.exports = productController;
