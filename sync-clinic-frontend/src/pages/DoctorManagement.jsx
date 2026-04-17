import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, updateDoctorStatus } from '../api/doctorApi'

const DOCTOR_STATUS = ['PENDING', 'VERIFIED', 'REJECTED']

export default function DoctorManagement() {
  const navigate = useNavigate()
  const userRole = localStorage.getItem('user_role')
  const userEmail = localStorage.getItem('user_email') || ''
  const isAdmin = userRole === 'ROLE_ADMIN'
  const [doctors, setDoctors] = useState([])
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })
  const [loading, setLoading] = useState(false)

  const visibleDoctors = useMemo(() => {
    if (isAdmin) {
      return doctors
    }

    return doctors.filter((doctor) => doctor.email === userEmail)
  }, [doctors, isAdmin, userEmail])

  const loadDoctors = async () => {
    setLoading(true)
    setStatusMessage({ text: '', isError: false })
    try {
      const data = await getDoctors()
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load doctor records',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  const handleStatusUpdate = async (doctor, status) => {
    if (!isAdmin) {
      setStatusMessage({ text: 'Only admins can verify or reject doctors.', isError: true })
      return
    }

    try {
      await updateDoctorStatus(doctor.id, status, doctor)
      setStatusMessage({ text: `${doctor.fullName || doctor.email} marked ${status}`, isError: false })
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor status update failed',
        isError: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Doctor Workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Doctor Management</h1>
            <p className="mt-1 text-sm text-slate-300">
              {isAdmin ? 'Review and manage doctor records.' : 'View the doctor record linked to your login.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(isAdmin ? '/adminDashboard' : '/doctorDashboard')}
              className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
            >
              Back to Dashboard
            </button>
            {!isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/doctor/profile')}
                className="rounded-lg border border-emerald-500/50 bg-emerald-900/30 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-800/40"
              >
                Manage My Profile
              </button>
            )}
          </div>
        </div>

        {statusMessage.text && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              statusMessage.isError
                ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-300">{isAdmin ? 'All Doctors' : 'My Doctor Record'}</h2>
              <p className="mt-1 text-sm text-slate-300">
                {loading ? 'Loading records...' : `${visibleDoctors.length} record${visibleDoctors.length === 1 ? '' : 's'} shown`}
              </p>
            </div>
            <button
              type="button"
              onClick={loadDoctors}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {visibleDoctors.length === 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                {isAdmin ? 'No doctor records found.' : 'No doctor profile is linked to your email yet.'}
              </div>
            ) : (
              visibleDoctors.map((doctor) => (
                <article key={doctor.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-100">{doctor.fullName || doctor.email}</h3>
                      <p className="text-sm text-cyan-300">{doctor.specialty || 'No specialty set'}</p>
                      <p className="text-sm text-slate-300">{doctor.hospital || 'No hospital set'}</p>
                      <p className="mt-1 text-xs text-slate-400">{doctor.email}</p>
                    </div>
                    <div className="text-sm lg:text-right">
                      <p className="font-semibold text-emerald-300">{doctor.status || 'PENDING'}</p>
                      <p className="text-slate-400">{doctor.experienceYears ?? 0} years experience</p>
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {DOCTOR_STATUS.map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => handleStatusUpdate(doctor, status)}
                          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                        >
                          Mark {status}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
