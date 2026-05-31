# Pass Application Form Redesign - Final Verification Guide

## Overview
The pass application form has been completely redesigned to support two pass types:
- **Daily Pass**: For same-day exits and returns
- **Long Leave**: For extended absences requiring coordinator approval

## Changes Made

### 1. Frontend Form (ApplyPass.jsx)
✅ **Fixed Issues**:
- Removed duplicate date fields (was showing both conditional and generic fields)
- Fixed `formData.type` reference to `formData.pass_type`
- Implemented proper conditional field rendering based on pass type

✅ **Features**:
- Toggle buttons to switch between Daily Pass and Long Leave
- Daily Pass fields: Pass Date, Exit Time (optional), Expected Return Time (optional)
- Long Leave fields: Leaving Date, Returning Date, Parent Contact
- Real-time validation with error messages
- Date picker prevents past dates
- Phone number validation for parent contact

### 2. Backend Model (Pass.js)
✅ **New Fields**:
- `pass_type`: ENUM('DAILY', 'LONG_LEAVE')
- `pass_date`: DATEONLY for daily passes
- `exit_time`: TIME (optional)
- `expected_return_time`: TIME (optional)
- `parent_contact`: STRING for long leave
- `coordinator_id`: INTEGER for automatic assignment
- `from_date`, `to_date`: Changed to DATEONLY

### 3. Backend Service (pass.service.js)
✅ **Features**:
- Date parsing and validation (YYYY-MM-DD format)
- UTC-based date comparisons
- Automatic coordinator assignment based on department
- Proper workflow status initialization:
  - Daily Pass: `PENDING_HOSTEL`
  - Long Leave: `PENDING_COORDINATOR`
- Approval record creation for each workflow stage

### 4. Backend Controller (pass.controller.js)
✅ **Features**:
- Comprehensive logging with `[PASS CONTROLLER]` prefix
- Profile completion check before pass creation
- Student ID retrieval from user ID
- Proper error handling and response formatting

### 5. Database Migration (add_pass_type_fields.js)
✅ **Automatic Execution**:
- Migration now runs automatically on server startup
- Checks if columns already exist to prevent errors
- Adds all new fields to passes table
- Changes date columns to DATEONLY type

### 6. Server Startup (server.js)
✅ **Changes**:
- Added `runPassTypeMigration()` function
- Checks if pass_type column exists before running migration
- Runs migration after schema fixes but before sync
- Proper error handling and logging

## Testing Checklist

### Test 1: Daily Pass Creation
```
Steps:
1. Login as student
2. Complete profile (if not done)
3. Go to Apply Pass
4. Select "Daily Pass" tab
5. Fill in:
   - Pass Date: Tomorrow's date
   - Reason: "Going home"
   - Destination: "Home"
   - Exit Time: 10:00 (optional)
   - Expected Return Time: 18:00 (optional)
6. Click "Submit Pass Request"

Expected Result:
✓ Pass created successfully
✓ Status: PENDING_HOSTEL
✓ Coordinator auto-assigned
✓ Approval record created for HOSTEL_STAFF
✓ Redirect to My Passes page
```

### Test 2: Long Leave Creation
```
Steps:
1. Login as student
2. Complete profile (if not done)
3. Go to Apply Pass
4. Select "Long Leave" tab
5. Fill in:
   - Leaving Date: 3 days from today
   - Returning Date: 7 days from today
   - Parent Contact: 9876543210
   - Reason: "Family emergency"
   - Destination: "Home"
6. Click "Submit Pass Request"

Expected Result:
✓ Pass created successfully
✓ Status: PENDING_COORDINATOR
✓ Coordinator auto-assigned
✓ Two approval records created:
  - COORDINATOR (PENDING)
  - HOSTEL_STAFF (PENDING)
✓ Redirect to My Passes page
```

### Test 3: Date Validation
```
Steps:
1. Go to Apply Pass
2. Select "Daily Pass"
3. Try to select today's date or past date

Expected Result:
✓ Date picker shows minimum date as tomorrow
✓ Cannot select past dates
✓ Error message: "Pass date cannot be in the past"
```

### Test 4: Long Leave Date Validation
```
Steps:
1. Go to Apply Pass
2. Select "Long Leave"
3. Set Leaving Date: Tomorrow
4. Try to set Returning Date: Same day or before

Expected Result:
✓ Returning Date picker minimum is set to Leaving Date + 1
✓ Error message: "Returning date must be after leaving date"
```

### Test 5: Parent Contact Validation
```
Steps:
1. Go to Apply Pass
2. Select "Long Leave"
3. Try to submit without parent contact
4. Try to submit with invalid phone number

Expected Result:
✓ Error: "Parent contact is required for long leave"
✓ Error: "Parent contact must be a valid phone number"
✓ Only 10-digit numbers accepted
```

### Test 6: Coordinator Auto-Assignment
```
Steps:
1. Create a daily pass
2. Check database:
   SELECT id, student_id, coordinator_id, status FROM passes WHERE id = [PASS_ID];

Expected Result:
✓ coordinator_id is populated (not NULL)
✓ Coordinator exists in users table with role = 'COORDINATOR'
✓ Coordinator is_active = true
```

