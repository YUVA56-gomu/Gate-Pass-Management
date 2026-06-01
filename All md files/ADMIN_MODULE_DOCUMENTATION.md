# Admin Module Documentation

## Overview

The Admin Module provides comprehensive system administration capabilities for the Smart Gate Pass Management System. It enables admins to manage users, view system statistics, and monitor activity logs.

## Architecture

### Backend Components

#### 1. Admin Service (`server/src/services/admin.service.js`)
Core business logic for admin operations.

**Key Functions:**

- `getDashboardStats()` - Get system statistics
  - Counts users by role (Students, Coordinators, Hostel Staff, Security, Admins)
  - Counts passes by status (Total, Approved, Rejected)
  - Calculates students outside (OUT without IN today)
  - All calculations from actual database records

- `getAllUsers(filter)` - Get all users with optional filtering
  - Supports filters: ALL, STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
  - Returns user list with status and last login

- `getUserById(userId)` - Get user details by ID
  - Returns complete user information

- `createUser(data)` - Create new staff account
  - Only allows: COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
  - Students use registration flow
  - Validates email, password strength
  - Hashes password before storage

- `updateUser(userId, data)` - Update user information
  - Can update: name, email, phone
  - Cannot change role through this endpoint

- `activateUser(userId)` - Activate deactivated user
- `deactivateUser(userId)` - Deactivate active user
- `resetUserPassword(userId)` - Reset user password to temporary password
- `getActivityLogs(limit)` - Get recent activity logs

#### 2. Admin Controller (`server/src/controllers/admin.controller.js`)
HTTP request handlers for admin endpoints.

**Endpoints:**

- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/users?filter=...` - Get all users with filters
- `GET /admin/users/:id` - Get user by ID
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/activate` - Activate user
- `PUT /admin/users/:id/deactivate` - Deactivate user
- `PUT /admin/users/:id/reset-password` - Reset password
- `GET /admin/activity-logs?limit=50` - Get activity logs

#### 3. Admin Routes (`server/src/routes/admin.routes.js`)
Route definitions with authentication and authorization.

**Security:**
- All routes require `authenticate` middleware
- All routes require `isAdmin` role middleware
- No other role access

### Frontend Components

#### 1. Admin API (`client/src/api/admin.api.js`)
API client functions for admin endpoints.

**Functions:**
- `getDashboardStats()` - Get dashboard statistics
- `getAllUsers(filter)` - Get all users with filters
- `getUserById(userId)` - Get user details
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user
- `activateUser(userId)` - Activate user
- `deactivateUser(userId)` - Deactivate user
- `resetUserPassword(userId)` - Reset password
- `getActivityLogs(limit)` - Get activity logs

#### 2. Dashboard Page (`client/src/pages/Admin/Dashboard.jsx`)
Main admin dashboard with system statistics.

**Features:**
- User Statistics Cards:
  - Total Students
  - Total Coordinators
  - Total Hostel Staff
  - Total Security Staff
  - Total Admins
- Pass Statistics Cards:
  - Total Passes
  - Approved Passes
  - Rejected Passes
  - Students Outside
- Auto-refresh every 30 seconds
- Quick action buttons

#### 3. Users Page (`client/src/pages/Admin/Users.jsx`)
User management interface.

**Features:**
- Users table with columns:
  - Name
  - Email
  - Role
  - Status (ACTIVE/INACTIVE)
  - Last Login
  - Created Date
- Filter buttons: ALL, STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
- Create User modal with form
- Activate/Deactivate buttons
- Reset Password button
- Loading and empty states

#### 4. Activity Logs Page (`client/src/pages/Admin/ActivityLogs.jsx`)
System activity monitoring.

**Features:**
- Activity logs table with columns:
  - User (Name, Email)
  - Role
  - Action
  - Entity (Type and ID)
  - Timestamp
- Limit selector (10, 25, 50, 100, 500)
- Loading and empty states
- Color-coded role badges

## Database Models

