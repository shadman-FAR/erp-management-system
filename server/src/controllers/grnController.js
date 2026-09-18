const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getGRNs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [grns, total] = await Promise.all([
      GRN.find()
        .populate({ path: 'purchaseOrder', populate: { path: 'supplier', select: 'name' } })
        .populate('receivedProducts.product', 'title SKU')
        .populate('receivedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      GRN.countDocuments(),
    ]);

    return successResponse(res, 200, 'GRNs retrieved', {
      grns,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getGRN = async (req, res, next) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate({ path: 'purchaseOrder', populate: { path: 'supplier', select: 'name email' } })
      .populate('receivedProducts.product', 'title SKU stock')
      .populate('receivedBy', 'name');
    if (!grn) return errorResponse(res, 404, 'GRN not found');
    return successResponse(res, 200, 'GRN retrieved', { grn });
  } catch (error) {
    next(error);
  }
};

const createGRN = async (req, res, next) => {
  try {
    const { purchaseOrder, receivedProducts, receivedDate, notes } = req.body;

    if (!receivedProducts || receivedProducts.length === 0) {
      return errorResponse(res, 400, 'At least one product is required');
    }

    const po = await PurchaseOrder.findById(purchaseOrder);
    if (!po) return errorResponse(res, 404, 'Purchase order not found');
    if (po.status === 'cancelled') return errorResponse(res, 400, 'Purchase order is cancelled');

    // Update inventory for each received product
    for (const item of receivedProducts) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    // Update PO status to received
    po.status = 'received';
    await po.save();

    const grn = await GRN.create({
      purchaseOrder,
      receivedProducts,
      receivedDate: receivedDate || Date.now(),
      receivedBy: req.user._id,
      notes,
    });

    return successResponse(res, 201, 'GRN created and inventory updated', { grn });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGRNs, getGRN, createGRN };