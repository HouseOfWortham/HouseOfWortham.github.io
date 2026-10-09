import { Link } from '@tanstack/react-router'
import { REUNION } from '@/data/fixtures'

export function SiteFooter() {
  return (
    <footer className="bg-sea-deep text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl text-white">{REUNION.name}</p>
          <p className="mt-1 text-sm">
            {REUNION.location} · {REUNION.dateLabel}
          </p>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/schedule" className="hover:text-white">Schedule</Link>
          <Link to="/vote" className="hover:text-white">Vote</Link>
          <Link to="/faq" className="hover:text-white">Travel Hub</Link>
        </nav>
        <p className="text-sm">Made with sand between our toes 🐚</p>
      </div>
    </footer>
  )
}
