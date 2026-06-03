export default function SkillTag({ skill, onClick, selected }) {
  return (
    <span
      onClick={onClick}
      className={`tag cursor-pointer select-none transition-all ${
        selected ? 'bg-accent-subtle border-accent-muted text-accent-text' : 'hover:border-surface-5 hover:text-text-primary'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {skill}
    </span>
  )
}