// controllers/optionController.js
const Option = require('../../models/option.models');
const Product = require('../../models/product.model');

// Create a new option
exports.createOption = async (req, res) => {
  try {
    const { name, elements, productId } = req.body;

    // Validate input
    if (!name || !elements || !Array.isArray(elements) || elements.length === 0 || !productId) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // Find the product to associate with the option
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create the new option
    const option = new Option({
      name,
      elements,
      product: productId,
    });

    const savedOption = await option.save();

    // Update the product to include the new option
    product.options.push(savedOption._id);
    await product.save();

    return res.status(201).json(savedOption);
  } catch (error) {
    console.error('Error creating option:', error);
    return res.status(500).json({ message: error.message });
  }
};
exports.getProductsOptions = async (req, res) => {
  try {
    const options = await Option.find()
      .populate('product', 'libele') // Replace 'libele' with the product field(s) you want to retrieve
      .exec();

    return res.status(200).json(options);
  } catch (error) {
    console.error('Error retrieving options:', error);
    return res.status(500).json({ message: error.message });
  }
};
// Add other methods for updating, deleting, and retrieving options as needed
