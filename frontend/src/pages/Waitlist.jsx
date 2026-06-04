import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, Loader2, Users, Rocket, Star,
  Github, Linkedin, Globe, Phone, MapPin, Briefcase, Code2,
  ChevronDown, X, Mail,
} from 'lucide-react'
import { joinWaitlist, getWaitlistCount } from '../services/waitlistService'

const ROLES = [
  'Student', 'Developer', 'Freelancer', 'Founder',
  'Designer', 'Recruiter', 'Tech Enthusiast', 'Other',
]

const KASHMIR_DISTRICTS = [
  'Srinagar', 'Baramulla', 'Anantnag', 'Shopian', 'Pulwama',
  'Budgam', 'Bandipora', 'Ganderbal', 'Kupwara', 'Kulgam',
  'Jammu', 'Rajouri', 'Udhampur', 'Kathua', 'Poonch',
  'Doda', 'Kishtwar', 'Ramban', 'Reasi', 'Samba',
  'Other (Outside Kashmir)',
]

// ─── Mini components ──────────────────────────────────────────────────────────

function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full bg-accent/20 animate-pulse"
      style={style}
    />
  )
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-surface-3 border border-surface-border text-text-secondary text-xs font-medium">
      <Icon size={13} className="text-accent" />
      {label}
    </div>
  )
}

function SuccessView({ email }) {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green/10 border-2 border-green/30
                      flex items-center justify-center mx-auto mb-6 relative">
        <CheckCircle size={36} className="text-green" />
        <div className="absolute inset-0 rounded-full bg-green/10 animate-ping" />
      </div>

      <h2 className="text-2xl font-bold font-display text-text-primary mb-2">
        You're on the list! 🎉
      </h2>
      <p className="text-text-secondary text-sm mb-1">
        We've saved your spot for <span className="text-accent font-medium">{email}</span>
      </p>
      <p className="text-text-muted text-xs mb-8 max-w-sm mx-auto">
        We'll reach out when KashDev opens early access. Keep an eye on your inbox!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn btn-secondary btn-md gap-2">
          ← Back to Homepage
        </Link>
        <Link to="/developers" className="btn btn-primary btn-md gap-2">
          Explore Developers <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── Form Section ─────────────────────────────────────────────────────────────

// Defined at module scope so React never treats it as a new component type on re-render
function InputField({ id, label, icon: Icon, required, type = 'text', placeholder, field, form, fieldErrors, onSet }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-text-secondary mb-1.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => onSet(field, e.target.value)}
          className={`input ${Icon ? 'pl-9' : ''} ${fieldErrors[field] ? 'border-red/50 focus:border-red/70' : ''}`}
        />
      </div>
      {fieldErrors[field] && (
        <p className="text-xs text-red-text mt-1">{fieldErrors[field]}</p>
      )}
    </div>
  )
}

