import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, TrendingUp, Clock, ChevronUp, CheckCircle2, Eye, Tag, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import Avatar from '../components/ui/Avatar'
import { timeAgo } from '../utils/helpers'
import { SkeletonGrid } from '../components/ui/Skeleton'

function QuestionCard({ question }) {
  const hasAccepted = !!question.acceptedAnswer
  return (
    <Link to={`/forum/question/${question._id}`}
      className="card card-hover p-5 flex gap-4 animate-fade-in">
      {/* Vote + answer counts */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0 text-center min-w-[44px]">
        <div className={`flex flex-col items-center p-1.5 rounded-lg ${question.voteScore > 0 ? 'text-accent' : 'text-text-faint'}`}>
          <ChevronUp size={14} />
          <span className="text-xs font-bold tabular">{question.voteScore}</span>
        </div>
        <div className={`flex flex-col items-center p-1.5 rounded-lg ${
          hasAccepted ? 'text-green bg-green-sub rounded-lg' : question.answerCount > 0 ? 'text-text-secondary' : 'text-text-faint'
        }`}>
          {hasAccepted ? <CheckCircle2 size={14} /> : <MessageSquare size={14} />}
          <span className="text-xs font-bold tabular">{question.answerCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-text-primary leading-snug mb-2 line-clamp-2">
          {question.title}
        </h3>

        {/* Tags */}
        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {question.tags.map(t => (
              <Link key={t._id} to={`/forum/tag/${t.slug}`}
                onClick={e => e.stopPropagation()}
                className="tag hover:border-surface-border-2 text-[10px]"
                style={{ borderColor: t.color + '40', color: t.color }}>
                {t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
          <Link to={`/developers/${question.author?.username}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
            <Avatar name={question.author?.name} src={question.author?.avatar} size="xs" />
            {question.author?.name}
          </Link>
          <span className="flex items-center gap-1">
            <Eye size={11} /> {question.viewCount}
          </span>
          <span>{timeAgo(question.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}

export default function Forum() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [sort, setSort] = useState('hot')

  const { data: qData, loading: qLoading }   = useApi('/forum', { params: { sort, limit: 20 } })
  const { data: tagData, loading: tagLoading } = useApi('/forum/tags')
  const questions = qData?.data   || []
  const tags      = tagData?.data || []

  const SORT_OPTIONS = [
    { value: 'hot',        label: 'Hot',       icon: TrendingUp },
    { value: 'newest',     label: 'Newest',    icon: Clock },
    { value: 'votes',      label: 'Top Voted', icon: ChevronUp },
    { value: 'unanswered', label: 'Unanswered',icon: MessageSquare },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-text-primary">Forum</h1>
              <p className="text-sm text-text-secondary mt-0.5">
                {qData?.pagination?.total || 0} questions from the community
              </p>
            </div>
            {user ? (
              <Link to="/forum/ask" className="btn btn-primary gap-2">
                <Plus size={14} /> Ask Question
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm">Login to Ask</Link>
            )}
          </div>

          {/* Sort tabs */}
          <div className="flex gap-1 mb-5 border-b border-surface-border pb-3">
            {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setSort(value)}
                className={`btn btn-sm gap-1.5 ${sort === value ? 'btn-primary' : 'btn-ghost'}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Questions */}
          {qLoading
            ? <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="card h-28 skeleton" />)}</div>
            : questions.length === 0
              ? (
                <div className="text-center py-20 card">
                  <MessageSquare size={32} className="text-text-faint mx-auto mb-3" />
                  <p className="text-text-muted text-sm mb-4">No questions yet. Be the first!</p>
                  {user && <Link to="/forum/ask" className="btn btn-primary btn-sm">Ask a Question</Link>}
                </div>
              )
              : (
                <div className="flex flex-col gap-3">
                  {questions.map(q => <QuestionCard key={q._id} question={q} />)}
                </div>
              )
          }
        </div>

        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0 space-y-5">
          {/* Popular Tags */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={14} className="text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">Popular Tags</h3>
            </div>
            {tagLoading
              ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-6 rounded" />)}</div>
              : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 20).map(t => (
                    <Link key={t._id} to={`/forum/tag/${t.slug}`}
                      className="tag text-[11px] hover:border-surface-border-2 transition-all"
                      style={{ borderColor: t.color + '40', color: t.color }}>
                      {t.name}
                      <span className="ml-1 text-text-faint">{t.questionCount}</span>
                    </Link>
                  ))}
                </div>
              )
            }
          </div>

          {/* Forum stats */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Forum Stats</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Questions</span>
                <span className="font-medium text-text-primary tabular">{qData?.pagination?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tags</span>
                <span className="font-medium text-text-primary tabular">{tags.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}