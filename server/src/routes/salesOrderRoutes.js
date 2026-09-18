const express = require('express');
const router = express.Router();
const { getSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder } = require('../controllers/salesOrderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getSalesOrders);
router.get('/:id', getSalesOrder);
router.post('/', authorize('admin', 'sales'), createSalesOrder);
router.put('/:id', authorize('admin', 'sales'), updateSalesOrder);

module.exports = router;