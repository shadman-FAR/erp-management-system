const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const { customerValidator } = require('../validators/customerValidator');

router.use(protect);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', authorize('admin', 'sales'), customerValidator, createCustomer);
router.put('/:id', authorize('admin', 'sales'), customerValidator, updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;