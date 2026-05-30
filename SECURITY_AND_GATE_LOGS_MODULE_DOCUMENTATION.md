# Security Module and Gate Logs Documentation

## Overview

The Security Module handles QR token scanning, gate entry/exit logging, and real-time monitoring of student movement. It provides security personnel with tools to verify passes and track gate activity.

## Architecture

### Backend Components

#### 1. Security Service (`server/src/services/security.service.js`)
Core business logic for QR scanning and gate logging.

**Key Functions:**

- `scanQRToken(token, securityUserId)` - Scan QR token and create gate log
  - Validates QR token (exists, active, not expired)
  - Validates pass (exists, status = APPROVED)
  - Implements scan logic (OUT → IN → COMPLETED)
  - Creates GateLog record with transaction safety
  - Returns scan result with student and pass details

- `getTodayLogs()` - Get today's gate logs
  - Filters logs by today's date range
  - Returns formatted log data with student/pass details

- `getAllLogs(filter)` - Get all logs with filters
  - Supports filters: ALL, OUT, IN, TODAY
  - Returns formatted log data

- `getDashboardStats()` - Get dashboard statistics
  - Calculates from actual database records
  - Returns: todayScans, studentsOutside, completedPasses, recentActivity

#### 2. Security Controller (`server/src/controllers/security.controller.js`)
HTTP request handlers for security endpoints.

**Endpoints:**

- `POST /security/scan` - Scan QR token
- `GET /security/logs/today` - Get today's logs
- `GET /security/logs?filter=ALL|OUT|IN|TODAY` - Get all logs with filters
- `GET /security/dashboard` - Get dashboard statistics

#### 3. Security Routes (`server/src/routes/security.routes.js`)
Route definitions with authentication and authorization.

**Security:**
- All routes require `authenticate` middleware
- All routes require `isSecurity` role middleware
- No student/coordinator/hostel staff access

### Frontend Components

#### 1. Security API (`client/src/api/security.api.js`)
API client functions for security endpoints.

**Functions:**
- `scanQRToken(token)` - Scan QR token
- `getTodayLogs()` - Get today's logs
- `getAllLogs(filter)` - Get all logs with filters
- `getDashboardStats()` - Get dashboard statistics

#### 2. Dashboard Page (`client/src/pages/Security/Dashboard.jsx`)
Main security dashboard with statistics and recent activity.

**Features:**
- Today's Scans card (total scans count)
- Students Outside card (OUT exists AND IN missing)
- Completed Passes card (both OUT and IN exist)
- Recent Scan Activity table (last 10 scans)
- Auto-refresh every 30 seconds
- Quick action buttons to Scanner and Logs

#### 3. QR Scanner Page (`client/src/pages/Security/QRScanner.jsx`)
QR scanning interface for recording entry/exit.

**Features:**
- QR token input field (auto-focused for scanner)
- Scan button to submit token
- Result card showing:
  - Scan status (OUT/IN/COMPLETED)
  - Student details (name, USN, department, program, year, semester, hostel, room)
  - Pass details (ID, type, destination, dates)
  - Scan timestamp
- Color-coded status indicators
- Auto-focus after successful scan for continuous scanning

#### 4. Scan Logs Page (`client/src/pages/Security/ScanLogs.jsx`)
View and filter all gate logs.

**Features:**
- Filter buttons: ALL, OUT, IN, TODAY
- Logs table with columns:
  - Student Name
  - USN
  - Pass Type (DAILY/LONG_LEAVE)
  - Action (OUT/IN)
  - Timestamp
  - Security Staff
- Summary cards (Total, OUT count, IN count)
- Loading and empty states

## Scan Logic

### First Scan
```
QR Scan → Verify Token → Valid Token → No OUT Log Exists → Create OUT Log → Result = OUT
```

### Second Scan
```
QR Scan → OUT Log Exists → IN Log Missing → Create IN Log → Result = IN
```

### Third+ Scan
```
QR Scan → OUT Exists → IN Exists → Return "Pass Already Completed" → No new log
```

## Database Models

