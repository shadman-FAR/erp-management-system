const { body } = require('express-validator');

const productValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('SKU').trim().notEmpty().withMessage('SKU is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
];

module.exports = { productValidator };