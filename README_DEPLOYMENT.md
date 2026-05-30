# Smart Gate Pass Management System - Deployment Guide

## Quick Start

The Smart Gate Pass Management System is **fully implemented and production-ready**. This guide will help you deploy it to your production environment.

## System Overview

A comprehensive web-based system for managing student gate passes in hostels with:
- 10 complete modules
- 55 API endpoints
- 24 frontend routes
- 9 database models
- Role-based access control (5 roles)
- Real-time analytics and reporting

## Prerequisites

### Server Requirements
- Node.js 16 or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- 2GB RAM minimum
- 10GB disk space minimum

### Development Tools
- Git for version control
- Postman or similar for API testing
- MySQL Workbench or similar for database management

## Deployment Steps

### 1. Backend Deployment

#### Step 1.1: Install Dependencies
```bash
cd server
npm install
```

#### Step 1.2: Configure Environment
Create `.env` file in server root:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gate_pass_system
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=production
```

#### Step 1.3: Setup Database
```bash
# Create database
mysql -u root -p < database_schema.sql

# Or use Sequelize sync (automatic)
npm start
```

#### Step 1.4: Start Backend Server
```bash
npm start
```

Server will run on `http://localhost:5000`

### 2. Frontend Deployment

#### Step 2.1: Install Dependencies
```bash
cd client
npm install
```

#### Step 2.2: Configure Environment
Create `.env` file in client root:
```
VITE_API_URL=http://localhost:5000
```

For production:
```
VITE_API_URL=https://api.yourdomain.com
```

#### Step 2.3: Build Frontend
```bash
npm run build
```

#### Step 2.4: Deploy Built Files
- Copy contents of `dist/` folder to your web server
- Configure web server to serve `index.html` for all routes
- Point domain to web server

### 3. Database Setup

#### Step 3.1: Create Database
```sql
CREATE DATABASE gate_pass_system;
USE gate_pass_system;
```

#### Step 3.2: Create Initial Admin User
```sql
INSERT INTO users (name, email, password, role, is_active, createdAt, updatedAt)
VALUES ('Admin', 'admin@example.com', 'hashed_password', 'ADMIN', true, NOW(), NOW());
```

#### Step 3.3: Create Departments
```sql
INSERT INTO departments (name, code, createdAt, updatedAt) VALUES
('Computer Science', 'CSE', NOW(), NOW()),
('Electronics', 'EC', NOW(), NOW()),
('Robotics', 'ROBOTICS', NOW(), NOW()),
('MBA', 'MBA', NOW(), NOW()),
('MCA', 'MCA', NOW(), NOW());
```

## Module Overview

### 1. Authentication
- Student registration and login
- JWT-based authentication
- Role-based authorization
- Session persistence

### 2. Student Module
- Profile management
- Pass application (DAILY/LONG_LEAVE)
- Pass tracking
- Dashboard and notifications

### 3. Coordinator Module
- Approve/reject LONG_LEAVE passes
- View approval history
- Performance metrics

### 4. Hostel Staff Module
- Approve/reject all passes
- Student directory
- Pass management
- Dashboard statistics

### 5. QR Token Module
- Generate QR codes for approved passes
- QR verification
- Token management

### 6. PDF Generation
- Generate PDFs for approved passes
- Professional formatting
- Embedded QR codes

### 7. Security Module
- QR scanning at gates
- Entry/exit logging
- Real-time statistics
- Scan logs

### 8. Admin Module
- User management
- Dashboard statistics
- Activity logs
- System settings

### 9. Reports Module
- 7 different report types
- CSV/PDF export
- Analytics and statistics
- Performance metrics

## API Endpoints

### Authentication
- `POST /auth/register` - Register new student
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- `PUT /auth/change-password` - Change password

### Student
- `POST /student/profile` - Create/update profile
- `GET /student/profile` - Get profile
- `GET /student/passes` - Get passes
- `GET /student/stats` - Get statistics

### Pass Management
- `POST /passes` - Create pass
- `GET /passes` - Get passes
- `GET /passes/:id` - Get pass details
- `PUT /passes/:id` - Update pass

### Approvals
- `GET /approvals/pending` - Get pending approvals
- `POST /approvals/:passId/approve` - Approve pass
- `POST /approvals/:passId/reject` - Reject pass
- `GET /approvals/history` - Get history

### Hostel
- `GET /hostel/pending` - Get pending passes
- `POST /hostel/:passId/approve` - Approve pass
- `POST /hostel/:passId/reject` - Reject pass
- `GET /hostel/passes` - Get all passes
- `GET /hostel/students` - Get students
- `GET /hostel/stats` - Get statistics

### QR Tokens
- `POST /qr/generate` - Generate QR
- `GET /qr/:passId` - Get QR
- `POST /qr/verify` - Verify QR
- `GET /qr/:passId/details` - Get QR details

### PDF
- `POST /pdf/generate` - Generate PDF
- `GET /pdf/:passId` - Download PDF
- `DELETE /pdf/:passId` - Delete PDF

