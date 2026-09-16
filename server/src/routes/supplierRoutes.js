const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');
const { supplierValidator } = require('../validators/supplierValidator');

router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.post('/', authorize('admin', 'purchase'), supplierValidator, createSupplier);
router.put('/:id', authorize('admin', 'purchase'), supplierValidator, updateSupplier);
router.delete('/:id', authorize('admin'), deleteSupplier);

module.exports = router;