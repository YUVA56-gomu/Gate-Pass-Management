# HOSTEL STAFF DASHBOARD - TESTING GUIDE

## 🧪 Quick Testing Steps

### Prerequisites
- Backend server running on port 5000
- Frontend running on port 5173
- Database with test data

---

## 1. LOGIN TEST

**Credentials**:
- Email: `priya.nair@hostel.edu` OR `suresh.kumar@hostel.edu`
- Password: `hostel123`

**Expected**:
- ✅ Login successful
- ✅ Redirects to `/hostel/dashboard`
- ✅ Dashboard loads without errors

---

## 2. PROFILE BUTTON TEST

**Steps**:
1. Click "Profile" button in header (top right)

**Expected**:
- ✅ Navigates to `/hostel/profile`
- ✅ Shows profile page with user information
- ✅ Does NOT redirect to landing page

---

## 3. LOGOUT CONFIRMATION TEST

**Steps**:
1. Click "Logout" button in header (top right, red button)

**Expected**:
- ✅ Modal appears with glassmorphism effect
- ✅ Title: "Confirm Logout"
- ✅ Message: "Are you sure you want to logout from Smart Gate Pass Management System?"
- ✅ Two buttons: "Cancel" (gray) and "Logout" (red)

**Test Cancel**:
1. Click "Cancel"

**Expected**:
- ✅ Modal closes
- ✅ User stays logged in
- ✅ Dashboard still visible

**Test Logout**:
1. Click "Logout" button again
2. Click "Logout" in modal

**Expected**:
- ✅ User logged out
- ✅ Redirects to `/login`
- ✅ Session cleared

---

## 4. QUICK ACTIONS TEST

**Steps**:
1. Look at right sidebar "Quick Actions" card

**Expected**:
- ✅ "View Pending Requests" button (blue)
- ✅ "Approved Passes" button (purple) ← NOT "Generate Pass"
- ✅ "Gate Pass Report" button (green)

**Test Approved Passes**:
1. Click "Approved Passes" button

**Expected**:
- ✅ Switches to "All Passes" tab
- ✅ Shows approved passes table

---

## 5. STUDENT DIRECTORY TEST

**Steps**:
1. Click "Students" tab in navigation

**Expected**:
- ✅ Shows student directory table
- ✅ Displays real student records (NOT "No students found")
- ✅ Shows columns: Name, USN, Department, Program, Year, Hostel, Room, Actions

**Check Console**:
```
[HOSTEL SERVICE] Fetching students with search: 
[HOSTEL SERVICE] Found students: X (where X > 0)
[HOSTEL DASHBOARD] Setting students: X
```

**Test Search**:
1. Type student name in search box

**Expected**:
- ✅ Table filters in real-time
- ✅ Shows matching students only

---

## 6. PENDING PASSES TEST

**Steps**:
1. Go to Dashboard tab
2. Look at "Pending Requests" table

**Expected**:
- ✅ Shows real pending passes (if any exist)
- ✅ Displays: Student Name, USN, Pass Type, Coordinator Status, Reason, Leave Dates, Actions
- ✅ If no pending passes: Shows "No pending requests" message

**Check Console**:
```
[HOSTEL SERVICE] Fetching pending passes...
[HOSTEL SERVICE] Found pending passes: X
[HOSTEL DASHBOARD] Setting pending passes: X
```

---

## 7. STATISTICS CARDS TEST

**Steps**:
1. Look at 4 statistics cards at top

**Expected**:
- ✅ Pending Requests: Shows real count (blue card)
- ✅ Approved Today: Shows real count (green card)
- ✅ Rejected Today: Shows real count (red card)
- ✅ Students Outside: Shows real count (purple card)

**Check Console**:
```
[HOSTEL SERVICE] Dashboard stats: {
  pending: X,
  approvedToday: X,
  rejectedToday: X,
  studentsOutside: X,
  totalPassesThisMonth: X
}
```

---

## 8. TODAY'S OVERVIEW TEST

**Steps**:
1. Look at right sidebar "Today's Overview" card

**Expected**:
- ✅ Entries (IN): Shows real count from gate logs
- ✅ Exits (OUT): Shows real count from gate logs
- ✅ Currently Outside: Shows calculated count
- ✅ Expected Returns Today: Shows real count

---

## 9. INTER FONT TEST

**Steps**:
1. Inspect any text element
2. Check computed styles

**Expected**:
- ✅ Font family: "Inter", system-ui, sans-serif
- ✅ All text uses Inter font

---

## 10. APPROVE PASS TEST

**Prerequisites**: At least one pending pass exists

**Steps**:
1. Go to Pending Requests table
2. Click green "Approve" button on a pass

**Expected**:
- ✅ Success notification appears
- ✅ Pass disappears from pending table
- ✅ "Approved Today" count increases by 1
- ✅ Pass appears in "All Passes" tab

---

## 11. REJECT PASS TEST

**Prerequisites**: At least one pending pass exists

**Steps**:
1. Go to Pending Requests table
2. Click red "Reject" button on a pass
3. Modal opens
4. Try clicking "Reject Pass" without entering remarks

