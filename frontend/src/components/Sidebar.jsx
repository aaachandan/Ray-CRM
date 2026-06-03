import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Phone, MessageSquare, Bell, BarChart3, LogOut, UserCircle, Building2 } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/calls', icon: Phone, label: 'Calls' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-600" />
          <span className="text-lg font-bold text-gray-800">Ray Services CRM</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/team"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <UserCircle className="w-5 h-5" />
            Team
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button onClick={onLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
