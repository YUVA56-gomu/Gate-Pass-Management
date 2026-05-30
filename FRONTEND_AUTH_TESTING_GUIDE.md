# Frontend Authentication Testing Guide

## Quick Start

### Prerequisites
- Node.js installed
- Backend server running on `http://localhost:5000`
- Frontend configured with `VITE_API_BASE_URL=http://localhost:5000`

### Start Servers

**Terminal 1 - Backend**:
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd client
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173` (or similar)

---

## Test Scenarios

### Test 1: Registration Flow

**Steps**:
1. Navigate to `http://localhost:5173`
2. Click "Register" button
3. Fill form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Password: `Password123`
   - Confirm Password: `Password123`
4. Click "Register"

**Expected Results**:
- ✅ Success message displayed
- ✅ Auto-redirect to login page after 2 seconds
- ✅ No console errors
- ✅ Backend creates User record with role = STUDENT

**Validation Tests**:
- Empty name → Error: "Name is required"
- Invalid email → Error: "Invalid email format"
- Password < 8 chars → Error: "Password must be at least 8 characters"
- Password without uppercase → Error: "Password must contain at least one uppercase letter"
- Password without lowercase → Error: "Password must contain at least one lowercase letter"
- Password without number → Error: "Password must contain at least one number"
- Passwords don't match → Error: "Passwords do not match"
- Duplicate email → Error from backend

---

### Test 2: Login Flow

**Steps**:
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `Password123`
3. Click "Login"

**Expected Results**:
- ✅ Redirect to `/student` (STUDENT role)
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ No console errors

**Check localStorage**:
```javascript
// In browser console
localStorage.getItem('token')     // Should return JWT token
localStorage.getItem('user')      // Should return user JSON
```

**Validation Tests**:
- Empty email → Error: "Email is required"
- Invalid email → Error: "Invalid email format"
- Empty password → Error: "Password is required"
- Wrong password → Error from backend
- Non-existent email → Error from backend

---

### Test 3: Role-Based Redirect

**Setup**: Create users with different roles (via backend admin endpoint)

**Test STUDENT Role**:
1. Login as student
2. Verify redirect to `/student`
3. Try accessing `/admin` → Should redirect to `/unauthorized`

**Test COORDINATOR Role**:
1. Login as coordinator
2. Verify redirect to `/coordinator`
3. Try accessing `/student` → Should redirect to `/unauthorized`

**Test HOSTEL_STAFF Role**:
1. Login as hostel staff
2. Verify redirect to `/hostel`
3. Try accessing `/security` → Should redirect to `/unauthorized`

**Test SECURITY Role**:
1. Login as security
2. Verify redirect to `/security`
3. Try accessing `/admin` → Should redirect to `/unauthorized`

**Test ADMIN Role**:
1. Login as admin
2. Verify redirect to `/admin`
3. Can access all admin routes

---

### Test 4: Session Persistence

**Steps**:
1. Login successfully
2. Verify token in localStorage
3. Refresh page (F5)
4. Verify user still logged in
5. Verify no redirect to login

**Expected Results**:
- ✅ User remains logged in after refresh
- ✅ Token still valid
- ✅ Dashboard loads without re-login
- ✅ No console errors

---

### Test 5: Protected Routes

**Test Without Authentication**:
1. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Navigate to `/student`
3. Should redirect to `/login`

**Test With Authentication**:
1. Login successfully
2. Navigate to `/student`
3. Should load student dashboard
4. Navigate to `/coordinator`
5. Should redirect to `/unauthorized` (wrong role)

---

### Test 6: Logout

**Steps**:
1. Login successfully
2. Click logout button (in navbar/sidebar)
3. Verify redirect to `/login`
4. Check localStorage is cleared:
   ```javascript
   localStorage.getItem('token')     // Should be null
   localStorage.getItem('user')      // Should be null
   ```
5. Try accessing `/student`
6. Should redirect to `/login`

**Expected Results**:
- ✅ Redirect to login page
- ✅ localStorage cleared
- ✅ Cannot access protected routes
- ✅ No console errors

---

### Test 7: Token Expiration (401 Response)

**Steps**:
1. Login successfully
2. Manually delete token from localStorage:
   ```javascript
   localStorage.removeItem('token')
   ```
3. Try accessing protected route
4. Should redirect to `/login`

**Expected Results**:
- ✅ Auto-redirect to login on 401
- ✅ localStorage cleared
- ✅ User prompted to login again

---

### Test 8: API Error Handling

**Test Invalid Credentials**:
1. Go to login page
2. Enter wrong password
3. Should show error message from backend

**Test Network Error**:
1. Stop backend server
2. Try to login
3. Should show generic error message

**Test Validation Error**:
1. Go to register page
2. Enter duplicate email
3. Should show backend validation error

