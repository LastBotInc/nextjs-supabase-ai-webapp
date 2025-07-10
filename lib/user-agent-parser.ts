import { UAParser } from 'ua-parser-js'

export interface ParsedUserAgent {
  browser: {
    name: string
    version: string
    major: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    type: string
    vendor: string
    model: string
  }
  engine: {
    name: string
    version: string
  }
  cpu: {
    architecture: string
  }
}

export interface UserAgentAnalytics {
  browser: string
  browserVersion: string
  browserMajor: string
  os: string
  osVersion: string
  deviceType: string
  deviceVendor: string
  deviceModel: string
  engine: string
  engineVersion: string
  cpuArchitecture: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isBot: boolean
}

/**
 * Parse a user agent string and extract detailed information
 */
export function parseUserAgent(userAgentString: string): UserAgentAnalytics {
  const parser = new UAParser(userAgentString)
  const result = parser.getResult()

  // Determine device type more accurately
  const deviceType = determineDeviceType(result, userAgentString)
  
  // Check if it's a bot
  const isBot = detectBot(userAgentString)

  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || 'Unknown',
    browserMajor: result.browser.major || 'Unknown',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || 'Unknown',
    deviceType,
    deviceVendor: result.device.vendor || 'Unknown',
    deviceModel: result.device.model || 'Unknown',
    engine: result.engine.name || 'Unknown',
    engineVersion: result.engine.version || 'Unknown',
    cpuArchitecture: result.cpu.architecture || 'Unknown',
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isBot
  }
}

/**
 * Determine device type with enhanced logic
 */
function determineDeviceType(result: any, userAgentString: string): string {
  // Check for explicit device type from parser
  if (result.device.type) {
    return result.device.type
  }

  // Check for mobile indicators
  const mobileIndicators = [
    'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 
    'BlackBerry', 'Windows Phone', 'Opera Mini'
  ]
  
  const tabletIndicators = [
    'iPad', 'Android.*Tablet', 'Kindle', 'Silk', 'PlayBook'
  ]

  // Check for tablet first (more specific)
  for (const indicator of tabletIndicators) {
    if (new RegExp(indicator, 'i').test(userAgentString)) {
      return 'tablet'
    }
  }

  // Then check for mobile
  for (const indicator of mobileIndicators) {
    if (new RegExp(indicator, 'i').test(userAgentString)) {
      return 'mobile'
    }
  }

  // Default to desktop
  return 'desktop'
}

/**
 * Detect if the user agent is a bot/crawler
 */
function detectBot(userAgentString: string): boolean {
  const botIndicators = [
    'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'whatsapp', 'telegram',
    'googlebot', 'bingbot', 'yandexbot', 'baiduspider',
    'slackbot', 'discordbot', 'applebot', 'duckduckbot'
  ]

  return botIndicators.some(indicator => 
    new RegExp(indicator, 'i').test(userAgentString)
  )
}

/**
 * Get a simplified browser name for analytics
 */
export function getSimplifiedBrowserName(browserName: string): string {
  const browserMap: Record<string, string> = {
    'Chrome': 'Chrome',
    'Firefox': 'Firefox',
    'Safari': 'Safari',
    'Edge': 'Edge',
    'Opera': 'Opera',
    'Internet Explorer': 'Internet Explorer',
    'Samsung Internet': 'Samsung Browser',
    'Chrome WebView': 'Chrome Mobile',
    'Mobile Safari': 'Safari Mobile',
    'Firefox Mobile': 'Firefox Mobile'
  }

  return browserMap[browserName] || browserName || 'Unknown'
}

/**
 * Get a simplified OS name for analytics
 */
export function getSimplifiedOSName(osName: string): string {
  const osMap: Record<string, string> = {
    'Windows': 'Windows',
    'Mac OS': 'macOS',
    'macOS': 'macOS',
    'iOS': 'iOS',
    'Android': 'Android',
    'Linux': 'Linux',
    'Ubuntu': 'Linux',
    'Chrome OS': 'Chrome OS',
    'Windows Phone': 'Windows Phone'
  }

  return osMap[osName] || osName || 'Unknown'
}

/**
 * Get browser market share category
 */
export function getBrowserCategory(browserName: string): string {
  const majorBrowsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
  const mobileBrowsers = ['Chrome Mobile', 'Safari Mobile', 'Samsung Browser']
  
  if (majorBrowsers.includes(browserName)) {
    return 'Major Desktop Browser'
  }
  
  if (mobileBrowsers.includes(browserName)) {
    return 'Mobile Browser'
  }
  
  return 'Other Browser'
}

