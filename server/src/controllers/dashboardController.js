const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const { successResponse } = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      pendingSalesOrders,
      pendingPurchaseOrders,
      lowStockProducts,
      recentSalesOrders,
      recentPurchaseOrders,
      totalInvoices,
      salesOrders,
      purchaseOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Supplier.countDocuments(),
      SalesOrder.countDocuments({ status: 'pending' }),
      PurchaseOrder.countDocuments({ status: 'pending' }),
      Product.find({ $expr: { $lte: ['$stock', '$reorderLevel'] } }).select('title SKU stock reorderLevel').limit(5),
      SalesOrder.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
      PurchaseOrder.find().populate('supplier', 'name').sort({ createdAt: -1 }).limit(5),
      Invoice.countDocuments(),
      SalesOrder.find().select('status totalPrice createdAt'),
      PurchaseOrder.find().select('status createdAt'),
    ]);

    // Total sales revenue from completed/confirmed orders
    const totalSales = salesOrders
      .filter((o) => ['confirmed', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Sales order status breakdown
    const salesStatusBreakdown = [
      { name: 'Pending', value: salesOrders.filter((o) => o.status === 'pending').length },
      { name: 'Confirmed', value: salesOrders.filter((o) => o.status === 'confirmed').length },
      { name: 'Completed', value: salesOrders.filter((o) => o.status === 'completed').length },
      { name: 'Cancelled', value: salesOrders.filter((o) => o.status === 'cancelled').length },
    ];

    // Purchase order status breakdown
    const purchaseStatusBreakdown = [
      { name: 'Pending', value: purchaseOrders.filter((o) => o.status === 'pending').length },
      { name: 'Ordered', value: purchaseOrders.filter((o) => o.status === 'ordered').length },
      { name: 'Received', value: purchaseOrders.filter((o) => o.status === 'received').length },
      { name: 'Cancelled', value: purchaseOrders.filter((o) => o.status === 'cancelled').length },
    ];

    // Monthly sales for last 6 months
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthOrders = salesOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === year;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      monthlySales.push({ month, revenue, orders: monthOrders.length });
    }

    return successResponse(res, 200, 'Dashboard stats retrieved', {
      stats: {
        totalProducts,
        totalCustomers,
        totalSuppliers,
        pendingSalesOrders,
        pendingPurchaseOrders,
        totalSales,
        totalInvoices,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentSalesOrders,
      recentPurchaseOrders,
      salesStatusBreakdown,
      purchaseStatusBreakdown,
      monthlySales,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };