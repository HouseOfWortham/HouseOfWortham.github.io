import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AuthButton } from '@/components/AuthButton'
import { IMAGES, REUNION, publicAsset } from '@/data/fixtures'

const links = [
  { to: '/', label: 'Home' },
  { to: '/schedule', label: 'Trip Schedule' },
  { to: '/vote', label: 'Vote on Activities' },
  { to: '/forum', label: 'Family Q&A' },
  { to: '/faq', label: 'Travel Hub & FAQ' },
] as const

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? 'bg-sea/90 py-3 shadow-lg backdrop-blur-md' : 'py-5'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 text-white">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src={publicAsset(IMAGES.logo)}
            alt="Tybee Island lighthouse logo"
            className="h-10 w-8 rounded-md object-cover shadow-sm"
          />
          <span className="font-display text-2xl font-semibold tracking-tight">{REUNION.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              activeProps={{ className: '!bg-white/15 !text-white' }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          <AuthButton />
        </nav>

        <button
          className="rounded-full p-2 hover:bg-white/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="animate-rise mx-auto flex max-w-6xl flex-col gap-1 px-5 pt-3 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 font-medium text-white/90 hover:bg-white/10"
              activeOptions={{ exact: true }}
              activeProps={{ className: '!bg-white/15' }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2">
            <AuthButton />
          </div>
        </nav>
      )}
    </header>
  )
}
