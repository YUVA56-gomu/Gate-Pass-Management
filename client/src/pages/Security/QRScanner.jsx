import { useState, useRef, useEffect } from 'react'
import { scanQRToken } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const SCAN_CONFIG = {
  OUT:       { label: 'Student Exited',   icon: '🚪', badge: 'VERIFIED — EXIT',   badgeCls: 'bg-orange-500', cardCls: 'border-orange-300 bg-orange-50' },
  IN:        { label: 'Student Returned', icon: '✅', badge: 'VERIFIED — RETURN', badgeCls: 'bg-emerald-500', cardCls: 'border-emerald-300 bg-emerald-50' },
  COMPLETED: { label: 'Pass Completed',   icon: '🎉', badge: 'COMPLETED',         badgeCls: 'bg-blue-500',   cardCls: 'border-blue-300 bg-blue-50' },
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right max-w-xs">{value || '—'}</span>
    </div>
  )
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
      const t = setTimeout(() => { setError(null); setSuccess(null) }, 5000)
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
        setResult(res.data)
        setSuccess(res.message || res.data?.message)
        setLastToken(token); setLastTime(Date.now())
        setToken('')
        if (inputRef.current) inputRef.current.focus()
      } else {
        setError(res.message || 'Scan failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to scan QR token')
    } finally {
      setLoading(false) }
  }

  const cfg = result ? (SCAN_CONFIG[result.scanResult] || { label: result.scanResult, icon: '🔍', badge: result.scanResult, badgeCls: 'bg-slate-500', cardCls: 'border-slate-300 bg-slate-50' }) : null
  const s = result?.studentDetails
  const p = result?.passDetails
  const a = result?.approvalDetails

  return (
    <DashboardShell>
      <PageHeader
        title="QR Scanner"
        subtitle="Scan student gate passes for entry/exit verification"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Scanner Panel ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Scan QR Code</h3>
                <p className="text-xs text-slate-400">Auto-focused for hardware scanner</p>
              </div>
            </div>

            {/* Scanner viewfinder */}
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

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-fade-in flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
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
            <p className="text-xs font-semibold text-slate-600 mb-2">How it works</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Point hardware scanner at student's QR code</li>
              <li>• Or manually enter the token and click Scan</li>
              <li>• <strong>1st scan</strong> = OUT (student exits campus)</li>
              <li>• <strong>2nd scan</strong> = IN (student returns)</li>
              <li>• 2-second cooldown prevents duplicate scans</li>
            </ul>
          </div>
        </div>

        {/* ── Result Panel ── */}
        <div className="lg:col-span-3">
          {result && cfg ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">

              {/* Verification Badge Header */}
              <div className={`p-5 border-b-2 ${cfg.cardCls}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Scan Result</p>
                    <p className="text-2xl font-bold">{cfg.label}</p>
                    {result.statusMessage && (
                      <p className="text-sm mt-1 opacity-75">{result.statusMessage}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-4xl">{cfg.icon}</span>
                    <div className={`mt-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide ${cfg.badgeCls}`}>
                      {cfg.badge}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Student Details */}
                {s && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{s.name}</p>
                        <p className="text-sm text-slate-500 font-mono">{s.usn}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Student Information</p>
                      <DetailRow label="Department"   value={s.department} />
                      <DetailRow label="Program"      value={s.program_type} />
                      <DetailRow label="Year / Sem"   value={`Year ${s.year_of_study || '—'}, Sem ${s.semester || '—'}`} />
                      <DetailRow label="Hostel / Room" value={`${s.hostel_name || '—'} — ${s.room_number || '—'}`} />
                      {s.phone && <DetailRow label="Phone" value={s.phone} />}
                    </div>
                  </div>
                )}

                {/* Pass Details */}
                {p && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pass Details</p>
                    <DetailRow label="Pass ID"     value={`#${p.id}`} />
                    <DetailRow label="Pass Type"   value={p.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'} />
                    <DetailRow label="Destination" value={p.destination} />
                    <DetailRow label="Reason"      value={p.reason} />
                    {p.pass_type === 'DAILY' ? (
                      <DetailRow label="Pass Date" value={fmt(p.pass_date || p.from_date)} />
                    ) : (
                      <>
                        <DetailRow label="Leaving"   value={fmt(p.leaving_date || p.from_date)} />
                        <DetailRow label="Returning" value={fmt(p.returning_date || p.to_date)} />
                        {p.parent_contact && <DetailRow label="Parent Contact" value={p.parent_contact} />}
                      </>
                    )}
                    <DetailRow label="Status" value={p.status} />
                  </div>
                )}

                {/* Approval Details */}
                {a && (a.coordinator || a.hostelStaff) && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Approval Chain</p>
                    {a.coordinator  && <DetailRow label="Coordinator"  value={a.coordinator} />}
                    {a.hostelStaff  && <DetailRow label="Hostel Staff" value={a.hostelStaff} />}
                  </div>
                )}

                {/* Scan Details */}
                {result.scanDetails && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Scan Record</p>
                    <DetailRow label="Action"    value={result.scanDetails.action} />
                    <DetailRow label="Timestamp" value={fmtDT(result.scanDetails.timestamp)} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm h-full min-h-80 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="font-bold text-slate-600 text-lg">Awaiting Scan</p>
                <p className="text-sm text-slate-400 mt-1">Scan a student's QR code to see their pass details and record entry/exit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

export default QRScanner
