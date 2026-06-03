import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Users, Phone, MessageSquare, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { API } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/reports/summary').then(res => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-64 bg-gray-200 rounded-xl" /></div>

  const cards = [
    { label: 'Total Leads', value: data?.totalLeads || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Calls', value: data?.totalCalls || 0, icon: Phone, color: 'bg-green-500' },
    { label: 'Messages', value: data?.totalMessages || 0, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Pending Reminders', value: data?.pendingReminders || 0, icon: Bell, color: 'bg-orange-500' },
  ]

  const statusColors = { new: 'status-new', contact: 'status-contact', qualified: 'status-qualified', lost: 'status-lost', won: 'status-won' }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {data?.leadsByStatus?.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`status-badge ${statusColors[s.status] || 'status-new'}`}>{s.status}</span>
                <span className="font-medium text-gray-800">{s.count}</span>
              </div>
            ))}
            {(!data?.leadsByStatus || data.leadsByStatus.length === 0) && (
              <p className="text-sm text-gray-500">No leads yet</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Service</h3>
          <div className="space-y-3">
            {data?.leadsByService?.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 capitalize">{s.service}</span>
                <span className="font-medium text-gray-800">{s.count}</span>
              </div>
            ))}
            {(!data?.leadsByService || data.leadsByService.length === 0) && (
              <p className="text-sm text-gray-500">No leads yet</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {data?.recentLeads?.map(lead => (
              <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.phone}</p>
                </div>
                <span className={`status-badge ${statusColors[lead.status] || 'status-new'}`}>{lead.status}</span>
              </Link>
            ))}
            {(!data?.recentLeads || data.recentLeads.length === 0) && (
              <p className="text-sm text-gray-500">No leads yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {data?.recentActivities?.map((act, i) => (
            <div key={act.id || i} className="flex items-start gap-3 p-2 text-sm">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <div>
                <p className="text-gray-700">{act.description}</p>
                <p className="text-xs text-gray-400">{act.lead_name && `Lead: ${act.lead_name} · `}{new Date(act.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <p className="text-sm text-gray-500">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
