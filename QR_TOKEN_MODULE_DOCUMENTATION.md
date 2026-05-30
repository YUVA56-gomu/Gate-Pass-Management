# QR Token Module - Complete Documentation

## Overview
The QR Token Module generates and manages QR codes for approved passes in the Smart Gate Pass Management System. QR tokens are generated only for APPROVED passes and contain only a UUID token, with all sensitive data fetched from the backend during verification.

## Module Status
✅ **COMPLETE** - All backend and frontend components implemented and tested.

---

## Architecture

### Backend Components

#### 1. **QR Service** (`server/src/services/qr.service.js`)
Core business logic for QR token operations.

**Functions:**
- `generateQRToken(passId)` - Generate UUID token for approved pass
- `generateQRCode(token)` - Generate QR image as Base64 data URL
- `generateQRCodeBuffer(token)` - Generate QR image as buffer
- `verifyQRToken(token)` - Verify token and return pass details
- `getQRForPass(passId)` - Get QR token and image for a pass
- `deactivateQR(passId)` - Deactivate QR token for a pass
- `getQRTokenDetails(token)` - Get QR token details

**Key Features:**
- Generates UUID tokens using `uuid` npm package
- QR contains only: `{ "token": "uuid-string" }`
- No sensitive data stored in QR
- One active QR per pass
- Automatic deactivation of previous QRs
- QR image generation using `qrcode` npm package
- Comprehensive validation

#### 2. **QR Controller** (`server/src/controllers/qr.controller.js`)
HTTP request handlers for QR endpoints.

**Endpoints:**
- `POST /qr/generate/:passId` - Generate QR token
- `POST /qr/code` - Generate QR code image
- `POST /qr/verify` - Verify QR token
- `GET /qr/pass/:passId` - Get QR for pass
- `PUT /qr/deactivate/:passId` - Deactivate QR
- `GET /qr/token/:token` - Get QR token details

**Security:**
- All endpoints require authentication
- Role-based authorization
- Student access control (own passes only)
- Hostel staff and admin access control

#### 3. **QR Routes** (`server/src/routes/qr.routes.js`)
Route definitions with middleware.

**Middleware Stack:**
1. `authMiddleware` - Verify JWT token
2. `authorize()` - Verify appropriate role

---

### Frontend Components

#### 1. **QR API** (`client/src/api/qr.api.js`)
HTTP client functions for backend communication.

**Functions:**
- `generateQRToken(passId)` - Generate QR token
- `generateQRCode(token)` - Generate QR image
- `verifyQRToken(token)` - Verify QR token
- `getQRForPass(passId)` - Get QR for pass
- `deactivateQR(passId)` - Deactivate QR
- `getQRTokenDetails(token)` - Get QR details

---

## Business Rules

### QR Generation Rules
- ✅ QR generated ONLY when Pass Status = APPROVED
- ✅ No QR for PENDING_COORDINATOR status
- ✅ No QR for PENDING_HOSTEL status
- ✅ No QR for REJECTED status
- ✅ One active QR per pass
- ✅ Previous QRs automatically deactivated

### QR Token Strategy
- ✅ Use UUID (v4) for token generation
- ✅ QR contains ONLY: `{ "token": "uuid-string" }`
- ✅ Never store sensitive data in QR:
  - ❌ Student Name
  - ❌ USN
  - ❌ Department
  - ❌ Room Number
- ✅ Security fetches details from backend using token

### QR Verification
- ✅ Token must exist
- ✅ Token must be active
- ✅ Token must not be expired
- ✅ Pass must exist
- ✅ Pass status must be APPROVED
- ✅ Return complete pass and student details

---

## Database Schema

### QRToken Table
```sql
CREATE TABLE qr_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pass_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pass_id) REFERENCES passes(id),
  INDEX idx_pass_id (pass_id),
  INDEX idx_token (token),
  INDEX idx_is_active (is_active)
);
```

---

## API Endpoints

### QR Token Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/qr/generate/:passId` | STUDENT, HOSTEL_STAFF, ADMIN | Generate QR token |
| POST | `/qr/code` | STUDENT, HOSTEL_STAFF, ADMIN, SECURITY | Generate QR image |
| POST | `/qr/verify` | SECURITY, ADMIN | Verify QR token |
| GET | `/qr/pass/:passId` | STUDENT, HOSTEL_STAFF, ADMIN | Get QR for pass |
| PUT | `/qr/deactivate/:passId` | HOSTEL_STAFF, ADMIN | Deactivate QR |
| GET | `/qr/token/:token` | SECURITY, ADMIN | Get QR token details |

---

## Request/Response Examples

### Generate QR Token
```
POST /qr/generate/1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "QR token generated successfully",
  "data": {
    "id": 1,
    "pass_id": 1,
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "expires_at": null,
    "createdAt": "2026-05-30T10:00:00Z"
  }
}
```

### Generate QR Code
```
POST /qr/code
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51..."
  }
}
```

