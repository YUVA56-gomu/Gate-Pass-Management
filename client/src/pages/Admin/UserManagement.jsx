import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { userAPI } from '../../api/user.api'
import { useNotification } from '../../hooks/useNotification'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      addNotification('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await userAPI.createUser(data)
      addNotification('User created successfully', 'success')
      reset()
      setShowForm(false)
      fetchUsers()
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to create user', 'error')
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await userAPI.deleteUser(id)
        addNotification('User deleted successfully', 'success')
        fetchUsers()
      } catch (error) {
        addNotification('Failed to delete user', 'error')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Add User'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow mb-6 max-w-2xl">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Role</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="hostel_staff">Hostel Staff</option>
                  <option value="security">Security Guard</option>
                </select>
                {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Create User
              </button>
            </form>
          )}

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-3">{user.name}</td>
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.role}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserManagement
