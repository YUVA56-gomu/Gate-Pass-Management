# Admin Module - Quick Reference

## File Structure

```
Backend:
- server/src/services/admin.service.js
- server/src/controllers/admin.controller.js
- server/src/routes/admin.routes.js

Frontend:
- client/src/api/admin.api.js
- client/src/pages/Admin/Dashboard.jsx
- client/src/pages/Admin/Users.jsx
- client/src/pages/Admin/ActivityLogs.jsx
```

## API Endpoints

### Dashboard
```
GET /admin/dashboard
Authorization: Bearer <token>
Response: { success, message, data: { users, passes, security } }
```

### Users
```
GET /admin/users?filter=ALL|STUDENT|COORDINATOR|HOSTEL_STAFF|SECURITY|ADMIN
Authorization: Bearer <token>
Response: { success, message, data: [{ id, name, email, role, status, lastLogin, createdAt }] }

GET /admin/users/:id
Authorization: Bearer <token>
Response: { success, message, data: { id, name, email, role, phone, status, lastLogin, createdAt, updatedAt } }

POST /admin/users
Authorization: Bearer <token>
Body: { name, email, password, role, phone }
Response: { success, message, data: { id, name, email, role, phone, status, createdAt } }

PUT /admin/users/:id
Authorization: Bearer <token>
Body: { name, email, phone }
Response: { success, message, data: { id, name, email, role, phone, status, updatedAt } }

PUT /admin/users/:id/activate
Authorization: Bearer <token>
Response: { success, message, data: { id, name, email, role, status, updatedAt } }

PUT /admin/users/:id/deactivate
Authorization: Bearer <token>
Response: { success, message, data: { id, name, email, role, status, updatedAt } }

PUT /admin/users/:id/reset-password
Authorization: Bearer <token>
Response: { success, message, data: { id, name, email, temporaryPassword, message } }
```

### Activity Logs
```
GET /admin/activity-logs?limit=50
Authorization: Bearer <token>
Response: { success, message, data: [{ id, user, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent, timestamp }] }
```

## Frontend Routes

```
/admin                    → Dashboard
/admin/dashboard          → Dashboard
/admin/users              → User Management
/admin/activity-logs      → Activity Logs
```

## Dashboard Statistics

| Card | Calculation |
|------|-------------|
| Total Students | COUNT(users WHERE role='STUDENT') |
| Total Coordinators | COUNT(users WHERE role='COORDINATOR') |
| Total Hostel Staff | COUNT(users WHERE role='HOSTEL_STAFF') |
| Total Security Staff | COUNT(users WHERE role='SECURITY') |
| Total Admins | COUNT(users WHERE role='ADMIN') |
| Total Passes | COUNT(passes) |
| Approved Passes | COUNT(passes WHERE status='APPROVED') |
| Rejected Passes | COUNT(passes WHERE status='REJECTED') |
| Students Outside | COUNT(pass_id WHERE OUT exists AND IN missing today) |

## User Roles

| Role | Can Create | Can Manage |
|------|-----------|-----------|
| STUDENT | No | No |
| COORDINATOR | No | No |
| HOSTEL_STAFF | No | No |
| SECURITY | No | No |
| ADMIN | Yes | Yes |

## Allowed Staff Roles

Admin can create:
- ✅ COORDINATOR
- ✅ HOSTEL_STAFF
- ✅ SECURITY
- ✅ ADMIN

Admin cannot create:
- ❌ STUDENT (use registration flow)

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## User Filters

| Filter | Shows |
|--------|-------|
| ALL | All users |
| STUDENT | Students only |
| COORDINATOR | Coordinators only |
| HOSTEL_STAFF | Hostel staff only |
| SECURITY | Security staff only |
| ADMIN | Admins only |

## Activity Log Limits

| Limit | Description |
|-------|-------------|
| 10 | Last 10 logs |
| 25 | Last 25 logs |
| 50 | Last 50 logs |
| 100 | Last 100 logs |
| 500 | Last 500 logs |

## Error Messages

| Error | Meaning |
|-------|---------|
| User not found | User ID doesn't exist |
| Email already exists | Email is unique |
| Invalid email format | Email format incorrect |
| Password must be at least 8 characters | Password too short |
| Invalid role | Role not allowed |
| User is already active | User already active |
| User is already inactive | User already inactive |
| Invalid filter | Filter not recognized |
| Limit must be a number between 1 and 500 | Limit out of range |

## Security Rules

✅ **Allowed:**
- ADMIN role users only
- Authenticated users with valid JWT
- Creating staff accounts
- Managing user status

❌ **Not Allowed:**
- STUDENT role access
- COORDINATOR role access
- HOSTEL_STAFF role access
- SECURITY role access
- Unauthenticated requests
- Creating STUDENT accounts via API

## Testing Commands

### Test Get Dashboard
```bash
curl -X GET http://localhost:5000/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

### Test Get Users
```bash
curl -X GET "http://localhost:5000/admin/users?filter=COORDINATOR" \
  -H "Authorization: Bearer <token>"
```

### Test Create User
```bash
curl -X POST http://localhost:5000/admin/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Coordinator",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "COORDINATOR",
    "phone": "9876543210"
  }'
```

### Test Reset Password
```bash
curl -X PUT http://localhost:5000/admin/users/5/reset-password \
  -H "Authorization: Bearer <token>"
```

### Test Get Activity Logs
```bash
curl -X GET "http://localhost:5000/admin/activity-logs?limit=50" \
  -H "Authorization: Bearer <token>"
```

## Common Issues

### Issue: "Insufficient permissions"
- **Cause:** User doesn't have ADMIN role
- **Solution:** Ensure user has ADMIN role assigned

### Issue: "User not found"
- **Cause:** User ID doesn't exist
- **Solution:** Verify user ID is correct

### Issue: "Email already exists"
- **Cause:** Email is already in use
- **Solution:** Use different email address

### Issue: "Invalid role"
- **Cause:** Role not allowed for creation
- **Solution:** Use COORDINATOR, HOSTEL_STAFF, SECURITY, or ADMIN

## Performance Notes

- Dashboard auto-refreshes every 30 seconds
- Activity logs load with configurable limit
- User filtering is fast with proper indexing
- Statistics calculated from actual database records

## Future Enhancements

1. User roles management
2. Advanced filtering (date range, department)
3. Bulk operations (activate, deactivate, reset)
4. Reports (activity, statistics)
5. Audit trail with rollback
6. User import/export (CSV)
