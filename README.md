# ERP Management System

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-23-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7-darkgreen)
![Express](https://img.shields.io/badge/Express-4-lightgrey)
![License](https://img.shields.io/badge/license-ISC-blue)

A full-stack **ERP (Enterprise Resource Planning) Management System** built with the MERN stack. Manages products, customers, suppliers, sales orders, purchase orders, inventory, invoices, and provides a real-time dashboard with charts.

---

## Features

- **JWT Authentication** with Role-Based Access Control (RBAC)
- **4 User Roles**: Admin, Sales, Purchase, Inventory
- **Product Management** with stock tracking and low-stock alerts
- **Customer & Supplier Management** with search and pagination
- **Sales Orders** with stock validation and status management
- **Purchase Orders** with supplier integration
- **GRN (Goods Receipt Note)** with automatic inventory updates
- **Invoice Generation** with PDF export (jsPDF)
- **Interactive Dashboard** with Recharts (bar, line, pie charts)
- **Swagger API Documentation**
- **Backend Tests** with Jest + Supertest
- **Responsive UI** with Material UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Material UI, Redux Toolkit, React Router |
| Forms | React Hook Form, Yup |
| Charts | Recharts |
| PDF | jsPDF |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| Testing | Jest, Supertest |
| Docs | Swagger/OpenAPI |

---

## Project Structure
erp-management-system/
├── client/ # React frontend
│ └── src/
│ ├── api/ # Axios configuration
│ ├── features/ # Redux slices
│ ├── layouts/ # MainLayout with sidebar
│ ├── pages/ # All page components
│ └── routes/ # Protected/Role routes
├── server/ # Express backend
│ └── src/
│ ├── controllers/ # Route handlers
│ ├── middleware/ # Auth, error handling
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── validators/ # Input validation
│ └── docs/ # Swagger config
└── README.md


---

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Clone & Install

```bash
git clone https://github.com/shadman-FAR/erp-management-system.git
cd erp-management-system

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

---

## Environment Variables

### Backend (`server/.env`)

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/erp_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development


### Frontend (`client/.env`)
VITE_API_URL=http://localhost:5000/api


---

## Running the Application

```bash
# Start backend (from server/)
npm run dev

# Start frontend (from client/)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger Docs: http://localhost:5000/api-docs

---

## Seed Data

```bash
cd server
npm run seed
```

Development credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | admin123 |
| Sales | sales@erp.com | sales123 |
| Purchase | purchase@erp.com | purchase123 |
| Inventory | inventory@erp.com | inventory123 |

> ⚠️ Development only. Never use in production.

---

## API Documentation

Swagger UI: `http://localhost:5000/api-docs`

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/products | List products |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/customers | List customers |
| POST | /api/customers | Create customer |
| GET | /api/suppliers | List suppliers |
| POST | /api/suppliers | Create supplier |
| GET | /api/sales-orders | List sales orders |
| POST | /api/sales-orders | Create sales order |
| PUT | /api/sales-orders/:id | Update status |
| GET | /api/purchase-orders | List purchase orders |
| POST | /api/purchase-orders | Create purchase order |
| GET | /api/grn | List GRNs |
| POST | /api/grn | Create GRN |
| GET | /api/invoices | List invoices |
| POST | /api/invoices | Create invoice |
| GET | /api/dashboard | Dashboard metrics |

---

## Roles & Permissions

| Feature | Admin | Sales | Purchase | Inventory |
|---------|-------|-------|----------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ | View | ✅ | View |
| Customers | ✅ | ✅ | ❌ | ❌ |
| Suppliers | ✅ | ❌ | ✅ | ❌ |
| Sales Orders | ✅ | ✅ | ❌ | ❌ |
| Purchase Orders | ✅ | ❌ | ✅ | View |
| GRN | ✅ | ❌ | ✅ | ✅ |
| Invoices | ✅ | ✅ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |

---

## Testing

```bash
cd server
npm test
```

Tests cover:
- User registration and login
- JWT authentication
- Role-based authorization
- Product CRUD operations
- Input validation

---

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Set as `MONGO_URI` in Render environment variables

---

## Known Limitations

- No real-time notifications (WebSocket not implemented)
- No email alerts
- No file upload for product images
- Invoice status update (sent/paid) is manual

---

## Future Enhancements

- Real-time notifications with Socket.io
- Email alerts for low stock
- Product image uploads
- Advanced reporting and analytics
- Mobile app with React Native
- Stripe payment integration

---

## Author

**Shadman Farooqui**
- GitHub: [@shadman-FAR](https://github.com/shadman-FAR)
- Email: shadmanfarooqui64@gmail.com
