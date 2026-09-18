const mongoose = require('mongoose');

const grnSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'Purchase order is required'],
    },
    receivedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
      },
    ],
    receivedDate: { type: Date, default: Date.now },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GRN', grnSchema);