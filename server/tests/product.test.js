const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

let adminToken;
let salesToken;
let productId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_test');

  // Register and login admin
  await request(app).post('/api/auth/register').send({
    name: 'Admin', email: 'admin.test@erp.com', password: 'admin123', role: 'admin',
  });
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin.test@erp.com', password: 'admin123',
  });
  adminToken = adminRes.body.data.token;

  // Register and login sales user
  await request(app).post('/api/auth/register').send({
    name: 'Sales', email: 'sales.test@erp.com', password: 'sales123', role: 'sales',
  });
  const salesRes = await request(app).post('/api/auth/login').send({
    email: 'sales.test@erp.com', password: 'sales123',
  });
  salesToken = salesRes.body.data.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Product API', () => {
  test('POST /api/products - admin can create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Product', SKU: 'TEST-001', price: 99.99, stock: 100, reorderLevel: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.SKU).toBe('TEST-001');
    productId = res.body.data.product._id;
  });

  test('POST /api/products - sales role cannot create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ title: 'Test Product 2', SKU: 'TEST-002', price: 49.99, stock: 50, reorderLevel: 5 });
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/products - any authenticated user can view products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products).toBeDefined();
  });

  test('PUT /api/products/:id - admin can update product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Product', SKU: 'TEST-001', price: 149.99, stock: 100, reorderLevel: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.price).toBe(149.99);
  });

  test('POST /api/products - should reject duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Duplicate SKU', SKU: 'TEST-001', price: 9.99, stock: 10, reorderLevel: 2 });
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/products/:id - admin can delete product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/products - unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(401);
  });
});