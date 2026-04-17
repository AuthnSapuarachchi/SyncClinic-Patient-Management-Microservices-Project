import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { getNotificationsByUser, getRecentNotifications } from '../api/notificationApi'

const formatDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('user_email') || ''

  const [patientId, setPatientId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [recentLimit, setRecentLimit] = useState(8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const statusClasses = useMemo(
    () => ({
      SENT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      FAILED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    }),
    [],
  )

  const loadNotifications = async (resolvedPatientId, selectedType = typeFilter, selectedLimit = recentLimit) => {
    setIsLoading(true)
    setError('')

    try {
      const [userResponse, recentResponse] = await Promise.all([
        getNotificationsByUser(resolvedPatientId, selectedType),
        getRecentNotifications(selectedLimit),
      ])

      const userItems = Array.isArray(userResponse?.data) ? userResponse.data : []
      const recentItems = Array.isArray(recentResponse?.data) ? recentResponse.data : []

      setNotifications(userItems)
      setRecentNotifications(recentItems)
    } catch (loadError) {
      console.error('Failed to load notifications', loadError)
      setError('Unable to load notification history right now. Please try again.')
      setNotifications([])
      setRecentNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializePage = async () => {
      if (!userEmail) {
        setError('User email is missing in session. Please log in again.')
        return
      }

      try {
        const profileResponse = await api.get(`/api/patients/profile/${encodeURIComponent(userEmail)}`)
        const resolvedId = profileResponse?.data?.id

        if (!resolvedId) {
          setError('Patient profile is incomplete. Please update your profile first.')
          return
        }

        setPatientId(resolvedId)
        await loadNotifications(resolvedId)
      } catch (profileError) {
        console.error('Failed to resolve patient id', profileError)
        setError('Unable to resolve your patient profile for notifications.')
      }
    }

    initializePage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  const handleApplyFilters = async () => {
    if (!patientId) {
      return
    }

    await loadNotifications(patientId, typeFilter, recentLimit)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Patient Notifications</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Notification Center</h1>
              <p className="mt-1 text-sm text-slate-300">Track email and SMS delivery for appointments and payments.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/patientDashboard')}
                className="rounded-lg border border-slate-500 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:from-cyan-700 hover:to-teal-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-300">Type</span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
              >
                <option value="ALL">All</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-slate-300">Recent Limit</span>
              <input
                type="number"
                min={1}
                max={50}
                value={recentLimit}
                onChange={(event) => setRecentLimit(Number(event.target.value || 8))}
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full rounded-xl bg-cyan-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {isLoading && <p className="mt-4 text-sm text-cyan-200">Loading notifications...</p>}
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-bold text-cyan-300">My Notification History</h2>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
                  No notification records found for the selected filter.
                </p>
              ) : (
                notifications.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-100">{item.eventType || 'UNKNOWN_EVENT'}</p>
                        <p className="mt-1 text-xs text-slate-300">{item.type || 'N/A'} • {formatDate(item.sentAt)}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClasses[item.status] || 'bg-slate-700/50 text-slate-200 border-slate-500'}`}>
                        {item.status || 'UNKNOWN'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{item.subject || '(No subject)'}</p>
                    {item.errorMessage && (
                      <p className="mt-2 rounded-md bg-rose-500/10 px-2 py-1 text-xs text-rose-300">Error: {item.errorMessage}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-bold text-cyan-300">Recent System Notifications</h2>
            <div className="mt-4 space-y-3">
              {recentNotifications.length === 0 ? (
                <p className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
                  No recent notifications available.
                </p>
              ) : (
                recentNotifications.map((item) => (
                  <article key={`recent-${item.id}`} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-100">{item.eventType || 'UNKNOWN_EVENT'}</p>
                        <p className="mt-1 text-xs text-slate-300">User #{item.userId || '-'} • {formatDate(item.sentAt)}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClasses[item.status] || 'bg-slate-700/50 text-slate-200 border-slate-500'}`}>
                        {item.status || 'UNKNOWN'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{item.subject || '(No subject)'}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
