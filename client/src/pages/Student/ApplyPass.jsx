import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as studentAPI from '../../api/student.api'
import * as passAPI from '../../api/pass.api'
import * as coordinatorAPI from '../../api/coordinator.api'

export const ApplyPass = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [coordinators, setCoordinators] = useState([])
  const [coordinatorsLoading, setCoordinatorsLoading] = useState(true)
  const [hostelStaff, setHostelStaff] = useState([])
  const [hostelStaffLoading, setHostelStaffLoading] = useState(true)

  const [formData, setFormData] = useState({
    pass_type: 'DAILY',
    reason: '',
    destination: '',
    pass_date: '',
    leaving_date: '',
    returning_date: '',
    exit_time: '',
    expected_return_time: '',
    parent_contact: '',
    coordinator_id: '',
    hostel_staff_id: ''
  })

  useEffect(() => {
    checkProfile()
    loadCoordinators()
    loadHostelStaff()
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

  const loadCoordinators = async () => {
    try {
      setCoordinatorsLoading(true)
      const response = await coordinatorAPI.getAllCoordinators()
      setCoordinators(response.data || [])
    } catch (err) {
      console.error('[ApplyPass] Failed to load coordinators:', err)
    } finally {
      setCoordinatorsLoading(false)
    }
  }

  const loadHostelStaff = async () => {
    try {
      setHostelStaffLoading(true)
      const response = await coordinatorAPI.getHostelStaff()
      setHostelStaff(response.data || [])
    } catch (err) {
      console.error('[ApplyPass] Failed to load hostel staff:', err)
    } finally {
      setHostelStaffLoading(false)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const today = getTodayDate()

    if (!formData.reason?.trim()) newErrors.reason = 'Reason is required'
    if (!formData.destination?.trim()) newErrors.destination = 'Destination is required'

    if (!formData.hostel_staff_id) {
      newErrors.hostel_staff_id = 'Hostel Staff selection is required'
    }

    if (formData.pass_type === 'DAILY') {
      if (!formData.pass_date) {
        newErrors.pass_date = 'Pass date is required'
      } else if (formData.pass_date < today) {
        newErrors.pass_date = 'Pass date cannot be in the past'
      }
    }

    if (formData.pass_type === 'LONG_LEAVE') {
      if (!formData.leaving_date) {
        newErrors.leaving_date = 'Leaving date is required'
      } else if (formData.leaving_date < today) {
        newErrors.leaving_date = 'Leaving date cannot be in the past'
      }

      if (!formData.returning_date) {
        newErrors.returning_date = 'Returning date is required'
      } else if (formData.leaving_date && formData.returning_date <= formData.leaving_date) {
        newErrors.returning_date = 'Returning date must be after leaving date'
      }

      if (!formData.parent_contact?.trim()) {
        newErrors.parent_contact = 'Parent contact is required for long leave'
      } else if (!/^\d{10}$/.test(formData.parent_contact.replace(/\D/g, ''))) {
        newErrors.parent_contact = 'Enter a valid 10-digit phone number'
      }

      if (!formData.coordinator_id) {
        newErrors.coordinator_id = 'Coordinator selection is required for long leave'
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
      navigate('/student/my-passes', { state: { message: 'Pass request submitted successfully!' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit pass request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const isDaily = formData.pass_type === 'DAILY'

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Pass</h1>
          <p className="text-gray-500 mt-1 font-normal">Submit a new gate pass or leave request</p>
        </div>

        {/* Profile Incomplete Warning */}
        {!profileComplete && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-amber-900">Complete your profile first</p>
                <p className="text-amber-800 text-sm mt-1 font-normal">Your student profile must be complete before you can apply for a pass.</p>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-semibold"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Workflow Banner */}
        {profileComplete && (
          <div className={`mb-6 p-4 rounded-xl border ${isDaily ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${isDaily ? 'text-blue-900' : 'text-purple-900'}`}>
              {isDaily ? '📅 Daily Pass Workflow' : '🗓️ Long Leave Workflow'}
            </p>
            <p className={`text-sm font-normal ${isDaily ? 'text-blue-800' : 'text-purple-800'}`}>
              {isDaily
                ? 'Student → Hostel Staff Approval → Pass Generated → Security Scan'
                : 'Student → Coordinator Approval → Hostel Staff Approval → Pass Generated → Security Scan'}
            </p>
          </div>
        )}

        {/* Form */}
        {profileComplete && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Pass Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Pass Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['DAILY', 'LONG_LEAVE'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          pass_type: type,
                          pass_date: '',
                          leaving_date: '',
                          returning_date: '',
                          parent_contact: '',
                          coordinator_id: '',
                          exit_time: '',
                          expected_return_time: ''
                        }))
                        setErrors({})
                      }}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition border-2 ${
                        formData.pass_type === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {type === 'DAILY' ? '📅 Daily Pass' : '🗓️ Long Leave'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason" name="reason" rows={3}
                  value={formData.reason} onChange={handleChange}
                  placeholder="Describe the reason for your pass request..."
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal resize-none ${errors.reason ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.reason && <p className="text-red-600 text-xs mt-1">{errors.reason}</p>}
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="destination" name="destination"
                  value={formData.destination} onChange={handleChange}
                  placeholder="e.g., Home, Hospital, City..."
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal ${errors.destination ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.destination && <p className="text-red-600 text-xs mt-1">{errors.destination}</p>}
              </div>

              {/* ── DAILY PASS FIELDS ── */}
              {isDaily && (
                <>
                  <div>
                    <label htmlFor="pass_date" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Pass Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date" id="pass_date" name="pass_date"
                      value={formData.pass_date} onChange={handleChange}
                      min={getTodayDate()}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.pass_date ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.pass_date && <p className="text-red-600 text-xs mt-1">{errors.pass_date}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exit_time" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Exit Time <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="time" id="exit_time" name="exit_time"
                        value={formData.exit_time} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="expected_return_time" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Return Time <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="time" id="expected_return_time" name="expected_return_time"
                        value={formData.expected_return_time} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── LONG LEAVE FIELDS ── */}
              {!isDaily && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="leaving_date" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Leaving Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date" id="leaving_date" name="leaving_date"
                        value={formData.leaving_date} onChange={handleChange}
                        min={getTodayDate()}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.leaving_date ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.leaving_date && <p className="text-red-600 text-xs mt-1">{errors.leaving_date}</p>}
                    </div>
                    <div>
                      <label htmlFor="returning_date" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Returning Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date" id="returning_date" name="returning_date"
                        value={formData.returning_date} onChange={handleChange}
                        min={formData.leaving_date || getTodayDate()}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.returning_date ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      {errors.returning_date && <p className="text-red-600 text-xs mt-1">{errors.returning_date}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parent_contact" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Parent Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel" id="parent_contact" name="parent_contact"
                      value={formData.parent_contact} onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal ${errors.parent_contact ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.parent_contact && <p className="text-red-600 text-xs mt-1">{errors.parent_contact}</p>}
                  </div>

                  {/* Coordinator Dropdown — Long Leave only */}
                  <div>
                    <label htmlFor="coordinator_id" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Coordinator <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="coordinator_id" name="coordinator_id"
                      value={formData.coordinator_id} onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.coordinator_id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">
                        {coordinatorsLoading ? 'Loading coordinators...' : 'Select Coordinator'}
                      </option>
                      {!coordinatorsLoading && coordinators.length === 0 && (
                        <option disabled>No Coordinators Available</option>
                      )}
                      {coordinators.map(c => (
                        <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>
                      ))}
                    </select>
                    {errors.coordinator_id && <p className="text-red-600 text-xs mt-1">{errors.coordinator_id}</p>}
                  </div>
                </>
              )}

              {/* ── HOSTEL STAFF DROPDOWN — both pass types ── */}
              <div>
                <label htmlFor="hostel_staff_id" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Hostel Staff <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-400">(Required for approval)</span>
                </label>
                <select
                  id="hostel_staff_id" name="hostel_staff_id"
                  value={formData.hostel_staff_id} onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.hostel_staff_id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">
                    {hostelStaffLoading ? 'Loading hostel staff...' : 'Select Hostel Staff'}
                  </option>
                  {!hostelStaffLoading && hostelStaff.length === 0 && (
                    <option disabled>No Hostel Staff Available</option>
                  )}
                  {hostelStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.phone ? ` — ${s.phone}` : ''}</option>
                  ))}
                </select>
                {errors.hostel_staff_id && <p className="text-red-600 text-xs mt-1">{errors.hostel_staff_id}</p>}
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || hostelStaffLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition text-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Pass Request'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/student/dashboard')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition text-sm"
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
