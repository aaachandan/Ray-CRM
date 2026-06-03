import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bell, Plus, CheckCircle, Clock } from 'lucide-react'

export default function Reminders() {
  const { API } = useAuth()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', priority: 'medium', lead_id: '' })
  const [leads, setLeads] = useState([])

  useEffect(() => {
    Promise.all([
      API.get(`/reminders${filter ? `?status=${filter}` : ''}`),
      API.get('/leads')
    ]).then(([remRes, leadRes]) => {
      setReminders(remRes.data)
      setLeads(leadRes.data)
    }).finally(() => setLoading(false))
  }, [filter])

  const createReminder = async (e) => {
    e.preventDefault()
    await API.post('/reminders', form)
    setForm({ title: '', description: '', due_date: '', priority: 'medium', lead_id: '' })
    setShowForm(false)
    const res = await API.get('/reminders')
    setReminders(res.data)
  }

  const completeReminder = async (id) => {
    await API.put(`/reminders/${id}/complete`)
    setReminders(reminders.map(r => r.id === id ? { ...r, status: 'completed', completed_at: new Date().toISOString() } : r))
  }

  const deleteReminder = async (id) => {
    if (!confirm('Delete this reminder?')) return
    await API.delete(`/reminders/${id}`)
    setReminders(reminders.filter(r => r.id !== id))
  }

  const priorityColors = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-green-600 bg-green-50' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Follow-up Reminders</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-800 mb-4">New Reminder</h3>
            <form onSubmit={createReminder} className="space-y-3">
              <input required placeholder="Title" className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <textarea placeholder="Description" className="input-field" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <input required type="datetime-local" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select className="input-field" value={form.lead_id} onChange={e => setForm({...form, lead_id: e.target.value})}>
                <option value="">No lead (general reminder)</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {['', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-200 rounded-xl" /></div>
      ) : reminders.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No reminders</div>
      ) : (
        <div className="space-y-3">
          {reminders.map(rem => (
            <div key={rem.id} className={`card p-4 flex items-start justify-between ${rem.status === 'completed' ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${rem.status === 'completed' ? 'text-green-500' : 'text-orange-400'}`}>
                  {rem.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{rem.title}</p>
                  {rem.description && <p className="text-xs text-gray-500 mt-0.5">{rem.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(rem.due_date).toLocaleString()}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[rem.priority] || priorityColors.medium}`}>
                      {rem.priority}
                    </span>
                    {rem.lead_name && <span className="text-xs text-blue-600">{rem.lead_name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rem.status === 'pending' && (
                  <button onClick={() => completeReminder(rem.id)} className="text-xs text-green-600 hover:text-green-800">Complete</button>
                )}
                <button onClick={() => deleteReminder(rem.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
