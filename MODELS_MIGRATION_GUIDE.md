# Sequelize Models Migration Guide

## Overview

This guide documents the migration of Sequelize models from the old schema to the new finalized database schema. All models have been updated to match the production-ready database design.

---

## Migration Summary

### What Changed
- ✅ 2 new models created (Department, QRToken)
- ✅ 7 existing models updated
- ✅ All ENUM values standardized to uppercase
- ✅ All associations properly defined
- ✅ All foreign keys correctly referenced
- ✅ All data types match database schema

### What Stayed the Same
- ✅ Sequelize configuration (db.js)
- ✅ Model file structure
- ✅ Association patterns
- ✅ Timestamps configuration

---

## Model-by-Model Changes

### 1. User Model

#### Before
```javascript
role: {
  type: DataTypes.ENUM('student', 'coordinator', 'hostel_staff', 'security', 'admin'),
  allowNull: false,
  defaultValue: 'student'
}
```

#### After
```javascript
role: {
  type: DataTypes.ENUM('STUDENT', 'COORDINATOR', 'HOSTEL_STAFF', 'SECURITY', 'ADMIN'),
  allowNull: false,
  defaultValue: 'STUDENT'
},
phone: {
  type: DataTypes.STRING
},
is_active: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
},
last_login: {
  type: DataTypes.DATE,
  allowNull: true
}
```

#### Impact
- All role references must be updated to uppercase
- Controllers, services, and routes need updates
- Frontend role checks need updates

---

### 2. Department Model (NEW)

#### Created
```javascript
const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'departments',
  timestamps: true
})
```

#### Usage
- Reference departments when creating students
- Validate department_id exists before creating student
- Use in student queries and reports

---

### 3. Student Model

#### Before
```javascript
{
  user_id: INTEGER (FK, unique),
  usn: STRING (unique),
  branch: STRING,
  room_no: STRING,
  phone: STRING
}
```

#### After
```javascript
{
  user_id: INTEGER (FK, unique),
  usn: STRING (unique),
  department_id: INTEGER (FK),
  program_type: ENUM('UG', 'PG'),
  year_of_study: INTEGER,
  semester: INTEGER,
  gender: ENUM('MALE', 'FEMALE', 'OTHER'),
  hostel_name: STRING,
  hostel_type: ENUM('BOYS', 'GIRLS'),
  room_number: STRING,
  parent_phone: STRING,
  emergency_contact: STRING
}
```

#### Impact
- Removed: branch, phone (use department_id and users.phone)
- Added: department_id, program_type, year_of_study, semester, gender, hostel_type, parent_phone, emergency_contact
- Renamed: room_no → room_number
- All student creation/update code needs changes
- All student queries need updates

---

### 4. Pass Model

#### Before
```javascript
{
  type: ENUM('daily', 'long_leave'),
  reason: TEXT,
  destination: STRING,
  status: ENUM('pending', 'approved', 'rejected')
}
```

#### After
```javascript
{
  type: ENUM('DAILY', 'LONG_LEAVE'),
  reason: TEXT (required),
  destination: STRING (required),
  status: ENUM('PENDING_COORDINATOR', 'PENDING_HOSTEL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
  pdf_path: STRING
}
```

#### Removed
- qr_code field (use QRToken model instead)

#### Impact
- All pass type references must be uppercase
- All pass status references must be updated to new workflow
- Pass creation logic needs updates
- Pass status checks need updates
- QR code handling moved to QRToken model

---

### 5. Approval Model

#### Before
```javascript
{
  stage: ENUM('coordinator', 'hostel_staff'),
  status: ENUM('pending', 'approved', 'rejected'),
  remarks: TEXT
}
```

#### After
```javascript
{
  stage: ENUM('COORDINATOR', 'HOSTEL_STAFF'),
  status: ENUM('PENDING', 'APPROVED', 'REJECTED'),
  remarks: TEXT,
  approved_at: DATE (nullable)
}
```

#### Impact
- All approval stage references must be uppercase
- All approval status references must be uppercase
- Approval timestamp tracking improved
- Service layer validation needed for coordinator approval rule

---

### 6. QRToken Model (NEW)

#### Created
```javascript
const QRToken = sequelize.define('QRToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pass_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, FK },
  token: { type: DataTypes.STRING(500), allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'qr_tokens',
  timestamps: false
})
```

#### Usage
- Create QRToken when pass is approved
- Query QRToken by token for scanning
- Check is_active and expires_at for validation
- Update is_active when pass is cancelled

---

### 7. GateLog Model

#### Before
```javascript
{
  pass_id: INTEGER (FK),
  action: ENUM('IN', 'OUT'),
  scanned_at: DATE
}
```

