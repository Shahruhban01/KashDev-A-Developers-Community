import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import DeveloperCard from '../ui/DeveloperCard'
import { SkeletonGrid } from '../ui/Skeleton'

export default function FeaturedDevelopers() {
  const { data, loading } = useApi('/developers', { params: { limit: 6 } })
  const developers = data?.data || []

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Community</p>
            <h2 className="section-title">Featured Developers</h2>
            <p className="section-sub">Talented engineers building from across Kashmir</p>
          </div>
          <Link to="/developers" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1 group">
            View all
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading
          ? <SkeletonGrid count={6} />
          : developers.length === 0
            ? (
              <div className="text-center py-16 card">
                <p className="text-text-muted text-sm">No developers yet. Be the first to join!</p>
                <Link to="/register" className="btn btn-primary btn-sm mt-4">Join Now</Link>
              </div>
            )
            : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {developers.map(p => <DeveloperCard key={p._id} profile={p} />)}
              </div>
            )
        }

        <div className="mt-6 sm:hidden text-center">
          <Link to="/developers" className="btn btn-secondary btn-sm gap-1">
            View all developers <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}