**Expected**:
- ✅ Error notification: "Remarks are required for rejection"

**Steps**:
1. Enter rejection remarks in textarea
2. Click "Reject Pass"

**Expected**:
- ✅ Success notification appears
- ✅ Pass disappears from pending table
- ✅ "Rejected Today" count increases by 1
- ✅ Modal closes

---

## 12. VIEW DETAILS TEST

**Prerequisites**: At least one pending pass exists

**Steps**:
1. Go to Pending Requests table
2. Click blue "View Details" button (eye icon)

**Expected**:
- ✅ Modal opens with glassmorphism effect
- ✅ Shows Student Information section
- ✅ Shows Pass Information section
- ✅ Shows Coordinator Status (if Long Leave)
- ✅ Shows rejection remarks textarea
- ✅ Shows Approve and Reject buttons

---

## 13. NAVIGATION TEST

**Test All Tabs**:
1. Click "Dashboard" tab
2. Click "Pending Requests" tab
3. Click "All Passes" tab
4. Click "Students" tab

**Expected**:
- ✅ Each tab loads correctly
- ✅ Active tab has blue underline
- ✅ Content changes for each tab
- ✅ No console errors
- ✅ No redirects to landing page

---

## 14. CONSOLE LOGS TEST

**Open Browser DevTools** (F12) → Console Tab

**Expected Logs**:
```
[HOSTEL DASHBOARD] Fetching dashboard data...
[HOSTEL SERVICE] Fetching pending passes...
[HOSTEL SERVICE] Found pending passes: X
[HOSTEL SERVICE] Fetching students with search: 
[HOSTEL SERVICE] Found students: X
[HOSTEL SERVICE] Calculating dashboard stats...
[HOSTEL SERVICE] Dashboard stats: {...}
[HOSTEL DASHBOARD] Dashboard data received: {...}
[HOSTEL DASHBOARD] Setting pending passes: X
[HOSTEL DASHBOARD] Setting all passes: X
[HOSTEL DASHBOARD] Setting students: X
```

**No Errors Expected**:
- ❌ No SQL errors
- ❌ No "Unknown column" errors
- ❌ No "Cannot read property" errors
- ❌ No 404 errors
- ❌ No 500 errors

---

## 15. EMPTY STATE TEST

**If No Pending Passes**:
- ✅ Shows "No pending requests" message with icon
- ✅ Shows "All caught up!" message

**If No Students** (shouldn't happen if database has students):
- ✅ Shows "No students found" message
- ✅ Check console logs to debug

**If No Approved Passes**:
- ✅ Shows "No approved passes found" message

---

## 🐛 TROUBLESHOOTING

### Issue: Students Not Showing

**Check**:
1. Backend console: `[HOSTEL SERVICE] Found students: X`
2. If X = 0:
   - Check database: `SELECT * FROM students;`
   - Check database: `SELECT * FROM users WHERE role = 'STUDENT';`
   - Verify students are linked to users

**Fix**:
- Ensure students table has records
- Ensure users table has records with role = 'STUDENT'
- Ensure students.user_id matches users.id

### Issue: Passes Not Showing

**Check**:
1. Backend console: `[HOSTEL SERVICE] Found pending passes: X`
2. If X = 0:
   - Check database: `SELECT * FROM passes WHERE status = 'PENDING_HOSTEL';`

**Fix**:
- Create test passes via student dashboard
- Ensure passes have status = 'PENDING_HOSTEL'

### Issue: Profile Redirects to Landing

**Check**:
- Route exists in AppRoutes.jsx
- HostelProfile component imported
- No authentication errors

**Fix**:
- Verify `/hostel/profile` route is defined
- Check RoleRoute allows 'HOSTEL_STAFF'

### Issue: Logout Modal Not Showing

**Check**:
- `showLogoutModal` state exists
- `handleLogout` function defined
- Modal JSX added before closing `</div>`

**Fix**:
- Verify all changes applied to Dashboard.jsx

---

## ✅ SUCCESS CRITERIA

All tests pass when:
- [x] Profile button navigates to profile page
- [x] Logout shows confirmation modal
- [x] Quick Actions shows "Approved Passes" (not "Generate Pass")
- [x] Student directory shows real students
- [x] Pending passes show real data
- [x] Statistics show real counts
- [x] Today's Overview shows real data
- [x] Inter font applied
- [x] All navigation works
- [x] No console errors
- [x] No SQL errors
- [x] Approve/Reject works
- [x] View Details works
- [x] Search works

---

## 📊 EXPECTED RESULTS

### With Test Data:
- Pending Requests: 1-5 passes
- Approved Today: 0-2 passes
- Rejected Today: 0-1 passes
- Students Outside: 0-3 students
- Students Directory: 5-10 students
- All Passes: 5-15 passes

### Without Test Data:
- All counts: 0
- Empty state messages shown
- No errors in console

---

**Testing Date**: May 31, 2026
**Tester**: [Your Name]
**Status**: [ ] PASS / [ ] FAIL
**Notes**: _____________________