function WaitlistForm({ onSuccess }) {
  const [step, setStep] = useState(1) // 1: basics, 2: profile
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm] = useState({
    full_name: '', email: '', location: '', role: '',
    phone: '', github_url: '', linkedin_url: '',
    portfolio_url: '', company_or_college: '', skills: '', message: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: '' }))
  }

  const validateStep1 = () => {
    const errs = {}
    if (!form.full_name.trim())   errs.full_name = 'Full name is required'
    if (!form.email.trim())       errs.email     = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.location)           errs.location  = 'Please select your location'
    if (!form.role)               errs.role      = 'Please select your role'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await joinWaitlist(form)
      onSuccess(form.email)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border border-surface-border-2 p-6 sm:p-8 relative overflow-hidden">
      {/* Glow top */}
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-7">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${step >= s ? 'bg-accent text-white' : 'bg-surface-3 text-text-muted border border-surface-border'}`}>
              {step > s ? <CheckCircle size={14} /> : s}
            </div>
            {s === 1 && (
              <>
                <span className={`text-xs font-medium transition-colors ${step >= 1 ? 'text-text-primary' : 'text-text-muted'}`}>
                  Basic Info
                </span>
                <div className={`flex-1 h-px w-8 transition-all ${step > 1 ? 'bg-accent' : 'bg-surface-border'}`} />
              </>
            )}
            {s === 2 && (
              <span className={`text-xs font-medium transition-colors ${step >= 2 ? 'text-text-primary' : 'text-text-muted'}`}>
                Profile Details
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Required fields */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
          <InputField
            id="wl-name" label="Full Name" icon={Users} required
            field="full_name" placeholder="Ahmad Mir"
            form={form} fieldErrors={fieldErrors} onSet={set}
          />
          <InputField
            id="wl-email" label="Email Address" icon={Mail} required
            field="email" type="email" placeholder="ahmad@example.com"
            form={form} fieldErrors={fieldErrors} onSet={set}
          />

          {/* Location select */}
          <div>
            <label htmlFor="wl-location" className="block text-xs font-medium text-text-secondary mb-1.5">
              Location <span className="text-red">*</span>
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
              <select
                id="wl-location"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={`input pl-9 appearance-none cursor-pointer
                  ${!form.location ? 'text-text-faint' : ''}
                  ${fieldErrors.location ? 'border-red/50' : ''}`}
              >
                <option value="" disabled>Select your district / city</option>
                {KASHMIR_DISTRICTS.map(d => (
                  <option key={d} value={d} className="bg-surface-3 text-text-primary">{d}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
            </div>
            {fieldErrors.location && <p className="text-xs text-red-text mt-1">{fieldErrors.location}</p>}
          </div>

          {/* Role select */}
          <div>
            <label htmlFor="wl-role" className="block text-xs font-medium text-text-secondary mb-1.5">
              I am a <span className="text-red">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('role', r)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all duration-150 text-left
                    ${form.role === r
                      ? 'bg-accent/15 border-accent/50 text-accent font-medium'
                      : 'bg-surface-3 border-surface-border text-text-secondary hover:border-surface-border-2 hover:text-text-primary'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {fieldErrors.role && <p className="text-xs text-red-text mt-1">{fieldErrors.role}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full gap-2 mt-2">
            Continue <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* Step 2 — Optional profile fields */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <p className="text-xs text-text-muted mb-4">
            All fields below are optional — fill what you're comfortable sharing.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              id="wl-phone" label="Phone Number" icon={Phone}
              field="phone" type="tel" placeholder="+91 98XXXXXXXX"
              form={form} fieldErrors={fieldErrors} onSet={set}
            />
            <InputField
              id="wl-company" label="Company / College" icon={Briefcase}
              field="company_or_college" placeholder="NIT Srinagar / Freelance"
              form={form} fieldErrors={fieldErrors} onSet={set}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              id="wl-github" label="GitHub Profile" icon={Github}
              field="github_url" placeholder="https://github.com/username"
              form={form} fieldErrors={fieldErrors} onSet={set}
            />
            <InputField
              id="wl-linkedin" label="LinkedIn Profile" icon={Linkedin}
              field="linkedin_url" placeholder="https://linkedin.com/in/username"
              form={form} fieldErrors={fieldErrors} onSet={set}
            />
          </div>

          <InputField
            id="wl-portfolio" label="Portfolio Website" icon={Globe}
            field="portfolio_url" placeholder="https://yoursite.com"
            form={form} fieldErrors={fieldErrors} onSet={set}
          />

          <div>
            <label htmlFor="wl-skills" className="block text-xs font-medium text-text-secondary mb-1.5">
              Skills & Technologies
            </label>
            <div className="relative">
              <Code2 size={14} className="absolute left-3 top-3 text-text-faint pointer-events-none" />
              <textarea
                id="wl-skills"
                value={form.skills}
                onChange={e => set('skills', e.target.value)}
                placeholder="React, Node.js, Python, Flutter, AWS..."
                rows={2}
                className="input pl-9 resize-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wl-message" className="block text-xs font-medium text-text-secondary mb-1.5">
              Additional Message
            </label>
            <textarea
              id="wl-message"
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Tell us what you're excited about, what you'd like to build, or how you can contribute..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red/10 border border-red/20 text-red-text text-sm">
              <X size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary btn-lg flex-1"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg flex-1 gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Joining...</>
              ) : (
                <>Join Waitlist <Rocket size={15} /></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Waitlist() {
  const [success, setSuccess]   = useState(false)
  const [email, setEmail]       = useState('')
  const [count, setCount]       = useState(null)

  useEffect(() => {
    getWaitlistCount()
      .then(res => setCount(res.data?.data?.count || null))
      .catch(() => {})
  }, [])

  const handleSuccess = (submittedEmail) => {
    setEmail(submittedEmail)
    setSuccess(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Particles configuration
  const particles = [
    { width: 80, height: 80, top: '10%', left: '5%',  animationDelay: '0s',    animationDuration: '6s' },
    { width: 40, height: 40, top: '20%', right: '8%', animationDelay: '1s',    animationDuration: '8s' },
    { width: 60, height: 60, top: '60%', left: '3%',  animationDelay: '2s',    animationDuration: '7s' },
    { width: 30, height: 30, top: '70%', right: '5%', animationDelay: '0.5s',  animationDuration: '5s' },
    { width: 50, height: 50, top: '85%', left: '20%', animationDelay: '1.5s',  animationDuration: '9s' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1c1f_1px,transparent_1px),linear-gradient(to_bottom,#1c1c1f_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-green/5 rounded-full blur-3xl" />
        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={{ ...p, opacity: 0.4 }} />
        ))}

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge badge-accent mb-6 text-sm px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Early Access — Limited Spots
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.75rem] text-text-primary mb-5 leading-tight tracking-tight">
            💻 Developers.{' '}
            <span className="text-gradient">🚀 Startups.</span>
            <br />
            🌟 Opportunities.
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed">
            Join the early access waitlist for{' '}
            <span className="text-text-primary font-semibold">Kashmir's fastest-growing tech community.</span>
          </p>
          <p className="text-sm text-text-muted max-w-xl mx-auto mb-8">
            Be among the first to access KashDev and help shape the future of Kashmir's developer ecosystem.
          </p>

          {/* Waitlist counter */}
          {count !== null && (
            <div className="inline-flex items-center gap-2 text-sm text-text-secondary mb-8">
              <div className="flex -space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i}
                    className="w-6 h-6 rounded-full bg-accent/20 border border-surface-border flex items-center justify-center text-[9px] font-bold text-accent"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>
                <strong className="text-text-primary tabular">{count.toLocaleString()}</strong> people already on the list
              </span>
            </div>
          )}

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <FeaturePill icon={Users}   label="Connect with Kashmiri devs" />
            <FeaturePill icon={Briefcase} label="Find opportunities locally" />
            <FeaturePill icon={Code2}   label="Showcase your projects" />
            <FeaturePill icon={Star}    label="Join Hall of Fame" />
          </div>
        </div>
      </section>

      {/* ── Form / Success ── */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {success ? (
            <SuccessView email={email} />
          ) : (
            <WaitlistForm onSuccess={handleSuccess} />
          )}
        </div>
      </section>

      {/* ── Why Join section ── */}
      {!success && (
        <section className="py-16 px-4 sm:px-6 bg-surface-1 border-t border-surface-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title mb-2">Why join the waitlist?</h2>
              <p className="section-sub">Early members get exclusive perks and help shape the platform</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: '🏆',
                  title: 'Founding Member Badge',
                  desc: 'Get a permanent "Founding Member" badge on your profile visible to the entire community.',
                },
                {
                  icon: '🎯',
                  title: 'Priority Access',
                  desc: 'Be first to explore every new feature before public launch. Shape the product with your feedback.',
                },
                {
                  icon: '🤝',
                  title: 'Exclusive Network',
                  desc: 'Connect with Kashmir\'s top engineers, founders, and investors in a curated early community.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card p-6 card-hover">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-semibold text-text-primary text-sm mb-2">{title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
