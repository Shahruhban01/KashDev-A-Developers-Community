import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronUp, ChevronDown, CheckCircle2, Bookmark,
  MessageSquare, Eye, Flag, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import api from '../services/api'
import Avatar from '../components/ui/Avatar'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

function VoteControls({ score, onUp, onDown }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <button onClick={onUp}
        className="p-1.5 rounded-lg hover:bg-accent-subtle hover:text-accent transition-all text-text-muted">
        <ChevronUp size={18} />
      </button>
      <span className="text-sm font-bold tabular text-text-primary">{score}</span>
      <button onClick={onDown}
        className="p-1.5 rounded-lg hover:bg-red-muted hover:text-red-text transition-all text-text-muted">
        <ChevronDown size={18} />
      </button>
    </div>
  )
}

function AnswerForm({ questionId, onSuccess }) {
  const [body, setBody]       = useState('')
  const [submitting, setSub]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSub(true)
    try {
      await api.post(`/forum/${questionId}/answers`, { body })
      toast.success('Answer posted!')
      setBody('')
      onSuccess?.()
    } catch (err) { toast.error(err.message) }
    finally { setSub(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mt-6">
      <h3 className="font-semibold text-text-primary mb-3">Your Answer</h3>
      <textarea value={body} onChange={e => setBody(e.target.value)}
        placeholder="Write a detailed answer..."
        className="input resize-none font-mono text-sm mb-3" rows={8} />
      <button type="submit" disabled={submitting || !body.trim()} className="btn btn-primary">
        {submitting ? 'Posting…' : 'Post Answer'}
      </button>
    </form>
  )
}

export default function ForumQuestionDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const { data, loading, error, refetch } = useApi(`/forum/${id}`)

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      {[1,2,3].map(i => <div key={i} className="card h-32 skeleton" />)}
    </div>
  )

  if (error || !data) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-text-muted">Question not found.</p>
      <Link to="/forum" className="btn btn-ghost btn-sm mt-4">← Forum</Link>
    </div>
  )

  const { question, answers } = data.data

  const voteQuestion = async (direction) => {
    if (!user) { toast.error('Login to vote'); return }
    try {
      await api.post(`/forum/${question._id}/vote`, { direction })
      refetch()
    } catch (err) { toast.error(err.message) }
  }

  const voteAnswer = async (answerId, direction) => {
    if (!user) { toast.error('Login to vote'); return }
    try {
      await api.post(`/forum/answers/${answerId}/vote`, { direction })
      refetch()
    } catch (err) { toast.error(err.message) }
  }

  const acceptAnswer = async (answerId) => {
    try {
      await api.post(`/forum/${question._id}/answers/${answerId}/accept`)
      toast.success('Answer accepted!')
      refetch()
    } catch (err) { toast.error(err.message) }
  }

  const bookmarkQuestion = async () => {
    if (!user) { toast.error('Login to bookmark'); return }
    try {
      const { data: r } = await api.post(`/forum/${question._id}/bookmark`)
      toast.success(r.bookmarked ? 'Bookmarked!' : 'Removed bookmark')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <Link to="/forum" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={14} /> Forum
      </Link>

      {/* Question */}
      <div className="card p-6 mb-4">
        <div className="flex gap-5">
          <VoteControls
            score={question.voteScore}
            onUp={() => voteQuestion('up')}
            onDown={() => voteQuestion('down')}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold font-display text-text-primary mb-3 leading-snug">
              {question.title}
            </h1>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags?.map(t => (
                <Link key={t._id} to={`/forum/tag/${t.slug}`}
                  className="tag text-[11px]" style={{ borderColor: t.color + '40', color: t.color }}>
                  {t.name}
                </Link>
              ))}
            </div>
            {/* Body */}
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-mono bg-surface-3 rounded-lg p-4 mb-4 border border-surface-border">
              {question.body}
            </div>
            {/* Meta bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Eye size={11} /> {question.viewCount} views</span>
                <span className="flex items-center gap-1"><MessageSquare size={11} /> {question.answerCount} answers</span>
                <span>{timeAgo(question.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={bookmarkQuestion}
                  className="btn btn-ghost btn-sm gap-1 text-xs">
                  <Bookmark size={12} /> Bookmark
                </button>
                <Link to={`/developers/${question.author?.username}`}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors">
                  <Avatar name={question.author?.name} src={question.author?.avatar} size="xs" />
                  {question.author?.name}
                  {question.author?.reputation > 0 && (
                    <span className="text-amber text-[10px] font-medium">⭐ {question.author.reputation}</span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      {answers.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold font-display text-text-primary mb-4">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex flex-col gap-4">
            {answers.map(answer => (
              <div key={answer._id}
                className={`card p-6 ${answer.isAccepted ? 'border-green/30 bg-green-sub/20' : ''}`}>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <VoteControls
                      score={answer.voteScore}
                      onUp={() => voteAnswer(answer._id, 'up')}
                      onDown={() => voteAnswer(answer._id, 'down')}
                    />
                    {answer.isAccepted && (
                      <CheckCircle2 size={20} className="text-green mt-1" />
                    )}
                    {/* Accept button for question author */}
                    {user?._id === question.author?._id && !answer.isAccepted && (
                      <button onClick={() => acceptAnswer(answer._id)}
                        className="p-1 text-text-faint hover:text-green transition-colors" title="Accept answer">
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {answer.isAccepted && (
                      <span className="inline-flex items-center gap-1 text-xs text-green font-medium mb-3">
                        <CheckCircle2 size={12} /> Accepted Answer
                      </span>
                    )}
                    <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-mono bg-surface-3 rounded-lg p-4 mb-4 border border-surface-border">
                      {answer.body}
                    </div>
                    <div className="flex items-center justify-between">
                      <Link to={`/developers/${answer.author?.username}`}
                        className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors">
                        <Avatar name={answer.author?.name} src={answer.author?.avatar} size="xs" />
                        {answer.author?.name}
                        {answer.author?.reputation > 0 && (
                          <span className="text-amber text-[10px]">⭐ {answer.author.reputation}</span>
                        )}
                      </Link>
                      <span className="text-xs text-text-faint">{timeAgo(answer.createdAt)}</span>
                    </div>

                    {/* Comments */}
                    {answer.comments?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
                        {answer.comments.map((c, i) => (
                          <div key={i} className="flex gap-2 text-xs text-text-muted">
                            <Avatar name={c.author?.name} src={c.author?.avatar} size="xs" className="flex-shrink-0 mt-0.5" />
                            <span className="text-text-secondary">{c.body}</span>
                            <span className="flex-shrink-0 text-text-faint ml-auto">{timeAgo(c.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {user
        ? <AnswerForm questionId={question._id} onSuccess={refetch} />
        : (
          <div className="card p-6 text-center mt-4">
            <p className="text-text-muted text-sm mb-4">You must be logged in to answer.</p>
            <Link to="/login" className="btn btn-primary btn-sm">Login to Answer</Link>
          </div>
        )
      }
    </div>
  )
}