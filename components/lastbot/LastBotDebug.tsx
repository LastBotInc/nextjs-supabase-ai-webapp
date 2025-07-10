'use client'

export default function LastBotDebug() {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE
  const baseUrl = process.env.NEXT_PUBLIC_LASTBOT_BASE_URL
  const widgetId = process.env.NEXT_PUBLIC_LASTBOT_WIDGET_ID

  // Only show debug in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '300px'
    }}>
      <h4>LastBot Debug Info:</h4>
      <div>ENABLE_LASTBOT_ONE: {isEnabled || 'undefined'}</div>
      <div>BASE_URL: {baseUrl || 'undefined'}</div>
      <div>WIDGET_ID: {widgetId || 'undefined'}</div>
      <div>Should render: {(isEnabled === 'true' && baseUrl && widgetId) ? 'YES' : 'NO'}</div>
      <div>Script loaded: {document.querySelector('script[src="https://assets.lastbot.com/lastbot-chat.js"]') ? 'YES' : 'NO'}</div>
      <div>Widget element: {document.querySelector('lastbot-chat') ? 'YES' : 'NO'}</div>
    </div>
  )
} 