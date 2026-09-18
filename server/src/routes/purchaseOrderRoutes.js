const express = require('express');
const router = express.Router();
const { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);
router.post('/', authorize('admin', 'purchase'), createPurchaseOrder);
router.put('/:id', authorize('admin', 'purchase'), updatePurchaseOrder);

module.exports = router;