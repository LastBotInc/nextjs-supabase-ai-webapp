'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface MediaSelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  error?: string
  className?: string
}

export function MediaSelector({ value, onChange, error, className }: MediaSelectorProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      onChange(url)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-32 h-32">
            <Image
              src={value}
              alt="Selected media"
              fill
              className="object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImagePlus className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-xs text-gray-500">Upload image</p>
            </div>
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 