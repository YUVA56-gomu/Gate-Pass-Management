import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import { authAPI } from '../../api/auth.api'
import { useNotification } from '../../hooks/useNotification'

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await authAPI.login(data.email, data.password)
      login(response.data.user, response.data.token)
      addNotification('Login successful', 'success')
      
      const roleRoutes = {
        student: '/student/dashboard',
        coordinator: '/coordinator/dashboard',
        hostel_staff: '/hostel/dashboard',
        security: '/security/dashboard',
        admin: '/admin/dashboard'
      }
      navigate(roleRoutes[response.data.user.role])
    } catch (error) {
      addNotification(error.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6">Smart Gate Pass</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
