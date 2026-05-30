import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { userAPI } from '../../api/user.api'
import { useNotification } from '../../hooks/useNotification'

function Profile() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      const user = response.data
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone)
    } catch (error) {
      addNotification('Failed to fetch profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await userAPI.updateProfile(data)
      addNotification('Profile updated successfully', 'success')
    } catch (error) {
      addNotification('Failed to update profile', 'error')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow max-w-2xl">
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
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...register('phone')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Update Profile
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default Profile
