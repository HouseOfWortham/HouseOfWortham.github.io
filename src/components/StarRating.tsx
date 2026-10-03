import { useState } from 'react'
import { Star } from 'lucide-react'

const labels = ['Not for me', 'Maybe', 'Sounds fun', 'Really want to', 'Can’t miss it!']

export function StarRating({
  value,
  onChange,
  name,
}: {
  value: number
  onChange: (rating: number) => void
  name: string
}) {
  const [hover, setHover] = useState(0)
  const [popped, setPopped] = useState(0)
  const shown = hover || value

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={`Your interest in ${name}`}
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''} — ${labels[n - 1]}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => {
              onChange(n)
              setPopped(n)
            }}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-tide"
          >
            <Star
              key={popped === n ? `pop-${value}` : n}
              size={30}
              strokeWidth={1.6}
              className={`transition-colors ${popped === n ? 'animate-pop' : ''} ${
                n <= shown ? 'fill-sun text-sun' : 'text-sea/25'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm font-medium text-sea/60">{shown ? labels[shown - 1] : 'Tap to rate'}</p>
    </div>
  )
}
