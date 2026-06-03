import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function Reports() {
  const { API } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [teamPerf, setTeamPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/reports/summary'),
      API.get('/reports/lead-trends?days=30'),
      API.get('/reports/team-performance'),
    ]).then(([sumRes, trendRes, perfRes]) => {
      setSummary(sumRes.data)
      setTrends(trendRes.data)
      setTeamPerf(perfRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-64 bg-gray-200 rounded-xl" /></div>

  const statusData = summary?.leadsByStatus?.map(s => ({ name: s.status, value: s.count })) || []
  const serviceData = summary?.leadsByService?.map(s => ({ name: s.service, value: s.count })) || []

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Reports & Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Leads by Status
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">No data</p>}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Leads by Service
          </h3>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">No data</p>}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Lead Trends (30 days)
          </h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-500 text-center py-8">No data</p>}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Team Performance</h3>
        {teamPerf.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Total Leads</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Total Calls</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Messages</th>
                </tr>
              </thead>
              <tbody>
                {teamPerf.map(m => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="p-3 text-sm font-medium text-gray-800">{m.name}</td>
                    <td className="p-3 text-sm text-gray-600">{m.total_leads}</td>
                    <td className="p-3 text-sm text-gray-600">{m.total_calls}</td>
                    <td className="p-3 text-sm text-gray-600">{m.total_messages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-500 text-center py-4">No team data</p>}
      </div>
    </div>
  )
}
