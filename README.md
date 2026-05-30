# Smart Gate Pass Management System

A digital college gate pass management platform with role-based access control, multi-stage approval workflows, and QR code scanning.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, Context API
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL 8+
- **Authentication**: JWT + bcrypt

## Roles
- **Student**: Apply for passes, view status, download PDFs
- **Coordinator**: Approve long leave requests
- **Hostel Staff**: Approve daily passes and long leave requests
- **Security Guard**: Scan QR codes, mark IN/OUT
- **Admin**: Manage users and system settings

## Quick Start

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

### Database Setup
```bash
mysql -u root -p
CREATE DATABASE smart_gate_pass;
cd server
npm run migrate
```

## Project Structure
- `client/` - React frontend application
- `server/` - Express backend API

## Environment Variables
Create `.env` files in both `client/` and `server/` directories.
