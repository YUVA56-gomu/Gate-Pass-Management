import { useState, useRef, useEffect } from 'react'
import { scanQRToken } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const RESULT_CONFIG = {
  OUT:       { label: 'Student Exited',  icon: '🚪', cls: 'bg-orange-50 border-orange-300 text-orange-800' },
  IN:        { label: 'Student Entered', icon: '✅', cls: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
  COMPLETED: { label: 'Pass Completed',  icon: '🎉', cls: 'bg-blue-50 border-blue-300 text-blue-800' },
}

export function QRScanner() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [lastToken, setLastToken] = useState(null)
  const [lastTime, setLastTime] = useState(null)
  const inputRef = useRef(null)
  const COOLDOWN = 2000

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null) }, 4000)
      return () => clearTimeout(t)
    }
  }, [error, success])

  const handleScan = async (e) => {
    e.preventDefault()
    if (!token.trim()) { setError('Please enter or scan a QR token'); return }
    const now = Date.now()
    if (lastToken === token && lastTime && (now - lastTime) < COOLDOWN) {
      setError(`Wait ${Math.ceil((COOLDOWN - (now - lastTime)) / 1000)}s before scanning the same token again`)
      return
    }
    try {
      setLoading(true); setError(null); setSuccess(null); setResult(null)
      const res = await scanQRToken(token)
      if (res.success) {
        setResult(res.data); setSuccess(res.message)
        setLastToken(token); setLastTime(Date.now())
        setToken('')
        if (inputRef.current) inputRef.current.focus()
      } else { setError(res.message || 'Failed to scan QR token') }
    } catch (err) { setError(err.message || 'Failed to scan QR token') }
    finally { setLoading(false) }
  }

  const resultCfg = result ? (RESULT_CONFIG[result.scanResult] || { label: result.scanResult, icon: '🔍', cls: 'bg-slate-50 border-slate-300 text-slate-800' }) : null

  return (
    <DashboardShell>
      <PageHeader
        title="QR Scanner"
        subtitle="Scan student gate passes for entry/exit verification"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Scanner Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scanner Input */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Scan QR Code</h3>
                <p className="text-xs text-slate-400">Auto-focused for hardware scanner</p>
              </div>
            </div>

            {/* Scanner visual */}
            <div className="relative w-full aspect-square max-w-48 mx-auto mb-4 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-4 border-2 border-orange-400/60 rounded-xl" />
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-orange-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-orange-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-orange-400 rounded-br-lg" />
              <div className="scan-line" />
              <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>

            <form onSubmit={handleScan} className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Scan QR code or enter token..."
                className="input-field text-sm"
                autoComplete="off"
              />
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-2.5 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning...
                  </span>
                ) : 'Scan Pass'}
              </button>
            </form>

            {/* Status Messages */}
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-fade-in">
                {error}
              </div>
            )}
            {success && !error && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 animate-fade-in">
                {success}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Instructions</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Point hardware scanner at student's QR code</li>
              <li>• Or manually enter the token and click Scan</li>
              <li>• First scan = OUT (exit), second scan = IN (return)</li>
              <li>• 2-second cooldown prevents duplicate scans</li>
            </ul>
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5 animate-fade-in">
              {/* Result Status */}
              <div className={`p-4 rounded-2xl border-2 ${resultCfg.cls}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Scan Result</p>
                    <p className="text-2xl font-bold mt-0.5">{resultCfg.label}</p>
                    {result.statusMessage && <p className="text-sm mt-1 opacity-80">{result.statusMessage}</p>}
                  </div>
                  <span className="text-4xl">{resultCfg.icon}</span>
                </div>
              </div>

              {/* Student Details */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Student Details</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Name', result.studentDetails.name],
                    ['USN', result.studentDetails.usn],
                    ['Department', result.studentDetails.department],
                    ['Program', result.studentDetails.program_type],
                    ['Year / Sem', `Year ${result.studentDetails.year_of_study}, Sem ${result.studentDetails.semester}`],
                    ['Hostel / Room', `${result.studentDetails.hostel_name} — ${result.studentDetails.room_number}`],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-slate-400">{l}</p>
                      <p className="font-medium text-slate-800">{v || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pass Details */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pass Details</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  {[
                    ['Pass ID', `#${result.passDetails.id}`],
                    ['Type', result.passDetails.type],
                    ['Destination', result.passDetails.destination],
                    ['From', new Date(result.passDetails.from_date).toLocaleDateString('en-IN')],
                    ['To', new Date(result.passDetails.to_date).toLocaleDateString('en-IN')],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500">{l}:</span>
                      <span className="font-medium text-slate-800">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scan Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Action:</span>
                  <StatusBadge status={result.scanDetails.action} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-medium text-slate-800">{fmtDT(result.scanDetails.timestamp)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm h-full min-h-64 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-600">Awaiting Scan</p>
                <p className="text-sm text-slate-400 mt-1">Scan a QR code to see student and pass details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

export default QRScanner
