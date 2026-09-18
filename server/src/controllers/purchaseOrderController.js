const PurchaseOrder = require('../models/PurchaseOrder');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getPurchaseOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = req.query.status ? { status: req.query.status } : {};

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplier', 'name email')
        .populate('products.product', 'title SKU')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PurchaseOrder.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Purchase orders retrieved', {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name email address contact')
      .populate('products.product', 'title SKU price')
      .populate('createdBy', 'name');
    if (!order) return errorResponse(res, 404, 'Purchase order not found');
    return successResponse(res, 200, 'Purchase order retrieved', { order });
  } catch (error) {
    next(error);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier, products, notes } = req.body;

    if (!products || products.length === 0) {
      return errorResponse(res, 400, 'At least one product is required');
    }

    const order = await PurchaseOrder.create({
      supplier,
      products,
      notes,
      createdBy: req.user._id,
    });

    const populated = await order.populate([
      { path: 'supplier', select: 'name email' },
      { path: 'products.product', select: 'title SKU' },
    ]);

    return successResponse(res, 201, 'Purchase order created', { order: populated });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return errorResponse(res, 404, 'Purchase order not found');
    if (order.status === 'cancelled') return errorResponse(res, 400, 'Cannot update a cancelled order');
    order.status = status;
    await order.save();
    return successResponse(res, 200, 'Purchase order updated', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder };