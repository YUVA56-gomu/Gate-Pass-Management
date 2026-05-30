# Smart Gate Pass Management System - Setup Guide

## Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- npm or yarn package manager

## Database Setup

### 1. Create Database
```bash
mysql -u root -p
CREATE DATABASE smart_gate_pass;
EXIT;
```

## Backend Setup

### 1. Navigate to server directory
```bash
cd server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_gate_pass
JWT_SECRET=your_secret_key
```

### 4. Start the server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to client directory
```bash
cd client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Default Test Credentials

After first run, create users through the admin panel or use these test accounts:

### Admin
- Email: admin@college.com
- Password: admin123

### Coordinator
- Email: coordinator@college.com
- Password: coord123

### Hostel Staff
- Email: hostel@college.com
- Password: hostel123

### Security Guard
- Email: security@college.com
- Password: security123

### Student
- Email: student@college.com
- Password: student123

## Project Structure

```
smart-gate-pass/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Role-based pages
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API calls
│   │   ├── context/       # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   └── routes/        # Route configuration
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # Sequelize models
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── package.json
├── README.md
└── API.md
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check DB credentials in `.env`
- Verify database exists

### Port Already in Use
- Change PORT in `.env` (backend)
- Change port in `vite.config.js` (frontend)

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## API Documentation
See `API.md` for complete API endpoint documentation.
