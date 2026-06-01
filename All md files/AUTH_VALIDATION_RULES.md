# Authentication Module - Validation Rules

## Complete Validation Rules Reference

---

## Email Validation

### Rules
- ✅ Required field
- ✅ Must be valid email format
- ✅ Must be unique (not already registered)
- ✅ Trimmed before validation
- ✅ Converted to lowercase
- ✅ Cannot be empty string

### Format
```
user@example.com
john.doe@company.co.uk
test+tag@domain.org
```

### Validation Logic
```javascript
const normalizeEmail = (email) => {
  return email.trim().toLowerCase()
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
}
```

### Error Messages
- `"Email cannot be empty"` - Empty string after trim
- `"Invalid email format"` - Doesn't match regex
- `"Email already registered"` - Already exists in database

### Applied During
- ✅ Registration
- ✅ Login
- ✅ User Creation (Admin)

---

## Password Validation

### Requirements
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ Cannot be empty string

### Valid Examples
- `MyPassword123`
- `SecurePass2024`
- `Admin@Pass99`
- `Welcome123`
- `Test@Pass456`

### Invalid Examples
- `password123` - No uppercase
- `PASSWORD123` - No lowercase
- `MyPassword` - No number
- `MyPass1` - Only 7 characters
- `MyPass` - No number, only 5 characters

### Validation Logic
```javascript
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number')
  }
}
```

### Error Messages
- `"Password must be at least 8 characters"` - Too short
- `"Password must contain at least one uppercase letter"` - Missing uppercase
- `"Password must contain at least one lowercase letter"` - Missing lowercase
- `"Password must contain at least one number"` - Missing number

### Applied During
- ✅ Registration
- ✅ User Creation (Admin)
- ✅ Password Change

---

## Name Validation

### Rules
- ✅ Required field
- ✅ Cannot be empty string
- ✅ Trimmed before storage
- ✅ No length limit (reasonable max in DB)

### Valid Examples
- `John Doe`
- `Jane Smith`
- `Dr. Robert Johnson`
- `Maria García`

### Invalid Examples
- `` (empty string)
- `   ` (only spaces)

### Validation Logic
```javascript
if (!name || name.trim().length === 0) {
  throw new Error('Name cannot be empty')
}
```

### Error Messages
- `"Name cannot be empty"` - Empty or only spaces

### Applied During
- ✅ Registration
- ✅ User Creation (Admin)
- ✅ User Update (Admin)

---

## Phone Validation

### Rules
- ✅ Optional field
- ✅ Trimmed before storage
- ✅ No format validation (flexible)
- ✅ Stored as string

### Valid Examples
- `9876543210`
- `+91 9876543210`
- `(987) 654-3210`
- `987-654-3210`

### Validation Logic
```javascript
phone: phone ? phone.trim() : null
```

### Applied During
- ✅ Registration
- ✅ User Creation (Admin)
- ✅ User Update (Admin)

---

## Role Validation

### Registration
- ✅ Always set to `STUDENT`
- ✅ Cannot be changed during registration
- ✅ No role parameter accepted

### User Creation (Admin)
- ✅ Required field
- ✅ Must be one of: COORDINATOR, HOSTEL_STAFF, SECURITY
- ✅ ADMIN role NOT allowed via API
- ✅ STUDENT role NOT allowed via API

### Valid Roles for API Creation
```javascript
const validRoles = ['COORDINATOR', 'HOSTEL_STAFF', 'SECURITY']
```

### Invalid Roles for API Creation
- ❌ ADMIN (must be created manually)
- ❌ STUDENT (use registration endpoint)

### Error Messages
- `"Invalid role. Must be one of: COORDINATOR, HOSTEL_STAFF, SECURITY. ADMIN accounts must be created manually."` - Invalid role

### Applied During
- ✅ User Creation (Admin)
- ✅ User Update (Admin)

---

## Login Validation

### Email Validation
- ✅ Required field
- ✅ Cannot be empty string
- ✅ Trimmed before validation
- ✅ Converted to lowercase
- ✅ Must be valid email format

### Password Validation
- ✅ Required field
- ✅ Cannot be empty string
- ✅ Compared with stored hash

### Account Status
- ✅ User must exist
- ✅ User must be active (is_active = true)

### Error Messages
- `"Email and password are required"` - Missing fields
- `"Email cannot be empty"` - Empty email
- `"Password cannot be empty"` - Empty password
- `"Invalid email format"` - Invalid format
- `"Invalid email or password"` - User not found or password wrong
- `"User account is inactive"` - User is_active = false

### Validation Logic
```javascript
// Normalize email
const normalizedEmail = normalizeEmail(email)

// Validate email
validateEmail(normalizedEmail)

// Find user
const user = await User.findOne({ where: { email: normalizedEmail } })

// Check active status
if (!user.is_active) {
  throw new Error('User account is inactive')
}

// Compare password
const isPasswordValid = await comparePassword(password, user.password)
```

---

## Change Password Validation

### Old Password
- ✅ Required field
- ✅ Cannot be empty string
- ✅ Must match current password

### New Password
- ✅ Required field
- ✅ Cannot be empty string
- ✅ Must meet strength requirements (8 chars, uppercase, lowercase, number)