### User Model
```javascript
{
  id: INTEGER (PK),
  name: STRING,
  email: STRING (UNIQUE),
  password: STRING,
  role: ENUM('STUDENT', 'COORDINATOR', 'HOSTEL_STAFF', 'SECURITY', 'ADMIN'),
  phone: STRING,
  is_active: BOOLEAN,
  last_login: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

### ActivityLog Model
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK),
  action: STRING,
  entity_type: STRING,
  entity_id: INTEGER,
  old_values: JSON,
  new_values: JSON,
  ip_address: STRING,
  user_agent: STRING,
  createdAt: DATE
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "totalStudents": 150,
      "totalCoordinators": 5,
      "totalHostelStaff": 10,
      "totalSecurityStaff": 8,
      "totalAdmins": 2
    },
    "passes": {
      "totalPasses": 500,
      "approvedPasses": 450,
      "rejectedPasses": 30
    },
    "security": {
      "studentsOutside": 12
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid filter. Use: ALL, STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, or ADMIN"
}
```

## User Management

### Create User (Staff Account)
**Allowed Roles:** COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
**Not Allowed:** STUDENT (use registration flow)

**Validation:**
- Name required
- Email required and unique
- Password required (8+ chars, uppercase, lowercase, number)
- Role required
- Email format validation

### Update User
**Can Update:** Name, Email, Phone
**Cannot Update:** Role (use separate endpoint if needed)

### Activate/Deactivate User
- Toggle user active status
- Prevents login when inactive

### Reset Password
- Generates temporary password
- User must change on first login
- Password hashed before storage

## Dashboard Statistics

### Users Section
- **Total Students:** Count of STUDENT role users
- **Total Coordinators:** Count of COORDINATOR role users
- **Total Hostel Staff:** Count of HOSTEL_STAFF role users
- **Total Security Staff:** Count of SECURITY role users
- **Total Admins:** Count of ADMIN role users

### Passes Section
- **Total Passes:** Count of all passes
- **Approved Passes:** Count of APPROVED status passes
- **Rejected Passes:** Count of REJECTED status passes
- **Students Outside:** Count of students with OUT log but no IN log today

## Security Rules

### Authentication
- All routes require valid JWT token
- Token must be in Authorization header: `Bearer <token>`

### Authorization
- All routes require ADMIN role
- No student access
- No coordinator access
- No hostel staff access
- No security staff access
- No public routes

### Data Validation
- Email format validation
- Password strength validation
- Role validation
- Input sanitization

## Integration Points

### With User Model
- Manages all user accounts
- Handles password hashing
- Tracks last login

### With ActivityLog Model
- Retrieves system activity
- Tracks user actions
- Monitors entity changes

### With Pass Model
- Calculates pass statistics
- Counts by status

### With GateLog Model
- Calculates students outside
- Uses OUT/IN logs

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| User not found | User ID doesn't exist | Verify user ID |
| Email already exists | Email is unique | Use different email |
| Invalid email format | Email format incorrect | Use valid email |
| Password must be at least 8 characters | Password too short | Use longer password |
| Invalid role | Role not allowed | Use allowed role |
| User is already active | User already active | No action needed |
| User is already inactive | User already inactive | No action needed |

## Future Enhancements

1. **User Roles Management**
   - Create custom roles
   - Assign permissions

2. **Advanced Filtering**
   - Date range filtering
   - Department filtering
   - Status filtering

3. **Bulk Operations**
   - Bulk activate/deactivate
   - Bulk password reset
   - Bulk user creation

4. **Reports**
   - User activity reports
   - Pass statistics reports
   - System usage reports

5. **Audit Trail**
   - Detailed change history
   - Who changed what and when
   - Rollback capabilities

6. **User Import/Export**
   - CSV import
   - CSV export
   - Bulk user creation

## Testing Checklist

- [ ] Dashboard statistics calculate correctly
- [ ] User filtering works for all roles
- [ ] Create user validates all fields
- [ ] Update user works correctly
- [ ] Activate/deactivate toggles status
- [ ] Reset password generates temporary password
- [ ] Activity logs display correctly
- [ ] Only ADMIN role can access
- [ ] Other roles cannot access
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Empty states work

## Deployment Notes

1. Ensure User table exists in database
2. Ensure ActivityLog table exists
3. Ensure ADMIN role users exist
4. Test all endpoints with ADMIN user
5. Verify other roles cannot access
6. Check error handling for edge cases
7. Monitor activity logs for suspicious activity
