require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Customer.deleteMany(),
      Supplier.deleteMany(),
    ]);
    console.log('Existing data cleared');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@erp.com', password: 'admin123', role: 'admin' },
      { name: 'Sales User', email: 'sales@erp.com', password: 'sales123', role: 'sales' },
      { name: 'Purchase User', email: 'purchase@erp.com', password: 'purchase123', role: 'purchase' },
      { name: 'Inventory User', email: 'inventory@erp.com', password: 'inventory123', role: 'inventory' },
    ]);
    console.log('Users seeded:', users.length);

    // Create products
    const products = await Product.create([
      { title: 'Laptop Pro', SKU: 'LAP-001', price: 999.99, stock: 50, reorderLevel: 10 },
      { title: 'Wireless Mouse', SKU: 'MOU-001', price: 29.99, stock: 8, reorderLevel: 10 },
      { title: 'USB-C Hub', SKU: 'HUB-001', price: 49.99, stock: 30, reorderLevel: 5 },
      { title: 'Monitor 27"', SKU: 'MON-001', price: 399.99, stock: 5, reorderLevel: 8 },
      { title: 'Mechanical Keyboard', SKU: 'KEY-001', price: 89.99, stock: 25, reorderLevel: 5 },
      { title: 'Webcam HD', SKU: 'CAM-001', price: 69.99, stock: 3, reorderLevel: 5 },
    ]);
    console.log('Products seeded:', products.length);

    // Create customers
    const customers = await Customer.create([
      { name: 'Acme Corporation', email: 'acme@corp.com', contact: '+1-555-0101', address: '123 Business Ave, NY' },
      { name: 'TechStart Inc', email: 'tech@start.com', contact: '+1-555-0102', address: '456 Startup Blvd, CA' },
      { name: 'Global Traders', email: 'global@traders.com', contact: '+1-555-0103', address: '789 Trade St, TX' },
    ]);
    console.log('Customers seeded:', customers.length);

    // Create suppliers
    const suppliers = await Supplier.create([
      { name: 'Tech Wholesale Co', email: 'wholesale@tech.com', contact: '+1-555-0201', address: '321 Supply Rd, WA' },
      { name: 'Global Electronics', email: 'global@electronics.com', contact: '+1-555-0202', address: '654 Electronics Way, OR' },
    ]);
    console.log('Suppliers seeded:', suppliers.length);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Development credentials:');
    console.log('Admin:     admin@erp.com     / admin123');
    console.log('Sales:     sales@erp.com     / sales123');
    console.log('Purchase:  purchase@erp.com  / purchase123');
    console.log('Inventory: inventory@erp.com / inventory123');
    console.log('\n⚠️  These are development-only credentials. Never use in production.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();