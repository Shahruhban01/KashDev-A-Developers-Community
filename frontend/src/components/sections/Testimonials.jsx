import { Quote } from 'lucide-react'
import Avatar from '../ui/Avatar'

const testimonials = [
  {
    name: 'Aadil Wani',
    username: 'aadilwani',
    role: 'Full-Stack Developer, Srinagar',
    text: "KashDev gave me a platform to showcase my work locally. I found two freelance clients and a co-founder for my startup within the first month.",
  },
  {
    name: 'Roohi Bhat',
    username: 'roohibhat',
    role: 'Frontend Engineer, Baramulla',
    text: "Finally a community that feels like home. Meeting other developers from the Valley who understand our context has been invaluable for my growth.",
  },
  {
    name: 'Zahoor Mir',
    username: 'zahoormir',
    role: 'Mobile Developer, Anantnag',
    text: "The Hall of Fame inspired me to contribute to open source. Seeing Kashmiri engineers at top companies pushes you to aim higher.",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-1">Community Voice</p>
          <h2 className="section-title">What developers say</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-6 flex flex-col gap-4 animate-fade-in">
              <Quote size={18} className="text-accent/50" />
              <p className="text-sm text-text-secondary leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-surface-border">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">{t.name}</p>
                  <p className="text-[11px] text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}