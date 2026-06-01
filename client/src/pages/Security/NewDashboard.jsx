import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import * as securityAPI from '../../api/security.api'
import { Html5QrcodeScanner } from 'html5-qrcode'

const NewDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { addNotification } = useNotification()

  // State management
  const [activeTab, setActiveTab] = useState('scanner')
  const [stats, setStats] = useState({
    todayScans: 0,
    studentsOutside: 0,
    completedPasses: 0
  })
  const [scanLogs, setScanLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scannedPass, setScannedPass] = useState(null)
  const [showPassModal, setShowPassModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [lastScannedToken, setLastScannedToken] = useState(null)
  const [scanCooldown, setScanCooldown] = useState(false)

  const scannerRef = useRef(null)
  const html5QrCodeScannerRef = useRef(null)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Initialize QR Scanner
  useEffect(() => {
    if (activeTab === 'scanner' && !html5QrCodeScannerRef.current) {
      initializeScanner()
    }

    return () => {
      if (html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current.clear().catch(err => {
          console.error('Error clearing scanner:', err)
        })
      }
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, logsData] = await Promise.all([
        securityAPI.getDashboardStats(),
        securityAPI.getTodayLogs()
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (logsData.success) {
        setScanLogs(logsData.data || [])
      }
    } catch (err) {
      console.error('[SECURITY DASHBOARD] Error fetching data:', err)
      addNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const initializeScanner = () => {
    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      }

      const scanner = new Html5QrcodeScanner('qr-reader', config, false)
      
      scanner.render(onScanSuccess, onScanError)
      html5QrCodeScannerRef.current = scanner
      setScanning(true)
    } catch (err) {
      console.error('[SCANNER] Initialization error:', err)
      addNotification('Failed to initialize scanner', 'error')
    }
  }

  const onScanSuccess = async (decodedText, decodedResult) => {
    // Prevent duplicate scans
    if (scanCooldown || decodedText === lastScannedToken) {
      return
    }

    console.log('[SCANNER] QR Code detected:', decodedText)
    
    setLastScannedToken(decodedText)
    setScanCooldown(true)

    // Reset cooldown after 3 seconds
    setTimeout(() => {
      setScanCooldown(false)
      setLastScannedToken(null)
    }, 3000)

    try {
      // Scan the QR token
      const response = await securityAPI.scanQRToken(decodedText)
      
      if (response.success) {
        setScannedPass(response.data)
        setShowPassModal(true)
        addNotification('QR Code scanned successfully', 'success')
        
        // Refresh logs
        await fetchDashboardData()
      } else {
        addNotification(response.message || 'Invalid QR code', 'error')
      }
    } catch (err) {
      console.error('[SCANNER] Scan error:', err)
      addNotification(err.message || 'Failed to scan QR code', 'error')
    }
  }

  const onScanError = (errorMessage) => {
    // Ignore routine scanning errors
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('[SCANNER] Scan error:', errorMessage)
    }
  }

  const handleAllowEntry = async () => {
    if (!scannedPass) return

    try {
      // The scan already created the log entry, just close modal
      setShowPassModal(false)
      setScannedPass(null)
      addNotification('Entry allowed', 'success')
      await fetchDashboardData()
    } catch (err) {
      console.error('[SECURITY] Allow entry error:', err)
      addNotification('Failed to process entry', 'error')
    }
  }

  const handleDenyEntry = () => {
    setShowPassModal(false)
    setScannedPass(null)
    addNotification('Entry denied', 'warning')
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Smart Gate Management</h1>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Security Guard Dashboard</h2>
              <p className="text-sm text-gray-600">Scan and verify student gate pass</p>
            </div>

            {/* Right: Profile and Logout */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/security/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'scanner'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
              </svg>
              <span className="font-semibold">QR Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'logs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Scan Logs</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* QR Scanner Tab */}
          {activeTab === 'scanner' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: QR Scanner */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">QR Code Scanner</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Position the QR code within the frame to scan</p>

                  {/* QR Scanner Container */}
                  <div className="relative bg-black rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
                    <div id="qr-reader" className="w-full"></div>
                    
                    {!scanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                        <div className="text-center text-white">
                          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-lg font-semibold mb-2">Camera permission required</p>
                          <p className="text-sm text-gray-300 mb-4">Please allow camera access to scan QR codes</p>
                          <button
                            onClick={initializeScanner}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                          >
                            Enable Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flashlight Tip */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Tap to turn on flashlight</span>
                  </div>
                </div>

                {/* Instructions Card */}
                <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Instructions</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Ensure the pass QR code is clearly visible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Allow access only if the status shows "Allowed"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>In case of any issue, contact the administrator</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Scan Logs */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Scan Logs</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                    >
                      View All
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Recent Scans */}
                  <div className="space-y-3">
                    {scanLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {log.studentName?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{log.studentName}</p>
                          <p className="text-xs text-gray-600">{formatDateTime(log.scannedAt)}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'OUT'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                      </div>
                    ))}

                    {scanLogs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No scans yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="mt-6 space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Today's Scans</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{stats.todayScans || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Students Outside</p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">{stats.studentsOutside || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Completed Passes</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{stats.completedPasses || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">All Scan Logs</h3>
                <p className="text-sm text-gray-600 mt-1">Complete history of all scanned passes</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Pass Type</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Verified By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scanLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {log.studentName?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{log.studentName}</p>
                              <p className="text-xs text-gray-600">{log.studentUSN}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.passType === 'DAILY'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {log.passType}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {formatDateTime(log.scannedAt)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'OUT'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {log.action === 'OUT' ? '✗ Denied' : '✓ Allowed'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.scannedBy}</p>
                            <p className="text-xs text-gray-600">Security Guard</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {scanLogs.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">No scan logs found</p>
                    <p className="text-gray-400 text-sm mt-1">Scanned passes will appear here</p>
                  </div>
                )}
              </div>

              {scanLogs.length > 0 && (
                <div className="p-4 border-t border-gray-100 text-center">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    Load More →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Pass Modal */}
      {showPassModal && scannedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pass Verified</h3>
              <button onClick={() => setShowPassModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800">✓ Valid Gate Pass</p>
              </div>
              {scannedPass.studentDetails && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Student: {scannedPass.studentDetails.name}</p>
                  <p className="text-xs text-gray-500">USN: {scannedPass.studentDetails.usn}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleDenyEntry} className="flex-1 py-2 border border-red-200 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-50 transition">
                Deny
              </button>
              <button onClick={handleAllowEntry} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition">
                Allow Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={confirmLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewDashboard
