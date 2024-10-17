const Product = require('../../models/product.model');
const FileUpload = require('../../models/media.model'); // Import your mongoose model
const Category = require('../../models/category.model')
const productController = {};

productController.createProduct = async (req, res) => {
  console.log('we re here')
  try {
    const { libele, category, price } = req.body;
    console.log('req', req.body)
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const categoryDoc = await Category.findOne({ libele: category }); 
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const { originalname, encoding, mimetype, destination, filename, path, size, fieldname } = req.file;
    const newImage = new FileUpload({
      fieldName: fieldname,
      originalName: originalname,
      encoding: encoding,
      mimeType: mimetype,
      destination: destination,
      fileName: filename,
      path: path,
      size: size,
    });
    const savedImage = await newImage.save();

    const product = new Product({
      libele,
      price,
      category: categoryDoc._id,
      image: savedImage._id,
    });

    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: error.message });
  }
};




productController.getProducts = async (req, res) => {
  try {
    console.log('Fetching all products');
    
     const products = await Product.find() .populate([
      { path: 'image' },
      { path: 'category', select: 'libele' }
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
