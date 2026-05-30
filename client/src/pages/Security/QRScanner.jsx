import { useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { securityAPI } from '../../api/security.api'
import { useNotification } from '../../hooks/useNotification'

function QRScanner() {
  const [qrCode, setQrCode] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const { addNotification } = useNotification()

  const handleScan = async () => {
    if (!qrCode.trim()) {
      addNotification('Please enter QR code', 'error')
      return
    }

    try {
      const response = await securityAPI.scanQR(qrCode)
      setScanResult(response.data)
      addNotification('QR scanned successfully', 'success')
      setQrCode('')
    } catch (error) {
      addNotification(error.response?.data?.message || 'Invalid QR code', 'error')
      setScanResult(null)
    }
  }

  const handleMarkIN = async () => {
    if (!scanResult?.pass_id) return
    try {
      await securityAPI.markIN(scanResult.pass_id)
      addNotification('Marked IN successfully', 'success')
      setScanResult(null)
    } catch (error) {
      addNotification('Failed to mark IN', 'error')
    }
  }

  const handleMarkOUT = async () => {
    if (!scanResult?.pass_id) return
    try {
      await securityAPI.markOUT(scanResult.pass_id)
      addNotification('Marked OUT successfully', 'success')
      setScanResult(null)
    } catch (error) {
      addNotification('Failed to mark OUT', 'error')
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="security" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">QR Scanner</h1>
          <div className="bg-white p-6 rounded shadow max-w-2xl">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Scan QR Code</label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Scan or paste QR code"
                className="w-full border rounded px-3 py-2"
                autoFocus
              />
            </div>
            <button
              onClick={handleScan}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Scan
            </button>

            {scanResult && (
              <div className="mt-6 p-4 bg-gray-100 rounded">
                <h2 className="text-lg font-semibold mb-2">Pass Details</h2>
                <p><strong>Student:</strong> {scanResult.student_name}</p>
                <p><strong>Type:</strong> {scanResult.pass_type}</p>
                <p><strong>Status:</strong> {scanResult.status}</p>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={handleMarkIN}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Mark IN
                  </button>
                  <button
                    onClick={handleMarkOUT}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Mark OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default QRScanner
