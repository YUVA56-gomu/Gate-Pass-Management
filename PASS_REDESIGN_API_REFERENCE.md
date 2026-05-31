# Pass Application Redesign - API Reference

## Overview
This document provides complete API reference for the redesigned pass application system with support for Daily Pass and Long Leave types.

---

## Endpoints

### Create Pass
**POST** `/api/passes`

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

#### Request Body

**Daily Pass**
```json
{
  "pass_type": "DAILY",
  "reason": "Medical appointment",
  "destination": "City Hospital",
  "pass_date": "2025-01-15",
  "exit_time": "09:00",
  "expected_return_time": "12:00"
}
```

**Long Leave**
```json
{
  "pass_type": "LONG_LEAVE",
  "reason": "Family emergency",
  "destination": "Home",
  "from_date": "2025-01-20",
  "to_date": "2025-01-25",
  "parent_contact": "9876543210"
}
```

#### Field Descriptions

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| pass_type | string | Yes | Type of pass | DAILY or LONG_LEAVE |
| reason | string | Yes | Reason for pass | Non-empty, max 1000 chars |
| destination | string | Yes | Destination | Non-empty, max 255 chars |
| pass_date | string | Conditional | Date for daily pass | YYYY-MM-DD, >= today |
| exit_time | string | No | Exit time for daily pass | HH:MM format |
| expected_return_time | string | No | Expected return time | HH:MM format |
| from_date | string | Conditional | Leaving date for long leave | YYYY-MM-DD, >= today |
| to_date | string | Conditional | Returning date for long leave | YYYY-MM-DD, > from_date |
| parent_contact | string | Conditional | Parent phone number | 10 digits, required for LONG_LEAVE |

