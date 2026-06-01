import { useState, useEffect } from 'react'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import {
  getNotifications, getUnreadCount, markAsRead,
  markAllAsRead, deleteNotification, deleteAllNotifications
} from '../../api/notification.api'

const TYPE_CONFIG = {
  PASS_SUBMITTED:       { icon: '📝', cls: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500'    },
  COORDINATOR_APPROVED: { icon: '✅', cls: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  HOSTEL_APPROVED:      { icon: '✅', cls: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  COORDINATOR_REJECTED: { icon: '❌', cls: 'bg-red-50 border-red-200',      dot: 'bg-red-500'     },
  HOSTEL_REJECTED:      { icon: '❌', cls: 'bg-red-50 border-red-200',      dot: 'bg-red-500'     },
  QR_GENERATED:         { icon: '📱', cls: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500'  },
  PASS_COMPLETED:       { icon: '🎉', cls: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-500'   },
  NEW_REQUEST:          { icon: '📬', cls: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500'  },
  SYSTEM:               { icon: 'ℹ️', cls: 'bg-slate-50 border-slate-200',  dot: 'bg-slate-400'   },
}

function getConfig(type) {
  return TYPE_CONFIG[type] || { icon: '🔔', cls: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' }
}

export function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filter, setFilter] = useState('all')
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  useEffect(() => {
    load(); loadCount()
    const interval = setInterval(() => { load(); loadCount() }, 60000)
    return () => clearInterval(interval)
  }, [filter, offset])

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const res = await getNotifications(LIMIT, offset, filter === 'unread')
      if (res.success) setNotifications(res.data)
      else setError(res.message)
    } catch (err) { setError(err.message || 'Failed to load notifications') }
    finally { setLoading(false) }
  }

  const loadCount = async () => {
    try {
      const res = await getUnreadCount()
      if (res.success) setUnreadCount(res.data.unreadCount)
    } catch { /* silent */ }
  }

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id); setSuccess('Marked as read'); load(); loadCount()
    } catch (err) { setError(err.message) }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(); setSuccess('All marked as read'); load(); loadCount()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id); setSuccess('Deleted'); load(); loadCount()
    } catch (err) { setError(err.message) }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all notifications?')) return
    try {
      await deleteAllNotifications(); setSuccess('All deleted'); load(); loadCount()
    } catch (err) { setError(err.message) }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-secondary text-sm py-2">
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={handleDeleteAll}
                className="btn-ghost text-sm py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl px-3">
                Delete all
              </button>
            )}
          </div>
        }
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

      {/* Filter */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-sm">
        {[['all', 'All'], ['unread', `Unread (${unreadCount})`]].map(([val, label]) => (
          <button key={val} onClick={() => { setFilter(val); setOffset(0) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === val ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl">🔔</div>
          <p className="font-semibold text-slate-700">No notifications</p>
          <p className="text-sm text-slate-400 mt-1">You'll see updates here when they arrive</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = getConfig(n.type)
            return (
              <div key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.cls} ${!n.is_read ? 'ring-1 ring-inset ring-slate-200' : ''} transition-all animate-fade-in`}>
                <div className="relative flex-shrink-0">
                  <span className="text-xl">{cfg.icon}</span>
                  {!n.is_read && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${cfg.dot} border-2 border-white`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}
            className="btn-secondary text-sm py-2 disabled:opacity-40">
            ← Previous
          </button>
          <button onClick={() => setOffset(offset + LIMIT)} disabled={notifications.length < LIMIT}
            className="btn-secondary text-sm py-2 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </DashboardShell>
  )
}

export default Notifications