/**
 * Analyze user agent trends and insights
 */
export interface UserAgentInsights {
  totalUserAgents: number
  uniqueBrowsers: number
  uniqueOperatingSystems: number
  mobilePercentage: number
  desktopPercentage: number
  tabletPercentage: number
  botPercentage: number
  topBrowser: string
  topOS: string
  mostCommonDeviceType: string
  browserDiversity: number // 0-1, higher means more diverse
  modernBrowserPercentage: number
}

/**
 * Calculate insights from user agent data
 */
export function calculateUserAgentInsights(userAgents: UserAgentAnalytics[]): UserAgentInsights {
  if (userAgents.length === 0) {
    return {
      totalUserAgents: 0,
      uniqueBrowsers: 0,
      uniqueOperatingSystems: 0,
      mobilePercentage: 0,
      desktopPercentage: 0,
      tabletPercentage: 0,
      botPercentage: 0,
      topBrowser: 'Unknown',
      topOS: 'Unknown',
      mostCommonDeviceType: 'Unknown',
      browserDiversity: 0,
      modernBrowserPercentage: 0
    }
  }

  const total = userAgents.length
  
  // Count unique browsers and OS
  const uniqueBrowsers = new Set(userAgents.map(ua => ua.browser)).size
  const uniqueOperatingSystems = new Set(userAgents.map(ua => ua.os)).size
  
  // Calculate device type percentages
  const mobileCount = userAgents.filter(ua => ua.isMobile).length
  const desktopCount = userAgents.filter(ua => ua.isDesktop).length
  const tabletCount = userAgents.filter(ua => ua.isTablet).length
  const botCount = userAgents.filter(ua => ua.isBot).length
  
  // Find top browser and OS
  const browserCounts = userAgents.reduce((acc, ua) => {
    acc[ua.browser] = (acc[ua.browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const osCounts = userAgents.reduce((acc, ua) => {
    acc[ua.os] = (acc[ua.os] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const deviceTypeCounts = userAgents.reduce((acc, ua) => {
    acc[ua.deviceType] = (acc[ua.deviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  const topOS = Object.entries(osCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  const mostCommonDeviceType = Object.entries(deviceTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  
  // Calculate browser diversity (Simpson's Diversity Index)
  const browserDiversity = calculateDiversityIndex(Object.values(browserCounts), total)
  
  // Calculate modern browser percentage (recent versions of major browsers)
  const modernBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
  const modernBrowserCount = userAgents.filter(ua => 
    modernBrowsers.includes(ua.browser) && 
    parseInt(ua.browserMajor) >= getMinimumModernVersion(ua.browser)
  ).length
  
  return {
    totalUserAgents: total,
    uniqueBrowsers,
    uniqueOperatingSystems,
    mobilePercentage: (mobileCount / total) * 100,
    desktopPercentage: (desktopCount / total) * 100,
    tabletPercentage: (tabletCount / total) * 100,
    botPercentage: (botCount / total) * 100,
    topBrowser,
    topOS,
    mostCommonDeviceType,
    browserDiversity,
    modernBrowserPercentage: (modernBrowserCount / total) * 100
  }
}

/**
 * Calculate Simpson's Diversity Index
 */
function calculateDiversityIndex(counts: number[], total: number): number {
  const sum = counts.reduce((acc, count) => {
    const proportion = count / total
    return acc + (proportion * proportion)
  }, 0)
  
  return 1 - sum
}

/**
 * Get minimum version for a browser to be considered "modern"
 */
function getMinimumModernVersion(browser: string): number {
  const modernVersions: Record<string, number> = {
    'Chrome': 90,
    'Firefox': 88,
    'Safari': 14,
    'Edge': 90
  }
  
  return modernVersions[browser] || 0
}

/**
 * Format user agent data for display
 */
export function formatUserAgentForDisplay(ua: UserAgentAnalytics): string {
  const parts = []
  
  if (ua.browser !== 'Unknown') {
    parts.push(`${ua.browser} ${ua.browserVersion}`)
  }
  
  if (ua.os !== 'Unknown') {
    parts.push(`on ${ua.os}`)
    if (ua.osVersion !== 'Unknown') {
      parts.push(ua.osVersion)
    }
  }
  
  if (ua.deviceType !== 'desktop' && ua.deviceVendor !== 'Unknown') {
    parts.push(`(${ua.deviceVendor}`)
    if (ua.deviceModel !== 'Unknown') {
      parts.push(ua.deviceModel)
    }
    parts.push(')')
  }
  
  return parts.join(' ')
} 