-- ============================================================================
-- Smart Gate Pass Management System - Complex SQL Queries
-- ============================================================================

-- ============================================================================
-- 1. JOIN QUERIES
-- ============================================================================

-- Query 1.1: Get all passes with student and approval details
SELECT 
    p.id as pass_id,
    s.usn,
    s.full_name,
    d.name as department,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    p.status,
    GROUP_CONCAT(
        CONCAT(a.stage, ':', a.status) 
        SEPARATOR ' | '
    ) as approvals,
    p.created_at
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
LEFT JOIN approvals a ON p.id = a.pass_id
GROUP BY p.id, s.usn, s.full_name, d.name, p.type, p.reason, 
         p.destination, p.from_date, p.to_date, p.status, p.created_at
ORDER BY p.created_at DESC;

-- Query 1.2: Get student details with pass count and approval status
SELECT 
    s.id,
    s.usn,
    s.full_name,
    u.email,
    u.phone,
    d.name as department,
    s.program_type,
    s.year_of_study,
    s.hostel_name,
    s.room_number,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_passes,
    SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending_passes,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected_passes
FROM students s
JOIN users u ON s.user_id = u.id
JOIN departments d ON s.department_id = d.id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY s.id, s.usn, s.full_name, u.email, u.phone, d.name, 
         s.program_type, s.year_of_study, s.hostel_name, s.room_number
ORDER BY s.full_name;

-- Query 1.3: Get approver details with approval statistics
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT a.id) as total_approvals,
    SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    AVG(TIMESTAMPDIFF(HOUR, a.created_at, a.approved_at)) as avg_approval_time_hours
FROM users u
LEFT JOIN approvals a ON u.id = a.approved_by
WHERE u.role IN ('coordinator', 'hostel_staff')
GROUP BY u.id, u.name, u.email, u.role
ORDER BY total_approvals DESC;

-- ============================================================================
-- 2. APPROVAL WORKFLOW QUERIES
-- ============================================================================

-- Query 2.1: Get passes pending coordinator approval
SELECT 
    a.id as approval_id,
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    a.created_at as pending_since,
    DATEDIFF(NOW(), a.created_at) as days_pending
FROM approvals a
JOIN passes p ON a.pass_id = p.id
JOIN students s ON p.student_id = s.id
WHERE a.stage = 'coordinator' 
    AND a.status = 'pending'
ORDER BY a.created_at ASC;

-- Query 2.2: Get passes pending hostel staff approval
SELECT 
    a.id as approval_id,
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    a.created_at as pending_since,
    DATEDIFF(NOW(), a.created_at) as days_pending
FROM approvals a
JOIN passes p ON a.pass_id = p.id
JOIN students s ON p.student_id = s.id
WHERE a.stage = 'hostel_staff' 
    AND a.status = 'pending'
ORDER BY a.created_at ASC;

-- Query 2.3: Get approval workflow status for a specific pass
SELECT 
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.status as overall_status,
    MAX(CASE WHEN a.stage = 'coordinator' THEN a.status END) as coordinator_status,
    MAX(CASE WHEN a.stage = 'coordinator' THEN u1.name END) as coordinator_name,
    MAX(CASE WHEN a.stage = 'coordinator' THEN a.approved_at END) as coordinator_approved_at,
    MAX(CASE WHEN a.stage = 'hostel_staff' THEN a.status END) as hostel_staff_status,
    MAX(CASE WHEN a.stage = 'hostel_staff' THEN u2.name END) as hostel_staff_name,
    MAX(CASE WHEN a.stage = 'hostel_staff' THEN a.approved_at END) as hostel_staff_approved_at
FROM passes p
JOIN students s ON p.student_id = s.id
LEFT JOIN approvals a ON p.id = a.pass_id
LEFT JOIN users u1 ON a.approved_by = u1.id AND a.stage = 'coordinator'
LEFT JOIN users u2 ON a.approved_by = u2.id AND a.stage = 'hostel_staff'
WHERE p.id = ?
GROUP BY p.id, s.usn, s.full_name, p.type, p.status;

-- Query 2.4: Get rejection reasons for rejected passes
SELECT 
    p.id as pass_id,
    s.usn,
    s.full_name,
    p.type,
    p.reason as pass_reason,
    a.stage as rejected_by_stage,
    u.name as rejected_by_name,
    a.remarks as rejection_reason,
    a.approved_at as rejected_at
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN approvals a ON p.id = a.pass_id
JOIN users u ON a.approved_by = u.id
WHERE p.status = 'rejected' 
    AND a.status = 'rejected'
ORDER BY a.approved_at DESC;

-- ============================================================================
-- 3. PASS TRACKING QUERIES
-- ============================================================================

