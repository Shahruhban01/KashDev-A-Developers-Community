import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Search, ChevronRight, ExternalLink } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { SkeletonGrid } from '../components/ui/Skeleton'

const TYPE_FILTERS = [
  { value: '',          label: 'All' },
  { value: 'mnc',       label: 'MNCs' },
  { value: 'startup',   label: 'Startups' },
  { value: 'research',  label: 'Research' },
  { value: 'freelance', label: 'Freelance' },
]

function CompanyCard({ company }) {
  const slug = company.slug || company._id?.toLowerCase().replace(/\s+/g, '-') || company.name?.toLowerCase().replace(/\s+/g, '-')

  return (
    <Link to={`/companies/${slug}`}
      className="card card-hover p-5 flex items-center gap-4 group animate-fade-in">
      {/* Logo placeholder */}
      <div className="w-12 h-12 rounded-xl bg-surface-3 border border-surface-border flex items-center justify-center flex-shrink-0 text-xl font-bold text-text-muted group-hover:border-surface-border-2 transition-all">
        {company.logo
          ? <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain" />
          : company.name?.charAt(0).toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-text-primary group-hover:text-white transition-colors truncate">
            {company.name || company.displayName}
          </h3>
          {company.tier === 1 && (
            <span className="badge badge-accent text-[10px] flex-shrink-0">Tier 1</span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{company.industry || company.headquarters || 'Technology'}</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-text-secondary">
          <Users size={11} />
          <span>{company.currentDevelopers || company.count || 0} Kashmiri developers</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-text-faint group-hover:text-text-muted transition-colors flex-shrink-0" />
    </Link>
  )
}

export default function Companies() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const params = {}
  if (search) params.search = search
  if (type)   params.type   = type

  const { data, loading } = useApi('/companies', { params })
  const companies   = data?.data      || []
  const discovered  = data?.discovered || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Discovery</p>
        <h1 className="text-2xl font-bold font-display text-text-primary mb-1">
          Where Are Kashmiri Developers Working?
        </h1>
        <p className="text-sm text-text-secondary">
          Explore companies with Kashmiri engineers — from FAANG to local startups.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..." className="input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setType(f.value)}
              className={`btn btn-sm ${type === f.value ? 'btn-primary' : 'btn-secondary'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading
        ? <SkeletonGrid count={8} />
        : (
          <div className="space-y-8">
            {/* Known companies with profiles */}
            {companies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Featured Companies</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {companies.map(co => <CompanyCard key={co._id || co.slug} company={co} />)}
                </div>
              </div>
            )}

            {/* Discovered from developer profiles */}
            {discovered.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
                  Also Working At
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {discovered.map((co, i) => (
                    <Link key={i}
                      to={`/companies/${co._id?.replace(/\s+/g, '-').toLowerCase()}`}
                      className="card card-hover p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-3 border border-surface-border flex items-center justify-center flex-shrink-0 text-sm font-bold text-text-muted">
                        {co.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{co.name}</p>
                        <p className="text-xs text-text-muted">{co.count} developer{co.count !== 1 ? 's' : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {companies.length === 0 && discovered.length === 0 && (
              <div className="text-center py-20 card">
                <Building2 size={32} className="text-text-faint mx-auto mb-3" />
                <p className="text-text-muted text-sm">No companies found.</p>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}