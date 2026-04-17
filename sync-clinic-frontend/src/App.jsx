import './App.css'
import { jwtDecode } from 'jwt-decode'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthScreen from './pages/AuthScreen'
import DoctorRegister from './pages/DoctorRegister'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/PatientDashboard'
import PaymentInitiation from './pages/PaymentInitiation'
import PaymentCheckout from './pages/PaymentCheckout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import PaymentHistory from './pages/PaymentHistory'
import PatientMainDashboard from './pages/PatientMainDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorManagement from './pages/DoctorManagement'
import DoctorProfile from './pages/DoctorProfile'
import AppointmentBooking from './pages/AppointmentBooking'

const normalizeRole = (role) => {
  if (typeof role !== 'string' || !role.trim()) {
    return null
  }

  return role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`
}

const extractRoleFromToken = (decodedToken) => {
  if (decodedToken?.role) {
    return normalizeRole(decodedToken.role)
  }

  if (typeof decodedToken?.authorities === 'string') {
    return normalizeRole(decodedToken.authorities)
  }

  if (Array.isArray(decodedToken?.authorities) && decodedToken.authorities.length > 0) {
    const firstAuthority = decodedToken.authorities[0]
    if (typeof firstAuthority === 'string') {
      return normalizeRole(firstAuthority)
    }

    if (typeof firstAuthority === 'object' && firstAuthority?.authority) {
      return normalizeRole(firstAuthority.authority)
    }
  }

  if (typeof decodedToken?.roles === 'string') {
    return normalizeRole(decodedToken.roles)
  }

  if (Array.isArray(decodedToken?.roles) && decodedToken.roles.length > 0) {
    return normalizeRole(decodedToken.roles[0])
  }

  return null
}

const clearSession = () => {
  localStorage.removeItem('jwt_token')
  localStorage.removeItem('user_email')
  localStorage.removeItem('user_role')
}

function App() {
  let token = localStorage.getItem('jwt_token')
  const savedRole = localStorage.getItem('user_role')
  const hasSeenLanding = localStorage.getItem('has_seen_landing') === 'true'
  let userRole = null

  if (token) {
    try {
      const decodedToken = jwtDecode(token)

      if (decodedToken?.exp && Date.now() >= decodedToken.exp * 1000) {
        console.warn('Token expired. Clearing session.')
        clearSession()
        token = null
      } else {
        userRole = extractRoleFromToken(decodedToken)
      }

      if (token && !userRole) {
        if (savedRole) {
          userRole = normalizeRole(savedRole)
        } else {
          // Default to patient in this app when token is valid but role claim is absent.
          userRole = 'ROLE_PATIENT'
          localStorage.setItem('user_role', userRole)
        }
      }
    } catch (error) {
      console.error('Invalid token', error)
      clearSession()
      token = null
    }
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={hasSeenLanding ? <AuthScreen /> : <Navigate to="/" replace />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Navigate 
            to={
              userRole === 'ROLE_ADMIN' ? '/adminDashboard' : 
              userRole === 'ROLE_DOCTOR' ? '/doctorDashboard' : 
              '/patientDashboard'
            } 
            replace 
          />
        } 
      />
      <Route
        path="/patientDashboard"
        element={
          userRole === 'ROLE_PATIENT' ? <PatientMainDashboard /> : 
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Role Mismatch</h1>
            <p className="mt-2 text-slate-300">Your current role is: <code className="bg-slate-800 px-2 py-1 rounded">{userRole}</code></p>
            <p className="mt-2 text-slate-400">You do not have access to the Patient Dashboard.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/adminDashboard"
        element={
          userRole === 'ROLE_ADMIN' ? <AdminDashboard /> : 
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="mt-2 text-slate-300">You must be an Admin to view this page.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/doctorDashboard"
        element={
          userRole === 'ROLE_DOCTOR' ? <DoctorDashboard /> : 
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="mt-2 text-slate-300">You must be a Doctor to view this page.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          userRole === 'ROLE_DOCTOR' ? <DoctorProfile /> :
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="mt-2 text-slate-300">You must be a Doctor to manage this profile.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/doctor-management"
        element={
          userRole === 'ROLE_ADMIN' || userRole === 'ROLE_DOCTOR' ? <DoctorManagement /> :
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="mt-2 text-slate-300">You must be an Admin or Doctor to view this page.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/appointments"
        element={
          userRole === 'ROLE_DOCTOR' || userRole === 'ROLE_PATIENT' ? <AppointmentBooking /> :
          <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
            <p className="mt-2 text-slate-300">You must be a Doctor or Patient to view appointments.</p>
            <button onClick={() => { clearSession(); window.location.href = '/'; }} className="mt-4 rounded bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700">Log Out</button>
          </div>
        }
      />
      <Route
        path="/patient/profile"
        element={userRole === 'ROLE_PATIENT' ? <PatientDashboard /> : <Navigate to="/" replace />}
      />
      
      {/* Payment Routes */}
      <Route
        path="/payment-initiation/:appointmentId"
        element={userRole === 'ROLE_PATIENT' ? <PaymentInitiation /> : <Navigate to="/" replace />}
      />
      <Route
        path="/payment-checkout/:appointmentId"
        element={userRole === 'ROLE_PATIENT' ? <PaymentCheckout /> : <Navigate to="/" replace />}
      />
      <Route
        path="/payment-success/:appointmentId"
        element={userRole === 'ROLE_PATIENT' ? <PaymentSuccess /> : <Navigate to="/" replace />}
      />
      <Route
        path="/payment-failed/:appointmentId"
        element={userRole === 'ROLE_PATIENT' ? <PaymentFailed /> : <Navigate to="/" replace />}
      />
      <Route
        path="/payment-history"
        element={userRole === 'ROLE_PATIENT' ? <PaymentHistory /> : <Navigate to="/" replace />}
      />
      
      <Route path="*" element={<Navigate to="/patientDashboard" replace />} />
    </Routes>
  )
}

export default App
