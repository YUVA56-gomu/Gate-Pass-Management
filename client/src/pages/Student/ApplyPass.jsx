import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as studentAPI from '../../api/student.api'
import * as passAPI from '../../api/pass.api'
import * as coordinatorAPI from '../../api/coordinator.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

const INITIAL_FORM = {
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
}

function Field({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-slate-400">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function ApplyPass() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [coordinators, setCoordinators] = useState([])
  const [hostelStaff, setHostelStaff] = useState([])
  const [loadingCoords, setLoadingCoords] = useState(true)
  const [loadingHostel, setLoadingHostel] = useState(true)
  const [formData, setFormData] = useState(INITIAL_FORM)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const res = await studentAPI.checkProfileCompletion()
        setProfileComplete(res.data.isComplete)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to check profile')
      } finally {
        setLoading(false)
      }
    }
    const loadCoords = async () => {
      try {
        const res = await coordinatorAPI.getAllCoordinators()
        setCoordinators(res.data || [])
      } catch { /* silent */ } finally { setLoadingCoords(false) }
    }
    const loadHostel = async () => {
      try {
        const res = await coordinatorAPI.getHostelStaff()
        setHostelStaff(res.data || [])
      } catch { /* silent */ } finally { setLoadingHostel(false) }
    }
    init(); loadCoords(); loadHostel()
  }, [])

  const today = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const switchType = (type) => {
    setFormData({ ...INITIAL_FORM, pass_type: type })
    setErrors({})
  }

  const validate = () => {
    const e = {}
    const t = today()
    if (!formData.reason?.trim())       e.reason = 'Reason is required'
    if (!formData.destination?.trim())  e.destination = 'Destination is required'
    if (!formData.hostel_staff_id)      e.hostel_staff_id = 'Hostel Staff selection is required'
    if (formData.pass_type === 'DAILY') {
      if (!formData.pass_date)          e.pass_date = 'Pass date is required'
      else if (formData.pass_date < t)  e.pass_date = 'Pass date cannot be in the past'
    }
    if (formData.pass_type === 'LONG_LEAVE') {
      if (!formData.leaving_date)                                          e.leaving_date = 'Leaving date is required'
      else if (formData.leaving_date < t)                                  e.leaving_date = 'Leaving date cannot be in the past'
      if (!formData.returning_date)                                        e.returning_date = 'Returning date is required'
      else if (formData.leaving_date && formData.returning_date <= formData.leaving_date) e.returning_date = 'Must be after leaving date'
      if (!formData.parent_contact?.trim())                                e.parent_contact = 'Parent contact is required'
      else if (!/^\d{10}$/.test(formData.parent_contact.replace(/\D/g,''))) e.parent_contact = 'Enter a valid 10-digit number'
      if (!formData.coordinator_id)                                        e.coordinator_id = 'Coordinator selection is required'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
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

  const isDaily = formData.pass_type === 'DAILY'

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Apply for Pass"
          subtitle="Submit a new gate pass or leave request"
          back="Back to Dashboard"
          onBack={() => navigate('/student/dashboard')}
        />

        {/* Profile Incomplete Warning */}
        {!profileComplete && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">Complete your profile first</p>
                <p className="text-amber-700 text-sm mt-0.5">Your student profile must be complete before applying for a pass.</p>
                <button onClick={() => navigate('/student/profile')}
                  className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors">
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Error */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        {profileComplete && (
          <>
            {/* Workflow Banner */}
            <div className={`mb-5 p-4 rounded-2xl border ${isDaily ? 'bg-blue-50 border-blue-200' : 'bg-violet-50 border-violet-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDaily ? 'text-blue-700' : 'text-violet-700'}`}>
                {isDaily ? 'Daily Pass Workflow' : 'Long Leave Workflow'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {(isDaily
                  ? ['Student', 'Hostel Staff', 'Pass Generated', 'Security Scan']
                  : ['Student', 'Coordinator', 'Hostel Staff', 'Pass Generated', 'Security Scan']
                ).map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isDaily ? 'text-blue-800' : 'text-violet-800'}`}>{step}</span>
                    {i < arr.length - 1 && (
                      <svg className={`w-3 h-3 ${isDaily ? 'text-blue-400' : 'text-violet-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Pass Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pass Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['DAILY', 'LONG_LEAVE'].map((type) => (
                      <button key={type} type="button" onClick={() => switchType(type)}
                        className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2 ${
                          formData.pass_type === type
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}>
                        {type === 'DAILY' ? '📅 Daily Pass' : '🗓️ Long Leave'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <Field label="Reason" required error={errors.reason}>
                  <textarea name="reason" rows={3} value={formData.reason} onChange={handleChange}
                    placeholder="Describe the reason for your pass request..."
                    className={`input-field resize-none ${errors.reason ? 'border-red-400 bg-red-50' : ''}`} />
                </Field>

                {/* Destination */}
                <Field label="Destination" required error={errors.destination}>
                  <input type="text" name="destination" value={formData.destination} onChange={handleChange}
                    placeholder="e.g., Home, Hospital, City..."
                    className={`input-field ${errors.destination ? 'border-red-400 bg-red-50' : ''}`} />
                </Field>

                {/* Daily Pass Fields */}
                {isDaily && (
                  <>
                    <Field label="Pass Date" required error={errors.pass_date}>
                      <input type="date" name="pass_date" value={formData.pass_date} onChange={handleChange}
                        min={today()}
                        className={`input-field ${errors.pass_date ? 'border-red-400 bg-red-50' : ''}`} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Exit Time" hint="Optional">
                        <input type="time" name="exit_time" value={formData.exit_time} onChange={handleChange} className="input-field" />
                      </Field>
                      <Field label="Return Time" hint="Optional">
                        <input type="time" name="expected_return_time" value={formData.expected_return_time} onChange={handleChange} className="input-field" />
                      </Field>
                    </div>
                  </>
                )}

                {/* Long Leave Fields */}
                {!isDaily && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Leaving Date" required error={errors.leaving_date}>
                        <input type="date" name="leaving_date" value={formData.leaving_date} onChange={handleChange}
                          min={today()}
                          className={`input-field ${errors.leaving_date ? 'border-red-400 bg-red-50' : ''}`} />
                      </Field>
                      <Field label="Returning Date" required error={errors.returning_date}>
                        <input type="date" name="returning_date" value={formData.returning_date} onChange={handleChange}
                          min={formData.leaving_date || today()}
                          className={`input-field ${errors.returning_date ? 'border-red-400 bg-red-50' : ''}`} />
                      </Field>
                    </div>
                    <Field label="Parent Contact" required error={errors.parent_contact}>
                      <input type="tel" name="parent_contact" value={formData.parent_contact} onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className={`input-field ${errors.parent_contact ? 'border-red-400 bg-red-50' : ''}`} />
                    </Field>
                    <Field label="Coordinator" required error={errors.coordinator_id}>
                      <select name="coordinator_id" value={formData.coordinator_id} onChange={handleChange}
                        className={`input-field ${errors.coordinator_id ? 'border-red-400 bg-red-50' : ''}`}>
                        <option value="">{loadingCoords ? 'Loading...' : 'Select Coordinator'}</option>
                        {!loadingCoords && coordinators.length === 0 && <option disabled>No coordinators available</option>}
                        {coordinators.map(c => (
                          <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {/* Hostel Staff */}
                <Field label="Hostel Staff" required hint="Required for approval" error={errors.hostel_staff_id}>
                  <select name="hostel_staff_id" value={formData.hostel_staff_id} onChange={handleChange}
                    className={`input-field ${errors.hostel_staff_id ? 'border-red-400 bg-red-50' : ''}`}>
                    <option value="">{loadingHostel ? 'Loading...' : 'Select Hostel Staff'}</option>
                    {!loadingHostel && hostelStaff.length === 0 && <option disabled>No hostel staff available</option>}
                    {hostelStaff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.phone ? ` — ${s.phone}` : ''}</option>
                    ))}
                  </select>
                </Field>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting || loadingHostel}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : 'Submit Pass Request'}
                  </button>
                  <button type="button" onClick={() => navigate('/student/dashboard')}
                    className="flex-1 btn-secondary py-3">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default ApplyPass
