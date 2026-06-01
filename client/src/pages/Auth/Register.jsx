import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 8) e.password = 'Min 8 characters'
    else if (!/[A-Z]/.test(formData.password)) e.password = 'Must contain an uppercase letter'
    else if (!/[a-z]/.test(formData.password)) e.password = 'Must contain a lowercase letter'
    else if (!/[0-9]/.test(formData.password)) e.password = 'Must contain a number'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const result = await register(formData.name, formData.email, formData.password, formData.phone)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2500)
      } else {
        setApiError(result.error || 'Registration failed')
      }
    } catch {
      setApiError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
           style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f5f3ff 100%)' }}>
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account created!</h2>
          <p className="text-slate-500 mb-6">Redirecting you to sign in...</p>
          <Link to="/login" className="btn-primary">Go to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f5f3ff 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-lg">Smart Gate Pass</span>
          </div>
          <p className="text-indigo-200 text-sm">VTU Management System</p>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Join the<br />system today.</h1>
          <p className="text-indigo-200 text-lg">Create your student account and start managing your gate passes digitally.</p>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-sm text-indigo-100 font-medium mb-1">Student Registration Only</p>
            <p className="text-xs text-indigo-200">Staff accounts are created by the administrator. If you are staff, contact your admin.</p>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-indigo-300 text-xs">© {new Date().getFullYear()} Smart Gate Pass · VTU</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">Smart Gate Pass</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
            <p className="text-slate-500 mt-1 text-sm">Student registration — fill in your details below</p>
          </div>

          {apiError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                disabled={loading} placeholder="John Doe"
                className={`input-field ${errors.name ? 'border-red-400 bg-red-50' : ''}`}
                autoComplete="name" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                disabled={loading} placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
                autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                disabled={loading} placeholder="9876543210"
                className="input-field" autoComplete="tel" />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  disabled={loading} placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400 bg-red-50' : ''}`}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password
                ? <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                : <p className="mt-1 text-xs text-slate-400">Min 8 chars · uppercase · lowercase · number</p>
              }
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                disabled={loading} placeholder="••••••••"
                className={`input-field ${errors.confirmPassword ? 'border-red-400 bg-red-50' : ''}`}
                autoComplete="new-password" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-center">
              <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