### GateLog Model
```javascript
{
  id: INTEGER (PK),
  pass_id: INTEGER (FK),
  action: ENUM('IN', 'OUT'),
  scan_status: ENUM('VALID', 'INVALID', 'EXPIRED'),
  scanned_by: INTEGER (FK to User),
  scanned_at: DATE,
  createdAt: DATE
}
```

### Relationships
- GateLog → Pass (many-to-one)
- GateLog → User (many-to-one, scanned_by)

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "QR scanned successfully",
  "data": {
    "passId": 101,
    "scanResult": "OUT",
    "message": "OUT scan recorded successfully",
    "studentDetails": {
      "id": 1,
      "usn": "USN001",
      "name": "John Doe",
      "department": "CSE",
      "program_type": "UG",
      "year_of_study": 2,
      "semester": 4,
      "hostel_name": "Hostel A",
      "room_number": "A101"
    },
    "passDetails": {
      "id": 101,
      "type": "DAILY",
      "destination": "Home",
      "from_date": "2026-05-31",
      "to_date": "2026-05-31"
    },
    "scanTime": "2026-05-31T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid QR token"
}
```

## Dashboard Statistics

### Today's Scans
Total number of scans (OUT + IN) recorded today.

### Students Outside
Count of students with OUT log but no IN log today.
- Temporary MVP implementation
- Future: Can be enhanced with more sophisticated logic

### Completed Passes
Count of students with both OUT and IN logs today.

### Recent Activity
Last 10 scans with student name, USN, pass type, action, timestamp, and security staff.

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid QR token | Token doesn't exist | Verify QR code is correct |
| QR token is inactive | Token has been deactivated | Generate new QR token |
| QR token has expired | Token expiration time passed | Generate new QR token |
| Pass not found | Pass ID doesn't exist | Verify pass exists |
| Pass is not approved | Pass status ≠ APPROVED | Wait for approval |
| Pass already completed | Both OUT and IN logs exist | No action needed |

## Security Rules

### Authentication
- All routes require valid JWT token
- Token must be in Authorization header: `Bearer <token>`

### Authorization
- All routes require SECURITY role
- No student access
- No coordinator access
- No hostel staff access
- No public routes

### Data Validation
- Token must be provided
- Token must be valid and active
- Pass must exist and be APPROVED
- Security user ID must be valid

## Integration Points

### With QR Token Module
- Verifies QR tokens generated by QR module
- Checks token validity and expiration
- Ensures token is active

### With Pass Module
- Validates pass exists and is APPROVED
- Retrieves pass details (type, destination, dates)
- Ensures pass belongs to correct student

### With Student Module
- Retrieves student details (name, USN, department, etc.)
- Ensures student exists

### With User Module
- Retrieves security staff details (scanned_by)
- Ensures security user exists

## Future Enhancements

1. **Advanced Analytics**
   - Peak hours analysis
   - Student movement patterns
   - Hostel-wise statistics

2. **Alerts and Notifications**
   - Alert when student stays outside too long
   - Notify hostel staff of unusual patterns
   - Real-time notifications to coordinators

3. **Signature Integration**
   - Digital signature capture at gate
   - Biometric verification

4. **Mobile App**
   - Mobile QR scanner app
   - Offline scanning capability
   - Real-time sync

5. **Advanced Filtering**
   - Date range filtering
   - Student/hostel filtering
   - Security staff filtering

## Testing Checklist

- [ ] QR token scanning works correctly
- [ ] First scan creates OUT log
- [ ] Second scan creates IN log
- [ ] Third scan returns COMPLETED
- [ ] Dashboard statistics calculate correctly
- [ ] Filters work on logs page
- [ ] Error messages display correctly
- [ ] Only SECURITY role can access
- [ ] Student/coordinator/hostel staff cannot access
- [ ] Auto-refresh works on dashboard
- [ ] Scanner auto-focuses after scan

## Deployment Notes

1. Ensure GateLog table exists in database
2. Ensure QRToken table exists and has active tokens
3. Ensure Pass table has APPROVED passes
4. Ensure User table has SECURITY role users
5. Test QR scanning with valid tokens
6. Verify all endpoints return correct responses
7. Check error handling for edge cases
