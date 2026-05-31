import { useNavigate } from 'react-router-dom'

/**
 * Reusable Quick Actions Panel Component
 * Displays role-specific quick action buttons
 */
export const QuickActionsPanel = ({ actions }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition text-left"
          >
            <span className="text-xl">{action.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{action.label}</p>
              {action.description && (
                <p className="text-xs text-gray-500">{action.description}</p>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActionsPanel
