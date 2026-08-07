# HRMS Backend API

A Human Resource Management System (HRMS) Backend built using Node.js, Express.js and Supabase.

## Features

- JWT Authentication
- Role-Based Authorization (RBAC)
- Employee Management
- Department Management
- Attendance Management
- Leave Management
- Dashboard Statistics
- Input Validation (express-validator)
- Global Error Handler
- Pagination
- Search
- Filter
- Sorting
- Swagger API Documentation

---

## Tech Stack

- Node.js
- Express.js
- Supabase
- PostgreSQL
- JWT
- bcrypt
- Express Validator
- Swagger

---

## Installation

```bash
git clone <repository-url>

cd hrms-backend

npm install
```

Create `.env`

```env
PORT=3000

SUPABASE_URL=your_supabase_url

SUPABASE_KEY=your_supabase_key

JWT_SECRET=your_jwt_secret
```

Run project

```bash
npm run dev
```

---

## API Documentation

```
http://localhost:3000/api-docs
```

---

## Main Modules

- Authentication
- Employees
- Departments
- Attendance
- Leave
- Dashboard

---

## Author

Muhammad Arief Fadhlan