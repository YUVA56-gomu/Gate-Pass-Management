# Quick Start Guide

## 1️⃣ Database Setup (One-time)
```bash
mysql -u root -p
CREATE DATABASE smart_gate_pass;
EXIT;
```

## 2️⃣ Backend Setup
```bash
cd server
npm install
```

Edit `server/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_gate_pass
JWT_SECRET=your_secret_key
```

Start backend:
```bash
npm run dev
```
✅ Backend runs on `http://localhost:5000`

## 3️⃣ Frontend Setup
```bash
cd client
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

## 4️⃣ Test the Application

### Create Admin User (First Time)
1. Go to `http://localhost:5173/register`
2. Register with role: admin
3. Login with those credentials

### Create Other Users
1. Login as admin
2. Go to Admin → Users
3. Click "Add User"
4. Create coordinator, hostel_staff, security accounts

### Test Student Flow
1. Register as student
2. Login
3. Apply for pass
4. Wait for approvals
5. Download PDF and view QR code

## 📁 Project Structure
```
.
├── client/          # React frontend
├── server/          # Express backend
├── README.md        # Project overview
├── API.md           # API documentation
├── SETUP.md         # Detailed setup
└── QUICK_START.md   # This file
```

## 🔑 Key Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | - | Register user |
| POST | /auth/login | - | Login user |
| POST | /passes | student | Apply for pass |
| GET | /passes/my-passes | student | View my passes |
| GET | /approvals/pending | coordinator, hostel_staff | View pending requests |
| POST | /approvals/:id/approve | coordinator, hostel_staff | Approve request |
| POST | /security/scan | security | Scan QR code |
| GET | /users | admin | View all users |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check MySQL is running and .env credentials |
| Port 5000 in use | Change PORT in server/.env |
| Port 5173 in use | Change port in client/vite.config.js |
| Module not found | Delete node_modules and run npm install |
| CORS error | Check backend CORS configuration |

## 📚 Documentation Files
- **README.md** - Overview and tech stack
- **API.md** - Complete API reference
- **SETUP.md** - Detailed installation guide
- **PROJECT_SUMMARY.md** - Architecture and fixes
- **QUICK_START.md** - This file

## ✅ All Errors Fixed
- ✅ Root package.json removed
- ✅ Database associations configured
- ✅ Foreign keys added to all models
- ✅ Environment files created
- ✅ No syntax errors in any file

Ready to go! 🚀