### Test 7: Approval Workflow
```
Steps:
1. Create a daily pass
2. Check database:
   SELECT * FROM approvals WHERE pass_id = [PASS_ID];

Expected Result:
Daily Pass:
✓ One approval record with stage = 'HOSTEL_STAFF', status = 'PENDING'

Long Leave:
✓ Two approval records:
  - stage = 'COORDINATOR', status = 'PENDING'
  - stage = 'HOSTEL_STAFF', status = 'PENDING'
```

### Test 8: Form Validation on Submit
```
Steps:
1. Go to Apply Pass
2. Try to submit without filling required fields

Expected Result:
✓ Error messages appear for all required fields
✓ Form does not submit
✓ Errors clear when user starts typing
```

### Test 9: Pass Type Toggle
```
Steps:
1. Go to Apply Pass
2. Select "Daily Pass"
3. Fill in some fields
4. Switch to "Long Leave"

Expected Result:
✓ Daily Pass fields disappear
✓ Long Leave fields appear
✓ Previous Daily Pass data is cleared
✓ Form is ready for Long Leave input
```

### Test 10: Profile Completion Check
```
Steps:
1. Create new student account
2. Try to go to Apply Pass without completing profile

Expected Result:
✓ Warning message: "Complete your profile first"
✓ "Go to Profile" button available
✓ Cannot submit pass without profile completion
```

## Database Verification Queries

### Check Pass Type Fields Exist
```sql
DESCRIBE passes;
-- Should show: pass_type, pass_date, exit_time, expected_return_time, parent_contact, coordinator_id
```

### Check Daily Pass
```sql
SELECT id, student_id, pass_type, pass_date, exit_time, expected_return_time, 
       coordinator_id, status, createdAt 
FROM passes 
WHERE pass_type = 'DAILY' 
LIMIT 1;
```

### Check Long Leave Pass
```sql
SELECT id, student_id, pass_type, from_date, to_date, parent_contact, 
       coordinator_id, status, createdAt 
FROM passes 
WHERE pass_type = 'LONG_LEAVE' 
LIMIT 1;
```

### Check Coordinator Assignment
```sql
SELECT p.id, p.student_id, p.pass_type, p.coordinator_id, u.name, u.role 
FROM passes p 
LEFT JOIN users u ON p.coordinator_id = u.id 
WHERE p.id = [PASS_ID];
```

### Check Approval Records
```sql
SELECT * FROM approvals WHERE pass_id = [PASS_ID];
```

## Console Logging Guide

### Frontend Logs
Look for these patterns in browser console:
```
[Profile] - Profile form logs
[PASS SERVICE] - Pass service operations
```

### Backend Logs
Look for these patterns in server console:
```
[PASS CONTROLLER] - Pass creation logs
[PASS SERVICE] - Service layer logs
[COORDINATOR ASSIGNMENT] - Coordinator assignment logs
[MIGRATION] - Migration execution logs
```

## Troubleshooting

### Issue: "Pass type fields already exist" message
**Solution**: This is normal. It means the migration already ran. No action needed.

### Issue: Date validation not working
**Solution**: 
- Check browser console for date parsing errors
- Verify date format is YYYY-MM-DD
- Check that getTodayDate() returns correct format

### Issue: Coordinator not assigned
**Solution**:
- Verify coordinator exists in users table with role = 'COORDINATOR'
- Check coordinator is_active = true
- Check student has valid department_id

### Issue: Approval records not created
**Solution**:
- Check pass was created successfully
- Verify pass_id is correct
- Check approvalRepository.create() is being called

### Issue: Form shows validation errors on load
**Solution**:
- This should not happen with the fixed form
- Clear browser cache and reload
- Check that touched/submitted states are initialized correctly

## Deployment Steps

1. **Backup Database**
   ```bash
   # Backup your database before deploying
   ```

2. **Deploy Code**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install dependencies (if needed)
   npm install
   ```

3. **Start Server**
   ```bash
   # Server will automatically run migration on startup
   npm start
   ```

4. **Verify Migration**
   - Check server logs for: "[MIGRATION] Pass type migration completed successfully"
   - Check database for new columns

5. **Test All Scenarios**
   - Run through all 10 test cases above
   - Verify database records are created correctly

## Success Criteria

✅ All 10 test cases pass
✅ Daily Pass workflow works end-to-end
✅ Long Leave workflow works end-to-end
✅ Date validation prevents past dates
✅ Coordinator auto-assignment works
✅ Approval records created correctly
✅ Form validation works properly
✅ No console errors
✅ Database migration runs automatically
✅ All new fields present in database

## Next Steps

After verification:
1. Test approval workflows (coordinator and hostel staff approval)
2. Test QR code generation for approved passes
3. Test PDF generation for approved passes
4. Test security staff scanning QR codes
5. Test pass completion workflow

---

**Last Updated**: May 31, 2026
**Status**: Ready for Testing