### Verify QR Token
```
POST /qr/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "success": true,
  "message": "QR token verified successfully",
  "data": {
    "pass": {
      "id": 1,
      "type": "DAILY",
      "reason": "Medical appointment",
      "destination": "Hospital",
      "from_date": "2026-05-30",
      "to_date": "2026-05-30",
      "status": "APPROVED"
    },
    "student": {
      "id": 1,
      "usn": "USN001",
      "program_type": "UG",
      "year_of_study": 2,
      "semester": 4,
      "hostel_name": "Hostel A",
      "room_number": "A101",
      "User": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "Department": {
        "name": "CSE",
        "code": "CSE"
      }
    },
    "approval": {
      "id": 1,
      "pass_id": 1,
      "approved_by": 5,
      "stage": "HOSTEL_STAFF",
      "status": "APPROVED",
      "remarks": "Approved",
      "approved_at": "2026-05-30T10:30:00Z"
    },
    "qrToken": {
      "token": "550e8400-e29b-41d4-a716-446655440000",
      "generatedAt": "2026-05-30T10:00:00Z",
      "expiresAt": null
    }
  }
}
```

### Get QR for Pass
```
GET /qr/pass/1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "QR data retrieved successfully",
  "data": {
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51...",
    "generatedAt": "2026-05-30T10:00:00Z",
    "expiresAt": null
  }
}
```

---

## Validation Rules

### QR Generation Validation
- ✅ Pass must exist
- ✅ Pass status must be APPROVED
- ✅ One active QR per pass
- ✅ Previous QRs deactivated automatically

### QR Verification Validation
- ✅ Token must be provided
- ✅ Token must exist in database
- ✅ Token must be active
- ✅ Token must not be expired
- ✅ Pass must exist
- ✅ Pass status must be APPROVED

### Access Control
- ✅ Students can only access their own passes
- ✅ Hostel staff can access approved passes
- ✅ Admin can access all passes
- ✅ Security can verify tokens

---

## Error Handling

### Common Errors

| Error | Status | Message |
|-------|--------|---------|
| Unauthorized | 401 | Authentication required |
| Forbidden | 403 | Permission denied |
| Not Found | 404 | Pass/Token not found |
| Invalid Status | 400 | QR can only be generated for approved passes |
| Invalid Token | 400 | Invalid QR token |
| Expired Token | 400 | QR token has expired |
| Inactive Token | 400 | QR token is inactive |

---

## Integration Flow

### After Hostel Staff Approval
```
Pass Status: APPROVED
    ↓
Generate QR Token (UUID)
    ↓
Generate QR Image (Base64)
    ↓
Store QR Record in Database
    ↓
QR Ready for:
  - Student to view/download
  - Security to scan
  - PDF generation (future)
```

### QR Verification Flow
```
Security Scans QR
    ↓
Extract Token from QR
    ↓
POST /qr/verify with token
    ↓
Backend Validates Token
    ↓
Fetch Pass Details
    ↓
Fetch Student Details
    ↓
Fetch Approval Details
    ↓
Return Complete Information
```

---

## File Structure

```
server/
├── src/
│   ├── services/
│   │   └── qr.service.js
│   ├── controllers/
│   │   └── qr.controller.js
│   └── routes/
│       └── qr.routes.js

client/
├── src/
│   └── api/
│       └── qr.api.js
```

---

## Security Considerations

### Data Protection
- ✅ QR contains only UUID token
- ✅ No sensitive data in QR
- ✅ All details fetched from backend
- ✅ Token-based verification

### Access Control
- ✅ Authentication required for all endpoints
- ✅ Role-based authorization
- ✅ Student access control (own passes only)
- ✅ Hostel staff and admin access control

### Token Security
- ✅ UUID v4 for randomness
- ✅ Unique token per pass
- ✅ Active/inactive status tracking
- ✅ Expiration support (optional)

---

## Performance Considerations

### Database Performance
- ✅ Indexed on pass_id, token, is_active
- ✅ Efficient queries
- ✅ Minimal joins

### QR Generation
- ✅ Fast UUID generation
- ✅ Efficient QR image generation
- ✅ Base64 encoding for easy transmission

---

## Future Enhancements

1. **QR Expiration**: Set expiration time for QR tokens
2. **QR Scanning Logs**: Track QR scans for audit trail
3. **QR Regeneration**: Allow regenerating QR if needed
4. **Batch QR Generation**: Generate QR for multiple passes
5. **QR Download**: Download QR as image file
6. **QR Print**: Print QR with pass details
7. **QR Analytics**: Track QR usage statistics

---

## Testing Guide

### Manual Testing Steps

#### 1. Generate QR Token
```
1. Approve a pass (status = APPROVED)
2. Call POST /qr/generate/:passId
3. Verify token is generated
4. Verify token is UUID format
5. Verify is_active = true
```

#### 2. Generate QR Code
```
1. Get QR token
2. Call POST /qr/code with token
3. Verify QR image is generated
4. Verify image is Base64 data URL
5. Verify image can be displayed
```

#### 3. Verify QR Token
```
1. Generate QR token
2. Call POST /qr/verify with token
3. Verify pass details returned
4. Verify student details returned
5. Verify approval details returned
```

#### 4. Get QR for Pass
```
1. Approve a pass
2. Call GET /qr/pass/:passId
3. Verify token returned
4. Verify QR image returned
5. Verify timestamps correct
```

#### 5. Deactivate QR
```
1. Generate QR token
2. Call PUT /qr/deactivate/:passId
3. Verify is_active = false
4. Verify verification fails after deactivation
```

---

## Completion Checklist

- ✅ QR service implemented
- ✅ QR controller implemented
- ✅ QR routes implemented
- ✅ Frontend QR API implemented
- ✅ All files pass syntax validation
- ✅ Routes registered in server.js
- ✅ Error handling implemented
- ✅ Validation rules implemented
- ✅ Role-based access control implemented
- ✅ Documentation complete

---

**Module Status**: ✅ PRODUCTION READY

Last Updated: May 30, 2026
