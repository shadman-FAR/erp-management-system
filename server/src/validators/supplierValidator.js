const { body } = require('express-validator');

const supplierValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('contact').trim().notEmpty().withMessage('Contact is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
];

module.exports = { supplierValidator };