import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Search, Send } from 'lucide-react'

export default function WhatsApp() {
  const { API } = useAuth()
  const [messages, setMessages] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState('')
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      API.get('/whatsapp'),
      API.get('/leads')
    ]).then(([msgRes, leadRes]) => {
      setMessages(msgRes.data)
      setLeads(leadRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!selectedLead || !content.trim()) return
    const res = await API.post('/whatsapp', { lead_id: selectedLead, content })
    setMessages([res.data, ...messages])
    setContent('')
  }

  const filtered = messages.filter(m =>
    !search || m.lead_name?.toLowerCase().includes(search.toLowerCase()) || m.content?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">WhatsApp Messages</h2>

      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Send Message</h3>
        <form onSubmit={sendMessage} className="flex flex-col md:flex-row gap-2">
          <select
            className="input-field w-full md:w-48"
            value={selectedLead}
            onChange={e => setSelectedLead(e.target.value)}
            required
          >
            <option value="">Select lead</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name} - {l.phone}</option>)}
          </select>
          <input
            className="input-field flex-1"
            placeholder="Type your message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary flex items-center gap-1 justify-center">
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          placeholder="Search messages..."
          className="input-field pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-200 rounded-xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No messages yet</div>
      ) : (
        <div className="card p-5 space-y-3">
          {filtered.map(msg => (
            <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-800">{msg.lead_name}</p>
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
              <span className="text-xs text-gray-400 capitalize">{msg.direction} · {msg.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