#### Response (Success - 201)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "student_id": 5,
    "pass_type": "DAILY",
    "reason": "Medical appointment",
    "destination": "City Hospital",
    "pass_date": "2025-01-15",
    "from_date": null,
    "to_date": null,
    "exit_time": "09:00",
    "expected_return_time": "12:00",
    "parent_contact": null,
    "coordinator_id": 5,
    "status": "PENDING_HOSTEL",
    "pdf_path": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "message": "Pass created successfully"
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "Pass date cannot be in the past",
  "statusCode": 400
}
```

#### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| Pass date cannot be in the past | Selected date is before today | Select today or future date |
| Leaving date cannot be in the past | Leaving date is before today | Select today or future date |
| Returning date must be after leaving date | Returning date <= leaving date | Select returning date after leaving date |
| Parent contact is required for long leave | Missing parent contact | Provide 10-digit phone number |
| Pass type must be DAILY or LONG_LEAVE | Invalid pass type | Use DAILY or LONG_LEAVE |
| Student profile not found | Student profile doesn't exist | Complete student profile first |
| Student profile must be completed | Profile incomplete | Complete all required fields |

---

## Get My Passes
**GET** `/api/passes/my-passes`

#### Request Headers
```
Authorization: Bearer {token}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "student_id": 5,
      "pass_type": "DAILY",
      "reason": "Medical appointment",
      "destination": "City Hospital",
      "pass_date": "2025-01-15",
      "from_date": null,
      "to_date": null,
      "exit_time": "09:00",
      "expected_return_time": "12:00",
      "parent_contact": null,
      "coordinator_id": 5,
      "status": "PENDING_HOSTEL",
      "pdf_path": null,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": 43,
      "student_id": 5,
      "pass_type": "LONG_LEAVE",
      "reason": "Family emergency",
      "destination": "Home",
      "pass_date": null,
      "from_date": "2025-01-20",
      "to_date": "2025-01-25",
      "exit_time": null,
      "expected_return_time": null,
      "parent_contact": "9876543210",
      "coordinator_id": 5,
      "status": "PENDING_COORDINATOR",
      "pdf_path": null,
      "createdAt": "2025-01-16T14:20:00Z",
      "updatedAt": "2025-01-16T14:20:00Z"
    }
  ],
  "message": "Passes retrieved successfully"
}
```

---

## Get Pass by ID
**GET** `/api/passes/:id`

#### Request Headers
```
Authorization: Bearer {token}
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Pass ID |

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "student_id": 5,
    "pass_type": "DAILY",
    "reason": "Medical appointment",
    "destination": "City Hospital",
    "pass_date": "2025-01-15",
    "from_date": null,
    "to_date": null,
    "exit_time": "09:00",
    "expected_return_time": "12:00",
    "parent_contact": null,
    "coordinator_id": 5,
    "status": "PENDING_HOSTEL",
    "pdf_path": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "message": "Pass retrieved successfully"
}
```

#### Response (Error - 404)
```json
{
  "success": false,
  "message": "Pass not found",
  "statusCode": 404
}
```

---

## Data Models

### Pass Model

```javascript
{
  id: number,                    // Primary key
  student_id: number,            // Foreign key to students
  pass_type: 'DAILY' | 'LONG_LEAVE',
  reason: string,                // Reason for pass
  destination: string,           // Destination
  pass_date: string | null,      // YYYY-MM-DD (DAILY only)
  from_date: string | null,      // YYYY-MM-DD (LONG_LEAVE only)
  to_date: string | null,        // YYYY-MM-DD (LONG_LEAVE only)
  exit_time: string | null,      // HH:MM (DAILY optional)
  expected_return_time: string | null, // HH:MM (DAILY optional)
  parent_contact: string | null, // Phone number (LONG_LEAVE only)
  coordinator_id: number | null, // Foreign key to users
  status: 'PENDING_COORDINATOR' | 'PENDING_HOSTEL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED',
  pdf_path: string | null,       // Path to generated PDF
  createdAt: ISO8601,            // Creation timestamp
  updatedAt: ISO8601             // Last update timestamp
}
```

### Approval Model

```javascript
{
  id: number,
  pass_id: number,               // Foreign key to passes
  stage: 'COORDINATOR' | 'HOSTEL_STAFF',
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  approver_id: number | null,    // Foreign key to users
  comments: string | null,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

---

## Status Transitions

### Daily Pass Status Flow
```
PENDING_HOSTEL
    ↓
APPROVED (if hostel staff approves)
    ↓
ACTIVE (when pass is used)
    ↓
COMPLETED (when pass expires)

OR

REJECTED (if hostel staff rejects)
CANCELLED (if student cancels)
```

### Long Leave Status Flow
```
PENDING_COORDINATOR
    ↓
PENDING_HOSTEL (if coordinator approves)
    ↓
APPROVED (if hostel staff approves)
    ↓
ACTIVE (when pass is used)
    ↓
COMPLETED (when pass expires)

OR

REJECTED (at any stage)
CANCELLED (if student cancels)
```

---

## Coordinator Assignment Logic

### Automatic Assignment
```javascript
// When pass is created:
1. Get student's department_id
2. Query User table for:
   - role = 'COORDINATOR'
   - is_active = true
   - department_id matches (if applicable)
3. If found: Assign coordinator_id
4. If not found: coordinator_id = null
```

### Console Output
```
[COORDINATOR ASSIGNMENT] Found coordinator: Dr. John Smith (ID: 5) for department 2
[COORDINATOR ASSIGNMENT] No coordinator found for department 2
[COORDINATOR ASSIGNMENT] Error finding coordinator: {error message}
```

---

## Date Handling

### Date Format
- All dates stored as YYYY-MM-DD (DATEONLY)
- No time component in date fields
- Times stored separately in TIME fields

### Date Validation
```javascript
// Validation Rules
1. Pass date >= today (UTC)
2. Leaving date >= today (UTC)
3. Returning date > leaving date
4. No timezone conversion issues
```

### Date Comparison
```javascript
// String comparison (YYYY-MM-DD format)
'2025-01-15' < '2025-01-20' // true
'2025-01-20' > '2025-01-15' // true
'2025-01-15' === '2025-01-15' // true
```

---

## Validation Rules

### Daily Pass
```javascript
{
  pass_type: 'DAILY',
  reason: {
    required: true,
    minLength: 1,
    maxLength: 1000
  },
  destination: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  pass_date: {
    required: true,
    format: 'YYYY-MM-DD',
    minDate: today,
    maxDate: null
  },
  exit_time: {
    required: false,
    format: 'HH:MM'
  },
  expected_return_time: {
    required: false,
    format: 'HH:MM'
  }
}
```

### Long Leave
```javascript
{
  pass_type: 'LONG_LEAVE',
  reason: {
    required: true,
    minLength: 1,
    maxLength: 1000
  },
  destination: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  from_date: {
    required: true,
    format: 'YYYY-MM-DD',
    minDate: today,
    maxDate: null
  },
  to_date: {
    required: true,
    format: 'YYYY-MM-DD',
    minDate: from_date + 1 day,
    maxDate: null
  },
  parent_contact: {
    required: true,
    format: 'phone',
    length: 10
  }
}
```

---

## Example Requests

### Create Daily Pass (cURL)
```bash
curl -X POST http://localhost:5000/api/passes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "pass_type": "DAILY",
    "reason": "Medical appointment",
    "destination": "City Hospital",
    "pass_date": "2025-01-15",
    "exit_time": "09:00",
    "expected_return_time": "12:00"
  }'
```

### Create Long Leave (cURL)
```bash
curl -X POST http://localhost:5000/api/passes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "pass_type": "LONG_LEAVE",
    "reason": "Family emergency",
    "destination": "Home",
    "from_date": "2025-01-20",
    "to_date": "2025-01-25",
    "parent_contact": "9876543210"
  }'
```

### Get My Passes (cURL)
```bash
curl -X GET http://localhost:5000/api/passes/my-passes \
  -H "Authorization: Bearer {token}"
```

### Get Pass by ID (cURL)
```bash
curl -X GET http://localhost:5000/api/passes/42 \
  -H "Authorization: Bearer {token}"
```

---

## JavaScript/Fetch Examples

### Create Daily Pass
```javascript
const createDailyPass = async (passData) => {
  const response = await fetch('/api/passes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      pass_type: 'DAILY',
      reason: passData.reason,
      destination: passData.destination,
      pass_date: passData.pass_date,
      exit_time: passData.exit_time,
      expected_return_time: passData.expected_return_time
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

### Create Long Leave
```javascript
const createLongLeave = async (passData) => {
  const response = await fetch('/api/passes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      pass_type: 'LONG_LEAVE',
      reason: passData.reason,
      destination: passData.destination,
      from_date: passData.from_date,
      to_date: passData.to_date,
      parent_contact: passData.parent_contact
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

### Get My Passes
```javascript
const getMyPasses = async () => {
  const response = await fetch('/api/passes/my-passes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

---

## Rate Limiting

- No specific rate limiting implemented
- Subject to general API rate limits
- Recommended: 100 requests per minute per user

---

## Authentication

- All endpoints require Bearer token authentication
- Token obtained from login endpoint
- Token must be included in Authorization header

---

## CORS

- CORS enabled for frontend domain
- Credentials included in requests
- Preflight requests handled

---

## Versioning

- Current API version: v1
- No breaking changes planned
- Backward compatibility maintained

---

## Support

For API issues or questions:
1. Check console logs for [PASS SERVICE] and [PASS CONTROLLER] messages
2. Review error messages and validation rules
3. Verify request format matches examples
4. Check database records for data consistency

