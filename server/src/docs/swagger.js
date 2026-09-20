const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP Management System API',
      version: '1.0.0',
      description: 'A complete ERP Management System REST API built with Node.js, Express, and MongoDB',
      contact: { name: 'Shadman', email: 'shadmanfarooqui64@gmail.com' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
      { url: 'https://your-render-app.onrender.com', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'sales', 'purchase', 'inventory'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            SKU: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            reorderLevel: { type: 'number' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            contact: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            contact: { type: 'string' },
            address: { type: 'string' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Products', description: 'Product management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Suppliers', description: 'Supplier management' },
      { name: 'Sales Orders', description: 'Sales order management' },
      { name: 'Purchase Orders', description: 'Purchase order management' },
      { name: 'GRN', description: 'Goods Receipt Notes' },
      { name: 'Invoices', description: 'Invoice management' },
      { name: 'Dashboard', description: 'Dashboard metrics' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Auth'],
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'API is running' } },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' },
                    role: { type: 'string', enum: ['admin', 'sales', 'purchase', 'inventory'], example: 'sales' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error or email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@erp.com' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current logged in user',
          responses: {
            200: { description: 'Current user data' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users (Admin only)',
          responses: {
            200: { description: 'List of users' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products with pagination and search',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'List of products' } },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product (Admin/Purchase)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'SKU', 'price'],
                  properties: {
                    title: { type: 'string', example: 'Laptop Pro' },
                    SKU: { type: 'string', example: 'LAP-001' },
                    price: { type: 'number', example: 999.99 },
                    stock: { type: 'integer', example: 50 },
                    reorderLevel: { type: 'integer', example: 10 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Product created' },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product data' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product (Admin/Purchase)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          responses: { 200: { description: 'Product updated' } },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product (Admin only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } },
        },
      },
      '/api/customers': {
        get: { tags: ['Customers'], summary: 'Get all customers', responses: { 200: { description: 'List of customers' } } },
        post: {
          tags: ['Customers'], summary: 'Create customer (Admin/Sales)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'contact'],
                  properties: {
                    name: { type: 'string', example: 'Acme Corp' },
                    email: { type: 'string', example: 'acme@corp.com' },
                    contact: { type: 'string', example: '+1-555-0101' },
                    address: { type: 'string', example: '123 Business Ave' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Customer created' } },
        },
      },
      '/api/customers/{id}': {
        get: { tags: ['Customers'], summary: 'Get customer by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Customer data' } } },
        put: { tags: ['Customers'], summary: 'Update customer', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Customer updated' } } },
        delete: { tags: ['Customers'], summary: 'Delete customer (Admin)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Customer deleted' } } },
      },
      '/api/suppliers': {
        get: { tags: ['Suppliers'], summary: 'Get all suppliers', responses: { 200: { description: 'List of suppliers' } } },
        post: {
          tags: ['Suppliers'], summary: 'Create supplier (Admin/Purchase)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'contact'],
                  properties: {
                    name: { type: 'string', example: 'Tech Wholesale' },
                    email: { type: 'string', example: 'tech@wholesale.com' },
                    contact: { type: 'string', example: '+1-555-0201' },
                    address: { type: 'string', example: '321 Supply Rd' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Supplier created' } },
        },
      },
      '/api/suppliers/{id}': {
        get: { tags: ['Suppliers'], summary: 'Get supplier by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Supplier data' } } },
        put: { tags: ['Suppliers'], summary: 'Update supplier', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Supplier updated' } } },
        delete: { tags: ['Suppliers'], summary: 'Delete supplier (Admin)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Supplier deleted' } } },
      },
      '/api/sales-orders': {
        get: { tags: ['Sales Orders'], summary: 'Get all sales orders', responses: { 200: { description: 'List of sales orders' } } },
        post: {
          tags: ['Sales Orders'], summary: 'Create sales order (Admin/Sales)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer', 'products'],
                  properties: {
                    customer: { type: 'string', example: '64abc123...' },
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          product: { type: 'string' },
                          quantity: { type: 'integer' },
                        },
                      },
                    },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Sales order created' } },
        },
      },
      '/api/sales-orders/{id}': {
        get: { tags: ['Sales Orders'], summary: 'Get sales order by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Sales order data' } } },
        put: {
          tags: ['Sales Orders'], summary: 'Update sales order status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Sales order updated' } },
        },
      },
      '/api/purchase-orders': {
        get: { tags: ['Purchase Orders'], summary: 'Get all purchase orders', responses: { 200: { description: 'List of purchase orders' } } },
        post: { tags: ['Purchase Orders'], summary: 'Create purchase order (Admin/Purchase)', responses: { 201: { description: 'Purchase order created' } } },
      },
      '/api/purchase-orders/{id}': {
        get: { tags: ['Purchase Orders'], summary: 'Get purchase order by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Purchase order data' } } },
        put: { tags: ['Purchase Orders'], summary: 'Update purchase order status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      },
      '/api/grn': {
        get: { tags: ['GRN'], summary: 'Get all GRNs', responses: { 200: { description: 'List of GRNs' } } },
        post: { tags: ['GRN'], summary: 'Create GRN and update inventory', responses: { 201: { description: 'GRN created' } } },
      },
      '/api/grn/{id}': {
        get: { tags: ['GRN'], summary: 'Get GRN by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'GRN data' } } },
      },
      '/api/invoices': {
        get: { tags: ['Invoices'], summary: 'Get all invoices', responses: { 200: { description: 'List of invoices' } } },
        post: {
          tags: ['Invoices'], summary: 'Create invoice from sales order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['salesOrderId'],
                  properties: {
                    salesOrderId: { type: 'string', example: '64abc123...' },
                    taxPercent: { type: 'number', example: 10 },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Invoice created' } },
        },
      },
      '/api/invoices/{id}': {
        get: { tags: ['Invoices'], summary: 'Get invoice by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Invoice data' } } },
      },
      '/api/dashboard': {
        get: { tags: ['Dashboard'], summary: 'Get dashboard metrics and charts data', responses: { 200: { description: 'Dashboard statistics' } } },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;