const express = require('express');
const router = express.Router();
const { getGRNs, getGRN, createGRN } = require('../controllers/grnController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getGRNs);
router.get('/:id', getGRN);
router.post('/', authorize('admin', 'purchase', 'inventory'), createGRN);

module.exports = router;