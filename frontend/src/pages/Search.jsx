import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp, Clock, X, Loader2 } from 'lucide-react'
import api from '../services/api'
import DeveloperCard from '../components/ui/DeveloperCard'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { useDebounce } from '../hooks/useDebounce'

const QUICK_SEARCHES = [
    'React developers open to work',
    'Kashmiris at Google',
    'Backend developers in Srinagar',
    'Startup founders',
    'MERN developers',
    'Students interested in AI',
    'Developers available for mentorship',
    'Open source contributors',
]

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQuery = searchParams.get('q') || ''

    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState([])
    const [intent, setIntent] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [trending, setTrending] = useState([])
    const [related, setRelated] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [pagination, setPagination] = useState(null)
    const inputRef = useRef(null)
    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        api.get('/search/trending').then(r => setTrending(r.data?.data ?? [])).catch(() => setTrending([]))
    }, [])

    // Fetch suggestions on typing
    useEffect(() => {
        if ((debouncedQuery ?? '').length >= 2) {
            api.get('/search/suggest', { params: { q: debouncedQuery } })
                .then(r => setSuggestions(r.data?.data ?? []))
                .catch(() => setSuggestions([]))
        } else {
            setSuggestions([])
        }
    }, [debouncedQuery])

    // Execute search when URL param changes
    useEffect(() => {
        const q = searchParams.get('q')
        if (q) {
            setQuery(q)
            executeSearch(q)
        }
    }, [searchParams.get('q')])

    const executeSearch = async (q) => {
        if (!q.trim()) return
        setLoading(true)
        setShowSuggestions(false)
        try {
            const { data } = await api.get('/search', { params: { q } })
            setResults(data.data ?? [])
            setIntent(data.intent ?? null)
            setPagination(data.pagination ?? null)
            // Fetch related
            const rel = await api.get('/search/related', { params: { q } })
            setRelated(rel.data?.data ?? [])
        } catch {
            setResults([])
            setIntent(null)
            setRelated([])
            setPagination(null)
        }
        finally { setLoading(false) }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setSearchParams({ q: query })
        executeSearch(query)
    }

    const handleSuggestionClick = (val) => {
        setQuery(val)
        setSearchParams({ q: val })
        executeSearch(val)
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Search Bar */}
            <div className="mb-8 relative">
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder='Try "react developers in srinagar" or "kashmiris at google"'
                            className="w-full bg-surface-2 border border-surface-border rounded-xl px-4 py-3.5 pl-11 pr-16 text-base text-text-primary placeholder:text-text-faint focus:outline-none transition-all"
                            style={{ borderColor: query ? 'rgba(91,138,240,0.5)' : undefined }}
                        />
                        {query && (
                            <button type="button" onClick={() => { setQuery(''); setResults([]); setIntent(null) }}
                                className="absolute right-12 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1">
                                <X size={14} />
                            </button>
                        )}
                        <button type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm px-3">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 card border border-surface-border shadow-lg z-50 py-1 animate-scale-in">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(s.value)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-all text-left">
                                {s.type === 'trending' && <TrendingUp size={13} className="text-accent flex-shrink-0" />}
                                {s.type === 'skill' && <span className="w-2 h-2 rounded-full bg-green flex-shrink-0" />}
                                {s.type === 'location' && <span className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />}
                                {s.type === 'company' && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                                <span className="flex-1">{s.label}</span>
                                {s.count && <span className="text-xs text-text-faint">{s.count} searches</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* No query: show trending + quick searches */}
            {!searchParams.get('q') && (
                <div className="space-y-8">
                    {trending.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={15} className="text-accent" />
                                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Trending Searches</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {trending.map((t, i) => (
                                    <button key={i} onClick={() => handleSuggestionClick(t.query)}
                                        className="tag hover:border-surface-border-2 hover:text-text-primary cursor-pointer transition-all py-1.5 px-3">
                                        {t.query}
                                        <span className="ml-1 text-text-faint text-[10px]">{t.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Try Searching</h2>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {QUICK_SEARCHES.map((q, i) => (
                                <button key={i} onClick={() => handleSuggestionClick(q)}
                                    className="card p-3 text-left text-sm text-text-secondary hover:text-text-primary hover:border-surface-border-2 transition-all flex items-center gap-2">
                                    <SearchIcon size={12} className="text-text-faint flex-shrink-0" /> {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {searchParams.get('q') && (
                <div>
                    {/* Intent chips */}
                    {intent && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {(intent.skills ?? []).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                            {(intent.companies ?? []).map(c => <span key={c} className="badge badge-accent">{c}</span>)}
                            {(intent.districts ?? []).map(d => <span key={d} className="badge badge-amber">{d}</span>)}
                            {(intent.cities ?? []).map(c => <span key={c} className="badge badge-amber">{c}</span>)}
                            {intent.openToWork && <span className="badge badge-green">Open to Work</span>}
                            {intent.openToMentor && <span className="badge badge-surface">Mentors</span>}
                            {intent.isStudent && <span className="badge badge-surface">Students</span>}
                            {intent.isFounder && <span className="badge badge-accent">Founders</span>}
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-text-muted">
                            {pagination ? `${pagination.total} developers found` : ''}
                        </p>
                    </div>

                    {loading
                        ? <SkeletonGrid count={6} />
                        : results.length === 0
                            ? (
                                <div className="text-center py-20 card">
                                    <p className="text-text-muted mb-2">No developers found for this search.</p>
                                    <p className="text-xs text-text-faint">Try different keywords or remove some filters.</p>
                                </div>
                            )
                            : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.map(p => <DeveloperCard key={p._id} profile={p} />)}
                                </div>
                            )
                    }

                    {/* Related searches */}
                    {related.length > 0 && (
                        <div className="mt-10">
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Related Searches</p>
                            <div className="flex flex-wrap gap-2">
                                {related.map((r, i) => (
                                    <button key={i} onClick={() => handleSuggestionClick(r)}
                                        className="tag hover:border-surface-border-2 hover:text-text-primary cursor-pointer transition-all py-1.5 px-3">
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}