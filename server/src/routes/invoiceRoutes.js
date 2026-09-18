const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', authorize('admin', 'sales'), createInvoice);

module.exports = router;