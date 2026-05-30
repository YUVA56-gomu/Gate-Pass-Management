import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '../../api/auth.api'
import { useNotification } from '../../hooks/useNotification'

function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.register(data)
      addNotification('Registration successful. Please login.', 'success')
      navigate('/login')
    } catch (error) {
      addNotification(error.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
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
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
