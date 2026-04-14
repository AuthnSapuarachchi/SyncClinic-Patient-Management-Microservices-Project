import './App.css'
import AuthScreen from './pages/AuthScreen'

function App() {

  return (
    const isAuthenticated = !!localStorage.getItem('jwt_token');
    <div>
      {/* If authenticated, show Dashboard. Otherwise, show Auth form. */}
      {isAuthenticated ? <PatientDashboard /> : <AuthScreen />}
    </div>

  )
}

export default App
