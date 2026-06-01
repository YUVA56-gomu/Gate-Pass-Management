import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as studentAPI from '../../api/student.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

const DEPARTMENTS = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 2, name: 'Electronics & Communication', code: 'EC' },
  { id: 3, name: 'Robotics', code: 'ROBOTICS' },
  { id: 4, name: 'Master of Business Administration', code: 'MBA' },
  { id: 5, name: 'Master of Computer Applications', code: 'MCA' }
]

const INITIAL = {
  usn: '', department_id: '', program_type: 'UG', year_of_study: '',
  semester: '', gender: 'MALE', hostel_name: '', hostel_type: 'BOYS',
  room_number: '', parent_phone: '', emergency_contact: ''
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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
    </div>
  )
}

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t) }
  }, [success])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await studentAPI.getStudentProfile()
      if (res.data) { setProfile(res.data); setFormData(res.data); setIsEditing(false) }
    } catch (err) {
      if (err.response?.status === 404) { setProfile(null); setIsEditing(true) }
      else setError(err.response?.data?.message || 'Failed to load profile')
    } finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const converted = ['department_id', 'year_of_study', 'semester'].includes(name)
      ? (value === '' ? '' : parseInt(value, 10)) : value
    setFormData(prev => ({ ...prev, [name]: converted }))
    setTouched(prev => ({ ...prev, [name]: true }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.usn?.trim()) e.usn = 'USN is required'
    if (!formData.department_id) e.department_id = 'Department is required'
    if (!formData.program_type) e.program_type = 'Program type is required'
    if (formData.year_of_study === '' || formData.year_of_study < 1 || formData.year_of_study > 5) e.year_of_study = 'Year must be 1–5'
    if (formData.semester === '' || formData.semester < 1 || formData.semester > 8) e.semester = 'Semester must be 1–8'
    if (!formData.gender) e.gender = 'Gender is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setSubmitted(true)
    const allTouched = {}; Object.keys(formData).forEach(k => { allTouched[k] = true }); setTouched(allTouched)
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const res = profile
        ? await studentAPI.updateStudentProfile(formData)
        : await studentAPI.createStudentProfile(formData)
      setProfile(res.data)
      setSuccess(profile ? 'Profile updated successfully' : 'Profile created successfully')
      setIsEditing(false); setSubmitted(false); setTouched({})
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Student Profile"
          subtitle={profile ? 'Manage your profile information' : 'Complete your profile to apply for passes'}
          actions={profile && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
          )}
        />

        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white mb-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.name}</h2>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
              {profile && (
                <p className="text-indigo-200 text-xs mt-0.5">{profile.usn} · {DEPARTMENTS.find(d => d.id === profile.department_id)?.code || ''}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {!isEditing && profile ? (
            /* View Mode */
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Academic</p>
                  <InfoRow label="USN" value={profile.usn} />
                  <InfoRow label="Department" value={profile.Department?.name} />
                  <InfoRow label="Program" value={profile.program_type} />
                  <InfoRow label="Year" value={profile.year_of_study} />
                  <InfoRow label="Semester" value={profile.semester} />
                  <InfoRow label="Gender" value={profile.gender} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Hostel</p>
                  <InfoRow label="Hostel Name" value={profile.hostel_name} />
                  <InfoRow label="Hostel Type" value={profile.hostel_type} />
                  <InfoRow label="Room Number" value={profile.room_number} />
                  <InfoRow label="Parent Phone" value={profile.parent_phone} />
                  <InfoRow label="Emergency Contact" value={profile.emergency_contact} />
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="USN" required error={(touched.usn || submitted) && errors.usn}>
                  <input type="text" name="usn" value={formData.usn} onChange={handleChange}
                    placeholder="e.g., CS21001"
                    className={`input-field ${(touched.usn || submitted) && errors.usn ? 'border-red-400 bg-red-50' : ''}`} />
                </Field>
                <Field label="Department" required error={(touched.department_id || submitted) && errors.department_id}>
                  <select name="department_id" value={formData.department_id} onChange={handleChange}
                    className={`input-field ${(touched.department_id || submitted) && errors.department_id ? 'border-red-400 bg-red-50' : ''}`}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Program Type" required>
                  <select name="program_type" value={formData.program_type} onChange={handleChange} className="input-field">
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                  </select>
                </Field>
                <Field label="Year of Study" required error={(touched.year_of_study || submitted) && errors.year_of_study}>
                  <select name="year_of_study" value={formData.year_of_study} onChange={handleChange}
                    className={`input-field ${(touched.year_of_study || submitted) && errors.year_of_study ? 'border-red-400 bg-red-50' : ''}`}>
                    <option value="">Select Year</option>
                    {(formData.program_type === 'UG' ? [1,2,3,4] : [1,2]).map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </Field>
                <Field label="Semester" required error={(touched.semester || submitted) && errors.semester}>
                  <select name="semester" value={formData.semester} onChange={handleChange}
                    className={`input-field ${(touched.semester || submitted) && errors.semester ? 'border-red-400 bg-red-50' : ''}`}>
                    <option value="">Select Semester</option>
                    {(formData.program_type === 'UG' ? [1,2,3,4,5,6,7,8] : [1,2,3,4]).map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </Field>
                <Field label="Gender" required error={(touched.gender || submitted) && errors.gender}>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className={`input-field ${(touched.gender || submitted) && errors.gender ? 'border-red-400 bg-red-50' : ''}`}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Hostel Name">
                  <input type="text" name="hostel_name" value={formData.hostel_name} onChange={handleChange}
                    placeholder="e.g., Boys Hostel A" className="input-field" />
                </Field>
                <Field label="Hostel Type">
                  <select name="hostel_type" value={formData.hostel_type} onChange={handleChange} className="input-field">
                    <option value="BOYS">Boys</option>
                    <option value="GIRLS">Girls</option>
                  </select>
                </Field>
                <Field label="Room Number">
                  <input type="text" name="room_number" value={formData.room_number} onChange={handleChange}
                    placeholder="e.g., 101" className="input-field" />
                </Field>
                <Field label="Parent Phone">
                  <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange}
                    placeholder="e.g., 9876543210" className="input-field" />
                </Field>
                <Field label="Emergency Contact">
                  <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange}
                    placeholder="e.g., 9876543210" className="input-field" />
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                  {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </button>
                {profile && (
                  <button type="button" onClick={() => { setIsEditing(false); setFormData(profile); setErrors({}); setTouched({}); setSubmitted(false) }}
                    className="flex-1 btn-secondary py-3">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

export default Profile
