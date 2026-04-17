import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDoctor, getDoctors, updateDoctor } from '../api/doctorApi'

const emptyProfile = {
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

export default function DoctorProfile() {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('user_email') || ''
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [formData, setFormData] = useState({ ...emptyProfile, email: userEmail })
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })
  const [loading, setLoading] = useState(false)

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId],
  )

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDoctors()
      const doctorList = Array.isArray(data) ? data : []
      const ownProfile = doctorList.find((doctor) => doctor.email === userEmail)
      setDoctors(ownProfile ? [ownProfile] : [])
      if (ownProfile) {
        setSelectedDoctorId(String(ownProfile.id))
      } else {
        setSelectedDoctorId('')
      }
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load doctor profiles',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }, [userEmail])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    if (!selectedDoctor) {
      setFormData((current) => ({
        ...emptyProfile,
        email: current.email || userEmail,
      }))
      return
    }

    setFormData({
      fullName: selectedDoctor.fullName || '',
      email: selectedDoctor.email || userEmail,
      phone: selectedDoctor.phone || '',
      specialty: selectedDoctor.specialty || '',
      hospital: selectedDoctor.hospital || '',
      qualification: selectedDoctor.qualification || '',
      experienceYears: selectedDoctor.experienceYears ?? '',
      bio: selectedDoctor.bio || '',
      status: selectedDoctor.status || 'PENDING',
    })
  }, [selectedDoctor, userEmail])

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleNewProfile = () => {
    if (doctors.length > 0) {
      setSelectedDoctorId(String(doctors[0].id))
      setStatusMessage({ text: 'Your existing profile is already linked to this email.', isError: false })
      return
    }

    setSelectedDoctorId('')
    setFormData({ ...emptyProfile, email: userEmail })
    setStatusMessage({ text: '', isError: false })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatusMessage({ text: '', isError: false })

    const payload = {
      ...formData,
      experienceYears: Number(formData.experienceYears) || 0,
      status: selectedDoctor?.status || formData.status || 'PENDING',
    }

    try {
      if (selectedDoctorId) {
        await updateDoctor(selectedDoctorId, payload)
        setStatusMessage({ text: 'Doctor profile updated successfully', isError: false })
      } else {
        await createDoctor(payload)
        setStatusMessage({ text: 'Doctor profile created successfully', isError: false })
      }
      await loadDoctors()
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Doctor profile save failed',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Doctor Workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Doctor Profile</h1>
            <p className="mt-1 text-sm text-slate-300">Create or update your professional details.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/doctorDashboard')}
              className="rounded-lg border border-cyan-500/50 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-800/40"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={handleNewProfile}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
            >
              {doctors.length > 0 ? 'Use Existing Profile' : 'Reset Form'}
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
          <aside className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">My Profile</h2>
            <p className="mt-1 text-xs text-slate-300">Only the profile linked to your login email is editable here.</p>
            {loading ? <p className="mt-3 text-sm text-slate-300">Loading...</p> : null}
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm">
              <p className="text-slate-300">Signed in as</p>
              <p className="font-semibold text-cyan-200">{userEmail || 'Unknown doctor'}</p>
              <p className="mt-3 text-slate-300">Profile record</p>
              <p className="font-semibold text-cyan-200">{doctors.length > 0 ? 'Found' : 'Not created yet'}</p>
              <p className="mt-3 text-slate-300">Profile status</p>
              <p className="font-semibold text-emerald-300">{formData.status || 'PENDING'}</p>
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
            <h2 className="text-xl font-bold text-cyan-300">{selectedDoctorId ? 'Update Profile' : 'Create Profile'}</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="specialty"
                  placeholder="Specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="hospital"
                  placeholder="Hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="qualification"
                  placeholder="Qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="experienceYears"
                  placeholder="Experience Years"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={handleChange}
                />
                <input
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-400"
                  value={`Status: ${formData.status || 'PENDING'}`}
                  readOnly
                />
              </div>
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                name="bio"
                rows="4"
                placeholder="Doctor bio"
                value={formData.bio}
                onChange={handleChange}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : selectedDoctorId ? 'Update Doctor Profile' : 'Create Doctor Profile'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