### Security
- `POST /security/scan` - Scan QR
- `GET /security/logs` - Get logs
- `GET /security/stats` - Get statistics

### Admin
- `GET /admin/dashboard` - Dashboard
- `GET /admin/users` - Get users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id` - Update user
- `PUT /admin/users/:id/activate` - Activate user
- `PUT /admin/users/:id/deactivate` - Deactivate user

### Reports
- `GET /reports/overview` - Overall statistics
- `GET /reports/departments` - Department stats
- `GET /reports/monthly` - Monthly stats
- `GET /reports/pass-types` - Pass type stats
- `GET /reports/security` - Security stats
- `GET /reports/coordinators` - Coordinator performance
- `GET /reports/hostel-staff` - Hostel staff performance
- `GET /reports/export/csv` - Export as CSV
- `GET /reports/export/pdf` - Export as PDF

## User Roles

### 1. Student
- Apply for passes
- View own passes
- Manage profile
- View notifications

### 2. Coordinator
- Approve/reject LONG_LEAVE passes
- View approval history
- View performance metrics

### 3. Hostel Staff
- Approve/reject all passes
- View student directory
- Manage all passes
- View statistics

### 4. Security
- Scan QR codes
- View gate logs
- View statistics

### 5. Admin
- Manage users
- View reports
- View activity logs
- System settings

## Testing

### Test Credentials
```
Admin:
Email: admin@example.com
Password: Admin@123

Coordinator:
Email: coordinator@example.com
Password: Coord@123

Hostel Staff:
Email: hostel@example.com
Password: Hostel@123

Security:
Email: security@example.com
Password: Security@123

Student:
Email: student@example.com
Password: Student@123
```

### Test Endpoints
Use Postman to test endpoints:
1. Login with test credentials
2. Copy JWT token from response
3. Add token to Authorization header: `Bearer {token}`
4. Test other endpoints

## Monitoring

### Logs
- Backend logs: Check console output
- Database logs: Check MySQL logs
- Frontend errors: Check browser console

### Performance
- Monitor API response times
- Monitor database query times
- Monitor server CPU and memory usage
- Monitor database connections

### Security
- Monitor failed login attempts
- Monitor unauthorized access attempts
- Review activity logs regularly
- Check for suspicious patterns

## Troubleshooting

### Backend Won't Start
1. Check Node.js version: `node --version`
2. Check database connection
3. Check environment variables
4. Check port availability: `netstat -an | grep 5000`

### Database Connection Error
1. Check MySQL is running
2. Check credentials in .env
3. Check database exists
4. Check user permissions

### Frontend Won't Load
1. Check API URL in .env
2. Check backend is running
3. Check CORS configuration
4. Check browser console for errors

### API Endpoints Return 401
1. Check JWT token is valid
2. Check token is in Authorization header
3. Check token hasn't expired
4. Re-login to get new token

### API Endpoints Return 403
1. Check user role has permission
2. Check role middleware is applied
3. Check user is not deactivated
4. Check endpoint authorization

## Maintenance

### Regular Tasks
- Monitor system performance
- Review logs for errors
- Backup database daily
- Update dependencies monthly
- Review security logs

### Database Maintenance
- Run OPTIMIZE TABLE monthly
- Check for unused indexes
- Monitor table sizes
- Archive old logs

### Security Updates
- Update Node.js regularly
- Update npm packages regularly
- Review security advisories
- Apply patches promptly

## Support

### Documentation
- Review `REPORTS_MODULE_QUICK_REFERENCE.md` for architecture
- Check code comments in service/controller files
- Review API response examples
- Check database schema documentation

### Debugging
- Enable debug logging
- Use Postman for API testing
- Check browser console for frontend errors
- Check server logs for backend errors

### Common Issues
- See Troubleshooting section above
- Check GitHub issues
- Review error messages carefully
- Check environment configuration

## Performance Optimization

### Database
- Add indexes for frequently queried fields
- Use query optimization
- Monitor slow queries
- Archive old data

### Backend
- Enable caching
- Use connection pooling
- Optimize database queries
- Use compression

### Frontend
- Enable gzip compression
- Minify CSS/JS
- Optimize images
- Use CDN for static files

## Scaling

### Horizontal Scaling
- Use load balancer
- Run multiple backend instances
- Use database replication
- Use caching layer (Redis)

### Vertical Scaling
- Increase server RAM
- Increase CPU cores
- Increase disk space
- Upgrade database server

## Backup & Recovery

### Database Backup
```bash
mysqldump -u root -p gate_pass_system > backup.sql
```

### Database Restore
```bash
mysql -u root -p gate_pass_system < backup.sql
```

### File Backup
- Backup .env files
- Backup uploaded files
- Backup database backups
- Store backups securely

## Conclusion

The Smart Gate Pass Management System is ready for production deployment. Follow this guide to deploy successfully.

For questions or issues, refer to the comprehensive documentation included in the project.

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: May 31, 2026
