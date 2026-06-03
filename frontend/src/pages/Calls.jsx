import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Phone, Search } from 'lucide-react'

export default function Calls() {
  const { API } = useAuth()
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    API.get('/calls').then(res => setCalls(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = calls.filter(c =>
    !search || c.lead_name?.toLowerCase().includes(search.toLowerCase()) || c.lead_phone?.includes(search)
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Call History</h2>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          placeholder="Search by lead name or phone..."
          className="input-field pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-200 rounded-xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No calls recorded yet</div>
      ) : (
        <>
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Lead</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(call => (
                  <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-gray-800">{call.lead_name}</p>
                      <p className="text-xs text-gray-500">{call.lead_phone}</p>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-sm capitalize">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {call.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{call.duration}s</td>
                    <td className="p-3 text-sm text-gray-600">{call.outcome || '-'}</td>
                    <td className="p-3 text-sm text-gray-500">{new Date(call.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {filtered.map(call => (
              <div key={call.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{call.lead_name}</p>
                    <p className="text-xs text-gray-500">{call.lead_phone}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs capitalize text-gray-600">
                    <Phone className="w-3 h-3" /> {call.type}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-medium">Duration:</span> {call.duration}s</p>
                  <p><span className="font-medium">Outcome:</span> {call.outcome || '-'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(call.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
