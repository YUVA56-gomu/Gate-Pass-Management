import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { userAPI } from '../../api/user.api'
import { useNotification } from '../../hooks/useNotification'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'

const ROLE_BADGE = {
  STUDENT:     'badge-info',
  COORDINATOR: 'badge-brand',
  HOSTEL_STAFF:'badge-success',
  SECURITY:    'badge-warning',
  ADMIN:       'badge-purple',
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { addNotification } = useNotification()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAllUsers()
      setUsers(res.data.data || [])
    } catch { addNotification('Failed to fetch users', 'error') }
    finally { setLoading(false) }
  }

  const onSubmit = async (data) => {
    try {
      await userAPI.createUser(data)
      addNotification('User created successfully', 'success')
      reset(); setShowForm(false); fetchUsers()
    } catch (err) { addNotification(err.response?.data?.message || 'Failed to create user', 'error') }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      await userAPI.deleteUser(id)
      addNotification('User deleted successfully', 'success')
      setDeleteId(null); fetchUsers()
    } catch { addNotification('Failed to delete user', 'error') }
    finally { setDeleting(false) }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {val?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-medium text-slate-800">{val}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (val) => (
      <span className={`badge ${ROLE_BADGE[val] || 'badge-gray'}`}>{val?.replace(/_/g, ' ')}</span>
    )},
    { key: 'isActive', label: 'Status', render: (val) => (
      <span className={`badge ${val ? 'badge-success' : 'badge-gray'}`}>{val ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <button onClick={() => setDeleteId(row.id || row._id)}
        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200">
        Delete
      </button>
    )}
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="User Management"
        subtitle="Create and manage system users"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        }
      />

      {/* Create User Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 animate-fade-in-down">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Create New User</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.name?.message}>
              <input {...register('name', { required: 'Name is required' })}
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Enter full name" />
            </Field>
            <Field label="Email Address" required error={errors.email?.message}>
              <input type="email" {...register('email', { required: 'Email is required' })}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="Enter email address" />
            </Field>
            <Field label="Role" required error={errors.role?.message}>
              <select {...register('role', { required: 'Role is required' })}
                className={`input-field ${errors.role ? 'border-red-400' : ''}`}>
                <option value="">Select Role</option>
                <option value="coordinator">Coordinator</option>
                <option value="hostel_staff">Hostel Staff</option>
                <option value="security">Security Guard</option>
              </select>
            </Field>
            <Field label="Password" required error={errors.password?.message}>
              <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                placeholder="Min 6 characters" />
            </Field>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={isSubmitting} className="btn-primary py-2.5 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-secondary py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        title="All Users"
        columns={columns}
        data={users}
        loading={loading}
        empty="No users found"
      />

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={() => handleDelete(deleteId)} disabled={deleting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        }>
        <p className="text-sm text-slate-600">Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </DashboardShell>
  )
}

export default UserManagement
