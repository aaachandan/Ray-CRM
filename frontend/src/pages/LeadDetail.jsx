import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, MessageSquare, Clock, Plus } from 'lucide-react'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { API } = useAuth()
  const [lead, setLead] = useState(null)
  const [calls, setCalls] = useState([])
  const [messages, setMessages] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    Promise.all([
      API.get(`/leads/${id}`),
      API.get(`/calls?lead_id=${id}`),
      API.get(`/whatsapp?lead_id=${id}`),
      API.get(`/reminders?lead_id=${id}`),
    ]).then(([leadRes, callsRes, msgRes, remRes]) => {
      setLead(leadRes.data)
      setCalls(callsRes.data)
      setMessages(msgRes.data)
      setReminders(remRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status) => {
    await API.put(`/leads/${id}`, { status })
    const res = await API.get(`/leads/${id}`)
    setLead(res.data)
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    const notes = lead.notes ? lead.notes + '\n' + newNote : newNote
    await API.put(`/leads/${id}`, { notes })
    setLead({ ...lead, notes })
    setNewNote('')
  }

  const logCall = async () => {
    await API.post('/calls', { lead_id: id, type: 'outgoing', duration: 0, notes: 'Call logged' })
    const res = await API.get(`/calls?lead_id=${id}`)
    setCalls(res.data)
  }

  const sendMessage = async () => {
    const content = prompt('Message content:')
    if (!content) return
    await API.post('/whatsapp', { lead_id: id, content })
    const res = await API.get(`/whatsapp?lead_id=${id}`)
    setMessages(res.data)
  }

  const addReminder = async () => {
    const title = prompt('Reminder title:')
    if (!title) return
    const due_date = prompt('Due date (YYYY-MM-DD HH:MM):')
    if (!due_date) return
    await API.post('/reminders', { lead_id: id, title, due_date })
    const res = await API.get(`/reminders?lead_id=${id}`)
    setReminders(res.data)
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /></div>
  if (!lead) return <div className="text-gray-500">Lead not found</div>

  const statusColors = { new: 'status-new', contact: 'status-contact', qualified: 'status-qualified', lost: 'status-lost', won: 'status-won' }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/leads')} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Leads</button>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{lead.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
              {lead.shop_name && <span><span className="font-medium">Shop:</span> {lead.shop_name}</span>}
              <span>{lead.phone}</span>
              {lead.email && <span>· {lead.email}</span>}
              <span>· {lead.source}</span>
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 capitalize">{lead.service || 'general'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-badge ${statusColors[lead.status] || 'status-new'}`}>{lead.status}</span>
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1"
              value={lead.status}
              onChange={e => updateStatus(e.target.value)}
            >
              <option value="new">New</option>
              <option value="contact">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={logCall} className="btn-secondary flex items-center gap-1 text-xs"><Phone className="w-3.5 h-3.5" /> Log Call</button>
          <button onClick={sendMessage} className="btn-secondary flex items-center gap-1 text-xs"><MessageSquare className="w-3.5 h-3.5" /> Send Message</button>
          <button onClick={addReminder} className="btn-secondary flex items-center gap-1 text-xs"><Clock className="w-3.5 h-3.5" /> Set Reminder</button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {['info', 'calls', 'messages', 'reminders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} {tab === 'calls' ? `(${calls.length})` : tab === 'messages' ? `(${messages.length})` : tab === 'reminders' ? `(${reminders.length})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="card p-5 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <div className="flex gap-2">
              <textarea className="input-field flex-1" rows={3} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." />
              <button onClick={addNote} className="btn-primary self-end"><Plus className="w-4 h-4" /></button>
            </div>
            {lead.notes && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>}
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="card p-5">
          {calls.length === 0 ? <p className="text-sm text-gray-500">No calls logged</p> : (
            <div className="space-y-3">
              {calls.map(call => (
                <div key={call.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium capitalize">{call.type} call</p>
                    <p className="text-xs text-gray-500">{call.duration}s · {new Date(call.created_at).toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-gray-500">{call.outcome || '-'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="card p-5">
          {messages.length === 0 ? <p className="text-sm text-gray-500">No messages</p> : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()} · {msg.direction} via {msg.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="card p-5">
          {reminders.length === 0 ? <p className="text-sm text-gray-500">No reminders</p> : (
            <div className="space-y-3">
              {reminders.map(rem => (
                <div key={rem.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{rem.title}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(rem.due_date).toLocaleString()} · {rem.priority}</p>
                  </div>
                  <span className={`status-badge ${rem.status === 'completed' ? 'status-won' : 'status-contact'}`}>{rem.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
