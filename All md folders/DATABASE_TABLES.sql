-- ============================================================================
-- Smart Gate Pass Management System - MySQL Database Schema
-- Database: smart_gate_pass
-- MySQL Version: 8.0+
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS smart_gate_pass;
USE smart_gate_pass;

-- ============================================================================
-- 1. DEPARTMENTS TABLE (Reference Table)
-- ============================================================================
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. USERS TABLE (Core Authentication)
-- ============================================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('student', 'coordinator', 'hostel_staff', 'security', 'admin') 
        NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. STUDENTS TABLE (Student-Specific Information)
-- ============================================================================
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    usn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    program_type ENUM('UG', 'PG') NOT NULL,
    year_of_study INT NOT NULL,
    semester INT NOT NULL,
    hostel_name VARCHAR(50),
    room_number VARCHAR(20),
    parent_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    
    INDEX idx_students_user_id (user_id),
    INDEX idx_students_usn (usn),
    INDEX idx_students_department_id (department_id),
    INDEX idx_students_program_type (program_type),
    
    CONSTRAINT chk_ug_year CHECK (
        (program_type = 'UG' AND year_of_study BETWEEN 1 AND 4) OR
        (program_type = 'PG' AND year_of_study BETWEEN 1 AND 2)
    ),
    CONSTRAINT chk_ug_semester CHECK (
        (program_type = 'UG' AND semester BETWEEN 1 AND 8) OR
        (program_type = 'PG' AND semester BETWEEN 1 AND 4)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. PASSES TABLE (Gate Pass Information)
-- ============================================================================
CREATE TABLE passes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    type ENUM('daily', 'long_leave') NOT NULL,
    reason TEXT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') 
        DEFAULT 'pending',
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    
    INDEX idx_passes_student_id (student_id),
    INDEX idx_passes_status (status),
    INDEX idx_passes_type (type),
    INDEX idx_passes_created_at (created_at),
    INDEX idx_passes_from_date (from_date),
    INDEX idx_passes_to_date (to_date),
    INDEX idx_passes_student_status (student_id, status),
    
    CONSTRAINT chk_pass_dates CHECK (from_date <= to_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. APPROVALS TABLE (Multi-Stage Approval Workflow)
-- ============================================================================
CREATE TABLE approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pass_id INT NOT NULL,
    stage ENUM('coordinator', 'hostel_staff') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    remarks TEXT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_approvals_pass_id (pass_id),
    INDEX idx_approvals_approved_by (approved_by),
    INDEX idx_approvals_stage (stage),
    INDEX idx_approvals_status (status),
    INDEX idx_approvals_created_at (created_at),
    INDEX idx_approvals_pass_stage (pass_id, stage),
    
    UNIQUE KEY unique_pass_stage (pass_id, stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. QR_TOKENS TABLE (QR Code Management)
-- ============================================================================
CREATE TABLE qr_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pass_id INT NOT NULL UNIQUE,
    token VARCHAR(500) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
    
    INDEX idx_qr_tokens_pass_id (pass_id),
    INDEX idx_qr_tokens_token (token),
    INDEX idx_qr_tokens_active (is_active),
    INDEX idx_qr_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. GATE_LOGS TABLE (Entry/Exit Tracking)
-- ============================================================================
CREATE TABLE gate_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pass_id INT NOT NULL,
    action ENUM('IN', 'OUT') NOT NULL,
    scanned_by INT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_gate_logs_pass_id (pass_id),
    INDEX idx_gate_logs_action (action),
    INDEX idx_gate_logs_scanned_at (scanned_at),
    INDEX idx_gate_logs_pass_action (pass_id, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. NOTIFICATIONS TABLE (User Notifications)
-- ============================================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM(
        'pass_applied', 'pass_approved', 'pass_rejected', 'pass_cancelled',
        'approval_pending', 'approval_completed', 'gate_scan', 'system_alert'
    ) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_pass_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_pass_id) REFERENCES passes(id) ON DELETE SET NULL,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. ACTIVITY_LOGS TABLE (Audit Trail)
-- ============================================================================
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action (action),
    INDEX idx_activity_logs_created_at (created_at),
    INDEX idx_activity_logs_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. INSERT SAMPLE DEPARTMENTS
-- ============================================================================
INSERT INTO departments (name, code, description) VALUES
('Computer Science and Engineering', 'CSE', 'Department of Computer Science and Engineering'),
('Electronics and Communication', 'ECE', 'Department of Electronics and Communication'),
('Robotics', 'ROBOTICS', 'Department of Robotics and Automation'),
('Master of Business Administration', 'MBA', 'MBA Program'),
('Master of Computer Applications', 'MCA', 'MCA Program');

-- ============================================================================
-- 11. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active Passes with Student Details
CREATE VIEW v_active_passes AS
SELECT 
    p.id,
    p.student_id,
    s.usn,
    s.full_name,
    d.name as department,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    p.status,
    p.created_at
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
WHERE p.status = 'approved' 
    AND p.from_date <= CURDATE() 
    AND p.to_date >= CURDATE();

-- View: Pending Approvals
CREATE VIEW v_pending_approvals AS
SELECT 
    a.id,
    a.pass_id,
    p.type as pass_type,
    s.usn,
    s.full_name,
    p.reason,
    p.destination,
    a.stage,
    a.status,
    a.created_at
FROM approvals a
JOIN passes p ON a.pass_id = p.id
JOIN students s ON p.student_id = s.id
WHERE a.status = 'pending'
ORDER BY a.created_at ASC;

-- View: Pass Approval History
CREATE VIEW v_pass_approval_history AS
SELECT 
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.reason,
    a.stage,
    a.status,
    u.name as approved_by,
    a.remarks,
    a.approved_at,
    a.created_at
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN approvals a ON p.id = a.pass_id
LEFT JOIN users u ON a.approved_by = u.id
ORDER BY p.id, a.stage;

-- View: Gate Log Summary
CREATE VIEW v_gate_log_summary AS
SELECT 
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.from_date,
    p.to_date,
    COUNT(CASE WHEN gl.action = 'IN' THEN 1 END) as total_in,
    COUNT(CASE WHEN gl.action = 'OUT' THEN 1 END) as total_out,
    MAX(CASE WHEN gl.action = 'IN' THEN gl.scanned_at END) as last_in,
    MAX(CASE WHEN gl.action = 'OUT' THEN gl.scanned_at END) as last_out
FROM passes p
JOIN students s ON p.student_id = s.id
LEFT JOIN gate_logs gl ON p.id = gl.pass_id
GROUP BY p.id, s.usn, s.full_name, p.type, p.from_date, p.to_date;

-- ============================================================================
-- 12. STORED PROCEDURES
-- ============================================================================

-- Procedure: Get Student Pass Status
DELIMITER //
CREATE PROCEDURE sp_get_student_passes(IN p_student_id INT)
BEGIN
    SELECT 
        id,
        type,
        reason,
        destination,
        from_date,
        to_date,
        status,
        created_at
    FROM passes
    WHERE student_id = p_student_id
    ORDER BY created_at DESC;
END //
DELIMITER ;

-- Procedure: Get Pending Approvals for User
DELIMITER //
CREATE PROCEDURE sp_get_pending_approvals(IN p_stage VARCHAR(50))
BEGIN
    SELECT 
        a.id,
        a.pass_id,
        p.type,
        s.usn,
        s.full_name,
        p.reason,
        p.destination,
        p.from_date,
        p.to_date,
        a.created_at
    FROM approvals a
    JOIN passes p ON a.pass_id = p.id
    JOIN students s ON p.student_id = s.id
    WHERE a.stage = p_stage AND a.status = 'pending'
    ORDER BY a.created_at ASC;
END //
DELIMITER ;

-- Procedure: Approve Pass
DELIMITER //
CREATE PROCEDURE sp_approve_pass(
    IN p_approval_id INT,
    IN p_approved_by INT,
    IN p_remarks TEXT
)
BEGIN
    UPDATE approvals
    SET 
        status = 'approved',
        approved_by = p_approved_by,
        remarks = p_remarks,
        approved_at = NOW()
    WHERE id = p_approval_id;
    
    -- Check if all approvals are done
    UPDATE passes
    SET status = 'approved'
    WHERE id = (
        SELECT pass_id FROM approvals WHERE id = p_approval_id
    ) AND NOT EXISTS (
        SELECT 1 FROM approvals 
        WHERE pass_id = (SELECT pass_id FROM approvals WHERE id = p_approval_id)
        AND status != 'approved'
    );
END //
DELIMITER ;

-- Procedure: Reject Pass
DELIMITER //
CREATE PROCEDURE sp_reject_pass(
    IN p_approval_id INT,
    IN p_approved_by INT,
    IN p_remarks TEXT
)
BEGIN
    UPDATE approvals
    SET 
        status = 'rejected',
        approved_by = p_approved_by,
        remarks = p_remarks,
        approved_at = NOW()
    WHERE id = p_approval_id;
    
    -- Reject the entire pass
    UPDATE passes
    SET status = 'rejected'
    WHERE id = (SELECT pass_id FROM approvals WHERE id = p_approval_id);
END //
DELIMITER ;

-- Procedure: Record Gate Log
DELIMITER //
CREATE PROCEDURE sp_record_gate_log(
    IN p_pass_id INT,
    IN p_action VARCHAR(10),
    IN p_scanned_by INT
)
BEGIN
    INSERT INTO gate_logs (pass_id, action, scanned_by)
    VALUES (p_pass_id, p_action, p_scanned_by);
END //
DELIMITER ;

-- ============================================================================
-- 13. TRIGGERS
-- ============================================================================

-- Trigger: Log user activity on pass creation
DELIMITER //
CREATE TRIGGER tr_log_pass_creation
AFTER INSERT ON passes
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
    SELECT 
        u.id,
        'pass_applied',
        'pass',
        NEW.id,
        JSON_OBJECT('type', NEW.type, 'destination', NEW.destination)
    FROM users u
    JOIN students s ON u.id = s.user_id
    WHERE s.id = NEW.student_id;
END //
DELIMITER ;

-- Trigger: Log approval activity
DELIMITER //
CREATE TRIGGER tr_log_approval
AFTER UPDATE ON approvals
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
        VALUES (
            NEW.approved_by,
            CONCAT('approval_', NEW.status),
            'approval',
            NEW.id,
            JSON_OBJECT('stage', NEW.stage, 'status', NEW.status)
        );
    END IF;
END //
DELIMITER ;

-- Trigger: Log gate scan activity
DELIMITER //
CREATE TRIGGER tr_log_gate_scan
AFTER INSERT ON gate_logs
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (
        NEW.scanned_by,
        'gate_scanned',
        'gate_log',
        NEW.id,
        JSON_OBJECT('action', NEW.action, 'pass_id', NEW.pass_id)
    );
END //
DELIMITER ;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
