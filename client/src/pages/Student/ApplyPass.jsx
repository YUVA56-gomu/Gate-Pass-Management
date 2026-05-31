import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as studentAPI from '../../api/student.api'
import * as passAPI from '../../api/pass.api'

export const ApplyPass = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    pass_type: 'DAILY',
    reason: '',
    destination: '',
    pass_date: '',
    from_date: '',
    to_date: '',
    exit_time: '',
    expected_return_time: '',
    parent_contact: ''
  })

  // Check profile completion on mount
  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      setLoading(true)
      const response = await studentAPI.checkProfileCompletion()
      setProfileComplete(response.data.isComplete)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const validateForm = () => {
    const newErrors = {}
    const today = getTodayDate()

    if (!formData.pass_type) {
      newErrors.pass_type = 'Pass type is required'
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = 'Reason is required'
    }

    if (!formData.destination?.trim()) {
      newErrors.destination = 'Destination is required'
    }

    // DAILY PASS VALIDATION
    if (formData.pass_type === 'DAILY') {
      if (!formData.pass_date) {
        newErrors.pass_date = 'Pass date is required'
      } else if (formData.pass_date < today) {
        newErrors.pass_date = 'Pass date cannot be in the past'
      }
    }

    // LONG LEAVE VALIDATION
    if (formData.pass_type === 'LONG_LEAVE') {
      if (!formData.from_date) {
        newErrors.from_date = 'Leaving date is required'
      } else if (formData.from_date < today) {
        newErrors.from_date = 'Leaving date cannot be in the past'
      }

      if (!formData.to_date) {
        newErrors.to_date = 'Returning date is required'
      } else if (formData.from_date && formData.to_date <= formData.from_date) {
        newErrors.to_date = 'Returning date must be after leaving date'
      }

      if (!formData.parent_contact?.trim()) {
        newErrors.parent_contact = 'Parent contact is required for long leave'
      } else if (!/^\d{10}$/.test(formData.parent_contact.replace(/\D/g, ''))) {
        newErrors.parent_contact = 'Parent contact must be a valid phone number'
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)

    try {
      await passAPI.createPass(formData)
      navigate('/student/my-passes', {
        state: { message: 'Pass created successfully' }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pass')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for Pass</h1>
          <p className="text-gray-600 mt-2">Submit a new gate pass or leave request</p>
        </div>

        {/* Profile Incomplete Warning */}
        {!profileComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900">Complete your profile first</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  You need to complete your student profile before applying for a pass.
                </p>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        {profileComplete && (
          <div className="bg-white rounded-lg shadow">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Pass Type Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pass Type *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        pass_type: 'DAILY',
                        from_date: '',
                        to_date: '',
                        parent_contact: ''
                      }))
                      setErrors({})
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      formData.pass_type === 'DAILY'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Daily Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        pass_type: 'LONG_LEAVE',
                        pass_date: '',
                        exit_time: '',
                        expected_return_time: ''
                      }))
                      setErrors({})
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      formData.pass_type === 'LONG_LEAVE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Long Leave
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the reason for your pass request"
                />
                {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Home, Hospital, etc."
                />
                {errors.destination && <p className="text-red-600 text-sm mt-1">{errors.destination}</p>}
              </div>

              {/* DAILY PASS FIELDS */}
              {formData.pass_type === 'DAILY' && (
                <>
                  <div>
                    <label htmlFor="pass_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Date *
                    </label>
                    <input
                      type="date"
                      id="pass_date"
                      name="pass_date"
                      value={formData.pass_date}
                      onChange={handleChange}
                      min={getTodayDate()}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pass_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.pass_date && <p className="text-red-600 text-sm mt-1">{errors.pass_date}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="exit_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Exit Time (Optional)
                      </label>
                      <input
                        type="time"
                        id="exit_time"
                        name="exit_time"
                        value={formData.exit_time}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="expected_return_time" className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Return Time (Optional)
                      </label>
                      <input
                        type="time"
                        id="expected_return_time"
                        name="expected_return_time"
                        value={formData.expected_return_time}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LONG LEAVE FIELDS */}
              {formData.pass_type === 'LONG_LEAVE' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="from_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Leaving Date *
                      </label>
                      <input
                        type="date"
                        id="from_date"
                        name="from_date"
                        value={formData.from_date}
                        onChange={handleChange}
                        min={getTodayDate()}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.from_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.from_date && <p className="text-red-600 text-sm mt-1">{errors.from_date}</p>}
                    </div>

                    <div>
                      <label htmlFor="to_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Returning Date *
                      </label>
                      <input
                        type="date"
                        id="to_date"
                        name="to_date"
                        value={formData.to_date}
                        onChange={handleChange}
                        min={formData.from_date || getTodayDate()}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.to_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.to_date && <p className="text-red-600 text-sm mt-1">{errors.to_date}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parent_contact" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Contact (Phone Number) *
                    </label>
                    <input
                      type="tel"
                      id="parent_contact"
                      name="parent_contact"
                      value={formData.parent_contact}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.parent_contact ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 9876543210"
                    />
                    {errors.parent_contact && <p className="text-red-600 text-sm mt-1">{errors.parent_contact}</p>}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Pass Request'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplyPass
