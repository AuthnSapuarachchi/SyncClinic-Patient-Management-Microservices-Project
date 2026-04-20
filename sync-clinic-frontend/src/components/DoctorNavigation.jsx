import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/doctorDashboard' },
  { label: 'Appointments', path: '/appointments' },
  { label: 'Prescriptions', path: '/doctor/prescriptions' },
  { label: 'Profile', path: '/doctor/profile' },
]

export default function DoctorNavigation() {
  const location = useLocation()

  return (
    <nav className="mb-6 rounded-xl border border-cyan-400/20 bg-slate-900/70 p-2" aria-label="Doctor navigation">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'border border-slate-700 bg-slate-800/70 text-slate-200 hover:border-cyan-500/60 hover:bg-cyan-900/30'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
