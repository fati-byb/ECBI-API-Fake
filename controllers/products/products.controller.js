const mongoose = require('mongoose');

const Product = require('../../models/product.model');
const FileUpload = require('../../models/media.model'); // Import your mongoose model
const Category = require('../../models/category.model');
const Option = require('../../models/option.models');
const cloudinary = require('../../config/cloudinary'); // Import Cloudinary config
const { Readable } = require('stream');

const productController = {};

productController.getProducts = async (req, res) => {
  const { page = 1, limit = 5} = req.query; // Defaults: page 1, 5 items per page
  const skip = (page - 1) * limit;
  try {
    const totalProducts = await Product.countDocuments();

     
     const products = await Product.find().populate([
     
      { path: 'category', select: 'libele' },
      {path:'options'}
    ])
    .skip(Number(skip))
    .limit(Number(limit));  
    
    
    //  ([{path:"image"},{path:"category",populate:[{path:"imageCategory"}]}])

    res.status(200).json({
      data: products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error)
    ;
    res.status(500).json({ error: 'Failed to fetch products' });
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
  try {
    const { libele, category, price, options } = req.body;

    if (!req.file) {
      return res.json({ message: 'No image file uploaded' });
    }

    // Validate the category
    const categoryDoc = await Category.findOne({ libele: category });
    if (!categoryDoc) {
      return res.json({ message: 'Invalid category' });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer); // Use buffer from Multer's memoryStorage
    });

    // Create the product without options initially
    const product = new Product({
      libele,
      price,
      category: categoryDoc._id,
      image: uploadResult.secure_url, // Store Cloudinary image URL
    });
    await product.save();

    // Handle options if provided
    const parsedOptions = options ? JSON.parse(options) : [];
    if (Array.isArray(parsedOptions)) {
      const optionDocs = await Promise.all(
        parsedOptions.map(async (option) => {
          const newOption = new Option({
            name: option.name,
            elements: option.elements,
            product: product._id,
          });
          const savedOption = await newOption.save();
          return savedOption._id;
        })
      );
      product.options = optionDocs;
      await product.save();
    }

    return res.json({
      message: 'Product and options created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product and options:', error);
    return res.json({ message: error.message });
  }
};


productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { libele, price, category, options } = req.body;

    // Check if a new image is uploaded
    let imageUrl = req.body.image; // Assume the image URL is sent in the request body
    if (req.file) {
      // Convert buffer to a readable stream
      const stream = Readable.from(req.file.buffer);

      // Upload image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.pipe(uploadStream);
      });

      imageUrl = uploadResult.secure_url; // Use the uploaded image URL
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { libele, price, category, options, image: imageUrl },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};



// Delete a product by ID
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
     await Option.deleteMany({ product: id });

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
