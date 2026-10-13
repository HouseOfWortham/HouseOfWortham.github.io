import { publicAsset } from '@/data/fixtures'

const iconPaths = {
  car: '/Tybee_Icons/Icon_CarFish.ico',
  plane: '/Tybee_Icons/Icon_Travel_Option_2_Plane.ico',
  footprints: '/Tybee_Icons/Icon_FeetBeachy.ico',
  groups: '/Tybee_Icons/Icon_Groups.ico',
  star: '/Tybee_Icons/Icon_Vote_Option_1_Star.ico',
  bed: '/Tybee_Icons/Icon_Bed.ico',
  vote: '/Tybee_Icons/Icon_Vote_Option_Check.ico',
  food: '/Tybee_Icons/Icon_KnifeFork.ico',
  chat: '/Tybee_Icons/Icon_SpeechBubble.ico',
  clock: '/Tybee_Icons/Icon_SundialClocke.ico',
  member: '/Tybee_Icons/Icon_SingleHead.ico',
  calendar: '/Tybee_Icons/Icon_Calander.ico',
} as const

export function TybeeIcon({
  icon,
  size,
  className = '',
  tone,
}: {
  icon: keyof typeof iconPaths
  size: number
  className?: string
  tone?: 'gold' | 'blue'
}) {
  const colorFilter =
    tone === 'gold'
      ? 'sepia(1) saturate(5) hue-rotate(350deg) brightness(1.05)'
      : tone === 'blue'
        ? 'sepia(1) saturate(3) hue-rotate(155deg) brightness(0.85)'
        : undefined

  return (
    <img
      src={publicAsset(iconPaths[icon])}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
      style={colorFilter ? { filter: colorFilter } : undefined}
    />
  )
}
