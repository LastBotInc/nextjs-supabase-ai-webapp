import { cn } from '@/lib/utils'

interface OrbProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'indigo' | 'purple' | 'blue' | 'pink'
  blur?: 'sm' | 'md' | 'lg'
  animation?: 'float' | 'orbit' | 'glow'
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
}

interface AnimatedOrbProps {
  orbs?: OrbProps[]
  className?: string
}

const defaultOrbs: OrbProps[] = [
  {
    size: 'lg',
    color: 'indigo',
    blur: 'lg',
    animation: 'float',
    speed: 'slow',
    className: 'absolute top-1/4 right-1/4'
  },
  {
    size: 'lg',
    color: 'purple',
    blur: 'lg',
    animation: 'float',
    speed: 'medium',
    className: 'absolute bottom-1/4 left-1/3'
  }
]

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-40 h-40'
}

const colorMap = {
  indigo: 'bg-indigo-500/20',
  purple: 'bg-purple-500/20',
  blue: 'bg-blue-500/20',
  pink: 'bg-pink-500/20'
}

const blurMap = {
  sm: 'blur-lg',
  md: 'blur-xl',
  lg: 'blur-2xl'
}

const animationMap = {
  float: {
    slow: 'animate-float-slow',
    medium: 'animate-float-medium',
    fast: 'animate-float-fast'
  },
  orbit: {
    slow: 'animate-orbit-slow',
    medium: 'animate-orbit-medium',
    fast: 'animate-orbit-fast'
  },
  glow: {
    slow: 'animate-glow-slow',
    medium: 'animate-glow-medium',
    fast: 'animate-glow-fast'
  }
}

export function AnimatedOrbs({ orbs = defaultOrbs, className }: AnimatedOrbProps) {
  return (
    <div className={cn('absolute inset-0', className)}>
      {orbs.map((orb, index) => (
        <div key={index} className={orb.className}>
          <div
            className={cn(
              'rounded-full',
              sizeMap[orb.size || 'md'],
              colorMap[orb.color || 'purple'],
              blurMap[orb.blur || 'lg'],
              animationMap[orb.animation || 'float'][orb.speed || 'medium']
            )}
          />
        </div>
      ))}
    </div>
  )
} 