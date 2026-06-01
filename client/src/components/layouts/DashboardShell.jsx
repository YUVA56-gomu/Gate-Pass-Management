import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getUnreadCount } from '../../api/notification.api'

/* ── Role Config ── */
const ROLE_CONFIG = {
  STUDENT: {
    label: 'Student Portal',
    color: 'from-indigo-500 to-violet-600',
    accent: '#6366f1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    nav: [
      { label: 'Dashboard',     path: '/student/dashboard',      icon: HomeIcon },
      { label: 'Apply Pass',    path: '/student/apply-pass',     icon: PlusIcon },
      { label: 'My Passes',     path: '/student/my-passes',      icon: PassIcon },
      { label: 'Notifications', path: '/student/notifications',  icon: BellIcon, badge: true },
      { label: 'Profile',       path: '/student/profile',        icon: UserIcon },
    ]
  },
  COORDINATOR: {
    label: 'Coordinator Portal',
    color: 'from-blue-500 to-cyan-600',
    accent: '#3b82f6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    nav: [
      { label: 'Dashboard',        path: '/coordinator/dashboard', icon: HomeIcon },
      { label: 'Pending Requests', path: '/coordinator/requests',  icon: ClockIcon },
      { label: 'History',          path: '/coordinator/history',   icon: HistoryIcon },
    ]
  },
  HOSTEL_STAFF: {
    label: 'Hostel Staff Portal',
    color: 'from-emerald-500 to-teal-600',
    accent: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    nav: [
      { label: 'Dashboard',        path: '/hostel/dashboard',  icon: HomeIcon },
      { label: 'Pending Requests', path: '/hostel/requests',   icon: ClockIcon },
      { label: 'All Passes',       path: '/hostel/all-passes', icon: PassIcon },
      { label: 'Students',         path: '/hostel/students',   icon: UsersIcon },
    ]
  },
  SECURITY: {
    label: 'Security Terminal',
    color: 'from-orange-500 to-red-600',
    accent: '#f97316',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    nav: [
      { label: 'Dashboard',  path: '/security/dashboard', icon: HomeIcon },
      { label: 'QR Scanner', path: '/security/scanner',   icon: QRIcon },
      { label: 'Scan Logs',  path: '/security/logs',      icon: LogIcon },
    ]
  },
  ADMIN: {
    label: 'Admin Console',
    color: 'from-violet-500 to-purple-700',
    accent: '#7c3aed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    nav: [
      { label: 'Dashboard',       path: '/admin/dashboard', icon: HomeIcon },
      { label: 'User Management', path: '/admin/users',     icon: UsersIcon },
      { label: 'Reports',         path: '/admin/reports',   icon: ChartIcon },
      { label: 'Settings',        path: '/admin/settings',  icon: SettingsIcon },
    ]
  }
}

/* ── Icon Components ── */
function HomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
function PassIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function BellIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}
function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function HistoryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 019-9" />
    </svg>
  )
}
function QRIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
}
function LogIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}
function ChartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function SettingsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

/* ── Logout Modal ── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
         style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-content glass-strong max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Sign out</h3>
            <p className="text-sm text-slate-500">You'll need to sign in again</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Shell ── */
export function DashboardShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogout, setShowLogout] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navRef = useRef(null)

  const role = user?.role || 'STUDENT'
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT

  /* Fetch unread notification count for students */
  useEffect(() => {
    if (role === 'STUDENT') {
      const fetchCount = async () => {
        try {
          const res = await getUnreadCount()
          if (res.success) setUnreadCount(res.data.unreadCount || 0)
        } catch { /* silent */ }
      }
      fetchCount()
      const interval = setInterval(fetchCount, 60000)
      return () => clearInterval(interval)
    }
  }, [role])

  /* Close mobile nav on route change */
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleDisplayName = (role) => {
    const map = {
      STUDENT: 'Student',
      COORDINATOR: 'Coordinator',
      HOSTEL_STAFF: 'Hostel Staff',
      SECURITY: 'Security Guard',
      ADMIN: 'Administrator'
    }
    return map[role] || role
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/60"
              style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: Logo + System Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
              {config.icon}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm leading-none">Smart Gate Pass</span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                  VTU
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-none">{config.label}</p>
            </div>
          </div>

          {/* Center: Secondary Nav (desktop) */}
          <nav ref={navRef} className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl">
            {config.nav.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon
              const showBadge = item.badge && unreadCount > 0
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right: User Info + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell (mobile) */}
            {role === 'STUDENT' && (
              <button
                onClick={() => navigate('/student/notifications')}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-colors md:hidden"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )}

            {/* User avatar + name */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-none">{getRoleDisplayName(role)}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogout(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-white/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileNavOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/60 bg-white/90 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in-down">
            {config.nav.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon
              const showBadge = item.badge && unreadCount > 0
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 page-enter">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Smart Gate Pass Management System · VTU
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </footer>

      {/* ── LOGOUT MODAL ── */}
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  )
}

export default DashboardShell