### Error Messages
- `"Old password and new password are required"` - Missing fields
- `"Passwords cannot be empty"` - Empty passwords
- `"Password must be at least 8 characters"` - Too short
- `"Password must contain at least one uppercase letter"` - Missing uppercase
- `"Password must contain at least one lowercase letter"` - Missing lowercase
- `"Password must contain at least one number"` - Missing number
- `"Old password is incorrect"` - Wrong old password
- `"User not found"` - User doesn't exist

---

## User Update Validation (Admin)

### Name
- ✅ Optional field
- ✅ If provided, cannot be empty
- ✅ Trimmed before storage

### Phone
- ✅ Optional field
- ✅ If provided, trimmed before storage

### Role
- ✅ Optional field
- ✅ If provided, must be one of: COORDINATOR, HOSTEL_STAFF, SECURITY
- ✅ ADMIN role NOT allowed
- ✅ STUDENT role NOT allowed

### is_active
- ✅ Optional field
- ✅ Boolean value
- ✅ Can be true or false

### Error Messages
- `"User not found"` - User doesn't exist
- `"Invalid role. Must be one of: COORDINATOR, HOSTEL_STAFF, SECURITY. ADMIN role cannot be assigned through API."` - Invalid role

---

## JWT Token Validation

### Token Structure
```javascript
{
  id: number,        // User ID
  role: string,      // User role
  email: string,     // User email
  iat: number,       // Issued at (auto)
  exp: number        // Expiration (auto)
}
```

### Validation Rules
- ✅ Token must be present in Authorization header
- ✅ Token must be valid JWT
- ✅ Token must not be expired
- ✅ Token signature must match JWT_SECRET

### Error Messages
- `"No token provided"` - Missing Authorization header
- `"Invalid token"` - Token corrupted or invalid signature
- `"Token has expired"` - Token expiration time exceeded

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Request Validation

### Required Fields by Endpoint

#### POST /auth/register
- ✅ name (required, non-empty)
- ✅ email (required, valid format, unique)
- ✅ password (required, strength validation)
- ✅ phone (optional)

#### POST /auth/login
- ✅ email (required, valid format)
- ✅ password (required, non-empty)

#### POST /auth/change-password
- ✅ oldPassword (required, non-empty)
- ✅ newPassword (required, strength validation)

#### POST /auth/users (Admin)
- ✅ name (required, non-empty)
- ✅ email (required, valid format, unique)
- ✅ password (required, strength validation)
- ✅ phone (optional)
- ✅ role (required, valid role)

#### PUT /auth/users/:id (Admin)
- ✅ name (optional, non-empty if provided)
- ✅ phone (optional)
- ✅ is_active (optional, boolean)
- ✅ role (optional, valid role)

---

## Validation Flow Diagram

```
Request
  ↓
Extract Data
  ↓
Validate Required Fields
  ↓
Normalize Data (trim, lowercase)
  ↓
Validate Format (email, password strength)
  ↓
Check Uniqueness (email)
  ↓
Check Business Rules (role, active status)
  ↓
Process Request
  ↓
Return Response
```

---

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication error)
- `403` - Forbidden (authorization error)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

### Example Error Responses

#### Validation Error
```json
{
  "success": false,
  "message": "Password must be at least 8 characters"
}
```

#### Authentication Error
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Authorization Error
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Validation Helper Functions

### Email Normalization
```javascript
const normalizeEmail = (email) => {
  return email.trim().toLowerCase()
}
```

### Email Validation
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
}
```

### Password Strength Validation
```javascript
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number')
  }
}
```

---

## Testing Validation

### Test Cases

#### Email Validation
```javascript
// Valid emails
validateEmail('user@example.com')      // ✅ Pass
validateEmail('john.doe@company.co.uk') // ✅ Pass
validateEmail('test+tag@domain.org')   // ✅ Pass

// Invalid emails
validateEmail('user@')                 // ❌ Fail
validateEmail('@example.com')          // ❌ Fail
validateEmail('user@.com')             // ❌ Fail
validateEmail('user name@example.com') // ❌ Fail
```

#### Password Validation
```javascript
// Valid passwords
validatePasswordStrength('MyPassword123')  // ✅ Pass
validatePasswordStrength('SecurePass2024') // ✅ Pass
validatePasswordStrength('Admin@Pass99')   // ✅ Pass

// Invalid passwords
validatePasswordStrength('password123')    // ❌ Fail (no uppercase)
validatePasswordStrength('PASSWORD123')    // ❌ Fail (no lowercase)
validatePasswordStrength('MyPassword')     // ❌ Fail (no number)
validatePasswordStrength('MyPass1')        // ❌ Fail (only 7 chars)
```

---

## Summary

### Validation Coverage
- ✅ Email validation (format, uniqueness, normalization)
- ✅ Password validation (strength requirements)
- ✅ Name validation (non-empty)
- ✅ Phone validation (optional, trimmed)
- ✅ Role validation (allowed roles)
- ✅ Login validation (credentials, account status)
- ✅ JWT validation (token format, expiration)
- ✅ API request validation (required fields)

### Error Handling
- ✅ User-friendly error messages
- ✅ Specific error descriptions
- ✅ Proper HTTP status codes
- ✅ Consistent response format

### Security
- ✅ Email normalization (prevents duplicates)
- ✅ Password strength requirements
- ✅ Account active status check
- ✅ Token expiration handling
- ✅ Secure password comparison

---

**Validation Rules Version**: 1.0  
**Status**: Complete  
**Last Updated**: 2024

