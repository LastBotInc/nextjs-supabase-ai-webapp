'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  Bot
} from 'lucide-react'

// Color palette for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

interface UserAgentData {
  insights: {
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
    browserDiversity: number
    modernBrowserPercentage: number
  }
  browserData: Array<{ name: string; value: number; percentage: number }>
  osData: Array<{ name: string; value: number; percentage: number }>
  deviceData: Array<{ name: string; value: number; percentage: number }>
  browserVersionData: Array<{ name: string; value: number; percentage: number }>
  timeSeriesData: Array<{ 
    date: string
    uniqueBrowsers: number
    uniqueDevices: number
    totalRequests: number
  }>
  totalEvents: number
}

interface UserAgentAnalyticsProps {
  dateRange: string
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}

// Metric card component
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  loading = false,
  badge
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  loading?: boolean
  badge?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge && <Badge variant="secondary">{badge}</Badge>}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Browser chart component
function BrowserChart({ data, loading }: { data?: UserAgentData['browserData']; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">🌐</div>
          <p>No browser data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Operating system chart component
function OSChart({ data, loading }: { data?: UserAgentData['osData']; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">💻</div>
          <p>No operating system data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip formatter={(value, name) => [`${value} users`, 'Count']} />
        <Bar dataKey="value" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Device types chart component
function DeviceChart({ data, loading }: { data?: UserAgentData['deviceData']; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📱</div>
          <p>No device data available</p>
        </div>
      </div>
    )
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {data.map((device, index) => (
        <div key={device.name} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getDeviceIcon(device.name)}
            <div>
              <p className="font-medium">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.value} users</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{device.percentage.toFixed(1)}%</p>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${device.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Browser versions chart
function BrowserVersionChart({ data, loading }: { data?: UserAgentData['browserVersionData']; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p>No browser version data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="horizontal">
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Time series chart for browser/device diversity
function DiversityChart({ data, loading }: { data?: UserAgentData['timeSeriesData']; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📈</div>
          <p>No time series data available</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="uniqueBrowsers" 
          stroke="#3b82f6" 
          name="Unique Browsers"
        />
        <Line 
          type="monotone" 
          dataKey="uniqueDevices" 
          stroke="#10b981" 
          name="Unique Devices"
        />
        <Line 
          type="monotone" 
          dataKey="totalRequests" 
          stroke="#f59e0b" 
          name="Total Requests"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function UserAgentAnalytics({ dateRange }: UserAgentAnalyticsProps) {
  const [data, setData] = useState<UserAgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [parsing, setParsing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/user-agents?dateRange=${dateRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user agent data')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching user agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseUserAgents = async () => {
    try {
      setParsing(true)
      const response = await fetch(`/api/analytics/user-agents?action=parse&dateRange=${dateRange}`)
      if (!response.ok) {
        throw new Error('Failed to parse user agents')
      }
      const result = await response.json()
      console.log('Parse result:', result)
      // Refresh data after parsing
      await fetchData()
    } catch (error) {
      console.error('Error parsing user agents:', error)
    } finally {
      setParsing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <LoadingSkeleton />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const insights = data?.insights

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Agent Analytics</h2>
        <div className="flex gap-2">
          <Button 
            onClick={parseUserAgents} 
            variant="outline" 
            size="sm"
            disabled={parsing}
          >
            {parsing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Parse User Agents
              </>
            )}
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Requests"
          value={insights?.totalUserAgents || 0}
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Unique Browsers"
          value={insights?.uniqueBrowsers || 0}
          icon={Globe}
          loading={loading}
          badge={insights?.topBrowser}
        />
        <MetricCard
          title="Operating Systems"
          value={insights?.uniqueOperatingSystems || 0}
          icon={Monitor}
          loading={loading}
          badge={insights?.topOS}
        />
        <MetricCard
          title="Modern Browsers"
          value={`${insights?.modernBrowserPercentage?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Device Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Desktop Users"
          value={`${insights?.desktopPercentage?.toFixed(1) || 0}%`}
          icon={Monitor}
          loading={loading}
        />
        <MetricCard
          title="Mobile Users"
          value={`${insights?.mobilePercentage?.toFixed(1) || 0}%`}
          icon={Smartphone}
          loading={loading}
        />
        <MetricCard
          title="Bot Traffic"
          value={`${insights?.botPercentage?.toFixed(1) || 0}%`}
          icon={Bot}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BrowserChart data={data?.browserData} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <OSChart data={data?.osData} loading={loading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceChart data={data?.deviceData} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Browser Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <BrowserVersionChart data={data?.browserVersionData} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Time Series */}
      <Card>
        <CardHeader>
          <CardTitle>Browser & Device Diversity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <DiversityChart data={data?.timeSeriesData} loading={loading} />
        </CardContent>
      </Card>

      {/* Insights Summary */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Insights Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Browser Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Your most popular browser is <strong>{insights.topBrowser}</strong> with {insights.uniqueBrowsers} unique browsers detected.
                  {insights.modernBrowserPercentage > 90 && (
                    <span className="text-green-600"> Excellent modern browser adoption!</span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Device Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Most users access your site via <strong>{insights.mostCommonDeviceType}</strong> devices.
                  {insights.mobilePercentage > 50 && (
                    <span className="text-blue-600"> Mobile-first audience detected.</span>
                  )}
                  {insights.botPercentage > 10 && (
                    <span className="text-orange-600"> High bot traffic detected.</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 