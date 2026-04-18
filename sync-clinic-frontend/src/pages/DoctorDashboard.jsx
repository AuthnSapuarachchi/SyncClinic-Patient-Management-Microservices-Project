import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointmentsByDoctor } from '../api/appointmentApi'
import {
  addDoctorAvailability,
  createPrescription,
  getDoctorAvailability,
  getDoctors,
} from '../api/doctorApi'
import api from '../api/axiosConfig'
import StatusToast from '../components/StatusToast'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const APPOINTMENT_STATUSES_TO_HIDE = ['CANCELLED', 'REJECTED', 'COMPLETED']

const padTwoDigits = (value) => String(value).padStart(2, '0')

const getAppointmentDateTime = (appointment) => {
  const [hours = 0, minutes = 0] = String(appointment?.appointmentTime || '00:00')
    .split(':')
    .map((part) => Number(part))

  const dateTime = appointment?.appointmentDate
    ? new Date(`${appointment.appointmentDate}T${padTwoDigits(hours)}:${padTwoDigits(minutes)}:00`)
    : null

  return dateTime && !Number.isNaN(dateTime.getTime()) ? dateTime : null
}

const formatAppointmentDateTime = (appointment) => {
  const dateTime = getAppointmentDateTime(appointment)

  if (!dateTime) {
    return 'Time not available'
  }

  return dateTime.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('user_email') || ''
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [appointments, setAppointments] = useState([])
  const [availabilityList, setAvailabilityList] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })
  const [videoRequests, setVideoRequests] = useState([])

  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
  })

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    medicines: '',
    notes: '',
  })

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId],
  )
  const nextAppointment = useMemo(() => {
    const now = new Date()
    return appointments
      .filter((appointment) => !APPOINTMENT_STATUSES_TO_HIDE.includes(appointment.status))
      .map((appointment) => ({ appointment, dateTime: getAppointmentDateTime(appointment) }))
      .filter(({ dateTime }) => dateTime && dateTime >= now)
      .sort((first, second) => first.dateTime - second.dateTime)[0]?.appointment || null
  }, [appointments])

  const loadDoctors = useCallback(async () => {
    setLoadingDoctors(true)
    try {
      const data = await getDoctors()
      const doctorList = Array.isArray(data) ? data : []
      const ownProfile = doctorList.find((doctor) => doctor.email === userEmail)
      setDoctors(doctorList)
      setSelectedDoctorId(ownProfile?.id ? String(ownProfile.id) : '')
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load doctors',
        isError: true,
      })
    } finally {
      setLoadingDoctors(false)
    }
  }, [userEmail])

  const loadAvailability = async (doctorId) => {
    if (!doctorId) {
      setAvailabilityList([])
      return
    }
    try {
      const data = await getDoctorAvailability(doctorId)
      setAvailabilityList(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load availability',
        isError: true,
      })
    }
  }

  const loadAppointments = async (doctorId = selectedDoctorId, showSuccessMessage = false) => {
    if (!doctorId) {
      setAppointments([])
      return
    }

    setLoadingAppointments(true)
    try {
      const data = await getAppointmentsByDoctor(doctorId)
      setAppointments(Array.isArray(data) ? data : [])
      if (showSuccessMessage) {
        setStatusMessage({ text: 'Appointments refreshed', isError: false })
      }
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load appointments',
        isError: true,
      })
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadVideoRequests = async (doctorId) => {
    if (!doctorId) return
    try {
      const { data } = await api.get(`/telemedicine-service/api/sessions/doctor/${doctorId}/requests`)
      const requests = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      const normalizedRequests = requests.map((request) => ({
        ...request,
        id: request?.id || request?.sessionId,
      }))
      setVideoRequests(normalizedRequests)
    } catch (error) {
      console.error('Failed to load video requests:', error)
      setVideoRequests([])
    }
  }

  const handleVideoAction = async (sessionId, action) => {
    try {
      if (action === 'accept') {
        const { data } = await api.put(`/telemedicine-service/api/sessions/${sessionId}/accept`)
        const joinUrl = data?.data?.joinUrl || data?.joinUrl
        if (joinUrl) {
          window.open(joinUrl, '_blank', 'noopener,noreferrer')
        }
      } else {
        await api.put(`/telemedicine-service/api/sessions/${sessionId}/reject`)
      }
      setStatusMessage({ text: `Session ${action}ed successfully`, isError: false })
      loadVideoRequests(selectedDoctorId)
    } catch (error) {
      setStatusMessage({ text: `Failed to ${action} session`, isError: true })
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    loadAvailability(selectedDoctorId)
    loadAppointments(selectedDoctorId)
    loadVideoRequests(selectedDoctorId)
  }, [selectedDoctorId])

  useEffect(() => {
    if (!selectedDoctorId) {
      return undefined
    }

    const intervalId = setInterval(() => {
      loadVideoRequests(selectedDoctorId)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [selectedDoctorId])

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault()
    if (!selectedDoctorId) {
      setStatusMessage({ text: 'Create your doctor profile before adding availability', isError: true })
      return
    }

    try {
      await addDoctorAvailability(selectedDoctorId, availabilityForm)
      setStatusMessage({ text: 'Availability slot added', isError: false })
      await loadAvailability(selectedDoctorId)
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to add availability',
        isError: true,
      })
    }
  }

  const handlePrescriptionSubmit = async (event) => {
    event.preventDefault()
    if (!selectedDoctorId) {
      setStatusMessage({ text: 'Create your doctor profile before creating prescriptions', isError: true })
      return
    }

    const patientId = Number(prescriptionForm.patientId)
    const appointmentId = Number(prescriptionForm.appointmentId)

    if (patientId <= 0 || appointmentId <= 0) {
      setStatusMessage({ text: 'Enter valid patient and appointment IDs before saving', isError: true })
      return
    }

    try {
      await createPrescription(selectedDoctorId, {
        patientId,
        appointmentId,
        diagnosis: prescriptionForm.diagnosis,
        medicines: prescriptionForm.medicines,
        notes: prescriptionForm.notes,
      })
      setPrescriptionForm({
        patientId: '',
        appointmentId: '',
        diagnosis: '',
        medicines: '',
        notes: '',
      })
      setStatusMessage({ text: 'Prescription created successfully', isError: false })
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to create prescription',
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
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Doctor Workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Doctor Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">Manage schedules, appointments, and prescriptions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/doctor/profile')}
              type="button"
              className="rounded-lg border border-emerald-500/50 bg-emerald-900/30 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-800/40"
            >
              Manage Profile
            </button>
            <button
              onClick={() => navigate('/appointments')}
              type="button"
              className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
            >
              Appointment Booking
            </button>
            <button
              onClick={() => navigate('/doctor/prescriptions')}
              type="button"
              className="rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
            >
              My Prescriptions
            </button>
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </div>

        <StatusToast
          message={statusMessage.text}
          isError={statusMessage.isError}
          onClose={() => setStatusMessage({ text: '', isError: false })}
        />

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-200">Profile Status</p>
            <p className="mt-1 text-2xl font-bold">{selectedDoctor?.status || 'Missing'}</p>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200">My Profile</p>
            <p className="mt-1 text-lg font-bold">{selectedDoctor?.fullName || 'Not created'}</p>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-200">Availability Slots</p>
            <p className="mt-1 text-2xl font-bold">{availabilityList.length}</p>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-sky-200">Appointments</p>
            <p className="mt-1 text-2xl font-bold">{appointments.length}</p>
          </div>
        </div>

        <section className="mb-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-linear-to-r from-cyan-500/15 via-slate-900/80 to-teal-500/15 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Nearest Appointment</p>
              {loadingAppointments ? (
                <p className="mt-2 text-sm text-slate-300">Checking your upcoming schedule...</p>
              ) : nextAppointment ? (
                <>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">
                    Appointment #{nextAppointment.id}
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-cyan-100">
                    {formatAppointmentDateTime(nextAppointment)}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Patient #{nextAppointment.patientId} • {nextAppointment.status || 'PENDING'}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    {nextAppointment.reason || 'No appointment reason provided.'}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">No upcoming appointments</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    You are clear from today onward. Refresh anytime to check for newly booked appointments.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadAppointments(selectedDoctorId, true)}
                className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                {loadingAppointments ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="rounded-xl border border-cyan-500/50 bg-cyan-900/30 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
              >
                Open Appointment Workspace
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">My Doctor Profile</h2>
            <p className="mt-1 text-xs text-slate-300">Dashboard actions are tied to your registered doctor profile.</p>

            {loadingDoctors ? <p className="mt-3 text-sm text-slate-300">Loading doctors...</p> : null}
            {selectedDoctor ? (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm">
                <p>
                  <span className="font-semibold text-cyan-200">{selectedDoctor.fullName}</span>
                </p>
                <p className="text-slate-300">{selectedDoctor.specialty || 'No specialty yet'}</p>
                <p className="mt-1 text-xs text-slate-400">Profile status: {selectedDoctor.status}</p>
                <button
                  type="button"
                  onClick={() => navigate('/doctor/profile')}
                  className="mt-3 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                >
                  Manage Profile
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                <p>No doctor profile is linked to {userEmail || 'this login'} yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/doctor/profile')}
                  className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Create Profile
                </button>
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
            <h2 className="text-xl font-bold text-cyan-300">Availability Calendar</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={handleAvailabilitySubmit}>
              <label className="text-sm font-semibold text-slate-200">
                Day
                <select
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  value={availabilityForm.dayOfWeek}
                  onChange={(event) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: event.target.value })}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-200">
                Start Time
                <input
                  type="time"
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  value={availabilityForm.startTime}
                  onChange={(event) => setAvailabilityForm({ ...availabilityForm, startTime: event.target.value })}
                />
              </label>
              <label className="text-sm font-semibold text-slate-200">
                End Time
                <input
                  type="time"
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  value={availabilityForm.endTime}
                  onChange={(event) => setAvailabilityForm({ ...availabilityForm, endTime: event.target.value })}
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white sm:col-span-3"
              >
                Add Availability Slot
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {availabilityList.length === 0 ? (
                <p className="text-sm text-slate-400">No availability slots for selected doctor.</p>
              ) : (
                availabilityList.map((slot) => (
                  <div key={slot.id} className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm">
                    <span className="font-semibold text-cyan-200">{slot.dayOfWeek}</span> {slot.startTime} - {slot.endTime}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-cyan-300">Pending Video Call Requests</h2>
            <button
              type="button"
              onClick={() => loadVideoRequests(selectedDoctorId)}
              className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
            >
              Refresh Requests
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {videoRequests.filter((req) => req.status === 'REQUESTED' || req.status === 'PENDING').length === 0 ? (
              <p className="text-sm text-slate-400">No pending video call requests.</p>
            ) : (
              videoRequests
                .filter((req) => req.status === 'REQUESTED' || req.status === 'PENDING')
                .map((req) => (
                  <div key={req.sessionId || req.id} className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">Patient: {req.patientName}</p>
                      <p className="text-sm text-slate-300">Time Requested: {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleVideoAction(req.sessionId || req.id, 'accept')}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleVideoAction(req.sessionId || req.id, 'reject')}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-xl font-bold text-cyan-300">Create Prescription</h2>
            <form className="mt-4 space-y-3" onSubmit={handlePrescriptionSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-200">
                  Patient ID
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                    placeholder="1"
                    type="number"
                    min="1"
                    value={prescriptionForm.patientId}
                    onChange={(event) => setPrescriptionForm({ ...prescriptionForm, patientId: event.target.value })}
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-slate-200">
                  Appointment ID
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                    placeholder="1001"
                    type="number"
                    min="1"
                    value={prescriptionForm.appointmentId}
                    onChange={(event) => setPrescriptionForm({ ...prescriptionForm, appointmentId: event.target.value })}
                    required
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-200">
                Diagnosis
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  rows="2"
                  placeholder="Brief diagnosis"
                  value={prescriptionForm.diagnosis}
                  onChange={(event) => setPrescriptionForm({ ...prescriptionForm, diagnosis: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                Medicines
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  rows="2"
                  placeholder="Medicine name, dose, frequency"
                  value={prescriptionForm.medicines}
                  onChange={(event) => setPrescriptionForm({ ...prescriptionForm, medicines: event.target.value })}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-200">
                Notes
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  rows="2"
                  placeholder="Optional follow-up notes"
                  value={prescriptionForm.notes}
                  onChange={(event) => setPrescriptionForm({ ...prescriptionForm, notes: event.target.value })}
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Save Prescription
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
