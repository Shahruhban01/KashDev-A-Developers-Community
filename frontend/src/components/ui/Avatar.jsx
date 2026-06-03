import { getInitials } from '../../utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const initials = getInitials(name)
  const sizeClass = sizes[size] || sizes.md

  if (src) {
    return (
      <img src={src} alt={name} loading="lazy"
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border border-surface-border ${className}`} />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-accent-subtle border border-accent-muted flex items-center justify-center flex-shrink-0 font-semibold text-accent-text ${className}`}>
      {initials}
    </div>
  )
}