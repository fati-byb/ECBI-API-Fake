const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/products/products.controller');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Directory where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

 const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Routes
router.post('/add-product', upload.single('image'), productController.createProduct);
router.get('/get-products', productController.getProducts);

module.exports = router;
