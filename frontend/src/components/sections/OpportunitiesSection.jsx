import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import OpportunityCard from '../ui/OpportunityCard'

export default function OpportunitiesSection() {
  const { data, loading } = useApi('/opportunities', { params: { limit: 4 } })
  const opportunities = data?.data || []

  return (
    <section className="py-16 px-4 sm:px-6 bg-surface-1 border-y border-surface-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Work</p>
            <h2 className="section-title">Opportunities</h2>
            <p className="section-sub">Jobs, internships, freelance and co-founder roles</p>
          </div>
          <Link to="/opportunities" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1 group">
            View all <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="card h-28 skeleton" />)}
          </div>
        )}

        {!loading && opportunities.length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-text-muted text-sm mb-4">No opportunities posted yet.</p>
            <Link to="/opportunities" className="btn btn-primary btn-sm">Post an Opportunity</Link>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="flex flex-col gap-3">
            {opportunities.map(o => <OpportunityCard key={o._id} opportunity={o} />)}
          </div>
        )}

        <div className="mt-5 sm:hidden text-center">
          <Link to="/opportunities" className="btn btn-secondary btn-sm gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}