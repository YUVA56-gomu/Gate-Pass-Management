# Reports Module - Quick Reference Guide

## Overview
The Reports Module provides comprehensive analytics and statistics for system administrators. It includes 7 report types with CSV/PDF export capabilities.

## Backend Architecture

### Service Layer (`server/src/services/report.service.js`)
Implements 9 core functions for data aggregation:

1. **getOverallStats()** - System-wide statistics
   - User counts by role (STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN)
   - Pass counts by status (APPROVED, REJECTED, PENDING, COMPLETED)
   - Students outside calculation (OUT without IN today)
   - All values calculated from actual database records

2. **getDepartmentStats()** - Department-wise breakdown
   - Iterates through all departments
   - Counts students per department
   - Aggregates pass statistics per department
   - Returns: departmentName, totalStudents, totalPasses, approvedPasses, rejectedPasses

3. **getMonthlyStats()** - Monthly pass trends
   - Groups passes by month using DATE_TRUNC
   - Calculates approved/rejected counts per month
   - Returns: month (formatted), totalPasses, approvedPasses, rejectedPasses
   - Ordered by most recent month first

4. **getPassTypeStats()** - Pass type breakdown
   - Analyzes DAILY and LONG_LEAVE passes
   - Counts total, approved, rejected per type
   - Returns: passType, totalCount, approvedCount, rejectedCount

5. **getSecurityStats()** - Security gate logs analysis
   - Today's OUT scans count
   - Today's IN scans count
   - Completed passes (both OUT and IN)
   - Students outside (OUT without IN)
   - Recent activity (last 10 scans with student/pass details)

6. **getCoordinatorPerformance()** - Coordinator metrics
   - Iterates through all COORDINATOR users
   - Counts approvals/rejections per coordinator
   - Pending passes count (PENDING_COORDINATOR status)
   - Average processing time in minutes
   - Returns: coordinatorName, approvals, rejections, pending, avgProcessingTimeMinutes

7. **getHostelStaffPerformance()** - Hostel staff metrics
   - Iterates through all HOSTEL_STAFF users
   - Counts approvals/rejections per staff member
   - Pending passes count (PENDING_HOSTEL status)
   - Average processing time in minutes
   - Returns: hostelStaffName, approvals, rejections, pending, avgProcessingTimeMinutes

8. **exportDataAsCSV(reportType)** - CSV export preparation
   - Accepts: 'overall', 'departments', 'monthly', 'passTypes', 'coordinators', 'hostelStaff'
   - Formats data with headers and quoted values
   - Returns: CSV string ready for download

9. **exportDataAsPDF(reportType)** - PDF export data preparation
   - Accepts: 'overall', 'departments', 'monthly', 'passTypes', 'security', 'coordinators', 'hostelStaff'
   - Returns: { reportType, generatedAt, data }
   - Data ready for PDF generation (frontend or backend)

### Controller Layer (`server/src/controllers/report.controller.js`)
Implements 9 endpoints with standardized responses:

- **getOverview()** - GET /reports/overview
- **getDepartments()** - GET /reports/departments
- **getMonthly()** - GET /reports/monthly
- **getPassTypes()** - GET /reports/pass-types
- **getSecurity()** - GET /reports/security
- **getCoordinators()** - GET /reports/coordinators
- **getHostelStaff()** - GET /reports/hostel-staff
- **exportCSV()** - GET /reports/export/csv?type=...
- **exportPDF()** - GET /reports/export/pdf?type=...

All endpoints return standardized format:
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Routes (`server/src/routes/report.routes.js`)
All routes require:
- `authenticate` middleware (JWT validation)
- `isAdmin` middleware (ADMIN role check)

No access for: STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY

## Frontend Architecture

### API Layer (`client/src/api/report.api.js`)
Provides 9 API functions:

1. **getOverallStats()** - Fetch overall statistics
2. **getDepartmentStats()** - Fetch department statistics
3. **getMonthlyStats()** - Fetch monthly statistics
4. **getPassTypeStats()** - Fetch pass type statistics
5. **getSecurityStats()** - Fetch security statistics
6. **getCoordinatorStats()** - Fetch coordinator performance
7. **getHostelStaffStats()** - Fetch hostel staff performance
8. **exportReportAsCSV(reportType)** - Download CSV file
9. **exportReportAsPDF(reportType)** - Get PDF data

### UI Component (`client/src/pages/Admin/Reports.jsx`)
Tab-based reports dashboard with:

**Tabs:**
1. Overview - User counts, pass statistics, students outside
2. Departments - Department-wise pass breakdown table
3. Monthly - Monthly pass trends table
4. Pass Types - DAILY vs LONG_LEAVE statistics
5. Security - Today's scans, completed passes, students outside, recent activity
6. Coordinators - Coordinator performance metrics table
7. Hostel Staff - Hostel staff performance metrics table

**Features:**
- Tab navigation with active state styling
- Loading state with spinner
- Error/success notifications
- Export buttons (CSV, PDF)
- Responsive grid layouts
- Color-coded status indicators
- Hover effects on tables

