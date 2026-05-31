import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as studentAPI from '../../api/student.api'

export const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    usn: '',
    department_id: '',
    program_type: 'UG',
    year_of_study: '',
    semester: '',
    gender: 'MALE',
    hostel_name: '',
    hostel_type: 'BOYS',
    room_number: '',
    parent_phone: '',
    emergency_contact: ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
    fetchDepartments()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await studentAPI.getStudentProfile()
      if (response.data) {
        setProfile(response.data)
        setFormData(response.data)
        setIsEditing(false)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null)
        setIsEditing(true)
      } else {
        setError(err.response?.data?.message || 'Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      // Using finalized departments
      setDepartments([
        { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
        { id: 2, name: 'Electronics & Communication', code: 'EC' },
        { id: 3, name: 'Robotics', code: 'ROBOTICS' },
        { id: 4, name: 'Master of Business Administration', code: 'MBA' },
        { id: 5, name: 'Master of Computer Applications', code: 'MCA' }
      ])
    } catch (err) {
      console.error('Failed to load departments:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(`[Profile] Field changed: ${name} = ${value}`)
    
    // FIX: Convert numeric fields to integers, keep others as strings
    // This ensures dropdown values match their option values
    const convertedValue = 
      name === 'department_id' || name === 'year_of_study' || name === 'semester' 
        ? (value === '' ? '' : parseInt(value, 10))
        : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue
    }))
    
    // FIX: Mark field as touched when user interacts with it
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }))
    
    // Clear error for this field only if it was previously showing an error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
    
    console.log(`[Profile] FormData updated:`, { [name]: convertedValue })
  }

  // FIX: Add blur handler to mark fields as touched
  const handleBlur = (e) => {
    const { name } = e.target
    console.log(`[Profile] Field blurred: ${name}`)
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.usn?.trim()) {
      newErrors.usn = 'USN is required'
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required'
    }

    if (!formData.program_type) {
      newErrors.program_type = 'Program type is required'
    }

    // FIX: Check for empty string instead of falsy value (0 is valid)
    if (formData.year_of_study === '' || formData.year_of_study < 1 || formData.year_of_study > 5) {
      newErrors.year_of_study = 'Year of study must be between 1 and 5'
    }

    // FIX: Check for empty string instead of falsy value (0 is valid)
    if (formData.semester === '' || formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = 'Semester must be between 1 and 8'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    console.log('[Profile] Validation result:', newErrors)
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    console.log('[Profile] Form submitted')
    console.log('[Profile] Current formData:', formData)
    console.log('[Profile] Profile exists:', !!profile)
    
    // FIX: Mark all fields as touched when form is submitted
    // This ensures all validation errors are shown
    setSubmitted(true)
    const allFieldsTouched = {}
    Object.keys(formData).forEach((key) => {
      allFieldsTouched[key] = true
    })
    setTouched(allFieldsTouched)

    const newErrors = validateForm()
    console.log('[Profile] Validation errors:', newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      console.log('[Profile] Form validation failed:', newErrors)
      return
    }

    setSaving(true)

    try {
      if (profile) {
        // Update existing profile
        console.log('[Profile] Updating profile with data:', formData)
        const response = await studentAPI.updateStudentProfile(formData)
        console.log('[Profile] Update response:', response)
        setProfile(response.data)
        setSuccess('Profile updated successfully')
        console.log('[Profile] Profile updated successfully')
      } else {
        // Create new profile
        console.log('[Profile] Creating profile with data:', formData)
        const response = await studentAPI.createStudentProfile(formData)
        console.log('[Profile] Create response:', response)
        setProfile(response.data)
        setSuccess('Profile created successfully')
        console.log('[Profile] Profile created successfully')
      }
      setIsEditing(false)
      setSubmitted(false)
      setTouched({})
    } catch (err) {
      console.error('[Profile] Error saving profile:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save profile'
      setError(errorMessage)
      console.error('[Profile] Error details:', err.response?.data || err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-2">
            {profile ? 'Manage your profile information' : 'Complete your profile to apply for passes'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {profile ? 'Your Profile' : 'Create Profile'}
            </h2>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing && profile ? (
            // View Mode
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">USN</label>
                  <p className="text-gray-900">{profile.usn}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-gray-900">{profile.Department?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                  <p className="text-gray-900">{profile.program_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  <p className="text-gray-900">{profile.year_of_study}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <p className="text-gray-900">{profile.semester}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-gray-900">{profile.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                  <p className="text-gray-900">{profile.hostel_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Type</label>
                  <p className="text-gray-900">{profile.hostel_type || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <p className="text-gray-900">{profile.room_number || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                  <p className="text-gray-900">{profile.parent_phone || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <p className="text-gray-900">{profile.emergency_contact || 'Not specified'}</p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* USN */}
                <div>
                  <label htmlFor="usn" className="block text-sm font-medium text-gray-700 mb-1">
                    USN *
                  </label>
                  <input
                    type="text"
                    id="usn"
                    name="usn"
                    value={formData.usn}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (touched.usn || submitted) && errors.usn ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., CS21001"
                  />
                  {(touched.usn || submitted) && errors.usn && <p className="text-red-600 text-sm mt-1">{errors.usn}</p>}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (touched.department_id || submitted) && errors.department_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {(touched.department_id || submitted) && errors.department_id && <p className="text-red-600 text-sm mt-1">{errors.department_id}</p>}
                </div>

                {/* Program Type */}
                <div>
                  <label htmlFor="program_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Program Type *
                  </label>
                  <select
                    id="program_type"
                    name="program_type"
                    value={formData.program_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                  </select>
                </div>

                {/* Year of Study */}
                <div>
                  <label htmlFor="year_of_study" className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Study *
                  </label>
                  <select
                    id="year_of_study"
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (touched.year_of_study || submitted) && errors.year_of_study ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Year</option>
                    {formData.program_type === 'UG' ? (
                      <>
                        {[1, 2, 3, 4].map((year) => (
                          <option key={year} value={year}>
                            Year {year}
                          </option>
                        ))}
                      </>
                    ) : (
                      <>
                        {[1, 2].map((year) => (
                          <option key={year} value={year}>
                            Year {year}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {(touched.year_of_study || submitted) && errors.year_of_study && <p className="text-red-600 text-sm mt-1">{errors.year_of_study}</p>}
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (touched.semester || submitted) && errors.semester ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Semester</option>
                    {formData.program_type === 'UG' ? (
                      <>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </>
                    ) : (
                      <>
                        {[1, 2, 3, 4].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {(touched.semester || submitted) && errors.semester && <p className="text-red-600 text-sm mt-1">{errors.semester}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      (touched.gender || submitted) && errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {(touched.gender || submitted) && errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>

                {/* Hostel Name */}
                <div>
                  <label htmlFor="hostel_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    id="hostel_name"
                    name="hostel_name"
                    value={formData.hostel_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Boys Hostel A"
                  />
                </div>

                {/* Hostel Type */}
                <div>
                  <label htmlFor="hostel_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Hostel Type
                  </label>
                  <select
                    id="hostel_type"
                    name="hostel_type"
                    value={formData.hostel_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BOYS">Boys</option>
                    <option value="GIRLS">Girls</option>
                  </select>
                </div>

                {/* Room Number */}
                <div>
                  <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="room_number"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 101"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    id="parent_phone"
                    name="parent_phone"
                    value={formData.parent_phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9876543210"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9876543210"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </button>
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(profile)
                      setErrors({})
                      setTouched({})
                      setSubmitted(false)
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
