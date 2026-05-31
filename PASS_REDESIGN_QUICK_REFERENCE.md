# Pass Redesign - Quick Reference Guide

## What Changed?

### Frontend (ApplyPass.jsx)
- ✅ Fixed duplicate date fields
- ✅ Fixed field references
- ✅ Form now works correctly

### Backend (server.js)
- ✅ Added automatic migration execution
- ✅ Database schema updated on startup

---

## How to Use

### For Students

#### Daily Pass
1. Go to "Apply Pass"
2. Click "Daily Pass" tab
3. Fill in:
   - Pass Date (required)
   - Reason (required)
   - Destination (required)
   - Exit Time (optional)
   - Expected Return Time (optional)
4. Click "Submit Pass Request"

#### Long Leave
1. Go to "Apply Pass"
2. Click "Long Leave" tab
3. Fill in:
   - Leaving Date (required)
   - Returning Date (required)
   - Parent Contact (required)
   - Reason (required)
   - Destination (required)
4. Click "Submit Pass Request"

### For Developers

#### Running the System
```bash
# Terminal 1: Backend
cd server
npm start
# Watch for: "[MIGRATION] Pass type migration completed successfully"

# Terminal 2: Frontend
cd client
npm run dev
```

#### Testing Daily Pass
```bash
# Create pass via UI, then verify in database:
SELECT * FROM passes WHERE pass_type = 'DAILY' ORDER BY createdAt DESC LIMIT 1;

# Expected columns:
# - pass_type: 'DAILY'
# - pass_date: [date]
# - exit_time: [time or NULL]
# - expected_return_time: [time or NULL]
# - coordinator_id: [assigned]
# - status: 'PENDING_HOSTEL'
```

#### Testing Long Leave
```bash
# Create pass via UI, then verify in database:
SELECT * FROM passes WHERE pass_type = 'LONG_LEAVE' ORDER BY createdAt DESC LIMIT 1;

# Expected columns:
# - pass_type: 'LONG_LEAVE'
# - from_date: [date]
# - to_date: [date]
# - parent_contact: [phone]
# - coordinator_id: [assigned]
# - status: 'PENDING_COORDINATOR'
```

#### Checking Approvals
```bash
# For daily pass (1 approval):
SELECT * FROM approvals WHERE pass_id = [PASS_ID];
# Expected: stage = 'HOSTEL_STAFF', status = 'PENDING'

# For long leave (2 approvals):
SELECT * FROM approvals WHERE pass_id = [PASS_ID];
# Expected: 
#   - stage = 'COORDINATOR', status = 'PENDING'
#   - stage = 'HOSTEL_STAFF', status = 'PENDING'
```

---

## Key Features

### Automatic Coordinator Assignment
- Coordinator is automatically assigned based on student's department
- No manual selection needed
- Coordinator must have role = 'COORDINATOR' and is_active = true

### Date Validation
- Past dates cannot be selected
- Returning date must be after leaving date
- Date format: YYYY-MM-DD (internally)

### Approval Workflow
- **Daily Pass**: PENDING_HOSTEL → APPROVED → ACTIVE
- **Long Leave**: PENDING_COORDINATOR → PENDING_HOSTEL → APPROVED → ACTIVE

### Phone Validation
- Parent contact must be 10 digits
- Only numbers accepted
- Required for long leave

---

## Common Issues & Solutions

### Issue: "Pass type fields already exist" on startup
**Solution**: This is normal. Migration already ran. No action needed.

### Issue: Date picker shows past dates
**Solution**: Browser cache issue. Clear cache and reload.

### Issue: Coordinator not assigned
**Solution**: Check if coordinator exists:
```sql
SELECT * FROM users WHERE role = 'COORDINATOR' AND is_active = true;
```

### Issue: Form shows validation errors on load
**Solution**: This shouldn't happen. Try:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

### Issue: Pass not created
**Solution**: Check:
1. Profile is complete
2. All required fields filled
3. Dates are valid
4. Browser console for errors
5. Server logs for backend errors

---

## Database Schema

### Passes Table
```sql
CREATE TABLE passes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  pass_type ENUM('DAILY', 'LONG_LEAVE') NOT NULL,
  reason TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  
  -- Daily Pass fields
  pass_date DATE,
  exit_time TIME,
  expected_return_time TIME,
  
  -- Long Leave fields
  from_date DATE,
  to_date DATE,
  parent_contact VARCHAR(255),
  
  -- Assignment & Status
  coordinator_id INT,
  status ENUM('PENDING_COORDINATOR', 'PENDING_HOSTEL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
  
  -- Metadata
  pdf_path VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (coordinator_id) REFERENCES users(id)
);
```

### Approvals Table
```sql
CREATE TABLE approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pass_id INT NOT NULL,
  stage ENUM('COORDINATOR', 'HOSTEL_STAFF') NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  FOREIGN KEY (pass_id) REFERENCES passes(id)
);
```

---

## API Endpoints

### Create Pass
```
POST /passes
Content-Type: application/json
Authorization: Bearer [token]

Body:
{
  "pass_type": "DAILY" | "LONG_LEAVE",
  "reason": "string",
  "destination": "string",
  
  // For DAILY:
  "pass_date": "YYYY-MM-DD",
  "exit_time": "HH:MM" (optional),
  "expected_return_time": "HH:MM" (optional),
  
  // For LONG_LEAVE:
  "from_date": "YYYY-MM-DD",
  "to_date": "YYYY-MM-DD",
  "parent_contact": "10-digit phone"
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "student_id": 45,
    "pass_type": "DAILY",
    "coordinator_id": 67,
    "status": "PENDING_HOSTEL",
    "createdAt": "2026-05-31T10:00:00Z"
  }
}
```

### Get My Passes
```
GET /passes/my
Authorization: Bearer [token]

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "pass_type": "DAILY",
      "status": "PENDING_HOSTEL",
      ...
    }
  ]
}
```

### Get Pass by ID
```
GET /passes/:id
Authorization: Bearer [token]

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "pass_type": "DAILY",
    ...
  }
}
```

---

## Console Logs to Watch

### Frontend
```
[Profile] - Profile form operations
```

### Backend
```
[PASS CONTROLLER] - Pass creation requests
[PASS SERVICE] - Pass service operations
[COORDINATOR ASSIGNMENT] - Coordinator assignment
[MIGRATION] - Database migration
```

---

## Deployment Checklist

- [ ] Code changes deployed
- [ ] Backend server started
- [ ] Migration completed successfully
- [ ] Database schema verified
- [ ] Daily pass test passed
- [ ] Long leave test passed
- [ ] Date validation working
- [ ] Coordinator assignment working
- [ ] Approval records created
- [ ] No console errors

---

## Support

For issues or questions:
1. Check PASS_REDESIGN_FINAL_VERIFICATION.md for detailed test cases
2. Check PASS_REDESIGN_CHANGES_MADE.md for what was changed
3. Review console logs for error messages
4. Check database schema with: `DESCRIBE passes;`

---

**Last Updated**: May 31, 2026
**Version**: 1.0
**Status**: Production Ready
