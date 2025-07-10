'use client'

import { useEffect } from 'react'

interface LastBotWidgetProps {
  className?: string
}

export default function LastBotWidget({ className }: LastBotWidgetProps) {
  // Check if LastBot is enabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE === 'true'
  const baseUrl = process.env.NEXT_PUBLIC_LASTBOT_BASE_URL
  const widgetId = process.env.NEXT_PUBLIC_LASTBOT_WIDGET_ID

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('LastBot Widget Debug:', {
      isEnabled,
      baseUrl,
      widgetId,
      shouldRender: isEnabled && baseUrl && widgetId
    })
  }

  useEffect(() => {
    // Only proceed if enabled and required config is available
    if (!isEnabled || !baseUrl || !widgetId) {
      return
    }

    // Check if script is already loaded
    if (document.querySelector('script[src="https://assets.lastbot.com/lastbot-chat.js"]')) {
      return
    }

    // Create and append the script
    const script = document.createElement('script')
    script.src = 'https://assets.lastbot.com/lastbot-chat.js'
    script.defer = true
    script.onload = () => {
      console.log('LastBot chat script loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load LastBot chat script')
    }

    document.head.appendChild(script)

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src="https://assets.lastbot.com/lastbot-chat.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [isEnabled, baseUrl, widgetId])

  // Don't render if not enabled or missing required config
  if (!isEnabled || !baseUrl || !widgetId) {
    return null
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<lastbot-chat
          auto-open="false"
          base-url="${baseUrl}"
          fullscreen="false"
          widget-id="${widgetId}"
        ></lastbot-chat>`
      }}
      className={className}
    />
  )
} 