import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Auth Pages
import Landing from '../pages/Auth/Landing'
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
import HostelProfile from '../pages/Hostel/Profile'

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
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes - Wrapped with PrivateRoute */}
      <Route element={<PrivateRoute />}>
        {/* Student Routes */}
        <Route path="/student" element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="apply-pass" element={<ApplyPass />} />
          <Route path="my-passes" element={<MyPasses />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route path="/coordinator" element={<RoleRoute allowedRoles={['COORDINATOR']} />}>
          <Route index element={<CoordinatorDashboard />} />
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="requests" element={<CoordinatorRequests />} />
          <Route path="history" element={<CoordinatorHistory />} />
        </Route>

        {/* Hostel Staff Routes */}
        <Route path="/hostel" element={<RoleRoute allowedRoles={['HOSTEL_STAFF']} />}>
          <Route index element={<HostelDashboard />} />
          <Route path="dashboard" element={<HostelDashboard />} />
          <Route path="requests" element={<HostelRequests />} />
          <Route path="students" element={<HostelStudents />} />
          <Route path="all-passes" element={<HostelAllPasses />} />
          <Route path="profile" element={<HostelProfile />} />
        </Route>

        {/* Security Guard Routes */}
        <Route path="/security" element={<RoleRoute allowedRoles={['SECURITY']} />}>
          <Route index element={<SecurityDashboard />} />
          <Route path="dashboard" element={<SecurityDashboard />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route path="logs" element={<ScanLogs />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
