# Reports Module Documentation

## Overview

The Reports Module provides comprehensive analytics, statistics, and reporting capabilities for the Smart Gate Pass Management System. It enables admins to generate detailed reports on system usage, performance metrics, and user activity.

## Architecture

### Backend Components

#### 1. Report Service (`server/src/services/report.service.js`)
Core business logic for report generation and data aggregation.

**Key Functions:**

- `getOverallStats()` - Get overall system statistics
  - Counts users by role
  - Counts passes by status
  - Calculates students outside
  - All from actual database records

- `getDepartmentStats()` - Get department-wise pass statistics
  - Department name and code
  - Total students per department
  - Total passes per department
  - Approved and rejected passes per department

- `getMonthlyStats()` - Get monthly pass statistics
  - Uses database aggregation for efficiency
  - Groups passes by month
  - Counts approved and rejected passes per month

- `getPassTypeStats()` - Get pass type statistics
  - DAILY and LONG_LEAVE pass counts
  - Approved and rejected counts per type

- `getSecurityStats()` - Get security statistics
  - Today's OUT and IN scans
  - Completed passes count
  - Students outside count
  - Recent security activity

- `getCoordinatorPerformance()` - Get coordinator performance
  - Approvals and rejections per coordinator
  - Pending passes count
  - Average processing time

- `getHostelStaffPerformance()` - Get hostel staff performance
  - Approvals and rejections per staff member
  - Pending passes count
  - Average processing time

- `exportDataAsCSV(reportType)` - Export report as CSV
  - Prepares data in CSV format
  - Supports all report types

- `exportDataAsPDF(reportType)` - Export report as PDF
  - Prepares data for PDF generation
  - Returns structured data

#### 2. Report Controller (`server/src/controllers/report.controller.js`)
HTTP request handlers for report endpoints.

**Endpoints:**

- `GET /reports/overview` - Get overall statistics
- `GET /reports/departments` - Get department statistics
- `GET /reports/monthly` - Get monthly statistics
- `GET /reports/pass-types` - Get pass type statistics
- `GET /reports/security` - Get security statistics
- `GET /reports/coordinators` - Get coordinator performance
- `GET /reports/hostel-staff` - Get hostel staff performance
- `GET /reports/export/csv?type=...` - Export as CSV
- `GET /reports/export/pdf?type=...` - Export as PDF

#### 3. Report Routes (`server/src/routes/report.routes.js`)
Route definitions with authentication and authorization.

**Security:**
- All routes require `authenticate` middleware
- All routes require `isAdmin` role middleware
- No other role access

### Frontend Components

#### 1. Report API (`client/src/api/report.api.js`)
API client functions for report endpoints.

**Functions:**
- `getOverallStats()` - Get overall statistics
- `getDepartmentStats()` - Get department statistics
- `getMonthlyStats()` - Get monthly statistics
- `getPassTypeStats()` - Get pass type statistics
- `getSecurityStats()` - Get security statistics
- `getCoordinatorStats()` - Get coordinator performance
- `getHostelStaffStats()` - Get hostel staff performance
- `exportReportAsCSV(reportType)` - Export as CSV
- `exportReportAsPDF(reportType)` - Export as PDF

#### 2. Reports Page (`client/src/pages/Admin/Reports.jsx`)
Main reports and analytics interface.

**Features:**
- Tab navigation for different reports
- Overview section with statistics cards
- Department-wise statistics table
- Monthly statistics table
- Pass type statistics table
- Security statistics with recent activity
- Coordinator performance table
- Hostel staff performance table
- Export buttons (CSV and PDF)
- Loading and error states

## Report Types

### 1. Overall System Statistics
**Data:**
- Total Students
- Total Coordinators
- Total Hostel Staff
- Total Security Staff
- Total Passes
- Approved Passes
- Rejected Passes
- Pending Passes
- Completed Passes
- Students Outside

**SQL-Equivalent:**
```sql
SELECT COUNT(*) FROM users WHERE role='STUDENT'
SELECT COUNT(*) FROM passes WHERE status='APPROVED'
-- etc.
```

### 2. Department-wise Pass Statistics
**Data:**
- Department Name
- Total Students
- Total Passes
- Approved Passes
- Rejected Passes

**SQL-Equivalent:**
```sql
SELECT d.name, COUNT(DISTINCT s.id), COUNT(p.id), 
       COUNT(CASE WHEN p.status='APPROVED' THEN 1 END),
       COUNT(CASE WHEN p.status='REJECTED' THEN 1 END)
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY d.id
```

### 3. Monthly Pass Statistics
**Data:**
- Month
- Total Passes
- Approved Passes
- Rejected Passes

