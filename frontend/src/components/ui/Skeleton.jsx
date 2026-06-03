export function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-2.5 w-full rounded" />
        <div className="skeleton h-2.5 w-3/4 rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-14 rounded" />
        <div className="skeleton h-5 w-18 rounded" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonLine({ w = 'full', h = '3' }) {
  return <div className={`skeleton h-${h} w-${w} rounded`} />
}