import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await register(form.name, form.username, form.email, form.password); toast.success('Welcome to KashDev!'); navigate('/dashboard') }
    catch (err) { toast.error(err.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Code2 size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-display text-text-primary">Join KashDev</h1>
          <p className="text-sm text-text-muted mt-1">Create your developer profile</p>
        </div>
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div><label className="label">Full Name</label>
            <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ali Bhat" autoFocus /></div>
          <div><label className="label">Username</label>
            <input className="input" required pattern="^[a-zA-Z0-9_]+$" minLength={3} maxLength={30}
              value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} placeholder="alibhat" /></div>
          <div><label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ali@example.com" /></div>
          <div><label className="label">Password</label>
            <input type="password" className="input" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" /></div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-text-muted mt-4">
          Already a member?{' '}
          <Link to="/login" className="text-accent-text hover:text-accent transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}