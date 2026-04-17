import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDoctor, deleteDoctor, getDoctors, updateDoctor, updateDoctorStatus } from '../api/doctorApi'

const DOCTOR_STATUS = ['PENDING', 'VERIFIED', 'REJECTED']
const emptyDoctorForm = {
  fullName: '',
  email: '',
  phone: '',
  specialty: '',
  hospital: '',
  qualification: '',
  experienceYears: '',
  bio: '',
  status: 'PENDING',
}

export default function DoctorManagement() {
  const navigate = useNavigate()
  const userRole = localStorage.getItem('user_role')
  const isAdmin = userRole === 'ROLE_ADMIN'
  const [doctors, setDoctors] = useState([])
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingDoctorId, setEditingDoctorId] = useState('')
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm)

  const visibleDoctors = useMemo(() => {
    return isAdmin ? doctors : []
  }, [doctors, isAdmin])

  const formTitle = editingDoctorId ? 'Edit Doctor' : 'Add Doctor'

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

  const resetForm = () => {
    setEditingDoctorId('')
    setDoctorForm(emptyDoctorForm)
  }

  const handleFormChange = (event) => {
    setDoctorForm({ ...doctorForm, [event.target.name]: event.target.value })
  }

  const handleEditDoctor = (doctor) => {
    setEditingDoctorId(String(doctor.id))
    setDoctorForm({
      fullName: doctor.fullName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialty: doctor.specialty || '',
      hospital: doctor.hospital || '',
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears ?? '',
      bio: doctor.bio || '',
      status: doctor.status || 'PENDING',
    })
    setStatusMessage({ text: '', isError: false })
  }

  const handleDoctorSubmit = async (event) => {
    event.preventDefault()
    const experienceYears = Number(doctorForm.experienceYears)

    if (!doctorForm.fullName.trim() || !doctorForm.email.trim()) {
      setStatusMessage({ text: 'Doctor name and email are required.', isError: true })
      return
    }

    if (experienceYears < 0) {
      setStatusMessage({ text: 'Experience years cannot be negative.', isError: true })
      return
    }

    const payload = {
      ...doctorForm,
      fullName: doctorForm.fullName.trim(),
      email: doctorForm.email.trim(),
      phone: doctorForm.phone.trim(),
      specialty: doctorForm.specialty.trim(),
      hospital: doctorForm.hospital.trim(),
      qualification: doctorForm.qualification.trim(),
      bio: doctorForm.bio.trim(),
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
      status: doctorForm.status || 'PENDING',
    }

    setSaving(true)
    setStatusMessage({ text: '', isError: false })
    try {
      if (editingDoctorId) {
        await updateDoctor(editingDoctorId, payload)
        setStatusMessage({ text: 'Doctor updated successfully.', isError: false })
      } else {
        await createDoctor(payload)
        setStatusMessage({ text: 'Doctor added successfully.', isError: false })
      }
      resetForm()
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor save failed.',
        isError: true,
      })
    } finally {
      setSaving(false)
    }
  }

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

  const handleDeleteDoctor = async (doctor) => {
    const label = doctor.fullName || doctor.email || `Doctor #${doctor.id}`
    const confirmed = window.confirm(`Delete ${label}? This will also remove this doctor's availability and prescriptions.`)

    if (!confirmed) {
      return
    }

    try {
      await deleteDoctor(doctor.id)
      if (String(editingDoctorId) === String(doctor.id)) {
        resetForm()
      }
      setStatusMessage({ text: `${label} deleted successfully.`, isError: false })
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor delete failed.',
        isError: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Doctor Workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Doctor Management</h1>
            <p className="mt-1 text-sm text-slate-300">
              Review all doctor records and manage verification status.
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
          <div className="mb-6 rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-cyan-300">{formTitle}</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Create a doctor record or update existing doctor details.
                </p>
              </div>
              {editingDoctorId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleDoctorSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="fullName"
                  placeholder="Full name"
                  value={doctorForm.fullName}
                  onChange={handleFormChange}
                  required
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={doctorForm.email}
                  onChange={handleFormChange}
                  required
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="phone"
                  placeholder="Phone"
                  value={doctorForm.phone}
                  onChange={handleFormChange}
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="specialty"
                  placeholder="Specialty"
                  value={doctorForm.specialty}
                  onChange={handleFormChange}
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="hospital"
                  placeholder="Hospital"
                  value={doctorForm.hospital}
                  onChange={handleFormChange}
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="qualification"
                  placeholder="Qualification"
                  value={doctorForm.qualification}
                  onChange={handleFormChange}
                />
                <input
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="experienceYears"
                  placeholder="Experience years"
                  type="number"
                  min="0"
                  value={doctorForm.experienceYears}
                  onChange={handleFormChange}
                />
                <select
                  className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="status"
                  value={doctorForm.status}
                  onChange={handleFormChange}
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
                name="bio"
                rows="3"
                placeholder="Doctor bio"
                value={doctorForm.bio}
                onChange={handleFormChange}
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingDoctorId ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-300">All Doctors</h2>
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
                No doctor records found.
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditDoctor(doctor)}
                      className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-600"
                    >
                      Edit
                    </button>
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
                    <button
                      type="button"
                      onClick={() => handleDeleteDoctor(doctor)}
                      className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
