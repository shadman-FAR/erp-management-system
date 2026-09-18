const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getSalesOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = req.query.status ? { status: req.query.status } : {};

    const [orders, total] = await Promise.all([
      SalesOrder.find(query)
        .populate('customer', 'name email')
        .populate('products.product', 'title SKU')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SalesOrder.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Sales orders retrieved', {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name email address contact')
      .populate('products.product', 'title SKU price')
      .populate('createdBy', 'name');
    if (!order) return errorResponse(res, 404, 'Sales order not found');
    return successResponse(res, 200, 'Sales order retrieved', { order });
  } catch (error) {
    next(error);
  }
};

const createSalesOrder = async (req, res, next) => {
  try {
    const { customer, products, notes } = req.body;

    if (!products || products.length === 0) {
      return errorResponse(res, 400, 'At least one product is required');
    }

    // Validate stock and calculate total
    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) return errorResponse(res, 404, `Product not found: ${item.product}`);
      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for ${product.title}. Available: ${product.stock}`);
      }
      totalPrice += product.price * item.quantity;
      orderProducts.push({ product: item.product, quantity: item.quantity, unitPrice: product.price });
    }

    const order = await SalesOrder.create({
      customer,
      products: orderProducts,
      totalPrice,
      notes,
      createdBy: req.user._id,
    });

    const populated = await order.populate([
      { path: 'customer', select: 'name email' },
      { path: 'products.product', select: 'title SKU' },
    ]);

    return successResponse(res, 201, 'Sales order created', { order: populated });
  } catch (error) {
    next(error);
  }
};

const updateSalesOrder = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) return errorResponse(res, 404, 'Sales order not found');

    if (order.status === 'cancelled') {
      return errorResponse(res, 400, 'Cannot update a cancelled order');
    }

    // Deduct stock when confirming
    if (status === 'confirmed' && order.status === 'pending') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    // Restore stock when cancelling confirmed order
    if (status === 'cancelled' && order.status === 'confirmed') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    order.status = status;
    await order.save();

    return successResponse(res, 200, 'Sales order updated', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder };