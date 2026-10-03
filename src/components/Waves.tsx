// Animated layered wave divider used at the bottom of hero sections.
export function Waves({ fill = 'var(--color-sand)' }: { fill?: string }) {
  const path =
    'M0 40 C 150 80 350 0 600 40 C 850 80 1050 0 1200 40 C 1350 80 1550 0 1800 40 C 2050 80 2250 0 2400 40 V100 H0 Z'
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden" aria-hidden>
      <svg className="wave-drift absolute bottom-3 h-16 w-[200%] opacity-40" viewBox="0 0 2400 100" preserveAspectRatio="none">
        <path d={path} fill={fill} />
      </svg>
      <svg
        className="wave-drift absolute bottom-0 h-14 w-[200%]"
        style={{ animationDuration: '12s', animationDirection: 'reverse' }}
        viewBox="0 0 2400 100"
        preserveAspectRatio="none"
      >
        <path d={path} fill={fill} />
      </svg>
    </div>
  )
}