## Data Flow

### Report Generation Flow
1. User clicks tab in Reports page
2. Frontend calls appropriate API function
3. API sends GET request to backend
4. Backend service queries database
5. Service aggregates data from multiple tables
6. Controller returns standardized response
7. Frontend displays data in appropriate format

### Export Flow
1. User clicks Export CSV/PDF button
2. Frontend calls export function with current tab type
3. Backend service prepares data
4. For CSV: Controller sets headers and sends CSV string
5. For PDF: Controller returns data object
6. Frontend handles download (CSV) or displays data (PDF)

## Database Queries Used

### Overall Stats
- COUNT users by role
- COUNT passes by status
- Complex query: OUT logs without corresponding IN logs (students outside)

### Department Stats
- JOIN Student → Department
- COUNT students per department
- COUNT passes per department with status filtering

### Monthly Stats
- GROUP BY DATE_TRUNC('month', createdAt)
- COUNT passes per month
- COUNT by status per month

### Pass Type Stats
- GROUP BY type (DAILY, LONG_LEAVE)
- COUNT by status per type

### Security Stats
- Query GateLog for today's date range
- COUNT by action (OUT, IN)
- Complex: Find passes with OUT but no IN (students outside)

### Performance Stats
- Query Approval table by approved_by user
- COUNT by status (APPROVED, REJECTED)
- Calculate time difference: (approved_at - createdAt) / 60000 = minutes

## Performance Considerations

### Optimizations
- Database aggregation (DATE_TRUNC, COUNT with WHERE)
- Indexed queries on status, role, action fields
- Batch processing for department/coordinator stats
- Efficient date range queries for today's logs

### Future Improvements
- Add caching for frequently accessed reports
- Implement pagination for large result sets
- Add date range filters for historical analysis
- Create materialized views for complex aggregations
- Add real-time dashboard updates with WebSockets

## Testing Checklist

- [ ] GET /reports/overview returns correct user/pass counts
- [ ] GET /reports/departments returns all departments with stats
- [ ] GET /reports/monthly returns months in descending order
- [ ] GET /reports/pass-types returns DAILY and LONG_LEAVE stats
- [ ] GET /reports/security returns today's scans and students outside
- [ ] GET /reports/coordinators returns all coordinators with performance
- [ ] GET /reports/hostel-staff returns all hostel staff with performance
- [ ] GET /reports/export/csv?type=overall downloads CSV file
- [ ] GET /reports/export/pdf?type=overall returns PDF data
- [ ] All endpoints require ADMIN role (403 for non-admin)
- [ ] All endpoints require authentication (401 for unauthenticated)
- [ ] Reports page loads all tabs correctly
- [ ] Export buttons work for all report types
- [ ] Error handling displays proper messages
- [ ] Loading state shows during data fetch

## API Response Examples

### Overall Stats Response
```json
{
  "success": true,
  "message": "Overall statistics retrieved successfully",
  "data": {
    "users": {
      "totalStudents": 150,
      "totalCoordinators": 5,
      "totalHostelStaff": 8,
      "totalSecurityStaff": 10
    },
    "passes": {
      "totalPasses": 450,
      "approvedPasses": 380,
      "rejectedPasses": 45,
      "pendingPasses": 25,
      "completedPasses": 320
    },
    "security": {
      "studentsOutside": 12
    }
  }
}
```

### Department Stats Response
```json
{
  "success": true,
  "message": "Department statistics retrieved successfully",
  "data": [
    {
      "departmentName": "CSE",
      "departmentCode": "CSE",
      "totalStudents": 60,
      "totalPasses": 180,
      "approvedPasses": 150,
      "rejectedPasses": 15
    },
    ...
  ]
}
```

### CSV Export Response
```
Metric,Value
"Total Students","150"
"Total Coordinators","5"
"Total Hostel Staff","8"
...
```

## Integration Status

✅ Backend routes registered in server.js
✅ Frontend routes configured in AppRoutes.jsx
✅ Reports link added to Admin sidebar
✅ All API functions implemented
✅ All service functions implemented
✅ All controller endpoints implemented
✅ Frontend UI component complete
✅ Error handling implemented
✅ Loading states implemented
✅ Export functionality prepared

## Known Limitations (MVP)

1. PDF export returns data only (actual PDF generation not implemented)
2. No date range filters (always shows all-time data)
3. No pagination for large result sets
4. Dashboard statistics are MVP implementation (future: integrate with Gate Logs)
5. No real-time updates (page refresh required)
6. No chart visualizations (data tables only)

## Future Enhancements

1. Add date range filters to all reports
2. Implement PDF generation with pdfkit
3. Add chart visualizations (bar, pie, line charts)
4. Implement report scheduling and email delivery
5. Add data export to Excel format
6. Create custom report builder
7. Add real-time dashboard with WebSockets
8. Implement report caching for performance
9. Add audit trail for report access
10. Create advanced filtering options
