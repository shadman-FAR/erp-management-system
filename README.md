\# ERP Management System



!\[React](https://img.shields.io/badge/React-18-blue)

!\[Node.js](https://img.shields.io/badge/Node.js-23-green)

!\[MongoDB](https://img.shields.io/badge/MongoDB-7-darkgreen)

!\[Express](https://img.shields.io/badge/Express-4-lightgrey)



A full-stack ERP Management System built with the MERN stack for managing products, customers, suppliers, sales orders, purchase orders, inventory, and invoices.



\## Features



\- JWT Authentication with Role-Based Access Control (Admin, Sales, Purchase, Inventory)

\- Product Management with stock tracking and low-stock alerts

\- Customer \& Supplier Management

\- Sales Orders with invoice generation (PDF export)

\- Purchase Orders with GRN (Goods Receipt Note) and inventory updates

\- Interactive Dashboard with Recharts

\- Swagger API Documentation



\## Tech Stack



\*\*Frontend:\*\* React, Vite, Material UI, Redux Toolkit, React Router, Axios, React Hook Form, Yup, Recharts, jsPDF



\*\*Backend:\*\* Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, express-validator



\*\*Testing:\*\* Jest, Supertest, React Testing Library



\## Setup Instructions



See installation section below.



\### Prerequisites



\- Node.js v18+

\- MongoDB (local or Atlas)



\### Installation



```bash

\# Clone the repository

git clone <your-repo-url>

cd erp-management-system



\# Install backend dependencies

cd server \&\& npm install



\# Install frontend dependencies

cd ../client \&\& npm install

```



\### Environment Variables



Create `server/.env` based on `server/.env.example`.



\### Running the Application



```bash

\# Start backend (from server/)

npm run dev



\# Start frontend (from client/)

npm run dev

```



\## API Documentation



Swagger UI available at: `http://localhost:5000/api-docs`



\## Author



Shadman

