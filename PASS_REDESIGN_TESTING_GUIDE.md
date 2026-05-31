# Pass Application Redesign - Testing Guide

## Quick Start Testing

### Prerequisites
- Backend server running
- Frontend development server running
- Student profile completed
- Coordinator user created in database

---

## Test Scenario 1: Daily Pass Creation

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Daily Pass" tab
3. Fill form:
   - **Pass Date**: Select today or future date
   - **Exit Time**: 09:00 (optional)
   - **Expected Return Time**: 12:00 (optional)
   - **Reason**: "Medical appointment"
   - **Destination**: "City Hospital"
4. Click "Submit Pass Request"

### Expected Results
- ✅ Pass created successfully
- ✅ Redirected to `/student/my-passes`
- ✅ Success message displayed
- ✅ Console shows: `[PASS SERVICE] Daily pass created with ID: X, Coordinator ID: Y`
- ✅ Database record:
  - `pass_type = 'DAILY'`
  - `pass_date = selected date`
  - `from_date = NULL`
  - `to_date = NULL`
  - `status = 'PENDING_HOSTEL'`

---

## Test Scenario 2: Daily Pass with Past Date (Should Fail)

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Daily Pass" tab
3. Try to select a past date in "Pass Date" field
4. Notice: Date picker prevents selection (min = today)

### Expected Results
- ✅ Past dates disabled in date picker
- ✅ Cannot submit form with past date
- ✅ Error message: "Pass date cannot be in the past"

---

## Test Scenario 3: Long Leave Creation

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Long Leave" tab
3. Fill form:
   - **Leaving Date**: Select date 5 days from today
   - **Returning Date**: Select date 10 days from today
   - **Parent Contact**: "9876543210"
   - **Reason**: "Family emergency"
   - **Destination**: "Home"
4. Click "Submit Pass Request"

### Expected Results
- ✅ Pass created successfully
- ✅ Redirected to `/student/my-passes`
- ✅ Success message displayed
- ✅ Console shows: `[PASS SERVICE] Long leave pass created with ID: X, Coordinator ID: Y`
- ✅ Database record:
  - `pass_type = 'LONG_LEAVE'`
  - `from_date = leaving date`
  - `to_date = returning date`
  - `pass_date = NULL`
  - `parent_contact = '9876543210'`
  - `status = 'PENDING_COORDINATOR'`

---

## Test Scenario 4: Long Leave with Invalid Dates (Should Fail)

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Long Leave" tab
3. Fill form:
   - **Leaving Date**: 2025-01-25
   - **Returning Date**: 2025-01-20 (before leaving date)
4. Click "Submit Pass Request"

### Expected Results
- ✅ Form validation fails
- ✅ Error message: "Returning date must be after leaving date"
- ✅ Pass not created
- ✅ Form remains on page

---

## Test Scenario 5: Long Leave with Missing Parent Contact (Should Fail)

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Long Leave" tab
3. Fill form without "Parent Contact"
4. Click "Submit Pass Request"

### Expected Results
- ✅ Form validation fails
- ✅ Error message: "Parent contact is required for long leave"
- ✅ Pass not created

---

## Test Scenario 6: Long Leave with Invalid Phone Number (Should Fail)

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Long Leave" tab
3. Fill form:
   - **Parent Contact**: "123" (less than 10 digits)
4. Click "Submit Pass Request"

### Expected Results
- ✅ Form validation fails
- ✅ Error message: "Parent contact must be a valid phone number"
- ✅ Pass not created

---

## Test Scenario 7: Coordinator Auto-Assignment

### Setup
1. Create a coordinator user in database:
   ```sql
   INSERT INTO users (name, email, password, role, is_active)
   VALUES ('Dr. John Smith', 'john@example.com', 'hashed_password', 'COORDINATOR', true);
   ```

2. Ensure student has department_id set:
   ```sql
   UPDATE students SET department_id = 1 WHERE id = 1;
   ```

### Steps
1. Create a daily pass
2. Check server console

### Expected Results
- ✅ Console shows: `[COORDINATOR ASSIGNMENT] Found coordinator: Dr. John Smith (ID: 5) for department 1`
- ✅ Pass record has `coordinator_id = 5`
- ✅ Coordinator receives notification (if implemented)

---

## Test Scenario 8: No Coordinator Available

### Setup
1. Delete or deactivate all coordinators:
   ```sql
   UPDATE users SET is_active = false WHERE role = 'COORDINATOR';
   ```

### Steps
1. Create a daily pass
2. Check server console

### Expected Results
- ✅ Console shows: `[COORDINATOR ASSIGNMENT] No coordinator found for department 1`
- ✅ Pass record has `coordinator_id = NULL`
- ✅ Pass still created successfully

---

## Test Scenario 9: Form Field Switching

### Steps
1. Navigate to `/student/apply-pass`
2. Click "Daily Pass" tab
3. Fill some fields
4. Click "Long Leave" tab
5. Notice fields changed

### Expected Results
- ✅ Daily pass fields hidden
- ✅ Long leave fields shown
- ✅ Previous daily pass data cleared
- ✅ Form errors cleared
- ✅ Click back to "Daily Pass" tab
- ✅ Long leave data cleared

---

## Test Scenario 10: Date Validation Across Timezones

### Setup
1. Change system timezone
2. Or test with different browser timezones

### Steps
1. Create a daily pass for today
2. Check database record

