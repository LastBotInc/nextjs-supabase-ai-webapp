'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XIcon,
  ExpandIcon,
  MinimizeIcon
} from 'lucide-react'

interface Slide {
  id: string
  title: string
  content: string
  background_image: string
  transition: 'fade' | 'slide' | 'zoom'
}

interface Presentation {
  id: string
  title: string
  description: string
  preview_image: string
  slides: Slide[]
  created_at: string
  updated_at: string
  locale: string
}

interface Props {
  presentation: Presentation
  locale: string
}

export default function PresentationViewer({ presentation, locale }: Props) {
  const t = useTranslations('Presentations')
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const slides = presentation.slides || []

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
    }
  }, [slides.length])

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
      } else if (document.fullscreenElement && document.exitFullscreen) {
        // Check if document is active and in fullscreen before attempting to exit
        if (document.visibilityState === 'visible') {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  const handleClose = () => {
    router.push(`/${locale}/presentations`)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        // Don't try to manually exit fullscreen on ESC, let the browser handle it
        setIsFullscreen(false)
      } else if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1)
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [goToSlide, currentSlide, handleFullscreenChange, isFullscreen])

  if (!slides.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('noPresentations')}
        </p>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-screen bg-gray-900 text-white overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-50' : ''
      )}
      onTouchStart={() => setTouchStart(null)}
      onTouchMove={(e) => {
        if (touchStart === null) return

        const currentTouch = e.touches[0].clientX
        const diff = touchStart - currentTouch

        if (Math.abs(diff) > 50) { // Minimum swipe distance
          if (diff > 0) {
            // Swipe left
            goToSlide(currentSlide + 1)
          } else {
            // Swipe right
            goToSlide(currentSlide - 1)
          }
          setTouchStart(null)
        }
      }}
    >
      {/* Navigation controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="text-white hover:bg-white/20 w-10 h-10 z-50"
        >
          {isFullscreen ? <MinimizeIcon className="h-6 w-6" /> : <ExpandIcon className="h-6 w-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20 w-10 h-10 z-50"
        >
          <XIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide content */}
      <div className="relative w-full h-full z-10">
        {currentSlideData.background_image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={currentSlideData.background_image}
              alt=""
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        <div className="relative z-20 flex flex-col items-center justify-center h-full p-8">
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: currentSlideData.content }} 
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 z-30">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Previous/Next buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => goToSlide(currentSlide - 1)}
        disabled={currentSlide === 0}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 transition-opacity w-12 h-12 z-40",
          currentSlide === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => goToSlide(currentSlide + 1)}
        disabled={currentSlide === slides.length - 1}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 transition-opacity w-12 h-12 z-40",
          currentSlide === slides.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChevronRightIcon className="h-8 w-8" />
      </Button>

      {/* Slide thumbnails */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'bg-blue-500 w-4'
                : 'bg-gray-500 hover:bg-gray-400'
            )}
          />
        ))}
      </div>
    </div>
  )
} 