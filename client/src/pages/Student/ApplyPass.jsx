import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { passAPI } from '../../api/pass.api'
import { useNotification } from '../../hooks/useNotification'

function ApplyPass() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await passAPI.applyPass(data)
      addNotification('Pass applied successfully', 'success')
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to apply pass', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Apply for Pass</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow max-w-2xl">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pass Type</label>
              <select
                {...register('type', { required: 'Pass type is required' })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Type</option>
                <option value="daily">Daily Pass</option>
                <option value="long_leave">Long Leave Pass</option>
              </select>
              {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea
                {...register('reason', { required: 'Reason is required' })}
                className="w-full border rounded px-3 py-2"
              />
              {errors.reason && <span className="text-red-500 text-sm">{errors.reason.message}</span>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Destination</label>
              <input
                {...register('destination', { required: 'Destination is required' })}
                className="w-full border rounded px-3 py-2"
              />
              {errors.destination && <span className="text-red-500 text-sm">{errors.destination.message}</span>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">From Date</label>
              <input
                type="date"
                {...register('from_date', { required: 'From date is required' })}
                className="w-full border rounded px-3 py-2"
              />
              {errors.from_date && <span className="text-red-500 text-sm">{errors.from_date.message}</span>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                {...register('to_date', { required: 'To date is required' })}
                className="w-full border rounded px-3 py-2"
              />
              {errors.to_date && <span className="text-red-500 text-sm">{errors.to_date.message}</span>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Applying...' : 'Apply Pass'}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default ApplyPass
