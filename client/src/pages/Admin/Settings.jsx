import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNotification } from '../../hooks/useNotification'
import API from '../../api/axios'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Settings() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { addNotification } = useNotification()
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data) => {
    try {
      await API.put('/settings', data)
      addNotification('Settings updated successfully', 'success')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch { addNotification('Failed to update settings', 'error') }
  }

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <PageHeader title="System Settings" subtitle="Configure system-wide settings" />

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 animate-fade-in">
            Settings updated successfully
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="College Name">
              <input {...register('college_name')} className="input-field" placeholder="e.g., Visvesvaraya Technological University" />
            </Field>
            <Field label="College Address">
              <textarea {...register('college_address')} rows={3} className="input-field resize-none" placeholder="Enter college address..." />
            </Field>
            <Field label="Contact Email">
              <input type="email" {...register('contact_email')} className="input-field" placeholder="admin@college.edu" />
            </Field>
            <Field label="Contact Phone">
              <input {...register('contact_phone')} className="input-field" placeholder="e.g., +91 9876543210" />
            </Field>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary py-2.5 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  )
}

export default Settings
