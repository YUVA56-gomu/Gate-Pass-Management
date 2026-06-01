# Smart Gate Pass Management System - Database Schema Design

## 1. ER Diagram Description

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────────┘

                              USERS
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                STUDENTS    APPROVALS   NOTIFICATIONS
                    │           │           │
                    │      ┌────┴────┐      │
                    │      │         │      │
                  PASSES  APPROVALS  │      │
                    │      (FK)      │      │
                    │               │      │
                ┌───┴───┐           │      │
                │       │           │      │
            GATE_LOGS  QR_TOKENS    │      │
                │       │           │      │
                └───────┴───────────┴──────┘
                    
            ACTIVITY_LOGS (tracks all actions)
            DEPARTMENTS (reference table)
```

## 2. Database Relationships

### Primary Relationships:
1. **Users → Students** (1:1)
   - One user can have one student profile
   - Foreign Key: `user_id` in students table

2. **Students → Passes** (1:N)
   - One student can have multiple passes
   - Foreign Key: `student_id` in passes table

3. **Passes → Approvals** (1:N)
   - One pass can have multiple approvals (coordinator + hostel staff)
   - Foreign Key: `pass_id` in approvals table

4. **Users → Approvals** (1:N)
   - One user (approver) can approve multiple passes
   - Foreign Key: `approved_by` in approvals table

5. **Passes → Gate Logs** (1:N)
   - One pass can have multiple gate logs (IN/OUT)
   - Foreign Key: `pass_id` in gate_logs table

6. **Passes → QR Tokens** (1:1)
   - One pass has one QR token
   - Foreign Key: `pass_id` in qr_tokens table

7. **Users → Notifications** (1:N)
   - One user can have multiple notifications
   - Foreign Key: `user_id` in notifications table

8. **Users → Activity Logs** (1:N)
   - One user can have multiple activity logs
   - Foreign Key: `user_id` in activity_logs table

9. **Students → Departments** (N:1)
   - Multiple students belong to one department
   - Foreign Key: `department_id` in students table

## 3. Normalization Notes

### Normalization Level: 3NF (Third Normal Form)

**Reasons:**
- All non-key attributes depend on the primary key
- No transitive dependencies
- Eliminates data redundancy
- Maintains referential integrity

**Design Decisions:**
1. **Separated Users and Students**: Allows flexibility for non-student users (admin, coordinator, security)
2. **Separate Approvals Table**: Tracks multi-stage approval workflow
3. **QR Tokens Table**: Stores QR data separately for security and scalability
4. **Activity Logs**: Maintains audit trail without cluttering other tables
5. **Departments Reference Table**: Avoids storing department names repeatedly

## 4. ENUM Values

### User Roles
```
'student', 'coordinator', 'hostel_staff', 'security', 'admin'
```

### Pass Types
```
'daily', 'long_leave'
```

### Pass Status
```
'pending', 'approved', 'rejected', 'cancelled'
```

### Approval Stages
```
'coordinator', 'hostel_staff'
```

### Approval Status
```
'pending', 'approved', 'rejected'
```

### Gate Log Actions
```
'IN', 'OUT'
```

### Departments
```
'CSE', 'ECE', 'Robotics', 'MBA', 'MCA'
```

### Program Types
```
'UG', 'PG'
```

### Notification Types
```
'pass_applied', 'pass_approved', 'pass_rejected', 'pass_cancelled', 
'approval_pending', 'approval_completed', 'gate_scan', 'system_alert'
```

### Activity Log Actions
```
'user_registered', 'user_login', 'pass_applied', 'pass_approved', 
'pass_rejected', 'approval_given', 'gate_scanned', 'qr_generated', 
'pdf_generated', 'user_updated', 'user_deleted'
```

## 5. Primary Keys & Constraints

### Primary Keys (All INT AUTO_INCREMENT)
- `users.id`
- `students.id`
- `passes.id`
- `approvals.id`
- `gate_logs.id`
- `qr_tokens.id`
- `notifications.id`
- `activity_logs.id`
- `departments.id`

### Unique Constraints
- `users.email` - Email must be unique
- `students.usn` - USN must be unique
- `students.user_id` - One user can have one student profile
- `qr_tokens.pass_id` - One pass has one QR token

### NOT NULL Constraints
- All foreign keys
- All required fields (name, email, password, etc.)
- All status fields (default values provided)

### Check Constraints
- `year_of_study` must be valid for program type
- `semester` must be valid for program type
- `from_date` must be <= `to_date` in passes table

## 6. Foreign Keys & Referential Integrity

### Foreign Key Relationships
```
students.user_id → users.id (ON DELETE CASCADE)
students.department_id → departments.id (ON DELETE RESTRICT)

passes.student_id → students.id (ON DELETE CASCADE)

approvals.pass_id → passes.id (ON DELETE CASCADE)
approvals.approved_by → users.id (ON DELETE SET NULL)

gate_logs.pass_id → passes.id (ON DELETE CASCADE)

qr_tokens.pass_id → passes.id (ON DELETE CASCADE)

notifications.user_id → users.id (ON DELETE CASCADE)

activity_logs.user_id → users.id (ON DELETE CASCADE)
```

### Cascade Rules
- **ON DELETE CASCADE**: When a student/pass is deleted, related records are deleted
- **ON DELETE SET NULL**: When an approver is deleted, approval record remains but approver is NULL
- **ON DELETE RESTRICT**: Cannot delete department if students exist

## 7. Indexes for Performance

### Recommended Indexes
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Students table
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_usn ON students(usn);
CREATE INDEX idx_students_department_id ON students(department_id);

-- Passes table
CREATE INDEX idx_passes_student_id ON passes(student_id);
CREATE INDEX idx_passes_status ON passes(status);
CREATE INDEX idx_passes_type ON passes(type);
CREATE INDEX idx_passes_created_at ON passes(created_at);
CREATE INDEX idx_passes_from_date ON passes(from_date);
CREATE INDEX idx_passes_to_date ON passes(to_date);

-- Approvals table
CREATE INDEX idx_approvals_pass_id ON approvals(pass_id);
CREATE INDEX idx_approvals_approved_by ON approvals(approved_by);
CREATE INDEX idx_approvals_stage ON approvals(stage);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_created_at ON approvals(created_at);

-- Gate Logs table
CREATE INDEX idx_gate_logs_pass_id ON gate_logs(pass_id);
CREATE INDEX idx_gate_logs_action ON gate_logs(action);
CREATE INDEX idx_gate_logs_scanned_at ON gate_logs(scanned_at);

-- QR Tokens table
CREATE INDEX idx_qr_tokens_pass_id ON qr_tokens(pass_id);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX idx_qr_tokens_active ON qr_tokens(is_active);

-- Notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Activity Logs table
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

### Composite Indexes (for common queries)
```sql
CREATE INDEX idx_passes_student_status ON passes(student_id, status);
CREATE INDEX idx_approvals_pass_stage ON approvals(pass_id, stage);
CREATE INDEX idx_gate_logs_pass_action ON gate_logs(pass_id, action);
```
