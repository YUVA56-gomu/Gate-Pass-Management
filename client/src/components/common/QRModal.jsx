import { useEffect } from 'react'

function QRModal({ isOpen, onClose, qrData, passDetails }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const typeLabel = passDetails?.passType === 'DAILY' ? 'Daily Pass' : passDetails?.passType === 'LONG_LEAVE' ? 'Long Leave' : passDetails?.passType

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content glass-strong w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60">
          <div>
            <h2 className="font-bold text-slate-900">Gate Pass QR Code</h2>
            <p className="text-xs text-slate-400 mt-0.5">Show this to security for scanning</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="px-6 py-5">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-6 mb-5 flex flex-col items-center">
            {qrData?.qrImage ? (
              <div className="bg-white p-4 rounded-2xl shadow-md mb-4 border border-slate-100">
                <img src={qrData.qrImage} alt="QR Code" className="w-56 h-56" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="spinner" />
              </div>
            )}

            <div className="text-center mb-3">
              <p className="text-xs text-slate-400 mb-0.5">Pass ID</p>
              <p className="text-2xl font-bold text-indigo-700">#{passDetails?.id}</p>
            </div>

            <div className="w-full p-3 rounded-xl bg-indigo-100/60 border border-indigo-200 text-center">
              <p className="text-xs font-semibold text-indigo-800">📱 Scan at Security Gate</p>
              <p className="text-xs text-indigo-600 mt-0.5">This QR code uniquely identifies your gate pass</p>
            </div>
          </div>

          {/* Pass Details */}
          <div className="space-y-2.5 mb-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pass Details</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
              {[
                ['Student', passDetails?.studentName],
                ['Pass Type', typeLabel],
                ['Status', passDetails?.status],
                ['Destination', passDetails?.destination],
                passDetails?.passDate ? ['Date', new Date(passDetails.passDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })] : null,
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}:</span>
                  <span className="font-medium text-slate-800">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-5">
            <p className="text-xs font-semibold text-amber-800 mb-2">Security Instructions</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Present this QR code to the security guard</li>
              <li>• Carry your physical ID card at all times</li>
              <li>• QR will be scanned at both entry and exit</li>
              <li>• Do not share this QR code with others</li>
            </ul>
          </div>

          <button onClick={onClose} className="w-full btn-secondary py-2.5">Close</button>
        </div>
      </div>
    </div>
  )
}

export default QRModal
