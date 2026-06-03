import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Users, Briefcase, Trophy, Github, Star, MapPin } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import DeveloperCard from '../components/ui/DeveloperCard'
import ProjectCard from '../components/ui/ProjectCard'
import { SkeletonGrid } from '../components/ui/Skeleton'

function Hero() {
  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1c1f_1px,transparent_1px),linear-gradient(to_bottom,#1c1c1f_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 badge badge-accent mb-6 text-sm px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Kashmir's Developer Community
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-5 leading-tight tracking-tight">
          Where Kashmiri Developers<br />
          <span className="text-gradient">Build Together</span>
        </h1>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
          Discover talented developers from the Valley, showcase your work, find your next opportunity,
          and contribute to a thriving tech ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg gap-2">
            Join the Community <ArrowRight size={16} />
          </Link>
          <Link to="/developers" className="btn btn-secondary btn-lg">
            Explore Developers
          </Link>
        </div>
      </div>
    </section>
  )
}

function CommunityStats() {
  const { data } = useApi('/users/stats')
  const stats = data?.data || {}

  return (
    <section className="py-10 px-4 sm:px-6 border-y border-surface-border bg-surface-1">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Developers', value: stats.users || '—', icon: Users },
          { label: 'Projects', value: stats.projects || '—', icon: Code2 },
          { label: 'Opportunities', value: stats.opportunities || '—', icon: Briefcase },
          { label: 'Districts Represented', value: '10+', icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center">
            <div className="flex justify-center mb-2">
              <Icon size={20} className="text-accent" />
            </div>
            <p className="text-2xl font-bold font-display tabular text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturedDevelopers() {
  const { data, loading } = useApi('/developers', { params: { limit: 6 } })

  return (
    <section className="py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Developers</h2>
            <p className="section-sub">Talented engineers from across Kashmir</p>
          </div>
          <Link to="/developers" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {loading
          ? <SkeletonGrid count={6} />
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.data?.slice(0, 6).map(p => <DeveloperCard key={p._id} profile={p} />)}
            </div>
        }
      </div>
    </section>
  )
}

function FeaturedProjects() {
  const { data, loading } = useApi('/projects', { params: { limit: 6 } })

  return (
    <section className="py-14 px-4 sm:px-6 bg-surface-1 border-y border-surface-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-sub">Open source and production projects built by the community</p>
          </div>
          <Link to="/projects" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {loading
          ? <SkeletonGrid count={6} />
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.data?.slice(0, 6).map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
        }
      </div>
    </section>
  )
}

function HallOfFameTeaser() {
  return (
    <section className="py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="card border-accent/20 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,101,242,0.05),transparent_70%)]" />
          <div className="relative">
            <Trophy size={32} className="text-amber mx-auto mb-4" />
            <h2 className="section-title mb-2">Hall of Fame</h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto mb-6">
              Celebrating Kashmiri engineers at top companies, open source contributors, and startup founders making a mark globally.
            </p>
            <Link to="/hall-of-fame" className="btn btn-primary gap-2">
              View Hall of Fame <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function JoinCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-surface-1 border-t border-surface-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="section-title mb-3">Ready to join?</h2>
        <p className="text-sm text-text-secondary mb-8">
          Create your developer profile, showcase your projects, and connect with the Kashmir tech community.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg gap-2">
            Create Your Profile <ArrowRight size={15} />
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-lg gap-2">
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div>
      <Hero />
      <CommunityStats />
      <FeaturedDevelopers />
      <FeaturedProjects />
      <HallOfFameTeaser />
      <JoinCTA />
    </div>
  )
}