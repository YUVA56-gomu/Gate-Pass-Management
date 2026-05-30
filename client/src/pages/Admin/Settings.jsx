import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { useNotification } from '../../hooks/useNotification'
import API from '../../api/axios'

function Settings() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await API.put('/settings', data)
      addNotification('Settings updated successfully', 'success')
    } catch (error) {
      addNotification('Failed to update settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow max-w-2xl">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">College Name</label>
              <input
                {...register('college_name')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">College Address</label>
              <textarea
                {...register('college_address')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                {...register('contact_email')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                {...register('contact_phone')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default Settings
