import { render, screen } from '@testing-library/react'
import LastBotWidget from '@/components/lastbot/LastBotWidget'

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_ENABLE_LASTBOT_ONE: 'true',
  NEXT_PUBLIC_LASTBOT_BASE_URL: 'https://smartia.lastbot.com/widgets/',
  NEXT_PUBLIC_LASTBOT_WIDGET_ID: '05c8e32c-99c1-4e0e-b350-d39299c7bbae'
}

describe('LastBotWidget', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    
    // Mock environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
  })

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
  })

  it('should render the LastBot widget when enabled', () => {
    render(<LastBotWidget />)
    
    // Check if the widget HTML is rendered
    const widget = document.querySelector('lastbot-chat')
    expect(widget).toBeInTheDocument()
    expect(widget).toHaveAttribute('auto-open', 'false')
    expect(widget).toHaveAttribute('base-url', mockEnv.NEXT_PUBLIC_LASTBOT_BASE_URL)
    expect(widget).toHaveAttribute('fullscreen', 'false')
    expect(widget).toHaveAttribute('widget-id', mockEnv.NEXT_PUBLIC_LASTBOT_WIDGET_ID)
  })

  it('should not render when ENABLE_LASTBOT_ONE is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE = 'false'
    
    render(<LastBotWidget />)
    
    const widget = document.querySelector('lastbot-chat')
    expect(widget).not.toBeInTheDocument()
  })

  it('should not render when ENABLE_LASTBOT_ONE is not set', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE
    
    render(<LastBotWidget />)
    
    const widget = document.querySelector('lastbot-chat')
    expect(widget).not.toBeInTheDocument()
  })

  it('should not render when base URL is missing', () => {
    delete process.env.NEXT_PUBLIC_LASTBOT_BASE_URL
    
    render(<LastBotWidget />)
    
    const widget = document.querySelector('lastbot-chat')
    expect(widget).not.toBeInTheDocument()
  })

  it('should not render when widget ID is missing', () => {
    delete process.env.NEXT_PUBLIC_LASTBOT_WIDGET_ID
    
    render(<LastBotWidget />)
    
    const widget = document.querySelector('lastbot-chat')
    expect(widget).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-lastbot-widget'
    
    render(<LastBotWidget className={customClass} />)
    
    const container = document.querySelector(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('should load the LastBot script', () => {
    render(<LastBotWidget />)
    
    // Check if script is added to head
    const script = document.querySelector('script[src="https://assets.lastbot.com/lastbot-chat.js"]')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('defer')
  })
}) 