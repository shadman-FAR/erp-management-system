const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const customerRoutes = require('./customerRoutes');
const supplierRoutes = require('./supplierRoutes');
const salesOrderRoutes = require('./salesOrderRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const grnRoutes = require('./grnRoutes');
const invoiceRoutes = require('./invoiceRoutes');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/grn', grnRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;