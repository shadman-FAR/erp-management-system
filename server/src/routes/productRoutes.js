const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { productValidator } = require('../validators/productValidator');

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'purchase'), productValidator, createProduct);
router.put('/:id', authorize('admin', 'purchase'), productValidator, updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;