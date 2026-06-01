import { useState, useRef, useEffect, useCallback, Component } from 'react'
import jsQR from 'jsqr'
import { scanQRToken } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

/* ─── Error Boundary ─────────────────────────────────────────────────────────── */
class ScannerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('[QRScanner] boundary caught:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <DashboardShell>
          <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-2xl border border-red-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Scanner failed to load</h3>
                <p className="text-sm text-slate-500 mt-0.5">{this.state.error?.message || 'An unexpected error occurred'}</p>
              </div>
            </div>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="w-full btn-primary py-2.5">
              Try Again
            </button>
          </div>
        </DashboardShell>
      )
    }
    return this.props.children
  }
}

/* ─── Audio feedback ─────────────────────────────────────────────────────────── */
const playBeep = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3)
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
    }
  } catch { /* AudioContext not available */ }
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const fmtDT = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
const fmt = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Extract UUID from QR content.
 * QR encodes: {"token":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
 * Returns the raw UUID string.
 */
const extractToken = (raw) => {
  if (!raw) return null
  const trimmed = raw.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed?.token) return String(parsed.token).trim()
  } catch { /* not JSON */ }
  return trimmed
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const SCAN_CFG = {
  OUT:       { label: 'Student Exited',   icon: '🚪', badge: 'VERIFIED — EXIT',   badgeCls: 'bg-orange-500', cardCls: 'border-orange-400 bg-orange-50' },
  IN:        { label: 'Student Returned', icon: '✅', badge: 'VERIFIED — RETURN', badgeCls: 'bg-emerald-500', cardCls: 'border-emerald-400 bg-emerald-50' },
  COMPLETED: { label: 'Pass Completed',   icon: '🎉', badge: 'COMPLETED',         badgeCls: 'bg-blue-500',   cardCls: 'border-blue-400 bg-blue-50' },
}

const STATE = {
  IDLE:       'IDLE',
  STARTING:   'STARTING',
  SCANNING:   'SCANNING',
  PROCESSING: 'PROCESSING',
  SUCCESS:    'SUCCESS',
  ERROR:      'ERROR',
  NO_CAMERA:  'NO_CAMERA',
}

const COOLDOWN_MS = 3000

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right max-w-xs">{value || '—'}</span>
    </div>
  )
}

