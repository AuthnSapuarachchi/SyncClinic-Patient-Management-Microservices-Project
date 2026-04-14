import './App.css'
import AuthScreen from './pages/AuthScreen'
import PatientDashboard from './pages/PatientDashboard'

function App() {

  const isAuthenticated = !!localStorage.getItem('jwt_token');

  return (
    
    <div>
      {/* If authenticated, show Dashboard. Otherwise, show Auth form. */}
      {isAuthenticated ? <PatientDashboard /> : <AuthScreen />}
    </div>

  )
}

export default App
