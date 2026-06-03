import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

const SERVICES = ['general', 'branding', 'marketing', 'repairing', 'website', 'loan', 'property', 'photography', 'solar']

export default function Leads() {
  const { API } = useAuth()
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: 'general', source: 'manual', notes: '' })
  const [loading, setLoading] = useState(true)

  const fetchLeads = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (serviceFilter) params.set('service', serviceFilter)
    API.get(`/leads?${params}`).then(res => setLeads(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeads() }, [statusFilter, serviceFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchLeads()
  }

  const createLead = async (e) => {
    e.preventDefault()
    await API.post('/leads', form)
    setForm({ name: '', phone: '', email: '', service: 'general', source: 'manual', notes: '' })
    setShowForm(false)
    fetchLeads()
  }

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead?')) return
    await API.delete(`/leads/${id}`)
    fetchLeads()
  }

  const statusColors = { new: 'status-new', contact: 'status-contact', qualified: 'status-qualified', lost: 'status-lost', won: 'status-won' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Leads</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-800 mb-4">New Lead</h3>
            <form onSubmit={createLead} className="space-y-3">
              <input required placeholder="Name" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input placeholder="Phone" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <input placeholder="Email" type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <select className="input-field" value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
                {SERVICES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select className="input-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="manual">Manual</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google Ads</option>
                <option value="referral">Referral</option>
              </select>
              <textarea placeholder="Notes" className="input-field" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder="Search leads by name, phone, email..."
              className="input-field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <select className="input-field w-36" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
          <option value="">All Services</option>
          {SERVICES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="input-field w-32" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contact">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-200 rounded-xl" /><div className="h-16 bg-gray-200 rounded-xl" /></div>
      ) : leads.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No leads found. Create your first lead!</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <Link to={`/leads/${lead.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">{lead.name}</Link>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 capitalize">{lead.service || 'general'}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{lead.phone || '-'}</td>
                  <td className="p-3 text-sm text-gray-600 capitalize">{lead.source}</td>
                  <td className="p-3"><span className={`status-badge ${statusColors[lead.status] || 'status-new'}`}>{lead.status}</span></td>
                  <td className="p-3">
                    <button onClick={() => deleteLead(lead.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