#### After
```javascript
{
  pass_id: INTEGER (FK),
  action: ENUM('IN', 'OUT'),
  scan_status: ENUM('VALID', 'INVALID', 'EXPIRED'),
  scanned_by: INTEGER (FK to users),
  scanned_at: DATE
}
```

#### Impact
- Added scan_status tracking (VALID, INVALID, EXPIRED)
- Added scanned_by user reference
- Gate log queries need updates
- Security guard tracking improved

---

### 8. Notification Model

#### Before
```javascript
{
  user_id: INTEGER (FK),
  title: STRING,
  message: TEXT,
  is_read: BOOLEAN
}
```

#### After
```javascript
{
  user_id: INTEGER (FK),
  type: ENUM('pass_applied', 'pass_approved', 'pass_rejected', 'pass_cancelled', 'approval_pending', 'approval_completed', 'gate_scan', 'system_alert'),
  title: STRING,
  message: TEXT,
  related_pass_id: INTEGER (FK),
  is_read: BOOLEAN,
  read_at: DATE (nullable)
}
```

#### Impact
- Added notification type tracking
- Added related_pass_id for linking to passes
- Added read_at timestamp
- Notification queries need updates
- Notification creation needs type parameter

---

### 9. ActivityLog Model

#### Before
```javascript
{
  user_id: INTEGER (FK),
  action: STRING
}
```

#### After
```javascript
{
  user_id: INTEGER (FK),
  action: STRING,
  entity_type: STRING,
  entity_id: INTEGER,
  old_values: JSON,
  new_values: JSON,
  ip_address: STRING,
  user_agent: STRING
}
```

#### Impact
- Enhanced audit trail with entity tracking
- JSON fields for before/after values
- IP address and user agent logging
- Activity log queries can be more detailed

---

## Association Changes

### New Associations
```javascript
// Department
Department.hasMany(Student, { foreignKey: 'department_id', onDelete: 'RESTRICT' })
Student.belongsTo(Department, { foreignKey: 'department_id' })

// User → GateLog
User.hasMany(GateLog, { foreignKey: 'scanned_by', onDelete: 'SET NULL' })
GateLog.belongsTo(User, { foreignKey: 'scanned_by', as: 'scanner' })

// Pass → QRToken
Pass.hasOne(QRToken, { foreignKey: 'pass_id', onDelete: 'CASCADE' })
QRToken.belongsTo(Pass, { foreignKey: 'pass_id' })

// Pass → Notification
Pass.hasMany(Notification, { foreignKey: 'related_pass_id', onDelete: 'SET NULL' })
Notification.belongsTo(Pass, { foreignKey: 'related_pass_id', as: 'relatedPass' })
```

### Updated Associations
```javascript
// User → Approval (unchanged, but stage/status uppercase)
User.hasMany(Approval, { foreignKey: 'approved_by', onDelete: 'SET NULL' })
Approval.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' })

// Pass → GateLog (unchanged, but scan_status added)
Pass.hasMany(GateLog, { foreignKey: 'pass_id', onDelete: 'CASCADE' })
GateLog.belongsTo(Pass, { foreignKey: 'pass_id' })
```

---

## Code Migration Checklist

### Controllers
- [ ] Update all role comparisons to uppercase
  - Before: `if (user.role === 'student')`
  - After: `if (user.role === 'STUDENT')`
- [ ] Update all pass type comparisons to uppercase
  - Before: `if (pass.type === 'daily')`
  - After: `if (pass.type === 'DAILY')`
- [ ] Update all pass status comparisons to new workflow
  - Before: `if (pass.status === 'pending')`
  - After: `if (pass.status === 'PENDING_HOSTEL')`
- [ ] Update all approval stage comparisons to uppercase
  - Before: `if (approval.stage === 'coordinator')`
  - After: `if (approval.stage === 'COORDINATOR')`
- [ ] Update all approval status comparisons to uppercase
  - Before: `if (approval.status === 'pending')`
  - After: `if (approval.status === 'PENDING')`
- [ ] Update gate log action comparisons (already uppercase)
- [ ] Add scan_status handling to gate log controller
- [ ] Add notification type handling to notification controller
- [ ] Update student controller for new fields

### Services
- [ ] Update role validation in auth service
- [ ] Update pass workflow logic in pass service
- [ ] Implement coordinator approval validation
  - Only allow for LONG_LEAVE passes
- [ ] Implement hostel staff approval validation
  - Allow for both DAILY and LONG_LEAVE passes
- [ ] Implement rejection remarks validation
  - Mandatory when status = REJECTED
- [ ] Update gate log service for scan_status
- [ ] Update notification service for notification types
- [ ] Update activity log service for entity tracking

