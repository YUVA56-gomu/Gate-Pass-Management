import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => removeNotification(id), 3500)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // showNotification is an alias for addNotification (used in AdminDashboard)
  const showNotification = addNotification

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      setUnreadCount,
      addNotification,
      removeNotification,
      showNotification,
    }}>
      {children}
      {/* Toast Renderer */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id}
              className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium pointer-events-auto max-w-sm ${
                n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                n.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' :
                n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-white border-slate-200 text-slate-800'
              }`}>
              <span className="flex-shrink-0">
                {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="flex-1">{n.message}</span>
              <button onClick={() => removeNotification(n.id)}
                className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
