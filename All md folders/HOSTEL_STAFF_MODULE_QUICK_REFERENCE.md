# Hostel Staff Module - Quick Reference

## What is the Hostel Staff Module?
The Hostel Staff Module enables hostel staff to approve or reject all pass requests (DAILY and LONG_LEAVE). Hostel Staff is the FINAL approval authority in the pass workflow.

## Key Features
- ✅ View pending passes (PENDING_HOSTEL status)
- ✅ Approve passes (optional remarks)
- ✅ Reject passes (mandatory remarks)
- ✅ View all passes with filtering
- ✅ Search student directory
- ✅ Dashboard with statistics
- ✅ Recent activity tracking

## Hostel Staff Responsibilities
- **Handles**: ALL passes (DAILY and LONG_LEAVE)
- **Status**: PENDING_HOSTEL (final approval stage)
- **After approval**: Pass status becomes APPROVED
- **After rejection**: Pass status becomes REJECTED
- **Authority**: FINAL approval authority

## Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/hostel` | View statistics & recent activity |
| Pending Passes | `/hostel/requests` | Review & approve/reject passes |
| Student Directory | `/hostel/students` | Search & view student info |
| All Passes | `/hostel/all-passes` | View all passes with filters |

## API Endpoints

```
GET  /hostel/pending              → Get pending passes
PUT  /hostel/passes/:id/approve   → Approve a pass
PUT  /hostel/passes/:id/reject    → Reject a pass
GET  /hostel/passes?filter=...    → Get all passes with filter
GET  /hostel/students?search=...  → Get students directory
GET  /hostel/dashboard            → Get dashboard statistics
```

## Workflow

```
Student Creates Pass (DAILY or LONG_LEAVE)
         ↓
If DAILY: PENDING_HOSTEL
If LONG_LEAVE: PENDING_COORDINATOR
         ↓
Coordinator Reviews (LONG_LEAVE only)
         ↓
If Approved: PENDING_HOSTEL
If Rejected: REJECTED
         ↓
Hostel Staff Reviews (PENDING_HOSTEL)
         ↓
    ┌────┴────┐
    ↓         ↓
 APPROVE    REJECT
    ↓         ↓
APPROVED   REJECTED
```

## Files Created/Modified

### Backend
- `server/src/services/hostel.service.js` - Business logic
- `server/src/controllers/hostel.controller.js` - HTTP handlers
- `server/src/routes/hostel.routes.js` - Route definitions
- `server/src/server.js` - Routes registered

### Frontend
- `client/src/api/hostel.api.js` - API client
- `client/src/pages/Hostel/Dashboard.jsx` - Dashboard
- `client/src/pages/Hostel/PendingRequests.jsx` - Pending passes
- `client/src/pages/Hostel/Students.jsx` - Student directory
- `client/src/pages/Hostel/AllPasses.jsx` - All passes
- `client/src/routes/AppRoutes.jsx` - Routes configured

## Quick Start

### For Hostel Staff
1. Login with HOSTEL_STAFF role
2. Go to `/hostel/requests`
3. Review pending passes
4. Click "Approve" or "Reject"
5. For rejection, enter mandatory remarks
6. Check `/hostel/dashboard` for statistics

### For Developers
1. All backend endpoints require HOSTEL_STAFF role
2. All frontend pages require HOSTEL_STAFF role
3. Use `hostelAPI` functions to call backend
4. Use `useAuth()` hook to get current user
5. Use `RoleRoute` to protect pages

## Validation Rules

### Approval
- ✅ Pass status must be PENDING_HOSTEL
- ✅ Remarks are optional

### Rejection
- ✅ Pass status must be PENDING_HOSTEL
- ✅ Remarks are mandatory (cannot be empty)

## Common Tasks

### View Pending Passes
```javascript
import * as hostelAPI from '../../api/hostel.api'

const response = await hostelAPI.getPendingPasses()
const passes = response.data
```

### Approve a Pass
```javascript
await hostelAPI.approvePass(passId, 'Optional remarks')
```

### Reject a Pass
```javascript
await hostelAPI.rejectPass(passId, 'Mandatory rejection reason')
```

### Get All Passes with Filter
```javascript
const response = await hostelAPI.getAllPasses('APPROVED')
// Filters: ALL, DAILY, LONG_LEAVE, APPROVED, REJECTED, PENDING_HOSTEL
```

### Search Students
```javascript
const response = await hostelAPI.getStudents('John')
// Search by name, USN, or department
```

### Get Dashboard Data
```javascript
const response = await hostelAPI.getDashboard()
const { stats, recentActivity } = response.data
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Only hostel staff can..." | Wrong role | Login as HOSTEL_STAFF |
| "This pass has already been processed" | Wrong status | Check pass status |
| "Pass not found" | Invalid ID | Check pass ID |
| "Remarks are mandatory..." | Empty remarks | Enter rejection reason |

## Statistics Dashboard

The dashboard shows:
- **Pending Passes**: Count of passes awaiting approval
- **Approved Today**: Count of approvals made today
- **Students Outside**: Count of approved daily passes for today
- **Recent Activity**: Last 5 actions with student names and dates

## Pass Filtering

Filter all passes by:
- **All**: Show all passes
- **Daily**: Show only daily passes
- **Long Leave**: Show only long leave passes
- **Approved**: Show only approved passes
- **Rejected**: Show only rejected passes
- **Pending**: Show only pending passes

## Student Search

Search students by:
- **Name**: Student's full name
- **USN**: Student's unique ID
- **Department**: Department name

## Data Displayed

### Pending Passes Table
- Student Name
- USN
- Department
- Pass Type (Daily/Long Leave)
- Reason
- Destination
- From Date
- To Date
- Applied Date
- Action buttons

### Student Directory Table
- Name
- USN
- Department
- Program Type (UG/PG)
- Year of Study
- Hostel Name
- Room Number
- View Details button

### All Passes Table
- Pass ID
- Student Name
- Pass Type
- Status (color-coded badge)
- Applied Date

## Security

- ✅ JWT authentication required
- ✅ HOSTEL_STAFF role required
- ✅ Hostel staff can see all passes
- ✅ Hostel staff can see all students
- ✅ Hostel staff can only see their own approvals

## Testing Checklist

- [ ] Login as HOSTEL_STAFF
- [ ] View pending passes
- [ ] Approve a pass with remarks
- [ ] Reject a pass with remarks
- [ ] Verify pass status changed
- [ ] View all passes
- [ ] Filter passes by type
- [ ] Filter passes by status
- [ ] Search students by name
- [ ] Search students by USN
- [ ] Search students by department
- [ ] View student details
- [ ] Check dashboard statistics
- [ ] Verify error messages

## Integration

### With Student Module
- Reads passes created by students
- Updates pass status after decision

### With Coordinator Module
- Receives approved LONG_LEAVE passes
- Coordinator already approved them

### With Authentication
- Uses JWT tokens
- Uses role-based authorization
- Tracks hostel staff ID for approvals

## Performance

- ✅ Efficient database queries
- ✅ Indexed on status, type, approved_by
- ✅ Real-time data (no caching)
- ✅ Auto-refresh after actions

## Status Badges

- 🟢 **Approved** (Green) - Pass approved
- 🔴 **Rejected** (Red) - Pass rejected
- 🟡 **Pending** (Yellow) - Awaiting decision

---

**Module Status**: ✅ PRODUCTION READY

For detailed documentation, see `HOSTEL_STAFF_MODULE_DOCUMENTATION.md`
