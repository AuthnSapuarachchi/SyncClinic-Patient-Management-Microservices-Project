import { useMemo, useState } from 'react'
import {
  cancelAppointment,
  createAppointment,
  getAppointmentStatusHistory,
  getAppointmentsByDoctor,
  getAppointmentsByDoctorAndStatus,
  getAppointmentsByPatient,
  getAppointmentsByPatientAndStatus,
  rescheduleAppointment,
  updateAppointmentStatus,
} from '../api/appointmentApi'

const APPOINTMENT_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']

export default function AppointmentBooking() {
  const [searchMode, setSearchMode] = useState('patient')
  const [patientId, setPatientId] = useState('')
  const [doctorSearchId, setDoctorSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [appointments, setAppointments] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  })

  const [rescheduleById, setRescheduleById] = useState({})

  const hasPatientId = useMemo(() => Number(patientId) > 0, [patientId])
  const hasDoctorSearchId = useMemo(() => Number(doctorSearchId) > 0, [doctorSearchId])

  const loadAppointments = async () => {
    if (searchMode === 'patient' && !hasPatientId) {
      setStatusMessage({ text: 'Enter a valid Patient ID first', isError: true })
      return
    }

    if (searchMode === 'doctor' && !hasDoctorSearchId) {
      setStatusMessage({ text: 'Enter a valid Doctor ID first', isError: true })
      return
    }

    setLoading(true)
    setStatusMessage({ text: '', isError: false })
    try {
      const data = searchMode === 'doctor'
        ? statusFilter
          ? await getAppointmentsByDoctorAndStatus(doctorSearchId, statusFilter)
          : await getAppointmentsByDoctor(doctorSearchId)
        : statusFilter
          ? await getAppointmentsByPatientAndStatus(patientId, statusFilter)
          : await getAppointmentsByPatient(patientId)
      setAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load appointments',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (event) => {
    event.preventDefault()
    if (!hasPatientId) {
      setStatusMessage({ text: 'Enter a valid Patient ID before booking', isError: true })
      return
    }

    try {
      await createAppointment({
        patientId: Number(patientId),
        doctorId: Number(bookingForm.doctorId),
        appointmentDate: bookingForm.appointmentDate,
        appointmentTime: bookingForm.appointmentTime,
        reason: bookingForm.reason,
      })
      setStatusMessage({ text: 'Appointment created successfully', isError: false })
      setBookingForm({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
      })
      await loadAppointments()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Appointment booking failed',
        isError: true,
      })
    }
  }

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId)
      setStatusMessage({ text: `Appointment #${appointmentId} cancelled`, isError: false })
      await loadAppointments()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Cancel action failed',
        isError: true,
      })
    }
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      setStatusMessage({ text: `Appointment #${appointmentId} marked ${newStatus}`, isError: false })
      await loadAppointments()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Status update failed',
        isError: true,
      })
    }
  }

  const loadStatusHistory = async () => {
    setLoadingHistory(true)
    setStatusMessage({ text: '', isError: false })
    try {
      const data = await getAppointmentStatusHistory()
      setStatusHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load appointment status history',
        isError: true,
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleReschedule = async (appointmentId) => {
    const selected = rescheduleById[appointmentId]
    if (!selected?.appointmentDate || !selected?.appointmentTime) {
      setStatusMessage({ text: 'Select new date and time for reschedule', isError: true })
      return
    }

    try {
      await rescheduleAppointment(appointmentId, selected)
      setStatusMessage({ text: `Appointment #${appointmentId} rescheduled`, isError: false })
      await loadAppointments()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Reschedule action failed',
        isError: true,
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Scheduling Workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Appointment Booking</h1>
            <p className="mt-1 text-sm text-slate-300">Book, filter, reschedule, and cancel appointments.</p>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Logout
          </button>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
            <h2 className="text-xl font-bold text-cyan-300">Book New Appointment</h2>
            <form className="mt-4 space-y-4" onSubmit={handleBookAppointment}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  type="number"
                  placeholder="Patient ID"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  type="number"
                  placeholder="Doctor ID"
                  value={bookingForm.doctorId}
                  onChange={(event) => setBookingForm({ ...bookingForm, doctorId: event.target.value })}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  type="date"
                  value={bookingForm.appointmentDate}
                  onChange={(event) => setBookingForm({ ...bookingForm, appointmentDate: event.target.value })}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  type="time"
                  value={bookingForm.appointmentTime}
                  onChange={(event) => setBookingForm({ ...bookingForm, appointmentTime: event.target.value })}
                  required
                />
              </div>
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                rows="3"
                placeholder="Reason for appointment"
                value={bookingForm.reason}
                onChange={(event) => setBookingForm({ ...bookingForm, reason: event.target.value })}
                required
              />
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Book Appointment
              </button>
            </form>
          </section>

          <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">Search Controls</h2>
            <p className="mt-1 text-xs text-slate-300">Load appointments by patient or doctor, then filter by status.</p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-800 p-1" role="tablist" aria-label="Appointment search mode">
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === 'patient'}
                onClick={() => {
                  setSearchMode('patient')
                  setAppointments([])
                  setStatusMessage({ text: '', isError: false })
                }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${searchMode === 'patient' ? 'bg-cyan-700 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                Patient
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === 'doctor'}
                onClick={() => {
                  setSearchMode('doctor')
                  setAppointments([])
                  setStatusMessage({ text: '', isError: false })
                }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${searchMode === 'doctor' ? 'bg-cyan-700 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                Doctor
              </button>
            </div>
            {searchMode === 'doctor' ? (
              <input
                className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                type="number"
                placeholder="Doctor ID"
                value={doctorSearchId}
                onChange={(event) => setDoctorSearchId(event.target.value)}
              />
            ) : null}
            <select
              className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {APPOINTMENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadAppointments}
              className="mt-3 w-full rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600"
            >
              {loading ? 'Loading...' : 'Load Appointments'}
            </button>
            <button
              type="button"
              onClick={loadStatusHistory}
              className="mt-3 w-full rounded-xl border border-cyan-500/50 bg-cyan-900/30 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-800/40"
            >
              {loadingHistory ? 'Loading History...' : 'Load Status History'}
            </button>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h2 className="text-xl font-bold text-cyan-300">Appointment List</h2>
          <div className="mt-4 space-y-3">
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-400">No appointments loaded.</p>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-cyan-200">
                        Appointment #{appointment.id} - {appointment.status}
                      </p>
                      <p className="text-slate-300">
                        Doctor {appointment.doctorId} | Patient {appointment.patientId}
                      </p>
                      <p className="text-slate-400">
                        {appointment.appointmentDate} {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => handleStatusUpdate(appointment.id, status)}
                          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                        >
                          Mark {status}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleCancel(appointment.id)}
                        className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold hover:bg-rose-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReschedule(appointment.id)}
                        className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold hover:bg-cyan-600"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <input
                      type="date"
                      className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
                      value={rescheduleById[appointment.id]?.appointmentDate || ''}
                      onChange={(event) =>
                        setRescheduleById({
                          ...rescheduleById,
                          [appointment.id]: {
                            ...rescheduleById[appointment.id],
                            appointmentDate: event.target.value,
                            appointmentTime: rescheduleById[appointment.id]?.appointmentTime || appointment.appointmentTime,
                          },
                        })
                      }
                    />
                    <input
                      type="time"
                      className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
                      value={rescheduleById[appointment.id]?.appointmentTime || ''}
                      onChange={(event) =>
                        setRescheduleById({
                          ...rescheduleById,
                          [appointment.id]: {
                            ...rescheduleById[appointment.id],
                            appointmentDate: rescheduleById[appointment.id]?.appointmentDate || appointment.appointmentDate,
                            appointmentTime: event.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h2 className="text-xl font-bold text-cyan-300">Status Tracking</h2>
          <div className="mt-4 space-y-3">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No status history loaded.</p>
            ) : (
              statusHistory.map((history) => (
                <div key={history.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm">
                  <p className="font-semibold text-cyan-200">
                    Appointment #{history.appointment?.id || '-'}
                  </p>
                  <p className="text-slate-300">
                    {history.oldStatus || 'NEW'} to {history.newStatus || '-'}
                  </p>
                  <p className="text-slate-400">{history.changedAt || 'Time not available'}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
