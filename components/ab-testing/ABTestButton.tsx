'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getVariant, trackConversion, getVariantConfig } from '@/lib/ab-testing'
import type { ABVariant } from '@/lib/ab-testing'

interface ABTestButtonProps {
  experimentName: string
  conversionGoal: string
  defaultText?: string
  defaultColor?: string
  defaultSize?: 'sm' | 'lg' | 'default' | 'icon'
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export default function ABTestButton({
  experimentName,
  conversionGoal,
  defaultText = 'Get Started',
  defaultColor = 'blue',
  defaultSize = 'default',
  onClick,
  className = '',
  children
}: ABTestButtonProps) {
  const [variant, setVariant] = useState<ABVariant | null>(null)
  const [config, setConfig] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadVariant() {
      try {
        const assignedVariant = await getVariant(experimentName)
        setVariant(assignedVariant)
        
        if (assignedVariant) {
          const variantConfig = await getVariantConfig(experimentName)
          setConfig(variantConfig)
        }
      } catch (error) {
        console.error('Failed to load A/B test variant:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVariant()
  }, [experimentName])

  const handleClick = async () => {
    // Track conversion
    try {
      await trackConversion(experimentName, conversionGoal)
    } catch (error) {
      console.error('Failed to track conversion:', error)
    }

    // Call original onClick handler
    if (onClick) {
      onClick()
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Button 
        disabled 
        size={defaultSize}
        className={className}
      >
        Loading...
      </Button>
    )
  }

  // If no variant assigned, show default
  if (!variant || !config) {
    return (
      <Button 
        onClick={handleClick}
        size={defaultSize}
        className={className}
      >
        {children || defaultText}
      </Button>
    )
  }

  // Get variant configuration
  const buttonText = config.button_text || defaultText
  const buttonColor = config.button_color || defaultColor
  const buttonSize = (config.button_size as 'sm' | 'lg' | 'default' | 'icon') || defaultSize

  // Color mapping for Tailwind classes
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    gray: 'bg-gray-600 hover:bg-gray-700 text-white',
    black: 'bg-black hover:bg-gray-800 text-white',
    white: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
  }

  const colorClass = colorClasses[buttonColor as keyof typeof colorClasses] || colorClasses.blue

  return (
    <Button 
      onClick={handleClick}
      size={buttonSize}
      className={`${colorClass} ${className}`}
      data-ab-experiment={experimentName}
      data-ab-variant={variant.name}
    >
      {children || buttonText}
    </Button>
  )
} 