### Expected Results
- ✅ Pass date correctly set to today (in user's timezone)
- ✅ No timezone conversion issues
- ✅ Date comparisons work correctly

---

## Database Verification Queries

### Check Pass Records
```sql
-- View all passes
SELECT id, student_id, pass_type, pass_date, from_date, to_date, 
       coordinator_id, status, created_at 
FROM passes 
ORDER BY created_at DESC;

-- View daily passes
SELECT * FROM passes WHERE pass_type = 'DAILY';

-- View long leave passes
SELECT * FROM passes WHERE pass_type = 'LONG_LEAVE';

-- Check coordinator assignments
SELECT p.id, p.pass_type, u.name as coordinator_name, p.status
FROM passes p
LEFT JOIN users u ON p.coordinator_id = u.id
ORDER BY p.created_at DESC;
```

### Check Approval Records
```sql
-- View approval records
SELECT a.id, a.pass_id, a.stage, a.status, p.pass_type
FROM approvals a
JOIN passes p ON a.pass_id = p.id
ORDER BY a.created_at DESC;

-- Check daily pass approvals
SELECT a.* FROM approvals a
JOIN passes p ON a.pass_id = p.id
WHERE p.pass_type = 'DAILY'
ORDER BY a.created_at DESC;

-- Check long leave approvals
SELECT a.* FROM approvals a
JOIN passes p ON a.pass_id = p.id
WHERE p.pass_type = 'LONG_LEAVE'
ORDER BY a.created_at DESC;
```

---

## Console Log Monitoring

### Filter Logs in Browser Console
```javascript
// Filter for pass service logs
console.log('Filtering for [PASS SERVICE] logs...');

// Filter for coordinator assignment logs
console.log('Filtering for [COORDINATOR ASSIGNMENT] logs...');

// Filter for pass controller logs
console.log('Filtering for [PASS CONTROLLER] logs...');
```

### Expected Log Sequence for Daily Pass
```
[PASS CONTROLLER] Creating pass for user: 1
[PASS CONTROLLER] Request body: {pass_type: 'DAILY', ...}
[PASS CONTROLLER] Student found: {id: 5, department_id: 1}
[PASS SERVICE] Creating pass with data: {pass_type: 'DAILY', ...}
[PASS SERVICE] Today's date (UTC): 2025-01-15
[PASS SERVICE] Daily pass date: 2025-01-15
[COORDINATOR ASSIGNMENT] Found coordinator: Dr. John Smith (ID: 5) for department 1
[PASS SERVICE] Daily pass created with ID: 42, Coordinator ID: 5
[PASS CONTROLLER] Pass created successfully: {id: 42, pass_type: 'DAILY', coordinator_id: 5, status: 'PENDING_HOSTEL'}
```

### Expected Log Sequence for Long Leave
```
[PASS CONTROLLER] Creating pass for user: 1
[PASS CONTROLLER] Request body: {pass_type: 'LONG_LEAVE', ...}
[PASS CONTROLLER] Student found: {id: 5, department_id: 1}
[PASS SERVICE] Creating pass with data: {pass_type: 'LONG_LEAVE', ...}
[PASS SERVICE] Today's date (UTC): 2025-01-15
[PASS SERVICE] Long leave - From: 2025-01-20, To: 2025-01-25
[COORDINATOR ASSIGNMENT] Found coordinator: Dr. John Smith (ID: 5) for department 1
[PASS SERVICE] Long leave pass created with ID: 43, Coordinator ID: 5
[PASS CONTROLLER] Pass created successfully: {id: 43, pass_type: 'LONG_LEAVE', coordinator_id: 5, status: 'PENDING_COORDINATOR'}
```

---

## Troubleshooting

### Issue: "Pass date cannot be in the past"
- **Cause**: System date is incorrect or timezone issue
- **Solution**: Check system date/time, verify timezone settings

### Issue: Coordinator not assigned
- **Cause**: No active coordinator in database
- **Solution**: Create coordinator user with role = 'COORDINATOR' and is_active = true

### Issue: Date picker shows wrong dates
- **Cause**: Timezone mismatch
- **Solution**: Check browser timezone, verify server timezone

### Issue: Form fields not switching
- **Cause**: JavaScript error or state not updating
- **Solution**: Check browser console for errors, refresh page

### Issue: Pass not created but no error message
- **Cause**: Backend error not returned properly
- **Solution**: Check server console logs, verify API response

---

## Performance Testing

### Load Testing
```javascript
// Create 100 daily passes
for (let i = 0; i < 100; i++) {
  // Create pass via API
}

// Expected: All passes created successfully
// Check: Database performance, coordinator assignment speed
```

### Date Validation Performance
```javascript
// Test with various date formats
const dates = [
  '2025-01-15',
  '01/15/2025',
  '2025-1-15',
  '2025-01-1'
];

// Expected: All formats handled correctly
```

---

## Regression Testing

### Existing Features
- ✅ Student profile completion check
- ✅ Pass history retrieval
- ✅ Pass details view
- ✅ Approval workflow
- ✅ QR code generation
- ✅ PDF generation
- ✅ Notifications

### Test All Existing Features After Changes
1. Create pass → Verify approval workflow still works
2. View pass details → Verify all fields display correctly
3. Generate QR/PDF → Verify generation works
4. Check notifications → Verify notifications sent

---

## Sign-Off Checklist

- [ ] All 10 test scenarios pass
- [ ] Database records correct
- [ ] Console logs show expected output
- [ ] No JavaScript errors in browser console
- [ ] No errors in server logs
- [ ] Coordinator assignment working
- [ ] Date validation working
- [ ] Form switching working
- [ ] Existing features still working
- [ ] Performance acceptable