---

## Browser DevTools Checks

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Login
4. Check requests:
   - POST /auth/login → 200 OK
   - Response contains `{ success: true, data: { user, token } }`
   - Token is JWT format (3 parts separated by dots)

### Application Tab
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Check stored values:
   - `token` - JWT token
   - `user` - User JSON object

### Console Tab
1. Open DevTools (F12)
2. Go to Console tab
3. Check for errors:
   - No 404 errors
   - No CORS errors
   - No undefined reference errors

---

## Common Issues & Solutions

### Issue: CORS Error
**Symptom**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Verify backend has CORS enabled
- Check `VITE_API_BASE_URL` matches backend URL
- Restart backend server

### Issue: 404 on API Calls
**Symptom**: `POST /auth/login 404 Not Found`

**Solution**:
- Verify backend server is running
- Check backend routes are defined
- Verify API base URL is correct

### Issue: Token Not Persisting
**Symptom**: User logged out after page refresh

**Solution**:
- Check localStorage is enabled in browser
- Verify token is being stored: `localStorage.getItem('token')`
- Check browser privacy settings

### Issue: Redirect Loop
**Symptom**: Infinite redirect between login and dashboard

**Solution**:
- Check user role is correct
- Verify role-based routes are configured
- Check RoleRoute component logic

### Issue: Validation Not Working
**Symptom**: Form submits with invalid data

**Solution**:
- Check browser console for errors
- Verify validation functions are called
- Check form field names match validation logic

---

## Performance Checks

### Load Time
1. Open DevTools (F12)
2. Go to Performance tab
3. Record page load
4. Check metrics:
   - First Contentful Paint < 2s
   - Largest Contentful Paint < 3s
   - Cumulative Layout Shift < 0.1

### Bundle Size
1. Check frontend build size:
   ```bash
   cd client
   npm run build
   ```
2. Verify bundle is reasonable (< 500KB gzipped)

### API Response Time
1. Open DevTools Network tab
2. Check API response times:
   - /auth/login < 500ms
   - /auth/register < 500ms
   - /auth/me < 200ms

---

## Security Checks

### 1. Password Security
- [ ] Password not visible in network requests (POST body)
- [ ] Password not stored in localStorage
- [ ] Password not logged in console
- [ ] Password hashed on backend

### 2. Token Security
- [ ] Token stored in localStorage (not cookies for now)
- [ ] Token sent in Authorization header
- [ ] Token cleared on logout
- [ ] Token cleared on 401 response

### 3. Email Validation
- [ ] Email trimmed before sending
- [ ] Email lowercased before sending
- [ ] Email format validated
- [ ] Email uniqueness validated on backend

### 4. Role-Based Access
- [ ] Users can only access their role's routes
- [ ] Unauthorized access redirects to /unauthorized
- [ ] Role cannot be changed via frontend
- [ ] Role validated on backend

---

## Regression Testing

After any changes, verify:

1. **Registration**:
   - [ ] Can register new student
   - [ ] Validation works
   - [ ] Success message displays
   - [ ] Redirect to login works

2. **Login**:
   - [ ] Can login with valid credentials
   - [ ] Redirect based on role works
   - [ ] Token stored in localStorage
   - [ ] Invalid credentials show error

3. **Protected Routes**:
   - [ ] Cannot access without login
   - [ ] Can access with correct role
   - [ ] Cannot access with wrong role
   - [ ] Redirect works correctly

4. **Session**:
   - [ ] Session persists on refresh
   - [ ] Logout clears session
   - [ ] Token expiration handled

5. **UI**:
   - [ ] No console errors
   - [ ] No broken links
   - [ ] Forms are responsive
   - [ ] Error messages display correctly

---

## Test Data

### Valid Test Credentials

**Student**:
```
Email: student@example.com
Password: Student123
```

**Coordinator**:
```
Email: coordinator@example.com
Password: Coordinator123
```

**Hostel Staff**:
```
Email: hostel@example.com
Password: Hostel123
```

**Security**:
```
Email: security@example.com
Password: Security123
```

**Admin**:
```
Email: admin@example.com
Password: Admin123
```

---

## Completion Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Registration flow works
- [ ] Login flow works
- [ ] Role-based redirect works
- [ ] Session persistence works
- [ ] Protected routes work
- [ ] Logout works
- [ ] Token expiration handled
- [ ] Error handling works
- [ ] No console errors
- [ ] localStorage working
- [ ] Network requests correct
- [ ] All validation works
- [ ] Security checks passed

---

## Next Steps

Once all tests pass:
1. Create dashboard components for each role
2. Implement pass management features
3. Add approval workflows
4. Implement QR code generation
5. Add notifications system
6. Create reporting features

