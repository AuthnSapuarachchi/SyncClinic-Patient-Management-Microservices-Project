import './App.css'
import { jwtDecode } from 'jwt-decode'
import AuthScreen from './pages/AuthScreen'
import PatientDashboard from './pages/PatientDashboard'
// import DoctorDashboard from './pages/DoctorDashboard'
// import AdminDashboard from './pages/AdminDashboard'

function App() {
  const token = localStorage.getItem('jwt_token')
  let userRole = null

  if (token) {
    try {
      const decodedToken = jwtDecode(token)

      // Support common JWT payload shapes from Spring Security style backends.
      if (decodedToken.role) {
        userRole = decodedToken.role
      } else if (Array.isArray(decodedToken.authorities) && decodedToken.authorities.length > 0) {
        userRole = decodedToken.authorities[0]
      } else if (Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) {
        userRole = decodedToken.roles[0]
      }
    } catch (error) {
      console.error('Invalid token', error)
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_email')
    }
  }

  if (!token) {
    return <AuthScreen />
  }

  if (userRole === 'ROLE_PATIENT') {
    return <PatientDashboard />
  }

  // if (userRole === 'ROLE_DOCTOR') {
  //   return <DoctorDashboard />
  // }

  // if (userRole === 'ROLE_ADMIN') {
  //   return <AdminDashboard />
  // }

  return <div className="p-6 text-center text-red-600 font-semibold">Unauthorized Role</div>
}

export default App
