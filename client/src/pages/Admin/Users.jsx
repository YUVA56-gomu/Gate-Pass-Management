import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Notification from '../../components/common/Notification'
import { getAllUsers, createUser, updateUser, activateUser, deactivateUser, resetUserPassword } from '../../api/admin.api'

function Users() {
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COORDINATOR',
    phone: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllUsers(filter)
      if (response.success) {
        setUsers(response.data)
      } else {
        setError(response.message || 'Failed to load users')
      }
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      // Validation
      if (!formData.name || !formData.name.trim()) {
        setError('Name is required')
        return
      }

      if (!formData.email || !formData.email.trim()) {
        setError('Email is required')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Invalid email format')
        return
      }

      if (!formData.password || !formData.password.trim()) {
        setError('Password is required')
        return
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }

      if (!formData.role) {
        setError('Role is required')
        return
      }

      console.log('[ADMIN] Creating user with data:', formData)

      const response = await createUser(formData)
      
      console.log('[ADMIN] Create user response:', response)

      if (response.success) {
        setSuccess('User created successfully')
        setFormData({ name: '', email: '', password: '', role: 'COORDINATOR', phone: '' })
        setShowCreateModal(false)
        // Refresh user list immediately
        await fetchUsers()
      } else {
        setError(response.message || 'Failed to create user')
      }
    } catch (err) {
      console.error('[ADMIN] Create user error:', err)
      setError(err.message || err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      setError(null)
      const response = await activateUser(userId)
      if (response.success) {
        setSuccess('User activated successfully')
        fetchUsers()
      } else {
        setError(response.message || 'Failed to activate user')
      }
    } catch (err) {
      setError(err.message || 'Failed to activate user')
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      setError(null)
      const response = await deactivateUser(userId)
      if (response.success) {
        setSuccess('User deactivated successfully')
        fetchUsers()
      } else {
        setError(response.message || 'Failed to deactivate user')
      }
    } catch (err) {
      setError(err.message || 'Failed to deactivate user')
    }
  }

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      setError(null)
      const response = await deactivateUser(selectedUser.id)
      if (response.success) {
        setSuccess('User deleted successfully')
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(response.message || 'Failed to delete user')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleResetPassword = async (userId) => {
    try {
      setError(null)
      const response = await resetUserPassword(userId)
      if (response.success) {
        setSuccess(`Password reset. Temporary password: ${response.data.temporaryPassword}`)
        fetchUsers()
      } else {
        setError(response.message || 'Failed to reset password')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          {error && <Notification type="error" message={error} />}
          {success && <Notification type="success" message={success} />}

          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-2">Manage system users and staff accounts</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Create User
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {['ALL', 'STUDENT', 'COORDINATOR', 'HOSTEL_STAFF', 'SECURITY', 'ADMIN'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'COORDINATOR'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'HOSTEL_STAFF'
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'SECURITY'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-600">No users found</p>
                </div>
              </div>
            )}
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New User</h2>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="COORDINATOR">Coordinator</option>
                      <option value="HOSTEL_STAFF">Hostel Staff</option>
                      <option value="SECURITY">Security</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setFormData({ name: '', email: '', password: '', role: 'COORDINATOR', phone: '' })
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete user <strong>{selectedUser.name}</strong>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedUser(null)
                    }}
                    className="flex-1 px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Users
