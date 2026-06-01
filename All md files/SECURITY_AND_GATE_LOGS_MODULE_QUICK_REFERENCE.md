# Security Module - Quick Reference

## File Structure

```
Backend:
- server/src/services/security.service.js
- server/src/controllers/security.controller.js
- server/src/routes/security.routes.js

Frontend:
- client/src/api/security.api.js
- client/src/pages/Security/Dashboard.jsx
- client/src/pages/Security/QRScanner.jsx
- client/src/pages/Security/ScanLogs.jsx
```

## API Endpoints

### Scan QR Token
```
POST /security/scan
Authorization: Bearer <token>
Body: { "token": "uuid-string" }
Response: { success, message, data: { passId, scanResult, studentDetails, passDetails, scanTime } }
```

### Get Today's Logs
```
GET /security/logs/today
Authorization: Bearer <token>
Response: { success, message, data: [{ id, passId, studentUSN, studentName, passType, action, scannedAt, scannedBy }] }
```

### Get All Logs with Filters
```
GET /security/logs?filter=ALL|OUT|IN|TODAY
Authorization: Bearer <token>
Response: { success, message, data: [{ id, passId, studentUSN, studentName, passType, action, scannedAt, scannedBy }] }
```

### Get Dashboard Statistics
```
GET /security/dashboard
Authorization: Bearer <token>
Response: { success, message, data: { todayScans, studentsOutside, completedPasses, recentActivity } }
```

## Frontend Routes

```
/security                    → Dashboard
/security/dashboard          → Dashboard
/security/scanner            → QR Scanner
/security/logs               → Scan Logs
```

## Scan Logic Summary

| Scan # | Condition | Action | Result |
|--------|-----------|--------|--------|
| 1st | No OUT log | Create OUT log | OUT |
| 2nd | OUT exists, no IN | Create IN log | IN |
| 3rd+ | OUT & IN exist | No new log | COMPLETED |

## Key Features

### Dashboard
- Today's Scans count
- Students Outside count (OUT without IN)
- Completed Passes count (OUT + IN)
- Recent Activity table (last 10 scans)
- Auto-refresh every 30 seconds

### QR Scanner
- Token input field (auto-focused)
- Scan button
- Result card with student/pass details
- Color-coded status (OUT/IN/COMPLETED)
- Auto-focus after scan

### Scan Logs
- Filter buttons (ALL, OUT, IN, TODAY)
- Logs table with all details
- Summary cards (Total, OUT, IN counts)

## Database Queries

### Count Today's Scans
```sql
SELECT COUNT(*) FROM gate_logs 
WHERE DATE(scanned_at) = CURDATE()
```

### Count Students Outside
```sql
SELECT COUNT(DISTINCT pass_id) FROM gate_logs 
WHERE DATE(scanned_at) = CURDATE() 
AND action = 'OUT' 
AND pass_id NOT IN (
  SELECT pass_id FROM gate_logs 
  WHERE DATE(scanned_at) = CURDATE() 
  AND action = 'IN'
)
```

### Count Completed Passes
```sql
SELECT COUNT(DISTINCT pass_id) FROM gate_logs 
WHERE DATE(scanned_at) = CURDATE() 
AND action = 'OUT' 
AND pass_id IN (
  SELECT pass_id FROM gate_logs 
  WHERE DATE(scanned_at) = CURDATE() 
  AND action = 'IN'
)
```

## Error Messages

| Error | Meaning |
|-------|---------|
| Token is required | No token provided in request |
| Invalid QR token | Token doesn't exist in database |
| QR token is inactive | Token has been deactivated |
| QR token has expired | Token expiration time passed |
| Pass not found | Pass ID doesn't exist |
| Pass is not approved | Pass status is not APPROVED |
| Invalid filter | Filter is not ALL, OUT, IN, or TODAY |

## Security Rules

✅ **Allowed:**
- SECURITY role users only
- Authenticated users with valid JWT
- Scanning APPROVED passes only

❌ **Not Allowed:**
- STUDENT role access
- COORDINATOR role access
- HOSTEL_STAFF role access
- Unauthenticated requests
- Scanning non-APPROVED passes

## Testing Commands

### Test Scan QR
```bash
curl -X POST http://localhost:5000/security/scan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"token":"uuid-string"}'
```

### Test Get Dashboard
```bash
curl -X GET http://localhost:5000/security/dashboard \
  -H "Authorization: Bearer <token>"
```

### Test Get Logs with Filter
```bash
curl -X GET "http://localhost:5000/security/logs?filter=OUT" \
  -H "Authorization: Bearer <token>"
```

## Common Issues

### Issue: "Invalid QR token"
- **Cause:** Token doesn't exist or is incorrect
- **Solution:** Verify token is correct, generate new QR if needed

### Issue: "Pass is not approved"
- **Cause:** Pass status is not APPROVED
- **Solution:** Wait for hostel staff approval

### Issue: "Pass already completed"
- **Cause:** Both OUT and IN logs already exist
- **Solution:** This is expected behavior, no action needed

### Issue: "Insufficient permissions"
- **Cause:** User doesn't have SECURITY role
- **Solution:** Ensure user has SECURITY role assigned

## Performance Notes

- Dashboard auto-refreshes every 30 seconds
- Scanner auto-focuses for continuous scanning
- Logs page loads all logs (consider pagination for large datasets)
- Statistics calculated from actual database records (no hardcoded values)

## Future Enhancements

1. Pagination for logs table
2. Date range filtering
3. Student/hostel filtering
4. Advanced analytics
5. Real-time notifications
6. Mobile app integration
