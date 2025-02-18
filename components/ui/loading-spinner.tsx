import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div className={cn('animate-spin rounded-full border-b-2 border-blue-500', sizeClasses[size])} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  )
} 