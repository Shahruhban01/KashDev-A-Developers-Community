export default function StatCard({ label, value, icon: Icon, suffix = '' }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent-muted flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-accent-text" />
        </div>
      )}
      <div>
        <p className="text-xl font-bold font-display text-text-primary tabular">{value}{suffix}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  )
}