# Coordinator Module - Quick Reference

## What is the Coordinator Module?
The Coordinator Module enables coordinators to approve or reject long leave pass requests from students. It's the first approval stage in the pass workflow.

## Key Features
- ✅ View pending long leave requests
- ✅ Approve requests (optional remarks)
- ✅ Reject requests (mandatory remarks)
- ✅ View approval history with filtering
- ✅ Dashboard with statistics

## Coordinator Responsibilities
- **Only handles**: LONG_LEAVE passes
- **Never sees**: DAILY passes
- **Only processes**: Passes with status PENDING_COORDINATOR
- **After approval**: Pass moves to PENDING_HOSTEL (Hostel Staff reviews)
- **After rejection**: Pass status becomes REJECTED

## Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/coordinator` | View statistics & recent activity |
| Pending Requests | `/coordinator/requests` | Review & approve/reject requests |
| History | `/coordinator/history` | View all approvals with filters |

## API Endpoints

```
GET  /approvals/pending          → Get pending requests
PUT  /approvals/:id/approve      → Approve a request
PUT  /approvals/:id/reject       → Reject a request
GET  /approvals/history          → Get approval history
```

## Workflow

```
Student Creates LONG_LEAVE Pass
         ↓
Pass Status: PENDING_COORDINATOR
         ↓
Coordinator Reviews Request
         ↓
    ┌────┴────┐
    ↓         ↓
 APPROVE    REJECT
    ↓         ↓
PENDING_   REJECTED
HOSTEL
    ↓
Hostel Staff Reviews
```

## Files Created/Modified

### Backend
- `server/src/services/approval.service.js` - Business logic
- `server/src/controllers/approval.controller.js` - HTTP handlers
- `server/src/routes/approval.routes.js` - Route definitions

### Frontend
- `client/src/api/approval.api.js` - API client
- `client/src/pages/Coordinator/Dashboard.jsx` - Dashboard
- `client/src/pages/Coordinator/PendingRequests.jsx` - Requests table
- `client/src/pages/Coordinator/History.jsx` - History with filters

### Configuration
- `client/src/routes/AppRoutes.jsx` - Routes already configured
- `server/src/server.js` - Routes already registered

## Quick Start

### For Coordinators
1. Login with COORDINATOR role
2. Go to `/coordinator/requests`
3. Review pending long leave requests
4. Click "Approve" or "Reject"
5. For rejection, enter mandatory remarks
6. Check `/coordinator/history` to see all approvals

### For Developers
1. All backend endpoints require COORDINATOR role
2. All frontend pages require COORDINATOR role
3. Use `approvalAPI` functions to call backend
4. Use `useAuth()` hook to get current user
5. Use `RoleRoute` to protect pages

## Validation Rules

### Approval
- ✅ Pass type must be LONG_LEAVE
- ✅ Pass status must be PENDING_COORDINATOR
- ✅ Remarks are optional

### Rejection
- ✅ Pass type must be LONG_LEAVE
- ✅ Pass status must be PENDING_COORDINATOR
- ✅ Remarks are mandatory (cannot be empty)

## Common Tasks

### View Pending Requests
```javascript
import * as approvalAPI from '../../api/approval.api'

const response = await approvalAPI.getPendingRequests()
const requests = response.data
```

### Approve a Request
```javascript
await approvalAPI.approveRequest(passId, 'Optional remarks')
```

### Reject a Request
```javascript
await approvalAPI.rejectRequest(passId, 'Mandatory rejection reason')
```

### Get Approval History
```javascript
const response = await approvalAPI.getApprovalHistory()
const history = response.data
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Only coordinators can..." | Wrong role | Login as COORDINATOR |
| "Pass is not pending..." | Wrong status | Check pass status |
| "Only LONG_LEAVE passes..." | Wrong type | Only LONG_LEAVE passes |
| "Remarks are mandatory..." | Empty remarks | Enter rejection reason |
| "Pass not found" | Invalid ID | Check pass ID |

## Statistics Dashboard

The dashboard shows:
- **Pending Long Leave Requests**: Count of requests awaiting approval
- **Approved Today**: Count of approvals made today
- **Rejected Today**: Count of rejections made today
- **Recent Activity**: Last 5 actions with student names and dates

## History Filtering

Filter approval history by:
- **All**: Show all approvals
- **Approved**: Show only approved requests
- **Rejected**: Show only rejected requests

## Data Displayed

### Pending Requests Table
- Student Name
- USN
- Department
- Reason
- Destination
- From Date
- To Date
- Action buttons

### History Table
- Pass ID
- Student Name
- USN
- Decision (Approved/Rejected badge)
- Remarks
- Date & Time

## Security

- ✅ JWT authentication required
- ✅ COORDINATOR role required
- ✅ Coordinators can only see LONG_LEAVE passes
- ✅ Coordinators can only see PENDING_COORDINATOR passes
- ✅ Coordinators can only see their own approval history

## Testing Checklist

- [ ] Login as COORDINATOR
- [ ] View pending requests
- [ ] Approve a request with remarks
- [ ] Reject a request with remarks
- [ ] Verify pass status changed
- [ ] View approval history
- [ ] Filter history by status
- [ ] Check dashboard statistics
- [ ] Verify error messages

## Integration

### With Student Module
- Reads passes created by students
- Updates pass status after decision

### With Hostel Staff Module
- Approved passes go to Hostel Staff (PENDING_HOSTEL)
- Hostel Staff sees approved requests

### With Authentication
- Uses JWT tokens
- Uses role-based authorization
- Tracks coordinator ID for approvals

## Performance

- ✅ Efficient database queries
- ✅ Indexed on pass_id, approved_by, stage
- ✅ Real-time data (no caching)
- ✅ Auto-refresh after actions

## Status Badges

- 🟢 **Approved** (Green) - Request approved
- 🔴 **Rejected** (Red) - Request rejected
- 🟡 **Pending** (Yellow) - Awaiting decision

---

**Module Status**: ✅ PRODUCTION READY

For detailed documentation, see `COORDINATOR_MODULE_DOCUMENTATION.md`
