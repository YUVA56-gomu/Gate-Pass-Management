# Smart Gate Pass Management System - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Auth Endpoints

### Register
- **POST** `/auth/register`
- **Body**: `{ name, email, password }`
- **Response**: User object

### Login
- **POST** `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

### Verify Token
- **GET** `/auth/verify`
- **Headers**: Authorization required
- **Response**: User object

## Pass Endpoints

### Create Pass
- **POST** `/passes`
- **Headers**: Authorization required
- **Body**: `{ type, reason, destination, from_date, to_date }`
- **Response**: Pass object

### Get My Passes
- **GET** `/passes/my-passes`
- **Headers**: Authorization required
- **Response**: Array of passes

### Get Pass by ID
- **GET** `/passes/:id`
- **Headers**: Authorization required
- **Response**: Pass object

### Download PDF
- **GET** `/passes/:id/pdf`
- **Headers**: Authorization required
- **Response**: PDF file

### Get QR Code
- **GET** `/passes/:id/qr`
- **Headers**: Authorization required
- **Response**: QR code image

## Approval Endpoints

### Get Pending Requests
- **GET** `/approvals/pending`
- **Headers**: Authorization required (coordinator, hostel_staff)
- **Response**: Array of pending approvals

### Approve Request
- **POST** `/approvals/:id/approve`
- **Headers**: Authorization required (coordinator, hostel_staff)
- **Body**: `{ remarks }`
- **Response**: Approval object

### Reject Request
- **POST** `/approvals/:id/reject`
- **Headers**: Authorization required (coordinator, hostel_staff)
- **Body**: `{ remarks }`
- **Response**: Approval object

### Get History
- **GET** `/approvals/history`
- **Headers**: Authorization required (coordinator, hostel_staff)
- **Response**: Array of approvals

## Security Endpoints

### Scan QR
- **POST** `/security/scan`
- **Headers**: Authorization required (security)
- **Body**: `{ qrCode }`
- **Response**: Pass details

### Mark IN
- **POST** `/security/mark-in/:passId`
- **Headers**: Authorization required (security)
- **Response**: Success message

### Mark OUT
- **POST** `/security/mark-out/:passId`
- **Headers**: Authorization required (security)
- **Response**: Success message

### Get Scan Logs
- **GET** `/security/logs`
- **Headers**: Authorization required (security)
- **Response**: Array of gate logs

## User Endpoints

### Get Profile
- **GET** `/users/profile`
- **Headers**: Authorization required
- **Response**: User object

### Update Profile
- **PUT** `/users/profile`
- **Headers**: Authorization required
- **Body**: `{ name, phone }`
- **Response**: Updated user object

### Get All Users
- **GET** `/users`
- **Headers**: Authorization required (admin)
- **Response**: Array of users

### Create User
- **POST** `/users`
- **Headers**: Authorization required (admin)
- **Body**: `{ name, email, password, role }`
- **Response**: User object

### Update User
- **PUT** `/users/:id`
- **Headers**: Authorization required (admin)
- **Body**: User data
- **Response**: Updated user object

### Delete User
- **DELETE** `/users/:id`
- **Headers**: Authorization required (admin)
- **Response**: Success message

## Report Endpoints

### Get Dashboard Stats
- **GET** `/reports/stats`
- **Headers**: Authorization required (admin)
- **Response**: `{ total_users, total_passes, approved_passes, total_scans }`

## Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

## Success Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```
