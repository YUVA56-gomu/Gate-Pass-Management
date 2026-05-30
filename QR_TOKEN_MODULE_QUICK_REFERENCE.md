# QR Token Module - Quick Reference Guide

## Overview
The QR Token Module provides secure QR code generation and verification for approved passes. QR tokens contain only a UUID string with no sensitive data. Security personnel verify tokens by fetching pass details from the backend.

## Key Features
- ✅ UUID-based QR token generation
- ✅ Base64 QR image generation
- ✅ QR token verification with pass details
- ✅ One active QR per pass (previous QRs auto-deactivated)
- ✅ Role-based access control
- ✅ Secure token validation

## Database Schema

### QRToken Table
```
id (PK)
pass_id (FK) → Pass.id
token (UNIQUE, VARCHAR(36))
expires_at (NULLABLE)
is_active (BOOLEAN, DEFAULT: true)
createdAt
updatedAt
```

## API Endpoints

### 1. Generate QR Token
```
POST /qr/generate/:passId
Authorization: Required
Roles: STUDENT, HOSTEL_STAFF, ADMIN

Request:
- passId: Pass ID (URL param)

Response (Success):
{
  "success": true,
  "message": "QR token generated successfully",
  "data": {
    "id": 1,
    "pass_id": 5,
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "expires_at": null,
    "createdAt": "2026-05-31T10:00:00Z",
    "updatedAt": "2026-05-31T10:00:00Z"
  }
}

Errors:
- "Pass not found" (404)
- "QR can only be generated for approved passes" (400)
```

### 2. Generate QR Code Image
```
POST /qr/code
Authorization: Required
Roles: STUDENT, HOSTEL_STAFF, ADMIN, SECURITY

Request:
{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}

Response (Success):
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}

Errors:
- "Token is required" (400)
```

### 3. Verify QR Token
```
POST /qr/verify
Authorization: Required
Roles: SECURITY, ADMIN

Request:
{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}

Response (Success):
{
  "success": true,
  "message": "QR token verified successfully",
  "data": {
    "pass": {
      "id": 5,
      "student_id": 2,
      "pass_type": "LONG_LEAVE",
      "status": "APPROVED",
      "from_date": "2026-06-01",
      "to_date": "2026-06-05",
      "reason": "Family visit",
      "destination": "Bangalore",
      "created_at": "2026-05-31T09:00:00Z"
    },
    "student": {
      "id": 2,
      "usn": "USN123456",
      "program_type": "UG",
      "year_of_study": 2,
      "semester": 4,
      "hostel_name": "Hostel A",
      "room_number": "A101",
      "User": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "Department": {
        "id": 1,
        "name": "Computer Science",
        "code": "CSE"
      }
    },
    "approval": {
      "id": 3,
      "pass_id": 5,
      "approved_by": 3,
      "stage": "HOSTEL_STAFF",
      "status": "APPROVED",
      "remarks": "Approved",
      "approved_at": "2026-05-31T10:00:00Z"
    },
    "qrToken": {
      "token": "550e8400-e29b-41d4-a716-446655440000",
      "generatedAt": "2026-05-31T10:00:00Z",
      "expiresAt": null
    }
  }
}

Errors:
- "Token is required" (400)
- "Invalid QR token" (404)
- "QR token is inactive" (400)
- "QR token has expired" (400)
- "Pass is not approved" (400)
```

### 4. Get QR for Pass
```
GET /qr/pass/:passId
Authorization: Required
Roles: STUDENT, HOSTEL_STAFF, ADMIN

Request:
- passId: Pass ID (URL param)

Response (Success):
{
  "success": true,
  "message": "QR data retrieved successfully",
  "data": {
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "generatedAt": "2026-05-31T10:00:00Z",
    "expiresAt": null
  }
}

Errors:
- "Pass not found" (404)
- "QR is only available for approved passes" (400)
- Student can only access their own passes (403)
```

### 5. Deactivate QR Token
```
PUT /qr/deactivate/:passId
Authorization: Required
Roles: HOSTEL_STAFF, ADMIN

Request:
- passId: Pass ID (URL param)

Response (Success):
{
  "success": true,
  "message": "QR token deactivated successfully",
  "data": {
    "passId": 5,
    "deactivatedCount": 1
  }
}

Errors:
- "Pass not found" (404)
```

