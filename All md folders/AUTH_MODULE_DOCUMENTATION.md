# Authentication Module Documentation

## Overview

Complete authentication module for the Smart Gate Pass Management System with JWT-based authentication, role-based authorization, and comprehensive user management.

---

## Files Generated

### Utilities
- `server/src/utils/jwt.js` - JWT token generation and verification
- `server/src/utils/bcrypt.js` - Password hashing and comparison

### Middleware
- `server/src/middleware/auth.middleware.js` - JWT authentication middleware
- `server/src/middleware/role.middleware.js` - Role-based authorization middleware

### Services
- `server/src/services/auth.service.js` - Authentication business logic

### Controllers
- `server/src/controllers/auth.controller.js` - Authentication request handlers

### Routes
- `server/src/routes/auth.routes.js` - Authentication endpoints

---

## Features Implemented

### 1. Student Registration ✅
- Self-registration for students only
- Email validation and uniqueness check
- Password hashing with bcrypt
- Default role: STUDENT
- Returns JWT token on success

### 2. Login ✅
- Email and password validation
- Account active status check
- Last login timestamp update
- JWT token generation
- Returns user data and token

### 3. JWT Authentication ✅
- Token generation with user ID and role
- Token verification and validation
- Token expiration handling
- Automatic token refresh capability

### 4. Role-Based Authorization ✅
- 5 roles: STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
- Role-specific middleware functions
- Flexible authorization with multiple roles
- Granular permission control

### 5. Protected Routes ✅
- Authentication middleware for protected endpoints
- Role middleware for role-specific endpoints
- Automatic user context injection

### 6. Logout ✅
- Client-side token invalidation
- Logout endpoint for consistency

### 7. Get Current User (/me) ✅
- Retrieve authenticated user data
- Include student information if applicable
- Exclude sensitive data (password)

### 8. Additional Features ✅
- Change password functionality
- User management (Admin only)
- User activation/deactivation
- User listing and retrieval

---

## API Endpoints

### Public Endpoints

#### Register Student
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}

Response (201):
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "STUDENT",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "STUDENT",
      "is_active": true,
      "last_login": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Endpoints (Requires Authentication)

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "STUDENT",
    "is_active": true,
    "last_login": "2024-01-15T10:30:00Z",
    "Student": {
      "id": 1,
      "usn": "USN123456",
      "program_type": "UG",
      "year_of_study": 2,
      "semester": 4,
      "gender": "MALE",
      "hostel_name": "Hostel A",
      "hostel_type": "BOYS",
      "room_number": "A101",
      "parent_phone": "9876543211",
      "emergency_contact": "9876543212"
    }
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "Logout successful"
  }
}
```

#### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```

### Admin Endpoints (Requires Admin Role)

#### Create User
```
POST /auth/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Coordinator",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "9876543220",
  "role": "COORDINATOR"
}

Response (201):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Jane Coordinator",
    "email": "jane@example.com",
    "phone": "9876543220",
    "role": "COORDINATOR",
    "is_active": true
  }
}
```

#### Get All Users
```
GET /auth/users
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "STUDENT",
      "is_active": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Jane Coordinator",
      "email": "jane@example.com",
      "phone": "9876543220",
      "role": "COORDINATOR",
      "is_active": true,
      "createdAt": "2024-01-15T10:05:00Z",
      "updatedAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

#### Get User by ID
```
GET /auth/users/:id
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "STUDENT",
    "is_active": true,
    "Student": {
      "id": 1,
      "usn": "USN123456",
      "program_type": "UG",
      "year_of_study": 2,
      "semester": 4,
      "gender": "MALE",
      "hostel_name": "Hostel A",
      "hostel_type": "BOYS",
      "room_number": "A101",
      "parent_phone": "9876543211",
      "emergency_contact": "9876543212"
    }
  }
}
```

#### Update User
```
PUT /auth/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543215",
  "is_active": true,
  "role": "STUDENT"
}

Response (200):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "9876543215",
    "role": "STUDENT",
    "is_active": true
  }
}
```

#### Deactivate User
```
POST /auth/users/:id/deactivate
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "message": "User deactivated successfully"
  }
}
```

#### Activate User
```
POST /auth/users/:id/activate
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "message": "User activated successfully"
  }
}
```

---

## Middleware Usage

### Authentication Middleware
```javascript
import { authenticate } from './middleware/auth.middleware.js'

// Protect a route
router.get('/protected', authenticate, controller)
```

### Role Middleware
```javascript
import { isAdmin, isStudent, authorize } from './middleware/role.middleware.js'

// Admin only
router.post('/admin-action', authenticate, isAdmin, controller)

// Student only
router.get('/student-data', authenticate, isStudent, controller)

// Multiple roles
router.post('/approval', authenticate, authorize('COORDINATOR', 'HOSTEL_STAFF'), controller)
```

---

## Validation Rules

### Registration
- **Name**: Required, string
- **Email**: Required, valid email format, unique
- **Password**: Required, minimum 6 characters
- **Phone**: Optional, string
- **Role**: Always set to 'STUDENT' (cannot be changed during registration)

### Login
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

### Change Password
- **Old Password**: Required, must match current password
- **New Password**: Required, minimum 6 characters

### Create User (Admin)
- **Name**: Required, string
- **Email**: Required, valid email format, unique
- **Password**: Required, minimum 6 characters
- **Phone**: Optional, string
- **Role**: Required, one of: STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN

---

## Error Handling

### Common Error Responses

#### Invalid Email or Password
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

#### Email Already Registered
```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 400
}
```

#### Insufficient Permissions
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

#### User Not Found
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

#### No Token Provided
```json
{
  "success": false,
  "message": "No token provided",
  "statusCode": 401
}
```

#### Token Expired
```json
{
  "success": false,
  "message": "Token has expired",
  "statusCode": 401
}
```

---

## JWT Token Structure

### Token Payload
```javascript
{
  id: 1,           // User ID
  role: 'STUDENT', // User role
  iat: 1234567890, // Issued at
  exp: 1234654290  // Expiration time
}
```

### Token Usage
```javascript
// Include in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Password Security

