import { publicAsset } from '@/data/fixtures'

const iconPaths = {
  car: '/Tybee_Icons/Icon_CarFish.ico',
  plane: '/Tybee_Icons/Icon_Travel_Option_2_Plane.ico',
  footprints: '/Tybee_Icons/Icon_FeetBeachy.ico',
  groups: '/Tybee_Icons/Icon_Groups.ico',
  star: '/Tybee_Icons/Icon_Vote_Option_1_Star.ico',
} as const

export function TybeeIcon({
  icon,
  size,
  className = '',
}: {
  icon: keyof typeof iconPaths
  size: number
  className?: string
}) {
  return (
    <img
      src={publicAsset(iconPaths[icon])}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  )
}
