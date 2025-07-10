'use client'

import React from 'react'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  bgColor?: string
}

export default function SectionContainer({ 
  children, 
  className = '',
  bgColor = 'bg-white'
}: SectionContainerProps) {
  return (
    <section className={`py-16 ${bgColor} ${className}`}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  )
} 