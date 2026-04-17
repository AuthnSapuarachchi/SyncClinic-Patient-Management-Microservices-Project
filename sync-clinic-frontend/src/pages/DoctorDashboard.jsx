import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoctorAvailability,
  createDoctor,
  createPrescription,
  getDoctorAvailability,
  getDoctors,
  updateDoctor,
} from '../api/doctorApi'

const DOCTOR_STATUS = ['PENDING', 'VERIFIED', 'REJECTED']
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [availabilityList, setAvailabilityList] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })

  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    hospital: '',
    qualification: '',
    experienceYears: '',
    bio: '',
    status: 'PENDING',
  })

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

  const loadDoctors = async () => {
    setLoadingDoctors(true)
    try {
      const data = await getDoctors()
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load doctors',
        isError: true,
      })
    } finally {
      setLoadingDoctors(false)
    }
  }

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

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    loadAvailability(selectedDoctorId)
  }, [selectedDoctorId])

  const handleCreateDoctor = async (event) => {
    event.preventDefault()
    setStatusMessage({ text: '', isError: false })

    try {
      const payload = {
        ...doctorForm,
        experienceYears: Number(doctorForm.experienceYears) || 0,
      }
      await createDoctor(payload)
      setDoctorForm({
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        hospital: '',
        qualification: '',
        experienceYears: '',
        bio: '',
        status: 'PENDING',
      })
      setStatusMessage({ text: 'Doctor profile created successfully', isError: false })
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor creation failed',
        isError: true,
      })
    }
  }

  const handleDoctorStatusUpdate = async (newStatus) => {
    if (!selectedDoctorId) {
      setStatusMessage({ text: 'Select a doctor first', isError: true })
      return
    }

    try {
      await updateDoctor(selectedDoctorId, { ...selectedDoctor, status: newStatus })
      setStatusMessage({ text: `Doctor status updated to ${newStatus}`, isError: false })
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor status update failed',
        isError: true,
      })
    }
  }

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault()
    if (!selectedDoctorId) {
      setStatusMessage({ text: 'Select a doctor before adding availability', isError: true })
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
      setStatusMessage({ text: 'Select a doctor before creating prescription', isError: true })
      return
    }

    try {
      await createPrescription(selectedDoctorId, {
        patientId: Number(prescriptionForm.patientId),
        appointmentId: Number(prescriptionForm.appointmentId),
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
            <p className="mt-1 text-sm text-slate-300">Manage doctor profile, availability calendar, and prescriptions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/appointments')}
              type="button"
              className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
            >
              Appointment Booking
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
            <h2 className="text-xl font-bold text-cyan-300">Create Doctor Profile</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateDoctor}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Full Name"
                  value={doctorForm.fullName}
                  onChange={(event) => setDoctorForm({ ...doctorForm, fullName: event.target.value })}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Email"
                  type="email"
                  value={doctorForm.email}
                  onChange={(event) => setDoctorForm({ ...doctorForm, email: event.target.value })}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Phone"
                  value={doctorForm.phone}
                  onChange={(event) => setDoctorForm({ ...doctorForm, phone: event.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Specialty"
                  value={doctorForm.specialty}
                  onChange={(event) => setDoctorForm({ ...doctorForm, specialty: event.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Hospital"
                  value={doctorForm.hospital}
                  onChange={(event) => setDoctorForm({ ...doctorForm, hospital: event.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Qualification"
                  value={doctorForm.qualification}
                  onChange={(event) => setDoctorForm({ ...doctorForm, qualification: event.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Experience Years"
                  type="number"
                  value={doctorForm.experienceYears}
                  onChange={(event) => setDoctorForm({ ...doctorForm, experienceYears: event.target.value })}
                />
                <select
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  value={doctorForm.status}
                  onChange={(event) => setDoctorForm({ ...doctorForm, status: event.target.value })}
                >
                  {DOCTOR_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                rows="3"
                placeholder="Doctor bio"
                value={doctorForm.bio}
                onChange={(event) => setDoctorForm({ ...doctorForm, bio: event.target.value })}
              />
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Save Doctor Profile
              </button>
            </form>
          </section>

          <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">Doctor List</h2>
            <p className="mt-1 text-xs text-slate-300">Select a doctor to manage schedule and prescriptions.</p>
            <select
              className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
              value={selectedDoctorId}
              onChange={(event) => setSelectedDoctorId(event.target.value)}
            >
              <option value="">Select doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} ({doctor.status})
                </option>
              ))}
            </select>

            {loadingDoctors ? <p className="mt-3 text-sm text-slate-300">Loading doctors...</p> : null}
            {selectedDoctor ? (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm">
                <p>
                  <span className="font-semibold text-cyan-200">{selectedDoctor.fullName}</span>
                </p>
                <p className="text-slate-300">{selectedDoctor.specialty || 'No specialty yet'}</p>
                <p className="mt-1 text-xs text-slate-400">Current status: {selectedDoctor.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOCTOR_STATUS.map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => handleDoctorStatusUpdate(status)}
                      className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-xl font-bold text-cyan-300">Availability Calendar</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={handleAvailabilitySubmit}>
              <select
                className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                value={availabilityForm.dayOfWeek}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: event.target.value })}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                value={availabilityForm.startTime}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, startTime: event.target.value })}
              />
              <input
                type="time"
                className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                value={availabilityForm.endTime}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, endTime: event.target.value })}
              />
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

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-xl font-bold text-cyan-300">Create Prescription</h2>
            <form className="mt-4 space-y-3" onSubmit={handlePrescriptionSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Patient ID"
                  type="number"
                  value={prescriptionForm.patientId}
                  onChange={(event) => setPrescriptionForm({ ...prescriptionForm, patientId: event.target.value })}
                  required
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  placeholder="Appointment ID"
                  type="number"
                  value={prescriptionForm.appointmentId}
                  onChange={(event) => setPrescriptionForm({ ...prescriptionForm, appointmentId: event.target.value })}
                  required
                />
              </div>
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                rows="2"
                placeholder="Diagnosis"
                value={prescriptionForm.diagnosis}
                onChange={(event) => setPrescriptionForm({ ...prescriptionForm, diagnosis: event.target.value })}
                required
              />
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                rows="2"
                placeholder="Medicines"
                value={prescriptionForm.medicines}
                onChange={(event) => setPrescriptionForm({ ...prescriptionForm, medicines: event.target.value })}
                required
              />
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                rows="2"
                placeholder="Notes"
                value={prescriptionForm.notes}
                onChange={(event) => setPrescriptionForm({ ...prescriptionForm, notes: event.target.value })}
              />
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
