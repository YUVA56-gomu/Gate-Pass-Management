import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Reusable Role-Based Navigation Component
 * Displays role-specific navigation tabs with current page highlight
 */
export const RoleNavigation = ({ items }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive(item.path)
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleNavigation
