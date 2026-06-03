import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import ProjectCard from '../ui/ProjectCard'
import { SkeletonGrid } from '../ui/Skeleton'

export default function FeaturedProjects() {
  const { data, loading } = useApi('/projects', { params: { limit: 6 } })
  const projects = data?.data || []

  return (
    <section className="py-16 px-4 sm:px-6 bg-surface-1 border-y border-surface-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Showcase</p>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-sub">Open source and production-grade work by the community</p>
          </div>
          <Link to="/projects" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1 group">
            View all
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading
          ? <SkeletonGrid count={6} />
          : projects.length === 0
            ? (
              <div className="text-center py-16 card">
                <p className="text-text-muted text-sm">No projects yet.</p>
                <Link to="/projects" className="btn btn-primary btn-sm mt-4">Add a Project</Link>
              </div>
            )
            : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => <ProjectCard key={p._id} project={p} />)}
              </div>
            )
        }

        <div className="mt-6 sm:hidden text-center">
          <Link to="/projects" className="btn btn-secondary btn-sm gap-1">
            View all projects <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}