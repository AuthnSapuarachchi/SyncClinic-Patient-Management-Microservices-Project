import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDoctor, getDoctors, updateDoctor } from '../api/doctorApi'
import DoctorNavigation from '../components/DoctorNavigation'
import StatusToast from '../components/StatusToast'

const emptyProfile = {
  fullName: '',
  email: '',
  phone: '',
  specialty: '',
  hospital: '',
  qualification: '',
  experienceYears: '',
  bio: '',
  profileImageUrl: '',
  status: 'PENDING',
}

const getInitials = (nameOrEmail) => {
  const parts = String(nameOrEmail || '')
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'DR'
}

export default function DoctorProfile() {
  const navigate = useNavigate()
  const userEmail = (localStorage.getItem('user_email') || '').trim().toLowerCase()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [formData, setFormData] = useState({ ...emptyProfile, email: userEmail })
  const [selectedImageFile, setSelectedImageFile] = useState(null)
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
      const ownProfile = doctorList.find((doctor) => doctor.email?.trim().toLowerCase() === userEmail)
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
      profileImageUrl: selectedDoctor.profileImageUrl || '',
      status: selectedDoctor.status || 'PENDING',
    })
  }, [selectedDoctor, userEmail])

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedImageFile(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ text: 'Please choose an image file.', isError: true })
      return
    }

    if (file.size > 1024 * 1024) {
      setStatusMessage({ text: 'Choose an image smaller than 1 MB.', isError: true })
      return
    }

    setSelectedImageFile(file)
    setStatusMessage({ text: `${file.name} selected. Click Upload Image to preview it.`, isError: false })
  }

  const handleImageUpload = () => {
    if (!selectedImageFile) {
      setStatusMessage({ text: 'Choose an image before uploading.', isError: true })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((current) => ({ ...current, profileImageUrl: reader.result || '' }))
      setStatusMessage({ text: 'Profile image uploaded. Save the profile to keep it.', isError: false })
    }
    reader.onerror = () => {
      setStatusMessage({ text: 'Could not read the selected image.', isError: true })
    }
    reader.readAsDataURL(selectedImageFile)
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
      email: userEmail,
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

        <DoctorNavigation />

        <StatusToast
          message={statusMessage.text}
          isError={statusMessage.isError}
          onClose={() => setStatusMessage({ text: '', isError: false })}
        />

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
              <div className="mt-4 flex items-center gap-3 border-t border-slate-700 pt-4">
                {formData.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl}
                    alt="Doctor profile"
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-cyan-300/30"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-500/15 text-lg font-black text-cyan-100 ring-1 ring-cyan-300/30">
                    {getInitials(formData.fullName || userEmail)}
                  </div>
                )}
                <div>
                  <p className="text-slate-300">Profile image</p>
                  <p className="text-xs text-slate-400">{formData.profileImageUrl ? 'Ready to save' : 'Not added yet'}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
            <h2 className="text-xl font-bold text-cyan-300">{selectedDoctorId ? 'Update Profile' : 'Create Profile'}</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {formData.profileImageUrl ? (
                    <img
                      src={formData.profileImageUrl}
                      alt="Doctor profile preview"
                      className="h-24 w-24 rounded-lg object-cover ring-1 ring-cyan-300/30"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-cyan-500/15 text-2xl font-black text-cyan-100 ring-1 ring-cyan-300/30">
                      {getInitials(formData.fullName || userEmail)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-200">
                      Profile Image
                      <input
                        id="doctor-profile-image"
                        className="sr-only"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <label
                          htmlFor="doctor-profile-image"
                          className="cursor-pointer rounded-lg border border-cyan-400/60 bg-cyan-900/40 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-800/50"
                        >
                          Choose File
                        </label>
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={!selectedImageFile}
                          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Upload Image
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {selectedImageFile ? `Selected: ${selectedImageFile.name}` : 'Use a JPG or PNG under 1 MB.'}
                    </p>
                    {formData.profileImageUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageFile(null)
                          setFormData((current) => ({ ...current, profileImageUrl: '' }))
                        }}
                        className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/20"
                      >
                        Remove Image
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['fullName', 'Full Name', 'text', 'Dr. Asha Perera'],
                  ['email', 'Email', 'email', 'doctor@syncclinic.com'],
                  ['phone', 'Phone', 'text', '+94...'],
                  ['specialty', 'Specialty', 'text', 'Cardiologist'],
                  ['hospital', 'Hospital', 'text', 'SyncClinic General'],
                  ['qualification', 'Qualification', 'text', 'MBBS, MD'],
                  ['experienceYears', 'Experience Years', 'number', '8'],
                ].map(([name, label, type, placeholder]) => (
                  <label key={name} className="text-sm font-semibold text-slate-200">
                    {label}
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                      name={name}
                      placeholder={placeholder}
                      type={type}
                      min={type === 'number' ? '0' : undefined}
                      value={formData[name]}
                      onChange={handleChange}
                      readOnly={name === 'email'}
                      title={name === 'email' ? 'Doctor profile email is linked to your login email.' : undefined}
                      required={name === 'fullName' || name === 'email'}
                    />
                  </label>
                ))}
                <label className="text-sm font-semibold text-slate-200">
                  Status
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-slate-400"
                    value={formData.status || 'PENDING'}
                    readOnly
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-200">
                Doctor Bio
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5"
                  name="bio"
                  rows="4"
                  placeholder="Short professional summary"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </label>
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
