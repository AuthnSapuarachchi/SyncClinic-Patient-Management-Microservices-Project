import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDoctorById } from '../api/doctorApi'

const displayValue = (value, fallback = 'Not provided') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return value
}

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{label}</p>
    <p className="mt-2 text-base font-semibold text-slate-100">{displayValue(value)}</p>
  </div>
)

export default function DoctorProfileView() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDoctor = async () => {
      if (!doctorId) {
        setError('Doctor profile was not found.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const data = await getDoctorById(doctorId)
        setDoctor(data)
      } catch (loadError) {
        console.error('Failed to load doctor profile', loadError)
        setError('Failed to load doctor profile. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctor()
  }, [doctorId])

  const statusLabel = doctor?.status || 'PENDING'
  const isVerified = statusLabel === 'VERIFIED'

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Back to doctors
        </button>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-sm text-cyan-200">
            Loading doctor profile...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!isLoading && !error && doctor && (
          <>
            <section className="mt-6 overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-900/80 shadow-2xl shadow-cyan-950/40">
              <div className="bg-linear-to-r from-cyan-500/20 via-teal-500/10 to-slate-900 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">Doctor Profile</p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                      {displayValue(doctor.fullName, 'Doctor')}
                    </h1>
                    <p className="mt-2 text-lg font-semibold text-cyan-200">{displayValue(doctor.specialty)}</p>
                    <p className="mt-1 text-sm text-slate-300">{displayValue(doctor.hospital)}</p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
                      isVerified
                        ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30'
                        : 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30'
                    }`}
                  >
                    {isVerified ? 'Verified Doctor' : statusLabel}
                  </span>
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-200">
                  {displayValue(doctor.bio, 'This doctor has not added a biography yet.')}
                </p>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailCard label="Qualification" value={doctor.qualification} />
              <DetailCard label="Experience" value={`${Number(doctor.experienceYears) || 0} years`} />
              <DetailCard label="Specialty" value={doctor.specialty} />
              <DetailCard label="Hospital" value={doctor.hospital} />
              <DetailCard label="Email" value={doctor.email} />
              <DetailCard label="Phone" value={doctor.phone} />
            </section>

          </>
        )}
      </main>
    </div>
  )
}
