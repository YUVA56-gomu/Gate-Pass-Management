# Authentication Module - Quick Reference

## Files Created

```
server/src/
├── utils/
│   ├── jwt.js (NEW)
│   ├── bcrypt.js (NEW)
│   └── response.js (UPDATED)
├── middleware/
│   ├── auth.middleware.js (NEW)
│   └── role.middleware.js (NEW)
├── services/
│   └── auth.service.js (NEW)
├── controllers/
│   └── auth.controller.js (NEW)
└── routes/
    └── auth.routes.js (NEW)
```

---

## Quick API Reference

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Register new student |
| POST | `/auth/login` | Login user |

### Protected Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/auth/me` | Get current user | Required |
| POST | `/auth/logout` | Logout user | Required |
| POST | `/auth/change-password` | Change password | Required |

### Admin Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/users` | Create user | Admin |
| GET | `/auth/users` | Get all users | Admin |
| GET | `/auth/users/:id` | Get user by ID | Admin |
| PUT | `/auth/users/:id` | Update user | Admin |
| POST | `/auth/users/:id/deactivate` | Deactivate user | Admin |
| POST | `/auth/users/:id/activate` | Activate user | Admin |

---

## Middleware Usage

### Authentication
```javascript
import { authenticate } from './middleware/auth.middleware.js'

router.get('/protected', authenticate, controller)
```

### Authorization
```javascript
import { isAdmin, isStudent, authorize } from './middleware/role.middleware.js'

// Single role
router.post('/admin', authenticate, isAdmin, controller)

// Multiple roles
router.post('/approval', authenticate, authorize('COORDINATOR', 'HOSTEL_STAFF'), controller)
```

---

## Service Functions

### Auth Service
```javascript
import * as authService from './services/auth.service.js'

// Register student
await authService.registerStudent({ name, email, password, phone })

// Login
await authService.login(email, password)

// Get current user
await authService.getCurrentUser(userId)

// Create user (Admin)
await authService.createUser({ name, email, password, phone, role })

// Update user (Admin)
await authService.updateUser(userId, { name, phone, is_active, role })

// Change password
await authService.changePassword(userId, oldPassword, newPassword)

// Deactivate user (Admin)
await authService.deactivateUser(userId)

// Activate user (Admin)
await authService.activateUser(userId)
```

---

## JWT Utilities

```javascript
import { generateToken, verifyToken, decodeToken } from './utils/jwt.js'

// Generate token
const token = generateToken(userId, role)

// Verify token
const decoded = verifyToken(token)

// Decode token
const payload = decodeToken(token)
```

---

## Bcrypt Utilities

```javascript
import { hashPassword, comparePassword } from './utils/bcrypt.js'

// Hash password
const hash = await hashPassword(password)

// Compare password
const isValid = await comparePassword(password, hash)
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

---

## Roles

| Role | Description |
|------|-------------|
| STUDENT | Can apply for passes |
| COORDINATOR | Can approve long leave passes |
| HOSTEL_STAFF | Can approve daily and long leave passes |
| SECURITY | Can scan QR codes |
| ADMIN | Full system access |

---

## Validation Rules

### Registration
- Name: Required
- Email: Required, valid format, unique
- Password: Required, min 6 characters
- Phone: Optional
- Role: Always STUDENT

### Login
- Email: Required, valid format
- Password: Required, min 6 characters

### Create User (Admin)
- Name: Required
- Email: Required, valid format, unique
- Password: Required, min 6 characters
- Phone: Optional
- Role: Required, valid role

---

## Common Errors

| Error | Status | Cause |
|-------|--------|-------|
| No token provided | 401 | Missing Authorization header |
| Invalid token | 401 | Token corrupted or invalid |
| Token has expired | 401 | Token expiration time exceeded |
| Insufficient permissions | 403 | User role not authorized |
| Email already registered | 400 | Email already exists |
| Invalid email or password | 401 | Wrong credentials |
| User not found | 404 | User ID doesn't exist |
| Password must be at least 6 characters | 400 | Password too short |

---

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=smart_gate_pass
PORT=5000
```

---

## Example Usage

### Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Integration Steps

1. **Install dependencies**
   ```bash
   npm install jsonwebtoken bcrypt
   ```

2. **Set environment variables**
   ```env
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=7d
   ```

3. **Import auth routes in server.js**
   ```javascript
   import authRoutes from './routes/auth.routes.js'
   app.use('/auth', authRoutes)
   ```

4. **Use middleware in other routes**
   ```javascript
   import { authenticate } from './middleware/auth.middleware.js'
   import { isAdmin } from './middleware/role.middleware.js'
   
   router.post('/admin-action', authenticate, isAdmin, controller)
   ```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Role-based authorization
- ✅ Email uniqueness validation
- ✅ Account active status check
- ✅ Token expiration handling
- ✅ Secure password comparison
- ✅ Sensitive data exclusion

---

## Next Steps

1. Test all endpoints with Postman or curl
2. Implement token blacklist for logout
3. Add rate limiting for login attempts
4. Add email verification
5. Add password reset functionality
6. Add two-factor authentication
7. Add audit logging
8. Add CORS configuration

---

**Quick Reference Version**: 1.0  
**Status**: Complete