-- Query 3.1: Get all passes for a specific student with full details
SELECT 
    p.id,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    p.status,
    p.created_at,
    DATEDIFF(p.to_date, p.from_date) + 1 as duration_days,
    CASE 
        WHEN p.status = 'approved' AND p.from_date <= CURDATE() AND p.to_date >= CURDATE() 
            THEN 'ACTIVE'
        WHEN p.status = 'approved' AND p.to_date < CURDATE() 
            THEN 'EXPIRED'
        WHEN p.status = 'approved' AND p.from_date > CURDATE() 
            THEN 'UPCOMING'
        ELSE p.status 
    END as pass_status_display
FROM passes p
WHERE p.student_id = ?
ORDER BY p.created_at DESC;

-- Query 3.2: Get passes expiring within next 7 days
SELECT 
    p.id,
    s.usn,
    s.full_name,
    u.email,
    p.type,
    p.destination,
    p.from_date,
    p.to_date,
    DATEDIFF(p.to_date, CURDATE()) as days_remaining
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.status = 'approved'
    AND p.to_date >= CURDATE()
    AND p.to_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY p.to_date ASC;

-- Query 3.3: Get passes by date range
SELECT 
    p.id,
    s.usn,
    s.full_name,
    d.name as department,
    p.type,
    p.reason,
    p.destination,
    p.from_date,
    p.to_date,
    p.status,
    COUNT(gl.id) as total_scans
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
LEFT JOIN gate_logs gl ON p.id = gl.pass_id
WHERE p.from_date >= ? AND p.to_date <= ?
GROUP BY p.id, s.usn, s.full_name, d.name, p.type, p.reason, 
         p.destination, p.from_date, p.to_date, p.status
ORDER BY p.from_date ASC;

-- Query 3.4: Get passes by department
SELECT 
    d.name as department,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
    SUM(CASE WHEN p.type = 'daily' THEN 1 ELSE 0 END) as daily_passes,
    SUM(CASE WHEN p.type = 'long_leave' THEN 1 ELSE 0 END) as long_leave_passes
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY d.id, d.name
ORDER BY total_passes DESC;

-- ============================================================================
-- 4. GATE LOG QUERIES
-- ============================================================================

-- Query 4.1: Get gate logs for a specific pass
SELECT 
    gl.id,
    gl.pass_id,
    gl.action,
    gl.scanned_at,
    u.name as scanned_by,
    CASE 
        WHEN gl.action = 'IN' THEN 'Entry'
        WHEN gl.action = 'OUT' THEN 'Exit'
    END as action_display
FROM gate_logs gl
LEFT JOIN users u ON gl.scanned_by = u.id
WHERE gl.pass_id = ?
ORDER BY gl.scanned_at ASC;

-- Query 4.2: Get today's gate activity
SELECT 
    s.usn,
    s.full_name,
    p.type,
    p.destination,
    MIN(CASE WHEN gl.action = 'IN' THEN gl.scanned_at END) as entry_time,
    MAX(CASE WHEN gl.action = 'OUT' THEN gl.scanned_at END) as exit_time,
    TIMEDIFF(
        MAX(CASE WHEN gl.action = 'OUT' THEN gl.scanned_at END),
        MIN(CASE WHEN gl.action = 'IN' THEN gl.scanned_at END)
    ) as duration_inside,
    COUNT(CASE WHEN gl.action = 'IN' THEN 1 END) as entry_count,
    COUNT(CASE WHEN gl.action = 'OUT' THEN 1 END) as exit_count
FROM gate_logs gl
JOIN passes p ON gl.pass_id = p.id
JOIN students s ON p.student_id = s.id
WHERE DATE(gl.scanned_at) = CURDATE()
GROUP BY s.usn, s.full_name, p.type, p.destination
ORDER BY MIN(gl.scanned_at) ASC;

-- Query 4.3: Get students currently inside campus
SELECT 
    s.usn,
    s.full_name,
    d.name as department,
    p.type,
    p.destination,
    MAX(gl.scanned_at) as last_scan_time,
    MAX(CASE WHEN gl.action = 'IN' THEN gl.scanned_at END) as entry_time,
    TIMEDIFF(NOW(), MAX(CASE WHEN gl.action = 'IN' THEN gl.scanned_at END)) as time_inside
FROM gate_logs gl
JOIN passes p ON gl.pass_id = p.id
JOIN students s ON p.student_id = s.id
JOIN departments d ON s.department_id = d.id
WHERE DATE(gl.scanned_at) = CURDATE()
    AND gl.action = 'IN'
    AND NOT EXISTS (
        SELECT 1 FROM gate_logs gl2
        WHERE gl2.pass_id = gl.pass_id
            AND gl2.action = 'OUT'
            AND gl2.scanned_at > gl.scanned_at
            AND DATE(gl2.scanned_at) = CURDATE()
    )
GROUP BY s.usn, s.full_name, d.name, p.type, p.destination
ORDER BY entry_time ASC;

