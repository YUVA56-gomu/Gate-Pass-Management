import { useState, useRef, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Notification from '../../components/common/Notification'
import { scanQRToken } from '../../api/security.api'

function QRScanner() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const inputRef = useRef(null)

  // Duplicate scan prevention
  const [lastScannedToken, setLastScannedToken] = useState(null)
  const [lastScanTime, setLastScanTime] = useState(null)
  const SCAN_COOLDOWN_MS = 2000 // 2 second cooldown

  useEffect(() => {
    // Focus on input for QR scanner
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleScan = async (e) => {
    e.preventDefault()

    if (!token.trim()) {
      setError('Please enter or scan a QR token')
      return
    }

    // Duplicate scan prevention: Check if same token scanned within cooldown period
    const now = Date.now()
    if (lastScannedToken === token && lastScanTime && (now - lastScanTime) < SCAN_COOLDOWN_MS) {
      setError(`Please wait ${Math.ceil((SCAN_COOLDOWN_MS - (now - lastScanTime)) / 1000)} seconds before scanning the same token again`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setResult(null)

      const response = await scanQRToken(token)

      if (response.success) {
        setResult(response.data)
        setSuccess(response.message)
        
        // Update duplicate scan prevention
        setLastScannedToken(token)
        setLastScanTime(Date.now())
        
        setToken('')
        // Focus back on input for next scan
        if (inputRef.current) {
          inputRef.current.focus()
        }
      } else {
        setError(response.message || 'Failed to scan QR token')
      }
    } catch (err) {
      setError(err.message || 'Failed to scan QR token')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getResultColor = (scanResult) => {
    switch (scanResult) {
      case 'OUT':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'IN':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          {error && <Notification type="error" message={error} />}
          {success && <Notification type="success" message={success} />}

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">QR Scanner</h1>
            <p className="text-gray-600 mt-2">Scan QR codes to record entry/exit</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner Input */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Scan QR Code</h2>

                <form onSubmit={handleScan}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Token
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Scan QR code or enter token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {loading ? 'Scanning...' : 'Scan'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions:</strong> Position your QR scanner to read the QR code, or manually enter the token and click Scan.
                  </p>
                </div>
              </div>
            </div>

            {/* Scan Result */}
            <div className="lg:col-span-2">
              {result ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Scan Result</h2>

                  {/* Result Status */}
                  <div className={`p-4 rounded-lg border-2 mb-6 ${getResultColor(result.scanResult)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-75">Scan Status</p>
                        <p className="text-2xl font-bold">{result.scanResult}</p>
                        {result.statusMessage && (
                          <p className="text-sm mt-2 opacity-90">{result.statusMessage}</p>
                        )}
                      </div>
                      <div className="text-4xl">
                        {result.scanResult === 'OUT' && '🚪'}
                        {result.scanResult === 'IN' && '✅'}
                        {result.scanResult === 'COMPLETED' && '🎉'}
                      </div>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Student Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{result.studentDetails.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">USN:</span>
                        <span className="font-medium text-gray-900">{result.studentDetails.usn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium text-gray-900">{result.studentDetails.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Program:</span>
                        <span className="font-medium text-gray-900">{result.studentDetails.program_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year/Semester:</span>
                        <span className="font-medium text-gray-900">
                          Year {result.studentDetails.year_of_study}, Sem {result.studentDetails.semester}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hostel/Room:</span>
                        <span className="font-medium text-gray-900">
                          {result.studentDetails.hostel_name} - {result.studentDetails.room_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Pass Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pass ID:</span>
                        <span className="font-medium text-gray-900">{result.passDetails.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pass Type:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.passDetails.type === 'DAILY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {result.passDetails.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination:</span>
                        <span className="font-medium text-gray-900">{result.passDetails.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">From Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(result.passDetails.from_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(result.passDetails.to_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scan Time */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Scan Details</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Action:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.scanDetails.action === 'OUT'
                            ? 'bg-orange-100 text-orange-800'
                            : result.scanDetails.action === 'IN'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {result.scanDetails.action}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateTime(result.scanDetails.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-gray-600">Scan a QR code to see details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
