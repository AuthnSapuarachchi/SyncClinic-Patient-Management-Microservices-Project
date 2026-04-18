import { useEffect, useMemo, useState } from 'react'
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
import api from '../api/axiosConfig'
import { getDoctors } from '../api/doctorApi'
import StatusToast from '../components/StatusToast'

const APPOINTMENT_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']

const STATUS_BADGE_CLASSES = {
  PENDING: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  APPROVED: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  REJECTED: 'border-rose-400/30 bg-rose-500/15 text-rose-200',
  CANCELLED: 'border-slate-400/30 bg-slate-500/15 text-slate-200',
  COMPLETED: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200',
  NEW: 'border-violet-400/30 bg-violet-500/15 text-violet-200',
}

const padTwoDigits = (value) => String(value).padStart(2, '0')

const formatAppointmentDateTime = (dateValue, timeValue) => {
  if (!dateValue && !timeValue) {
    return 'Time not available'
  }

  const timeParts = String(timeValue || '')
    .split(':')
    .map((part) => Number(part))
  const hasTime = timeParts.length >= 2 && timeParts.every((part) => Number.isFinite(part))
  const localDate = dateValue && hasTime
    ? new Date(`${dateValue}T${padTwoDigits(timeParts[0])}:${padTwoDigits(timeParts[1])}:00`)
    : null

  if (localDate && !Number.isNaN(localDate.getTime())) {
    return localDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return [dateValue, timeValue].filter(Boolean).join(' ')
}

const formatHistoryDateTime = (dateTimeValue) => {
  if (!dateTimeValue) {
    return 'Time not available'
  }

  const normalizedDateTime = String(dateTimeValue).includes('T') ? dateTimeValue : String(dateTimeValue).replace(' ', 'T')
  const timestampWithZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalizedDateTime)
    ? normalizedDateTime
    : `${normalizedDateTime}Z`
  const localDate = new Date(timestampWithZone)

  if (Number.isNaN(localDate.getTime())) {
    return dateTimeValue
  }

  return localDate.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

const StatusBadge = ({ status }) => {
  const displayStatus = status || 'NEW'
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_BADGE_CLASSES[displayStatus] || STATUS_BADGE_CLASSES.NEW}`}>
      {displayStatus}
    </span>
  )
}

const formatEmailName = (email) => {
  const emailPrefix = email?.split('@')[0]?.trim()
  if (!emailPrefix) {
    return ''
  }

  return emailPrefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatPersonName = (person) => {
  const profileName =
    [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim() || person?.fullName?.trim() || ''

  if (profileName && profileName.toLowerCase() !== 'pending pending') {
    return profileName
  }

  return formatEmailName(person?.email)
}

export default function AppointmentBooking() {
  const userRole = localStorage.getItem('user_role')
  const userEmail = localStorage.getItem('user_email') || ''
  const isDoctor = userRole === 'ROLE_DOCTOR'
  const canManageAppointmentStatus = isDoctor
  const [searchMode, setSearchMode] = useState(isDoctor ? 'doctor' : 'patient')
  const [patientId, setPatientId] = useState('')
  const [doctorSearchId, setDoctorSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patientsById, setPatientsById] = useState({})
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
  const doctorNamesById = useMemo(
    () =>
      doctors.reduce((namesById, doctor) => {
        if (doctor.id) {
          namesById[doctor.id] = formatPersonName(doctor)
        }
        return namesById
      }, {}),
    [doctors],
  )
  const patientNamesById = useMemo(
    () =>
      Object.values(patientsById).reduce((namesById, patient) => {
        if (patient?.id) {
          namesById[patient.id] = formatPersonName(patient)
        }
        return namesById
      }, {}),
    [patientsById],
  )

  const hydratePatientNames = async (appointmentList) => {
    const patientIds = [
      ...new Set(
        appointmentList
          .map((appointment) => appointment.patientId)
          .filter((id) => id && !patientsById[id]),
      ),
    ]

    if (patientIds.length === 0) {
      return
    }

    const patientEntries = await Promise.all(
      patientIds.map(async (id) => {
        try {
          const response = await api.get(`/api/patients/${id}`)
          return [id, response.data]
        } catch {
          return [id, null]
        }
      }),
    )

    setPatientsById((currentPatientsById) => {
      const nextPatientsById = { ...currentPatientsById }
      patientEntries.forEach(([id, patient]) => {
        if (patient) {
          nextPatientsById[id] = patient
        }
      })
      return nextPatientsById
    })
  }

  const loadAppointments = async ({
    nextSearchMode = searchMode,
    nextDoctorId = doctorSearchId,
    nextPatientId = patientId,
    nextStatusFilter = statusFilter,
    showSuccessMessage = false,
  } = {}) => {
    if (nextSearchMode === 'patient' && !(Number(nextPatientId) > 0)) {
      setStatusMessage({ text: 'Enter a valid Patient ID first', isError: true })
      return
    }

    if (nextSearchMode === 'doctor' && !(Number(nextDoctorId) > 0)) {
      setStatusMessage({ text: 'Enter a valid Doctor ID first', isError: true })
      return
    }

    setLoading(true)
    setStatusMessage({ text: '', isError: false })
    try {
      const data = nextSearchMode === 'doctor'
        ? nextStatusFilter
          ? await getAppointmentsByDoctorAndStatus(nextDoctorId, nextStatusFilter)
          : await getAppointmentsByDoctor(nextDoctorId)
        : nextStatusFilter
          ? await getAppointmentsByPatientAndStatus(nextPatientId, nextStatusFilter)
          : await getAppointmentsByPatient(nextPatientId)
      const appointmentList = Array.isArray(data) ? data : []
      setAppointments(appointmentList)
      await hydratePatientNames(appointmentList)
      if (showSuccessMessage) {
        setStatusMessage({ text: 'Appointments refreshed', isError: false })
      }
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load appointments',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStatusHistory = async ({ showSuccessMessage = false } = {}) => {
    setLoadingHistory(true)
    if (!showSuccessMessage) {
      setStatusMessage({ text: '', isError: false })
    }
    try {
      const data = await getAppointmentStatusHistory()
      setStatusHistory(Array.isArray(data) ? data : [])
      if (showSuccessMessage) {
        setStatusMessage({ text: 'Status history refreshed', isError: false })
      }
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load appointment status history',
        isError: true,
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  const refreshDoctorWorkspace = async ({ showSuccessMessage = true } = {}) => {
    await Promise.all([
      loadAppointments({ showSuccessMessage }),
      loadStatusHistory({ showSuccessMessage: false }),
    ])
  }

  useEffect(() => {
    const loadDirectoryData = async () => {
      try {
        const data = await getDoctors()
        const doctorList = Array.isArray(data) ? data : []
        setDoctors(doctorList)

        if (isDoctor) {
          setSearchMode('doctor')
          const ownProfile = doctorList.find((doctor) => doctor.email === userEmail)
          setDoctorSearchId(ownProfile?.id ? String(ownProfile.id) : '')
          if (!ownProfile) {
            setStatusMessage({ text: 'Create your doctor profile before loading doctor appointments.', isError: true })
          } else {
            await Promise.all([
              loadAppointments({
                nextSearchMode: 'doctor',
                nextDoctorId: ownProfile.id,
                nextStatusFilter: '',
              }),
              loadStatusHistory(),
            ])
          }
        }
      } catch (error) {
        if (isDoctor) {
          setStatusMessage({
            text: error?.response?.data?.message || 'Failed to resolve your doctor profile',
            isError: true,
          })
        }
      }

      try {
        const response = await api.get('/api/patients/all')
        const data = response.data
        const patientList = Array.isArray(data) ? data : []
        setPatientsById(
          patientList.reduce((patientsByIdMap, patient) => {
            if (patient.id) {
              patientsByIdMap[patient.id] = patient
            }
            return patientsByIdMap
          }, {}),
        )
      } catch {
        // Patient names can still be hydrated per appointment below if the directory is unavailable.
      }
    }

    loadDirectoryData()
  }, [isDoctor, userEmail])

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

        <StatusToast
          message={statusMessage.text}
          isError={statusMessage.isError}
          onClose={() => setStatusMessage({ text: '', isError: false })}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {isDoctor ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
              <h2 className="text-xl font-bold text-cyan-300">My Appointment Workspace</h2>
              <p className="mt-2 text-sm text-slate-300">
                Doctor accounts load appointments only for the doctor profile linked to the signed-in email.
              </p>
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm">
                <p className="text-cyan-200">Signed in as</p>
                <p className="font-semibold text-white">{userEmail || 'Unknown doctor'}</p>
                <p className="mt-3 text-cyan-200">Resolved Doctor ID</p>
                <p className="font-semibold text-white">{doctorSearchId || 'Create profile first'}</p>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
              <h2 className="text-xl font-bold text-cyan-300">Book New Appointment</h2>
              <form className="mt-4 space-y-4" onSubmit={handleBookAppointment}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Patient ID
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={patientId}
                      onChange={(event) => setPatientId(event.target.value)}
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-200">
                    Doctor ID
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      type="number"
                      min="1"
                      placeholder="101"
                      value={bookingForm.doctorId}
                      onChange={(event) => setBookingForm({ ...bookingForm, doctorId: event.target.value })}
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-200">
                    Appointment Date
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      type="date"
                      value={bookingForm.appointmentDate}
                      onChange={(event) => setBookingForm({ ...bookingForm, appointmentDate: event.target.value })}
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-200">
                    Appointment Time
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      type="time"
                      value={bookingForm.appointmentTime}
                      onChange={(event) => setBookingForm({ ...bookingForm, appointmentTime: event.target.value })}
                      required
                    />
                  </label>
                </div>
                <label className="block text-sm font-semibold text-slate-200">
                  Reason for Appointment
                  <textarea
                    className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                    rows="3"
                    placeholder="Briefly describe the reason"
                    value={bookingForm.reason}
                    onChange={(event) => setBookingForm({ ...bookingForm, reason: event.target.value })}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  Book Appointment
                </button>
              </form>
            </section>
          )}

          <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            {isDoctor ? (
              <>
                <h2 className="text-lg font-bold text-cyan-300">Filter Appointments</h2>
                <p className="mt-1 text-xs text-slate-300">
                  Your doctor profile is already selected. Filter your schedule by appointment status.
                </p>
                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-xs text-cyan-100">
                  Showing appointments for {doctorNamesById[doctorSearchId] || userEmail || 'your account'}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('')
                      loadAppointments({ nextStatusFilter: '' })
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === '' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    All
                  </button>
                  {APPOINTMENT_STATUS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status)
                        loadAppointments({ nextStatusFilter: status })
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${statusFilter === status ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => refreshDoctorWorkspace()}
                  className="mt-4 w-full rounded-xl bg-linear-to-r from-cyan-700 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:from-cyan-600 hover:to-teal-600"
                >
                  {loading || loadingHistory ? 'Refreshing...' : 'Refresh Appointments and Tracking'}
                </button>
                <button
                  type="button"
                  onClick={() => loadStatusHistory({ showSuccessMessage: true })}
                  className="mt-3 w-full rounded-xl border border-cyan-500/50 bg-cyan-900/30 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-800/40"
                >
                  {loadingHistory ? 'Loading History...' : 'Load Status History'}
                </button>
              </>
            ) : (
              <>
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
                  <label className="mt-3 block text-sm font-semibold text-slate-200">
                    Doctor ID
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      type="number"
                      placeholder="Doctor ID"
                      value={doctorSearchId}
                      onChange={(event) => setDoctorSearchId(event.target.value)}
                    />
                  </label>
                ) : null}
                <label className="mt-3 block text-sm font-semibold text-slate-200">
                  Status Filter
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
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
                </label>
                <button
                  type="button"
                  onClick={loadAppointments}
                  className="mt-3 w-full rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600"
                >
                  {loading ? 'Loading...' : 'Load Appointments'}
                </button>
              </>
            )}
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
                        Doctor: {doctorNamesById[appointment.doctorId] || `ID ${appointment.doctorId}`} | Patient:{' '}
                        {patientNamesById[appointment.patientId] ||
                          formatPersonName(patientsById[appointment.patientId]) ||
                          `ID ${appointment.patientId}`}
                      </p>
                      <p className="text-slate-400">
                        {formatAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canManageAppointmentStatus
                        ? ['APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                            <button
                              type="button"
                              key={status}
                              onClick={() => handleStatusUpdate(appointment.id, status)}
                              className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                            >
                              Mark {status}
                            </button>
                          ))
                        : null}
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

        {isDoctor ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-cyan-300">Status Tracking</h2>
                <p className="mt-1 text-sm text-slate-300">Recent appointment status changes for your schedule.</p>
              </div>
              <button
                type="button"
                onClick={() => loadStatusHistory({ showSuccessMessage: true })}
                className="rounded-xl border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-800/40"
              >
                {loadingHistory ? 'Refreshing...' : 'Refresh Tracking'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {statusHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No status history loaded.</p>
              ) : (
                statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-cyan-200">
                          Appointment #{history.appointment?.id || '-'}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Updated</p>
                        <p className="text-slate-300">{formatHistoryDateTime(history.changedAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div>
                          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">From</p>
                          <StatusBadge status={history.oldStatus || 'NEW'} />
                        </div>
                        <span className="mt-5 hidden text-slate-500 sm:inline">→</span>
                        <div>
                          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">To</p>
                          <StatusBadge status={history.newStatus || '-'} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
