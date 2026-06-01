# Frontend Authentication - Quick Reference Guide

## File Locations

```
client/src/
├── api/axios.js                    # HTTP client
├── api/auth.api.js                 # API functions
├── context/AuthContext.jsx         # Auth state
├── hooks/useAuth.js                # Auth hook
├── pages/Auth/Landing.jsx          # Landing page
├── pages/Auth/Login.jsx            # Login page
├── pages/Auth/Register.jsx         # Register page
├── routes/PrivateRoute.jsx         # Auth guard
├── routes/RoleRoute.jsx            # Role guard
├── routes/AppRoutes.jsx            # Routes config
├── App.jsx                         # Root component
└── main.jsx                        # Entry point
```

---

## Quick Start

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
cd client
npm run dev
```

### 3. Access Application
```
http://localhost:5173
```

---

## Common Tasks

### Use Auth Context
```javascript
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, token, login, logout, isAuthenticated, hasRole } = useAuth()
  
  if (!isAuthenticated()) {
    return <div>Please login</div>
  }
  
  return <div>Welcome {user.name}</div>
}
```

### Protect a Route
```javascript
import PrivateRoute from './routes/PrivateRoute'
import RoleRoute from './routes/RoleRoute'

// Require authentication
<PrivateRoute>
  <StudentDashboard />
</PrivateRoute>

// Require specific role
<RoleRoute allowedRoles={['STUDENT']}>
  <StudentDashboard />
</RoleRoute>

// Multiple roles
<RoleRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
  <AdminPanel />
</RoleRoute>
```

### Make API Call
```javascript
import axiosInstance from '../api/axios'

// Token is automatically attached
const response = await axiosInstance.get('/auth/me')
const response = await axiosInstance.post('/auth/login', { email, password })
```

### Check User Role
```javascript
const { hasRole } = useAuth()

if (hasRole('ADMIN')) {
  // Show admin features
}

if (hasRole(['ADMIN', 'COORDINATOR'])) {
  // Show admin or coordinator features
}
```

### Handle Login
```javascript
const { login } = useAuth()

const result = await login(email, password)
if (result.success) {
  // User logged in, redirect happens automatically
} else {
  // Show error: result.error
}
```

### Handle Logout
```javascript
const { logout } = useAuth()

await logout()
// User is logged out, redirected to login
```

---

## API Endpoints

### Register
```javascript
POST /auth/register
{
  name: string,
  email: string,
  password: string,
  phone: string (optional)
}
```

### Login
```javascript
POST /auth/login
{
  email: string,
  password: string
}
```

### Get Current User
```javascript
GET /auth/me
// Requires: Authorization: Bearer {token}
```

### Logout
```javascript
POST /auth/logout
// Requires: Authorization: Bearer {token}
```

### Change Password
```javascript
POST /auth/change-password
{
  oldPassword: string,
  newPassword: string
}
// Requires: Authorization: Bearer {token}
```

---

## Response Format

### Success
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... }
}
```

### Error
```javascript
{
  success: false,
  message: "Error description"
}
```

---

## Role Names

```javascript
'STUDENT'
'COORDINATOR'
'HOSTEL_STAFF'
'SECURITY'
'ADMIN'
```

---

## Validation Rules

### Email
- Required
- Valid format (user@domain.com)
- Unique on backend

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Name
- Required
- Non-empty

### Phone
- Optional
- Any format

---

## localStorage Keys

```javascript
localStorage.getItem('token')    // JWT token
localStorage.getItem('user')     // User JSON object
```

---

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:5000
```

---

## Redirect Routes

After login, users are redirected based on role:

```javascript
STUDENT → /student
COORDINATOR → /coordinator
HOSTEL_STAFF → /hostel
SECURITY → /security
ADMIN → /admin
```

---

## Error Messages

### Validation Errors
- "Name is required"
- "Email is required"
- "Invalid email format"
- "Password is required"
- "Password must be at least 8 characters"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one number"
- "Please confirm your password"
- "Passwords do not match"

### API Errors
- "Login failed"
- "Registration failed"
- "Invalid credentials"
- "Email already exists"
- "User not found"

---

## Debugging

### Check Token
```javascript
console.log(localStorage.getItem('token'))
```

### Check User
```javascript
console.log(JSON.parse(localStorage.getItem('user')))
```

### Check Auth State
```javascript
const { user, token, isAuthenticated } = useAuth()
console.log({ user, token, isAuthenticated: isAuthenticated() })
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform login
4. Check requests and responses

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors and warnings

---

## Common Patterns

### Protected Component
```javascript
import { useAuth } from '../hooks/useAuth'

function ProtectedComponent() {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }
  
  return <div>Welcome {user.name}</div>
}
```

### Role-Protected Component
```javascript
import { useAuth } from '../hooks/useAuth'

function AdminComponent() {
  const { hasRole } = useAuth()
  
  if (!hasRole('ADMIN')) {
    return <Navigate to="/unauthorized" />
  }
  
  return <div>Admin Panel</div>
}
```

### API Call with Error Handling
```javascript
import axiosInstance from '../api/axios'

async function fetchData() {
  try {
    const response = await axiosInstance.get('/api/data')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, user redirected to login
    } else {
      console.error('Error:', error.response?.data?.message)
    }
  }
}
```

### Form with Validation
```javascript
const [errors, setErrors] = useState({})

const validateForm = () => {
  const newErrors = {}
  
  if (!email) newErrors.email = 'Email is required'
  if (!password) newErrors.password = 'Password is required'
  
  return newErrors
}

const handleSubmit = (e) => {
  e.preventDefault()
  const newErrors = validateForm()
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }
  
  // Submit form
}
```

---

## Testing Checklist

- [ ] Can register new account
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Session persists on page refresh
- [ ] Can logout
- [ ] Cannot access protected routes without login
- [ ] Role-based redirect works
- [ ] Cannot access routes with wrong role
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] No console errors

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Check backend CORS configuration

### Issue: 404 on API
**Solution**: Verify backend server is running

### Issue: Token Not Persisting
**Solution**: Check localStorage is enabled

### Issue: Redirect Loop
**Solution**: Check role-based routes configuration

### Issue: Validation Not Working
**Solution**: Check browser console for errors

---

## Performance Tips

1. Use `useCallback` for event handlers
2. Use `useMemo` for expensive computations
3. Lazy load route components
4. Minimize re-renders with proper dependencies
5. Use React DevTools Profiler to identify bottlenecks

---

## Security Tips

1. Never store sensitive data in localStorage
2. Always use HTTPS in production
3. Validate all inputs on frontend and backend
4. Use strong password requirements
5. Implement rate limiting on backend
6. Use CORS properly
7. Sanitize user input
8. Keep dependencies updated

---

## Resources

- **Frontend Auth Docs**: FRONTEND_AUTH_DOCUMENTATION.md
- **Testing Guide**: FRONTEND_AUTH_TESTING_GUIDE.md
- **Completion Summary**: FRONTEND_AUTH_COMPLETION_SUMMARY.md
- **Backend Auth Docs**: AUTH_CORRECTIONS_APPLIED.md
- **Backend Validation Rules**: AUTH_VALIDATION_RULES.md

---

## Support

For issues or questions:
1. Check the documentation files
2. Review the testing guide
3. Check browser console for errors
4. Check network requests in DevTools
5. Review the troubleshooting section

