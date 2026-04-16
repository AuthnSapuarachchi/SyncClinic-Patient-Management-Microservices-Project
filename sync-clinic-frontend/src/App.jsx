import './App.css'
import { jwtDecode } from 'jwt-decode'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthScreen from './pages/AuthScreen'
import PatientDashboard from './pages/PatientDashboard'
import PaymentInitiation from './pages/PaymentInitiation'
import PaymentCheckout from './pages/PaymentCheckout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import PaymentHistory from './pages/PaymentHistory'
// import DoctorDashboard from './pages/DoctorDashboard'
// import AdminDashboard from './pages/AdminDashboard'

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
        <Route path="/" element={<AuthScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/patientDashboard" replace />} />
      <Route
        path="/patientDashboard"
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
