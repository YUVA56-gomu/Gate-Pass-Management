import { useNotification } from '../../hooks/useNotification'

function Notification() {
  const { notifications } = useNotification()

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded shadow-lg text-white ${
            notif.type === 'error'
              ? 'bg-red-500'
              : notif.type === 'success'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
        >
          {notif.message}
        </div>
      ))}
    </div>
  )
}

export default Notification
