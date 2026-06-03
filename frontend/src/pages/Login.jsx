import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/dashboard') }
    catch (err) { toast.error(err.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Code2 size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-display text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your KashDev account</p>
        </div>
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div><label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoFocus /></div>
          <div><label className="label">Password</label>
            <input type="password" className="input" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="text-center text-sm text-text-muted mt-4">
          No account?{' '}
          <Link to="/register" className="text-accent-text hover:text-accent transition-colors">Join KashDev</Link>
        </p>
      </div>
    </div>
  )
}