export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(new Date(date))
}

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

export const truncate = (str, max = 120) =>
  str?.length > max ? str.slice(0, max) + '…' : str

export const SKILLS = [
  'React', 'Node.js', 'Python', 'Flutter', 'Next.js', 'Vue.js',
  'TypeScript', 'JavaScript', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Docker', 'AWS', 'Firebase', 'GraphQL', 'PHP', 'Laravel',
  'Django', 'Swift', 'Kotlin', 'Go', 'Rust', 'Java', 'Spring Boot',
]

export const EXPERIENCE_LEVELS = [
  '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'
]

export const OPPORTUNITY_TYPES = [
  { value: 'job', label: 'Full-time Job', color: 'accent' },
  { value: 'internship', label: 'Internship', color: 'green' },
  { value: 'freelance', label: 'Freelance', color: 'amber' },
  { value: 'cofounder', label: 'Co-founder', color: 'surface' },
]

export const formatLocation = (location) => {
  if (!location) return ''
  if (typeof location === 'string') return location
  const { city, district, state, country } = location
  return [city || district, state, country].filter(Boolean).join(', ')
}