-- Query 4.4: Get gate activity summary by hour
SELECT 
    HOUR(gl.scanned_at) as hour,
    COUNT(CASE WHEN gl.action = 'IN' THEN 1 END) as entries,
    COUNT(CASE WHEN gl.action = 'OUT' THEN 1 END) as exits,
    COUNT(*) as total_scans
FROM gate_logs gl
WHERE DATE(gl.scanned_at) = CURDATE()
GROUP BY HOUR(gl.scanned_at)
ORDER BY hour ASC;

-- ============================================================================
-- 5. STUDENT REPORT QUERIES
-- ============================================================================

-- Query 5.1: Get student pass statistics
SELECT 
    s.usn,
    s.full_name,
    d.name as department,
    s.program_type,
    s.year_of_study,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.type = 'daily' THEN 1 ELSE 0 END) as daily_passes,
    SUM(CASE WHEN p.type = 'long_leave' THEN 1 ELSE 0 END) as long_leave_passes,
    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_passes,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected_passes,
    SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending_passes,
    SUM(DATEDIFF(p.to_date, p.from_date) + 1) as total_days_requested
FROM students s
JOIN departments d ON s.department_id = d.id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY s.id, s.usn, s.full_name, d.name, s.program_type, s.year_of_study
ORDER BY s.full_name;

-- Query 5.2: Get students with most passes
SELECT 
    s.usn,
    s.full_name,
    d.name as department,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_passes,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected_passes
FROM students s
JOIN departments d ON s.department_id = d.id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY s.id, s.usn, s.full_name, d.name
HAVING COUNT(DISTINCT p.id) > 0
ORDER BY total_passes DESC
LIMIT 20;

-- Query 5.3: Get students with high rejection rate
SELECT 
    s.usn,
    s.full_name,
    d.name as department,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected_passes,
    ROUND(
        (SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT p.id)) * 100, 2
    ) as rejection_percentage
FROM students s
JOIN departments d ON s.department_id = d.id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY s.id, s.usn, s.full_name, d.name
HAVING COUNT(DISTINCT p.id) > 0 
    AND rejection_percentage > 20
ORDER BY rejection_percentage DESC;

-- Query 5.4: Get students by hostel
SELECT 
    s.hostel_name,
    s.room_number,
    s.usn,
    s.full_name,
    d.name as department,
    u.email,
    u.phone,
    COUNT(DISTINCT p.id) as total_passes
FROM students s
JOIN departments d ON s.department_id = d.id
JOIN users u ON s.user_id = u.id
LEFT JOIN passes p ON s.id = p.student_id
WHERE s.hostel_name IS NOT NULL
GROUP BY s.hostel_name, s.room_number, s.usn, s.full_name, d.name, u.email, u.phone
ORDER BY s.hostel_name, s.room_number;

-- ============================================================================
-- 6. NOTIFICATION QUERIES
-- ============================================================================

-- Query 6.1: Get unread notifications for a user
SELECT 
    id,
    type,
    title,
    message,
    related_pass_id,
    created_at
FROM notifications
WHERE user_id = ? AND is_read = FALSE
ORDER BY created_at DESC;

-- Query 6.2: Get notification statistics
SELECT 
    type,
    COUNT(*) as total,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
    SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read
FROM notifications
WHERE user_id = ?
GROUP BY type
ORDER BY total DESC;

-- ============================================================================
-- 7. ACTIVITY LOG QUERIES
-- ============================================================================

-- Query 7.1: Get recent activity
SELECT 
    al.id,
    u.name,
    u.role,
    al.action,
    al.entity_type,
    al.entity_id,
    al.created_at
FROM activity_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- Query 7.2: Get user activity summary
SELECT 
    u.name,
    u.role,
    COUNT(*) as total_actions,
    COUNT(DISTINCT DATE(al.created_at)) as active_days,
    MAX(al.created_at) as last_activity
FROM activity_logs al
JOIN users u ON al.user_id = u.id
GROUP BY u.id, u.name, u.role
ORDER BY total_actions DESC;

-- ============================================================================
-- 8. DASHBOARD QUERIES
-- ============================================================================

-- Query 8.1: Dashboard statistics
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM passes WHERE status = 'approved') as approved_passes,
    (SELECT COUNT(*) FROM passes WHERE status = 'pending') as pending_passes,
    (SELECT COUNT(*) FROM passes WHERE status = 'rejected') as rejected_passes,
    (SELECT COUNT(*) FROM gate_logs WHERE DATE(scanned_at) = CURDATE()) as today_scans,
    (SELECT COUNT(DISTINCT student_id) FROM gate_logs 
     WHERE DATE(scanned_at) = CURDATE()) as students_on_campus_today;

-- Query 8.2: Department-wise pass distribution
SELECT 
    d.name as department,
    COUNT(DISTINCT p.id) as total_passes,
    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
    ROUND(
        (SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT p.id)) * 100, 2
    ) as approval_rate
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY d.id, d.name
ORDER BY total_passes DESC;

-- ============================================================================
-- END OF QUERIES
-- ============================================================================
