'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@/utils/cn'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  className?: string
}

export function TagInput({ value = [], onChange, error, className }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }
    setInput('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 p-2 bg-background border rounded-lg min-h-[42px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-primary/20"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </span>
        ))}
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 px-0"
          placeholder="Add tags..."
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 