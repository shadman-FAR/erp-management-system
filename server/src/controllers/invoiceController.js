const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find()
        .populate('customer', 'name email')
        .populate('salesOrder', 'status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(),
    ]);

    return successResponse(res, 200, 'Invoices retrieved', {
      invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email address contact')
      .populate('salesOrder');
    if (!invoice) return errorResponse(res, 404, 'Invoice not found');
    return successResponse(res, 200, 'Invoice retrieved', { invoice });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { salesOrderId, taxPercent = 0 } = req.body;

    const salesOrder = await SalesOrder.findById(salesOrderId)
      .populate('customer', 'name email address')
      .populate('products.product', 'title price');

    if (!salesOrder) return errorResponse(res, 404, 'Sales order not found');
    if (salesOrder.status === 'cancelled') return errorResponse(res, 400, 'Cannot invoice a cancelled order');

    const existing = await Invoice.findOne({ salesOrder: salesOrderId });
    if (existing) return errorResponse(res, 400, 'Invoice already exists for this sales order');

    const items = salesOrder.products.map((item) => ({
      product: item.product.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = (subtotal * taxPercent) / 100;
    const total = subtotal + tax;

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      salesOrder: salesOrderId,
      customer: salesOrder.customer._id,
      items,
      subtotal,
      tax,
      total,
    });

    // Mark sales order as completed
    salesOrder.status = 'completed';
    await salesOrder.save();

    const populated = await invoice.populate('customer', 'name email');
    return successResponse(res, 201, 'Invoice created', { invoice: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, getInvoice, createInvoice };