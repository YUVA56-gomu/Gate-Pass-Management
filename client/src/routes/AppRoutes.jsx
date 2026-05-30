import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Auth Pages
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'

// Student Pages
import StudentDashboard from '../pages/Student/Dashboard'
import ApplyPass from '../pages/Student/ApplyPass'
import MyPasses from '../pages/Student/MyPasses'
import StudentNotifications from '../pages/Student/Notifications'
import StudentProfile from '../pages/Student/Profile'

// Coordinator Pages
import CoordinatorDashboard from '../pages/Coordinator/Dashboard'
import CoordinatorRequests from '../pages/Coordinator/PendingRequests'
import CoordinatorHistory from '../pages/Coordinator/History'

// Hostel Staff Pages
import HostelDashboard from '../pages/Hostel/Dashboard'
import HostelRequests from '../pages/Hostel/PendingRequests'
import HostelStudents from '../pages/Hostel/Students'
import HostelAllPasses from '../pages/Hostel/AllPasses'

// Security Pages
import SecurityDashboard from '../pages/Security/Dashboard'
import QRScanner from '../pages/Security/QRScanner'
import ScanLogs from '../pages/Security/ScanLogs'

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard'
import UserManagement from '../pages/Admin/UserManagement'
import AdminReports from '../pages/Admin/Reports'
import AdminSettings from '../pages/Admin/Settings'

function AppRoutes() {
  const { loading } = useContext(AuthContext)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/apply-pass" element={<ApplyPass />} />
          <Route path="/student/my-passes" element={<MyPasses />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route element={<RoleRoute allowedRoles={['coordinator']} />}>
          <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
          <Route path="/coordinator/requests" element={<CoordinatorRequests />} />
          <Route path="/coordinator/history" element={<CoordinatorHistory />} />
        </Route>

        {/* Hostel Staff Routes */}
        <Route element={<RoleRoute allowedRoles={['hostel_staff']} />}>
          <Route path="/hostel/dashboard" element={<HostelDashboard />} />
          <Route path="/hostel/requests" element={<HostelRequests />} />
          <Route path="/hostel/students" element={<HostelStudents />} />
          <Route path="/hostel/all-passes" element={<HostelAllPasses />} />
        </Route>

        {/* Security Guard Routes */}
        <Route element={<RoleRoute allowedRoles={['security']} />}>
          <Route path="/security/dashboard" element={<SecurityDashboard />} />
          <Route path="/security/scanner" element={<QRScanner />} />
          <Route path="/security/logs" element={<ScanLogs />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default AppRoutes