**SQL-Equivalent:**
```sql
SELECT DATE_TRUNC('month', createdAt), COUNT(*),
       COUNT(CASE WHEN status='APPROVED' THEN 1 END),
       COUNT(CASE WHEN status='REJECTED' THEN 1 END)
FROM passes
GROUP BY DATE_TRUNC('month', createdAt)
ORDER BY DATE_TRUNC('month', createdAt) DESC
```

### 4. Pass Type Statistics
**Data:**
- Pass Type (DAILY, LONG_LEAVE)
- Total Count
- Approved Count
- Rejected Count

### 5. Security Statistics
**Data:**
- Today's OUT Scans
- Today's IN Scans
- Completed Passes
- Students Outside
- Recent Activity (last 10 scans)

**Uses GateLog table for entry/exit tracking**

### 6. Coordinator Performance
**Data:**
- Coordinator Name
- Approvals
- Rejections
- Pending Passes
- Average Processing Time (minutes)

**SQL-Equivalent:**
```sql
SELECT u.name, COUNT(CASE WHEN a.status='APPROVED' THEN 1 END),
       COUNT(CASE WHEN a.status='REJECTED' THEN 1 END),
       COUNT(p.id),
       AVG(EXTRACT(EPOCH FROM (a.approved_at - a.createdAt))/60)
FROM users u
LEFT JOIN approvals a ON u.id = a.approved_by
LEFT JOIN passes p ON p.status='PENDING_COORDINATOR'
WHERE u.role='COORDINATOR'
GROUP BY u.id
```

### 7. Hostel Staff Performance
**Data:**
- Hostel Staff Name
- Approvals
- Rejections
- Pending Passes
- Average Processing Time (minutes)

## Database Integration

### Models Used
- User (for user counts and performance)
- Student (for student counts)
- Pass (for pass statistics)
- Department (for department information)
- Approval (for performance metrics)
- GateLog (for security statistics)

### Relationships
- User → Approval (one-to-many, approved_by)
- User → Student (one-to-one)
- Student → Pass (one-to-many)
- Student → Department (many-to-one)
- Pass → Approval (one-to-many)
- Pass → GateLog (one-to-many)

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Overall statistics retrieved successfully",
  "data": {
    "users": {
      "totalStudents": 150,
      "totalCoordinators": 5,
      "totalHostelStaff": 10,
      "totalSecurityStaff": 8
    },
    "passes": {
      "totalPasses": 500,
      "approvedPasses": 450,
      "rejectedPasses": 30,
      "pendingPasses": 15,
      "completedPasses": 400
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
  "message": "Invalid report type"
}
```

## Export Functionality

### CSV Export
- Converts report data to CSV format
- Sets appropriate headers for download
- Filename: `report-{type}-{date}.csv`
- Supports all report types

### PDF Export
- Prepares data for PDF generation
- Returns structured data
- Can be integrated with pdfkit or similar library
- Supports all report types

## Performance Considerations

1. **Database Aggregation**
   - Uses database-level aggregation for efficiency
   - Minimizes data transfer
   - Suitable for large datasets

2. **Caching Opportunities**
   - Monthly statistics can be cached
   - Department statistics can be cached
   - Consider caching for frequently accessed reports

3. **Query Optimization**
   - Proper indexing on Pass, User, Approval tables
   - Use of raw queries where appropriate
   - Batch operations for performance

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
- Report type validation
- Input sanitization
- Error handling

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid report type | Report type not recognized | Use valid report type |
| Failed to get overall stats | Database error | Check database connection |
| Failed to export data | Export preparation failed | Retry export |

## Future Enhancements

1. **Advanced Filtering**
   - Date range filtering
   - Department filtering
   - Status filtering

2. **Charts and Visualizations**
   - Bar charts for monthly data
   - Pie charts for pass types
   - Line charts for trends

3. **Scheduled Reports**
   - Automatic report generation
   - Email delivery
   - Report scheduling

4. **Custom Reports**
   - User-defined report templates
   - Custom metrics
   - Flexible data selection

5. **Real-time Dashboards**
   - Live statistics updates
   - Real-time alerts
   - Performance monitoring

6. **Advanced Export**
   - Excel export with formatting
   - PDF with charts
   - Email delivery

## Testing Checklist

- [ ] Overall statistics calculate correctly
- [ ] Department statistics are accurate
- [ ] Monthly statistics group correctly
- [ ] Pass type statistics are correct
- [ ] Security statistics calculate correctly
- [ ] Coordinator performance is accurate
- [ ] Hostel staff performance is accurate
- [ ] CSV export works
- [ ] PDF export data is correct
- [ ] Only ADMIN role can access
- [ ] Other roles cannot access
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Tab navigation works

## Deployment Notes

1. Ensure all models exist in database
2. Ensure proper indexing on Pass, User, Approval tables
3. Test all report endpoints
4. Verify export functionality
5. Monitor performance for large datasets
6. Consider caching strategy