function StatusBadge({ state, scanError }) {
  const cfg = {
    [STATE.IDLE]:       { text: 'Camera Off',        cls: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400',    pulse: false },
    [STATE.STARTING]:   { text: 'Starting…',         cls: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500',    pulse: true  },
    [STATE.SCANNING]:   { text: 'Searching for QR…', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500',  pulse: true  },
    [STATE.PROCESSING]: { text: 'Verifying Pass…',   cls: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500',     pulse: true  },
    [STATE.SUCCESS]:    { text: 'Pass Verified ✓',   cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500',  pulse: false },
    [STATE.ERROR]:      { text: scanError || 'Invalid QR', cls: 'bg-red-100 text-red-700',   dot: 'bg-red-500',      pulse: false },
    [STATE.NO_CAMERA]:  { text: 'No Camera',         cls: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400',    pulse: false },
  }
  const c = cfg[state] || cfg[STATE.IDLE]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {c.text}
    </span>
  )
}

/* ─── Inner Scanner ──────────────────────────────────────────────────────────── */
function QRScannerInner() {
  const [camState, setCamState]       = useState(STATE.IDLE)
  const [manualToken, setManualToken] = useState('')
  const [result, setResult]           = useState(null)
  const [scanError, setScanError]     = useState(null)
  const [cameraMsg, setCameraMsg]     = useState(null)
  const [recentScans, setRecentScans] = useState([])

  /* DOM refs */
  const videoRef    = useRef(null)   // <video> element
  const canvasRef   = useRef(null)   // offscreen <canvas> for jsQR

  /* Control refs — never cause re-renders */
  const streamRef     = useRef(null)   // MediaStream
  const rafRef        = useRef(null)   // requestAnimationFrame handle
  const scanningRef   = useRef(false)  // controls the jsQR decode loop
  const processingRef = useRef(false)
  const lastTokenRef  = useRef(null)
  const lastTimeRef   = useRef(0)
  const mountedRef    = useRef(false)
  const startingRef   = useRef(false)

  /* ── Safe state setters ── */
  const safe = useCallback((setter) => (v) => { if (mountedRef.current) setter(v) }, [])

  /* ── Stop stream + cancel animation loop ── */
  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    safe(setCamState)(STATE.IDLE)
    console.log('[SCANNER] Camera stopped')
  }, [safe])

  /* ── Process decoded token ── */
  const processToken = useCallback(async (rawToken) => {
    if (!rawToken?.trim()) return
    if (processingRef.current) return

    const token = extractToken(rawToken)
    console.log('[SCANNER] Raw QR content:', rawToken)
    console.log('[SCANNER] Parsed token:', token)
    if (!token) { console.warn('[SCANNER] Token extraction failed'); return }

    const now = Date.now()
    if (lastTokenRef.current === token && (now - lastTimeRef.current) < COOLDOWN_MS) {
      console.log('[SCANNER] Cooldown — skipping duplicate')
      return
    }

    processingRef.current = true
    if (mountedRef.current) setCamState(STATE.PROCESSING)
    if (mountedRef.current) setScanError(null)
    console.log('[SCANNER] Verification request sent:', token)

    try {
      const res = await scanQRToken(token)
      if (!mountedRef.current) return
      console.log('[SCANNER] API response:', res)

      if (res.success) {
        playBeep('success')
        console.log('[SCANNER] SUCCESS — action:', res.data?.scanResult)
        setCamState(STATE.SUCCESS)
        setResult(res.data)
        lastTokenRef.current = token
        lastTimeRef.current  = Date.now()
        setRecentScans(prev => [{
          id:          Date.now(),
          studentName: res.data?.studentDetails?.name,
          usn:         res.data?.studentDetails?.usn,
          action:      res.data?.scanResult,
          passType:    res.data?.passDetails?.pass_type,
          time:        new Date(),
        }, ...prev].slice(0, 10))
        setTimeout(() => { if (mountedRef.current) setCamState(STATE.SCANNING) }, 3000)
      } else {
        playBeep('error')
        console.warn('[SCANNER] FAILED:', res.message)
        setCamState(STATE.ERROR)
        setScanError(res.message || 'Pass not valid')
        setTimeout(() => { if (mountedRef.current) setCamState(STATE.SCANNING) }, 3000)
      }
    } catch (err) {
      if (!mountedRef.current) return
      playBeep('error')
      console.error('[SCANNER] ERROR:', err)
      setCamState(STATE.ERROR)
      setScanError(err.message || 'Failed to verify pass')
      setTimeout(() => { if (mountedRef.current) setCamState(STATE.SCANNING) }, 3000)
    } finally {
      processingRef.current = false
    }
  }, [])

  /* ── jsQR decode loop — runs every animation frame ── */
  // scanningRef controls whether the loop keeps running — avoids stale closure on camState
  const scanLoop = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !mountedRef.current || !scanningRef.current) return

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }

    const w = video.videoWidth
    const h = video.videoHeight
    if (w === 0 || h === 0) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }

    canvas.width  = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)

    /*
     * jsQR — the actual decoder.
     * inversionAttempts: 'attemptBoth' tries normal AND inverted QR codes.
     */
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' })

    if (code) {
      console.log('[SCANNER] QR Detected — raw:', code.data)
      if (!processingRef.current) {
        processToken(code.data)
      }
    }

    if (mountedRef.current && scanningRef.current) {
      rafRef.current = requestAnimationFrame(scanLoop)
    }
  }, [processToken])

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    if (startingRef.current) return
    if (streamRef.current) return  // already running

    startingRef.current = true
    safe(setCamState)(STATE.STARTING)
    safe(setCameraMsg)(null)
    console.log('[SCANNER] Camera starting...')

    try {
      /*
       * Request the back camera first (environment).
       * On laptops with only one camera, facingMode: 'environment' still works —
       * it just uses the only available camera.
       * We request a high resolution so jsQR has more pixels to work with.
       */
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop())
        startingRef.current = false
        return
      }

      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')  // required on iOS

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
      })
      await video.play()

      console.log(`[SCANNER] Camera started — ${video.videoWidth}x${video.videoHeight}`)
      scanningRef.current = true
      safe(setCamState)(STATE.SCANNING)

      // Start the jsQR decode loop
      rafRef.current = requestAnimationFrame(scanLoop)

    } catch (err) {
      const msg = String(err?.message || err)
      console.error('[SCANNER] Camera start error:', msg)
      if (/permission|notallowed|denied/i.test(msg)) {
        safe(setCameraMsg)('Camera permission denied. Allow camera access in your browser settings, then click Start Camera.')
      } else if (/notfound|no camera|devices|overconstrained/i.test(msg)) {
        safe(setCameraMsg)('No camera found on this device. Use manual token entry below.')
      } else {
        safe(setCameraMsg)(`Camera error: ${msg}`)
      }
      safe(setCamState)(STATE.NO_CAMERA)
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    } finally {
      startingRef.current = false
    }
  }, [safe, scanLoop])

  /* ── Manage scan loop based on camera state ── */
  useEffect(() => {
    if (camState === STATE.SCANNING && streamRef.current) {
      // Resume loop when returning to SCANNING (after success/error timeout)
      scanningRef.current = true
      if (!rafRef.current) {
        console.log('[SCANNER] Resuming scan loop')
        rafRef.current = requestAnimationFrame(scanLoop)
      }
    }
    if (camState === STATE.PROCESSING || camState === STATE.SUCCESS || camState === STATE.ERROR) {
      // Pause loop during verification / result display
      scanningRef.current = false
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [camState, scanLoop])

  /* ── Auto-start on mount ── */
  useEffect(() => {
    mountedRef.current = true
    const timer = setTimeout(() => { if (mountedRef.current) startCamera() }, 100)
    return () => {
      clearTimeout(timer)
      mountedRef.current = false
      scanningRef.current = false
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Manual submit ── */
  const handleManualSubmit = (e) => {
    e.preventDefault()
    const t = manualToken.trim()
    if (t) processToken(t)
  }

  const isActive = camState === STATE.SCANNING || camState === STATE.PROCESSING
  const cfg = result ? (SCAN_CFG[result.scanResult] || {
    label: result.scanResult, icon: '🔍', badge: result.scanResult, badgeCls: 'bg-slate-500', cardCls: 'border-slate-300 bg-slate-50'
  }) : null
  const s = result?.studentDetails
  const p = result?.passDetails
  const a = result?.approvalDetails

  return (
    <DashboardShell>
      <PageHeader title="QR Scanner" subtitle="Live camera scanning for gate pass verification" />

      {/* Hidden canvas — jsQR reads pixels from here */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── LEFT: Camera ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-800 text-sm">Live Camera</span>
              </div>
              <StatusBadge state={camState} scanError={scanError} />
            </div>

            {/* Video viewport */}
            <div className="relative bg-slate-900" style={{ height: '380px' }}>
              {/*
                The <video> element is always in the DOM.
                object-fit: cover fills the container without stretching.
              */}
              <video
                ref={videoRef}
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: (camState === STATE.SCANNING || camState === STATE.PROCESSING || camState === STATE.SUCCESS || camState === STATE.ERROR) ? 'block' : 'none',
                }}
              />

              {/* Idle / No camera overlay */}
              {(camState === STATE.IDLE || camState === STATE.NO_CAMERA) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-300 text-center leading-snug max-w-xs">
                    {cameraMsg || 'Camera is off. Click Start Camera below.'}
                  </p>
                </div>
              )}

              {/* Starting overlay */}
              {camState === STATE.STARTING && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
                  <div className="spinner mb-2" style={{ borderTopColor: '#f97316' }} />
                  <p className="text-xs text-slate-300 mt-1">Requesting camera access…</p>
                </div>
              )}

              {/* Scanning — corner brackets over the live video */}
              {camState === STATE.SCANNING && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56">
                    <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
                    <div className="absolute left-2 right-2 top-0 h-0.5 bg-orange-400/80 scan-line" />
                  </div>
                </div>
              )}

              {/* Processing overlay */}
              {camState === STATE.PROCESSING && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/75 text-white pointer-events-none">
                  <div className="spinner mb-2" style={{ borderTopColor: '#6366f1' }} />
                  <p className="text-sm font-semibold">QR Detected</p>
                  <p className="text-xs text-slate-300 mt-0.5">Verifying Pass…</p>
                </div>
              )}

              {/* Success flash */}
              {camState === STATE.SUCCESS && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/80 text-white animate-fade-in pointer-events-none">
                  <span className="text-5xl mb-2">✅</span>
                  <p className="text-base font-bold">Pass Verified!</p>
                </div>
              )}

              {/* Error flash */}
              {camState === STATE.ERROR && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white animate-fade-in pointer-events-none">
                  <span className="text-5xl mb-2">❌</span>
                  <p className="text-sm font-bold">Invalid QR</p>
                  <p className="text-xs text-red-200 text-center px-6 mt-1">{scanError}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
              {isActive ? (
                <button onClick={stopCamera}
                  className="flex-1 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200">
                  Stop Camera
                </button>
              ) : (
                <button onClick={startCamera} disabled={camState === STATE.STARTING}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                  {camState === STATE.STARTING ? 'Starting…' : 'Start Camera'}
                </button>
              )}
            </div>
          </div>

          {/* Manual fallback */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-700 mb-1">Manual Token Entry</p>
            <p className="text-xs text-slate-400 mb-3">Use if camera is unavailable</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input type="text" value={manualToken} onChange={e => setManualToken(e.target.value)}
                placeholder="Paste token or JSON…" className="input-field text-sm flex-1" autoComplete="off" />
              <button type="submit" disabled={!manualToken.trim() || camState === STATE.PROCESSING}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 flex-shrink-0">
                Verify
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">How it works</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Camera starts automatically on page load</li>
              <li>• Point camera at student's QR code</li>
              <li>• Scanner detects and verifies automatically</li>
              <li>• <strong>1st scan</strong> = OUT (student exits campus)</li>
              <li>• <strong>2nd scan</strong> = IN (student returns)</li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT: Result + Recent ── */}
        <div className="xl:col-span-3 space-y-4">
          {result && cfg ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-scale-in">
              <div className={`p-5 border-b-2 ${cfg.cardCls}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Scan Result</p>
                    <p className="text-2xl font-bold">{cfg.label}</p>
                    {result.statusMessage && <p className="text-sm mt-1 opacity-75">{result.statusMessage}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-5xl">{cfg.icon}</span>
                    <div className={`mt-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide ${cfg.badgeCls}`}>{cfg.badge}</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {s && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">{s.name}</p>
                        <p className="text-sm text-slate-500 font-mono">{s.usn}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Student</p>
                      <DetailRow label="Department"    value={s.department} />
                      <DetailRow label="Program"       value={s.program_type} />
                      <DetailRow label="Year / Sem"    value={`Year ${s.year_of_study || '—'}, Sem ${s.semester || '—'}`} />
                      <DetailRow label="Hostel / Room" value={`${s.hostel_name || '—'} — ${s.room_number || '—'}`} />
                    </div>
                  </div>
                )}
                {p && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pass</p>
                    <DetailRow label="Pass ID"     value={`#${p.id}`} />
                    <DetailRow label="Type"        value={p.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'} />
                    <DetailRow label="Destination" value={p.destination} />
                    <DetailRow label="Reason"      value={p.reason} />
                    {p.pass_type === 'DAILY'
                      ? <DetailRow label="Pass Date"  value={fmt(p.pass_date || p.from_date)} />
                      : <><DetailRow label="Leaving"   value={fmt(p.leaving_date || p.from_date)} /><DetailRow label="Returning" value={fmt(p.returning_date || p.to_date)} /></>
                    }
                    <DetailRow label="Status" value={p.status} />
                  </div>
                )}
                {a && (a.coordinator || a.hostelStaff) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Approvals</p>
                    {a.coordinator && <DetailRow label="Coordinator"  value={a.coordinator} />}
                    {a.hostelStaff && <DetailRow label="Hostel Staff" value={a.hostelStaff} />}
                  </div>
                )}
                {result.scanDetails && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Scan Record</p>
                    <DetailRow label="Action"    value={result.scanDetails.action} />
                    <DetailRow label="Timestamp" value={fmtDT(result.scanDetails.timestamp)} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm min-h-64 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="font-bold text-slate-600">Awaiting Scan</p>
                <p className="text-sm text-slate-400 mt-1">Point camera at a student's QR code</p>
              </div>
            </div>
          )}

          {recentScans.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-slate-800 text-sm">Recent Scans (this session)</p>
              </div>
              <div className="divide-y divide-slate-100">
                {recentScans.map(scan => (
                  <div key={scan.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${scan.action === 'OUT' ? 'bg-orange-500' : scan.action === 'IN' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                        {scan.action === 'OUT' ? '↑' : scan.action === 'IN' ? '↓' : '✓'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{scan.studentName || '—'}</p>
                        <p className="text-xs text-slate-400 font-mono">{scan.usn || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge text-xs ${scan.action === 'OUT' ? 'badge-warning' : scan.action === 'IN' ? 'badge-success' : 'badge-info'}`}>{scan.action}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{scan.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

/* ─── Export ─────────────────────────────────────────────────────────────────── */
export function QRScanner() {
  return (
    <ScannerErrorBoundary>
      <QRScannerInner />
    </ScannerErrorBoundary>
  )
}

export default QRScanner
