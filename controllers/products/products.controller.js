const Product = require('../../models/product.model');
const FileUpload = require('../../models/media.model'); // Import your mongoose model
const Category = require('../../models/category.model');
const Option = require('../../models/option.models');

const productController = {};




productController.createProduct = async (req, res) => {
  try {
    const { libele, category, price, options } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Validate the category
    const categoryDoc = await Category.findOne({ libele: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Upload the image file
    const { originalname, encoding, mimetype, destination, filename, path, size, fieldname } = req.file;
    const newImage = new FileUpload({
      fieldName: fieldname,
      originalName: originalname,
      encoding,
      mimeType: mimetype,
      destination,
      fileName: filename,
      path,
      size,
    });
    const savedImage = await newImage.save();

    // Create the product without options initially
    const product = new Product({
      libele,
      price,
      category: categoryDoc._id,
      image: savedImage._id,
    });
    await product.save();

    // If options are provided, save each option with a reference to the product
  console.log('options', options)  
  console.log('Type of options:', typeof options);
  parsedOptions = JSON.parse(options);

    if (options && Array.isArray(parsedOptions)) {

      const optionDocs = await Promise.all(

        parsedOptions.map(async (option) => {
          const newOption = new Option({
            name: option.name,
            elements: option.elements,
            product: product._id, // Link each option to the product
          });
          const savedOption = await newOption.save();
          return savedOption._id; // Return the ID of each saved option
        })
      );

      // Update the product with the option IDs
      product.options = optionDocs;
      await product.save(); // Save the updated product with options
    }

    return res.status(201).json({
      message: 'Product and options created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product and options:', error);
    return res.status(500).json({ message: error.message });
  }
};




productController.getProducts = async (req, res) => {
  try {
    console.log('Fetching all products');
    
     const products = await Product.find().populate([
      { path: 'image' },
      { path: 'category', select: 'libele' },
      {path:'options'}
    ]); 
    //  ([{path:"image"},{path:"category",populate:[{path:"imageCategory"}]}])

    res.status(200).json(products);
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





productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating product with ID:', id);

    // Get the image path if a new image is uploaded
    const imagePath = req.file ? req.file.path.replace(/\\/g, '/').replace(/^media\//, '') : null;

    // Build the update data
    const updateData = {
      ...req.body,
      ...(imagePath && { image: imagePath }) // Add image to update if available
    };

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
    console.log('Deleting product with ID:', id);

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
