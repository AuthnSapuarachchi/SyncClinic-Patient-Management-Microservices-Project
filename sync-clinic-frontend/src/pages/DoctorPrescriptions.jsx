import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, getPrescriptionsByDoctor } from '../api/doctorApi'
import api from '../api/axiosConfig'
import DoctorNavigation from '../components/DoctorNavigation'
import StatusToast from '../components/StatusToast'

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

export default function DoctorPrescriptions() {
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('user_email') || ''
  const [doctor, setDoctor] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [patientsById, setPatientsById] = useState({})
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false })

  const sortedPrescriptions = useMemo(
    () => [...prescriptions].sort((first, second) => Number(second.id || 0) - Number(first.id || 0)),
    [prescriptions],
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

  const hydratePatientNames = useCallback(
    async (prescriptionList) => {
      const patientIds = [
        ...new Set(
          prescriptionList
            .map((prescription) => prescription.patientId)
            .filter(Boolean),
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
    },
    [],
  )

  const loadPrescriptions = useCallback(async (doctorId, showSuccessMessage = false) => {
    if (!doctorId) {
      setPrescriptions([])
      return
    }

    setLoading(true)
    try {
      const data = await getPrescriptionsByDoctor(doctorId)
      const prescriptionList = Array.isArray(data) ? data : []
      setPrescriptions(prescriptionList)
      await hydratePatientNames(prescriptionList)
      if (showSuccessMessage) {
        setStatusMessage({ text: 'Prescriptions refreshed', isError: false })
      }
    } catch (error) {
      setStatusMessage({
        text: error?.response?.data?.message || 'Failed to load prescriptions',
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }, [hydratePatientNames])

  useEffect(() => {
    const loadDoctorProfile = async () => {
      setLoading(true)
      try {
        const data = await getDoctors()
        const doctorList = Array.isArray(data) ? data : []
        const ownProfile = doctorList.find((item) => item.email === userEmail)
        setDoctor(ownProfile || null)

        if (!ownProfile) {
          setStatusMessage({ text: 'Create your doctor profile before viewing prescriptions.', isError: true })
          setPrescriptions([])
          return
        }

        await loadPrescriptions(ownProfile.id)
      } catch (error) {
        setStatusMessage({
          text: error?.response?.data?.message || 'Failed to resolve your doctor profile',
          isError: true,
        })
      } finally {
        setLoading(false)
      }
    }

    loadDoctorProfile()
  }, [loadPrescriptions, userEmail])

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
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Digital Prescriptions</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">My Created Prescriptions</h1>
            <p className="mt-1 text-sm text-slate-300">
              Review prescriptions issued from your doctor profile.
            </p>
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
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </div>

        <DoctorNavigation />

        <StatusToast
          message={statusMessage.text}
          isError={statusMessage.isError}
          onClose={() => setStatusMessage({ text: '', isError: false })}
        />

        <section className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-200">Doctor</p>
              <p className="mt-1 text-xl font-bold">{doctor?.fullName || userEmail || 'Unknown doctor'}</p>
              <p className="text-sm text-slate-300">{doctor?.specialty || 'Specialty not set'}</p>
            </div>
            <button
              type="button"
              onClick={() => loadPrescriptions(doctor?.id, true)}
              disabled={!doctor?.id || loading}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Refreshing...' : 'Refresh Prescriptions'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-300">Prescription List</h2>
              <p className="text-sm text-slate-300">{sortedPrescriptions.length} prescription(s) created by you.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading && sortedPrescriptions.length === 0 ? (
              <p className="text-sm text-slate-400">Loading prescriptions...</p>
            ) : null}
            {!loading && sortedPrescriptions.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-300">
                No prescriptions created yet.
              </div>
            ) : null}
            {sortedPrescriptions.map((prescription) => (
              <article key={prescription.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-cyan-200">Prescription #{prescription.id}</p>
                    <p className="mt-1 text-slate-300">
                      {patientNamesById[prescription.patientId]
                        ? `${patientNamesById[prescription.patientId]} (Patient #${prescription.patientId})`
                        : `Patient #${prescription.patientId || '-'}`} • Appointment #{prescription.appointmentId || '-'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/appointments')}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                  >
                    Open Appointments
                  </button>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-lg bg-slate-800/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Diagnosis</p>
                    <p className="mt-1 text-slate-100">{prescription.diagnosis || '-'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Medicines</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-100">{prescription.medicines || '-'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-100">{prescription.notes || '-'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
