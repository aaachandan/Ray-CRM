import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Users as UsersIcon } from 'lucide-react'

export default function Team() {
  const { API, user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent', phone: '' })

  useEffect(() => {
    API.get('/team').then(res => setMembers(res.data)).finally(() => setLoading(false))
  }, [])

  const addMember = async (e) => {
    e.preventDefault()
    await API.post('/team', form)
    setForm({ name: '', email: '', password: '', role: 'agent', phone: '' })
    setShowForm(false)
    const res = await API.get('/team')
    setMembers(res.data)
  }

  const deleteMember = async (id) => {
    if (!confirm('Remove this team member?')) return
    await API.delete(`/team/${id}`)
    setMembers(members.filter(m => m.id !== id))
  }

  if (user?.role !== 'admin') {
    return <div className="card p-8 text-center text-gray-500">Only admins can manage the team.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold text-gray-800 mb-4">Add Team Member</h3>
            <form onSubmit={addMember} className="space-y-3">
              <input required placeholder="Name" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input required type="password" placeholder="Password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <input placeholder="Phone" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-200 rounded-xl" /></div>
      ) : members.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No team members</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-800">{m.name}</td>
                  <td className="p-3 text-sm text-gray-600">{m.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full capitalize bg-blue-100 text-blue-700">{m.role}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{m.phone || '-'}</td>
                  <td className="p-3">
                    {m.id !== user.id && (
                      <button onClick={() => deleteMember(m.id)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                    )}
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