### Routes
- [ ] Update all role checks in route middleware
- [ ] Update all ENUM value references in route handlers
- [ ] Add new routes for QRToken if needed
- [ ] Update pass routes for new status workflow
- [ ] Update approval routes for new stage/status

### Repositories
- [ ] Update user repository for role queries
- [ ] Update pass repository for status queries
- [ ] Update approval repository for stage/status queries
- [ ] Update gate log repository for scan_status queries
- [ ] Add department repository if needed
- [ ] Add QRToken repository if needed

### Frontend
- [ ] Update all role displays to uppercase
- [ ] Update all pass type displays to uppercase
- [ ] Update all pass status displays to new workflow
- [ ] Update all approval stage displays to uppercase
- [ ] Update all approval status displays to uppercase
- [ ] Update gate log action displays
- [ ] Add scan_status display to gate logs
- [ ] Add notification type handling
- [ ] Update student form for new fields
- [ ] Update role selection in user management

### API Layer
- [ ] Update all API response ENUM values
- [ ] Update all API request validation for ENUM values
- [ ] Update API documentation for new ENUM values
- [ ] Update API error messages for new ENUM values

---

## Testing Checklist

### Unit Tests
- [ ] Test user role validation
- [ ] Test pass type validation
- [ ] Test pass status workflow
- [ ] Test approval stage validation
- [ ] Test approval status validation
- [ ] Test gate log scan_status
- [ ] Test notification types
- [ ] Test student field validation

### Integration Tests
- [ ] Test daily pass workflow
- [ ] Test long leave pass workflow
- [ ] Test approval workflow
- [ ] Test gate log creation
- [ ] Test notification creation
- [ ] Test activity log creation

### End-to-End Tests
- [ ] Test complete daily pass flow
- [ ] Test complete long leave pass flow
- [ ] Test rejection workflow
- [ ] Test cancellation workflow
- [ ] Test security scanning

---

## Deployment Checklist

### Pre-Deployment
- [ ] All models updated and tested
- [ ] All controllers updated and tested
- [ ] All services updated and tested
- [ ] All routes updated and tested
- [ ] All frontend components updated and tested
- [ ] All API endpoints tested
- [ ] Database migrations prepared

### Deployment
- [ ] Backup existing database
- [ ] Run database migrations
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify all endpoints working
- [ ] Monitor error logs

### Post-Deployment
- [ ] Verify all workflows working
- [ ] Check database integrity
- [ ] Monitor performance
- [ ] Verify notifications working
- [ ] Check audit logs

---

## Rollback Plan

If issues occur during deployment:

1. Stop the application
2. Restore database from backup
3. Revert to previous code version
4. Restart application
5. Verify functionality
6. Investigate issues
7. Fix and redeploy

---

## Common Issues and Solutions

### Issue: "Unknown column 'branch' in 'field list'"
**Solution**: Update queries to use `department_id` instead of `branch`

### Issue: "Enum value 'student' is not valid"
**Solution**: Update all role references to uppercase 'STUDENT'

### Issue: "Enum value 'pending' is not valid"
**Solution**: Update all pass status references to new workflow values

### Issue: "Foreign key constraint fails"
**Solution**: Ensure all referenced records exist before creating dependent records

### Issue: "QRToken not found"
**Solution**: Create QRToken when pass is approved, not when created

### Issue: "Notification type not recognized"
**Solution**: Use one of the 8 valid notification types

---

## Performance Considerations

### Indexes
- All foreign keys are indexed
- All search columns are indexed
- Composite indexes for common queries
- Date indexes for range queries

### Queries
- Use eager loading for associations
- Use select to limit columns
- Use where clauses to filter early
- Use pagination for large result sets

### Caching
- Cache department list (rarely changes)
- Cache user roles (rarely changes)
- Cache notification types (never changes)
- Don't cache pass status (frequently changes)

---

## Documentation References

- `DATABASE_SCHEMA_FINAL.md` - Final database schema
- `SEQUELIZE_MODELS_UPDATED.md` - Complete model documentation
- `IMPLEMENTATION_STATUS.md` - Implementation progress
- `DATABASE_CORRECTIONS_SUMMARY.md` - Summary of corrections

---

## Support

For questions or issues:
1. Check the documentation files
2. Review the model definitions
3. Check the database schema
4. Review the service layer validation rules
5. Check the error logs

---

## Status

✅ **ALL MODELS UPDATED**  
✅ **ALL ASSOCIATIONS DEFINED**  
✅ **ALL ENUM VALUES STANDARDIZED**  
⏳ **CONTROLLERS/SERVICES PENDING UPDATE**  
⏳ **FRONTEND PENDING UPDATE**  

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Next Step**: Update Controllers and Services