### Hashing
- Algorithm: bcrypt
- Salt rounds: 10
- Automatic hashing on user creation and password change

### Comparison
- Secure comparison using bcrypt.compare()
- Prevents timing attacks

### Requirements
- Minimum 6 characters
- No additional complexity requirements (can be customized)

---

## Role-Based Access Control

### Roles
1. **STUDENT** - Can apply for passes, view own data
2. **COORDINATOR** - Can approve long leave passes
3. **HOSTEL_STAFF** - Can approve daily and long leave passes
4. **SECURITY** - Can scan QR codes and log gate entries
5. **ADMIN** - Full system access, user management

### Role Hierarchy
```
ADMIN (highest)
├── COORDINATOR
├── HOSTEL_STAFF
├── SECURITY
└── STUDENT (lowest)
```

### Authorization Middleware
```javascript
// Single role
isAdmin(req, res, next)
isStudent(req, res, next)
isCoordinator(req, res, next)
isHostelStaff(req, res, next)
isSecurity(req, res, next)

// Multiple roles
authorize('ADMIN', 'COORDINATOR')(req, res, next)

// Combinations
isAdminOrCoordinator(req, res, next)
isAdminOrHostelStaff(req, res, next)
```

---

## User Registration Flow

### Student Self-Registration
```
1. User submits registration form
   ↓
2. Validate input (name, email, password)
   ↓
3. Check email uniqueness
   ↓
4. Hash password with bcrypt
   ↓
5. Create user with role = 'STUDENT'
   ↓
6. Generate JWT token
   ↓
7. Return user data and token
```

### Admin User Creation
```
1. Admin submits user creation form
   ↓
2. Validate input (name, email, password, role)
   ↓
3. Validate role is valid
   ↓
4. Check email uniqueness
   ↓
5. Hash password with bcrypt
   ↓
6. Create user with specified role
   ↓
7. Return user data (no token)
```

---

## Login Flow

```
1. User submits login form
   ↓
2. Validate input (email, password)
   ↓
3. Find user by email
   ↓
4. Check if user exists
   ↓
5. Check if user is active
   ↓
6. Compare password with hash
   ↓
7. Update last_login timestamp
   ↓
8. Generate JWT token
   ↓
9. Return user data and token
```

---

## Authentication Flow

```
1. Client sends request with Authorization header
   ↓
2. Extract token from header
   ↓
3. Verify token signature
   ↓
4. Check token expiration
   ↓
5. Decode token to get user ID and role
   ↓
6. Attach user to request object
   ↓
7. Continue to next middleware/controller
```

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_gate_pass
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Usage Examples

### Register as Student
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
  -H "Authorization: Bearer <token>"
```

### Create User (Admin)
```bash
curl -X POST http://localhost:5000/auth/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Coordinator",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "9876543220",
    "role": "COORDINATOR"
  }'
```

---

## Security Considerations

### Best Practices Implemented
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Role-based authorization
- ✅ Email uniqueness validation
- ✅ Account active status check
- ✅ Token expiration handling
- ✅ Secure password comparison
- ✅ Sensitive data exclusion (password)

### Recommendations
- Use HTTPS in production
- Store JWT_SECRET in environment variables
- Implement token blacklist for logout
- Add rate limiting for login attempts
- Implement CORS properly
- Use secure cookies for token storage
- Add request validation middleware
- Implement audit logging

---

## Testing

### Test Registration
```javascript
// Valid registration
POST /auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210"
}
// Expected: 201, user data with token

// Duplicate email
POST /auth/register
{
  "name": "Another User",
  "email": "test@example.com",
  "password": "password123"
}
// Expected: 400, "Email already registered"

// Invalid password
POST /auth/register
{
  "name": "Test User",
  "email": "test2@example.com",
  "password": "123"
}
// Expected: 400, "Password must be at least 6 characters"
```

### Test Login
```javascript
// Valid login
POST /auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
// Expected: 200, user data with token

// Invalid password
POST /auth/login
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
// Expected: 401, "Invalid email or password"

// Non-existent user
POST /auth/login
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
// Expected: 401, "Invalid email or password"
```

---

## Troubleshooting

### Issue: "No token provided"
**Solution**: Include Authorization header with Bearer token
```
Authorization: Bearer <token>
```

### Issue: "Token has expired"
**Solution**: Login again to get a new token

### Issue: "Invalid token"
**Solution**: Ensure token is not corrupted and matches JWT_SECRET

### Issue: "Insufficient permissions"
**Solution**: Ensure user has required role for the endpoint

### Issue: "Email already registered"
**Solution**: Use a different email or login with existing account

### Issue: "User not found"
**Solution**: Ensure user ID is correct and user exists

---

## Status

✅ **Authentication Module Complete**

All features implemented and tested:
- ✅ Student registration
- ✅ Login with JWT
- ✅ Role-based authorization
- ✅ Protected routes
- ✅ Password hashing
- ✅ User management (Admin)
- ✅ Comprehensive error handling
- ✅ Validation logic

---

**Document Version**: 1.0  
**Status**: Complete  
**Last Updated**: 2024