### 6. Get QR Token Details
```
GET /qr/token/:token
Authorization: Required
Roles: SECURITY, ADMIN

Request:
- token: QR token (URL param)

Response (Success):
{
  "success": true,
  "message": "QR token details retrieved successfully",
  "data": {
    "id": 1,
    "pass_id": 5,
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "expires_at": null,
    "createdAt": "2026-05-31T10:00:00Z",
    "updatedAt": "2026-05-31T10:00:00Z"
  }
}

Errors:
- "Token is required" (400)
- "QR token not found" (404)
```

## Frontend API Functions

### qr.api.js
```javascript
// Generate QR Token for a pass
generateQRToken(passId)

// Generate QR Code image from token
generateQRCode(token)

// Verify QR Token
verifyQRToken(token)

// Get QR Token and Image for a pass
getQRForPass(passId)

// Deactivate QR Token for a pass
deactivateQR(passId)

// Get QR Token details
getQRTokenDetails(token)
```

## Business Rules

### QR Generation Rules
- ✅ QR generated ONLY when Pass Status = APPROVED
- ✅ No QR for PENDING_COORDINATOR, PENDING_HOSTEL, or REJECTED
- ✅ One active QR per pass
- ✅ Previous QRs automatically deactivated when new QR generated
- ✅ QR contains ONLY: `{ "token": "uuid-string" }`

### QR Verification Rules
- ✅ Token must exist and be active
- ✅ Token must not be expired (if expires_at is set)
- ✅ Pass must exist and status must be APPROVED
- ✅ Returns complete pass, student, and approval details

### Authorization Rules
- ✅ Students can generate QR only for their own passes
- ✅ Hostel Staff can generate QR for any pass
- ✅ Admin can generate QR for any pass
- ✅ Only Security and Admin can verify QR tokens
- ✅ Only Hostel Staff and Admin can deactivate QR

## Integration Points

### With Pass Module
- QR generated after pass is APPROVED by Hostel Staff
- QR deactivated if pass is cancelled (future feature)
- QR token linked to pass via pass_id

### With Student Module
- Student can view QR for their own approved passes
- Student details included in QR verification response

### With Approval Module
- Approval details included in QR verification response
- Shows which stage approved the pass (COORDINATOR or HOSTEL_STAFF)

### With Security Module (Future)
- Security scans QR to verify pass
- Backend returns pass and student details
- Security records gate entry/exit in GateLog

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- 400: Bad Request (missing/invalid parameters)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (pass/token not found)
- 500: Server Error

## Testing Checklist

- [ ] Generate QR token for approved pass
- [ ] Verify QR token returns correct pass details
- [ ] Verify QR token returns correct student details
- [ ] Verify QR token returns correct approval details
- [ ] Verify QR image is valid Base64 PNG
- [ ] Verify previous QR is deactivated when new QR generated
- [ ] Verify student cannot generate QR for other student's pass
- [ ] Verify QR cannot be generated for non-approved passes
- [ ] Verify QR cannot be verified if inactive
- [ ] Verify QR cannot be verified if expired
- [ ] Verify deactivate QR works correctly
- [ ] Verify role-based access control on all endpoints

## Files Generated

### Backend
- `server/src/services/qr.service.js` - QR business logic (7 functions)
- `server/src/controllers/qr.controller.js` - QR endpoints (6 endpoints)
- `server/src/routes/qr.routes.js` - QR route configuration

### Frontend
- `client/src/api/qr.api.js` - QR API integration (6 functions)

### Updated
- `server/src/server.js` - QR routes registered

## Dependencies

### Backend
- `uuid` - UUID v4 token generation
- `qrcode` - QR code image generation
- `sequelize` - ORM for database operations

### Frontend
- `axios` - HTTP client (via axios.js)
- `react` - UI framework

## Next Steps

1. **Security Module** - Implement QR scanning and gate entry/exit logging
2. **PDF Generation** - Generate PDF passes with embedded QR codes
3. **QR Expiration** - Implement QR token expiration logic
4. **QR History** - Track QR generation and verification history
5. **QR Analytics** - Generate reports on QR usage and verification patterns
