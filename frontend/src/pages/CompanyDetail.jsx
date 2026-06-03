import { useParams, Link } from 'react-router-dom'
import { Users, Briefcase, Code2, ArrowLeft, ExternalLink, Clock } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Avatar from '../components/ui/Avatar'
import OpportunityCard from '../components/ui/OpportunityCard'
import { SkeletonGrid } from '../components/ui/Skeleton'

export default function CompanyDetail() {
  const { companySlug } = useParams()
  const { data, loading, error } = useApi(`/companies/${companySlug}`)

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <SkeletonGrid count={6} />
    </div>
  )

  if (error || !data) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-text-muted">Company not found.</p>
      <Link to="/companies" className="btn btn-ghost btn-sm mt-4">← Back to Companies</Link>
    </div>
  )

  const { company, currentDevelopers, alumni, topSkills, opportunities, stats } = data.data

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Back */}
      <Link to="/companies" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={14} /> Companies
      </Link>

      {/* Company Header */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 border border-surface-border flex items-center justify-center text-3xl font-bold text-text-muted flex-shrink-0">
            {company.logo
              ? <img src={company.logo} alt={company.name} className="w-10 h-10 object-contain" />
              : company.name?.charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-display text-text-primary mb-1">{company.name}</h1>
            {company.industry && <p className="text-sm text-text-muted mb-1">{company.industry}</p>}
            {company.headquarters && (
              <p className="text-xs text-text-faint flex items-center gap-1">
                <Briefcase size={10} /> {company.headquarters}
              </p>
            )}
            {company.description && (
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">{company.description}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-surface-border">
          {[
            { label: 'Current Developers', value: stats.currentCount, icon: Users },
            { label: 'Alumni',             value: stats.alumniCount,  icon: Clock },
            { label: 'Top Skills',         value: topSkills.length,   icon: Code2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={16} className="text-accent mx-auto mb-1" />
              <p className="text-xl font-bold font-display tabular text-text-primary">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <div>
          <h2 className="text-base font-bold font-display text-text-primary mb-3">Technologies Used</h2>
          <div className="flex flex-wrap gap-2">
            {topSkills.map(({ skill, count }) => (
              <span key={skill} className="tag py-1.5 px-3">
                {skill}
                <span className="ml-1.5 text-text-faint text-[10px]">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Developers */}
      {currentDevelopers.length > 0 && (
        <div>
          <h2 className="text-base font-bold font-display text-text-primary mb-4">
            Kashmiri Developers at {company.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {currentDevelopers.map(profile => (
              <Link key={profile._id} to={`/developers/${profile.user?.username}`}
                className="card card-hover p-4 flex items-center gap-3 animate-fade-in">
                <Avatar name={profile.user?.name} src={profile.user?.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary truncate">{profile.user?.name}</p>
                  <p className="text-xs text-text-muted">@{profile.user?.username}</p>
                  {profile.skills?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {profile.skills.slice(0, 3).map(s => (
                        <span key={s} className="tag text-[10px] py-0">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {profile.openToWork && <span className="badge badge-green flex-shrink-0">Hiring</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alumni */}
      {alumni.length > 0 && (
        <div>
          <h2 className="text-base font-bold font-display text-text-primary mb-4">Alumni</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {alumni.map(profile => (
              <Link key={profile._id} to={`/developers/${profile.user?.username}`}
                className="card card-hover p-4 flex items-center gap-3 opacity-80 animate-fade-in">
                <Avatar name={profile.user?.name} src={profile.user?.avatar} size="md" />
                <div>
                  <p className="font-medium text-sm text-text-primary">{profile.user?.name}</p>
                  <p className="text-xs text-text-muted">Former · @{profile.user?.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div>
          <h2 className="text-base font-bold font-display text-text-primary mb-4">
            Open Opportunities at {company.name}
          </h2>
          <div className="flex flex-col gap-3">
            {opportunities.map(o => <OpportunityCard key={o._id} opportunity={o} />)}
          </div>
        </div>
      )}
    </div>
  )
}