'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function ImageTest() {
  const [errors, setErrors] = useState<string[]>([])
  const [loaded, setLoaded] = useState<string[]>([])

  const images = [
    { src: '/images/hero-handshake.jpg', alt: 'Hero Handshake', width: 1200, height: 400 },
    { src: '/images/team-member-1.jpg', alt: 'Team Member 1', width: 220, height: 220 },
    { src: '/images/team-member-2.jpg', alt: 'Team Member 2', width: 220, height: 220 },
    { src: '/images/team-member-3.jpg', alt: 'Team Member 3', width: 220, height: 220 },
    { src: '/images/team-member-4.jpg', alt: 'Team Member 4', width: 220, height: 220 }
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, index) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="mb-2">{img.alt}</h2>
            <div className="relative h-[300px]" style={{ background: '#f0f0f0' }}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                style={{ objectFit: 'contain' }}
                onError={() => setErrors(prev => [...prev, img.src])}
                onLoad={() => setLoaded(prev => [...prev, img.src])}
              />
            </div>
            <div className="mt-2">
              <p>Path: {img.src}</p>
              <p>Status: {
                errors.includes(img.src) ? 'Failed to load ❌' : 
                loaded.includes(img.src) ? 'Loaded successfully ✅' : 
                'Loading...'
              }</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Regular HTML Image Tags</h2>
        <div className="grid grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div key={`html-${index}`} className="border p-4 rounded">
              <h2 className="mb-2">{img.alt} (HTML img)</h2>
              <div style={{ height: '300px', background: '#f0f0f0' }}>
                <img 
                  src={img.src} 
                  alt={img.alt}
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 